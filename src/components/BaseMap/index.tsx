import React, { MutableRefObject, useCallback, useEffect, useRef } from "react";

import {
  AttributionControl,
  ControlPosition,
  GeolocateControl,
  GeolocateResultEvent,
  Map,
  MapRef,
  NavigationControl,
  ViewStateChangeEvent,
  StyleSpecification,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { GlobeControl } from "../GlobeControl";

export const BaseMap: React.FC<{
  id?: string;
  mapRef: MutableRefObject<MapRef | null>;
  longitude: number;
  latitude: number;
  zoom: number;
  children?: any;
  style?: string | StyleSpecification;
  onMapLoad?: () => void;
  onMapMove?: (e: ViewStateChangeEvent) => void;
  onMapMoveStart?: (e: ViewStateChangeEvent) => void;
  onMapMoveEnd?: (e: ViewStateChangeEvent) => void;
  enableInteractions?: boolean;
  attributionPosition?: string;
  onGeolocate?: ((e: GeolocateResultEvent) => void) | undefined;
}> = ({
  id,
  mapRef,
  longitude,
  latitude,
  zoom,
  children,
  style = "/map_styles/fiord-color-gl-style/style.json",
  onMapLoad,
  onMapMove,
  onMapMoveStart,
  onMapMoveEnd,
  enableInteractions = true,
  attributionPosition = "top-right",
  onGeolocate,
}) => {
  const applyAtmosphere = (mapInstance: maplibregl.Map) => {
    // 現在の時刻から太陽の位置を計算
    const now = new Date();
    const dayOfYear = Math.floor(
      (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000
    );
    const timeOfDay =
      (now.getUTCHours() +
        now.getUTCMinutes() / 60 +
        now.getUTCSeconds() / 3600) /
      24;

    // 太陽の赤緯を計算 (地球の軸の傾きによる季節変化)
    const solarDeclination =
      23.45 * Math.sin((2 * Math.PI * (dayOfYear - 81)) / 365);

    // 太陽の方位角と高度角を計算
    const hourAngle = 2 * Math.PI * (timeOfDay - 0.5); // UTC正午を基準
    const sunAzimuth = Math.atan2(
      Math.sin(hourAngle),
      Math.cos(hourAngle) * Math.sin((Math.PI * solarDeclination) / 180)
    );
    const sunElevation = Math.asin(
      Math.cos((Math.PI * solarDeclination) / 180) * Math.cos(hourAngle)
    );

    // MapLibreのlight position用に変換 (azimuth, elevation, distance)
    const azimuthDegrees = ((sunAzimuth * 180) / Math.PI + 360) % 360;
    const elevationDegrees = Math.max(5, (sunElevation * 180) / Math.PI + 90); // 最小5度に制限

    mapInstance.setSky({
      "sky-color": "#000",
      "sky-horizon-blend": 0.5,
      "horizon-color": "#434343ff",
      "horizon-fog-blend": 0.5,
      "fog-color": "#000",
      "fog-ground-blend": 0.5,
      "atmosphere-blend": [
        "interpolate",
        ["linear"],
        ["zoom"],
        0,
        0.8,
        5,
        0.5,
        7,
        0,
      ],
    });
    mapInstance.setLight({
      anchor: "map",
      position: [azimuthDegrees, elevationDegrees, 80],
      intensity: Math.max(
        0.05,
        Math.min(0.3, ((elevationDegrees - 90) / 90) * 0.3 + 0.1)
      ),
    });
  };

  // リアルタイム更新用のインターバル
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const updateAtmosphere = () => {
      const mapInstance = mapRef.current?.getMap?.();
      if (mapInstance) {
        applyAtmosphere(mapInstance);
      }
    };

    // 初回実行
    updateAtmosphere();

    // 10秒おきに更新
    intervalRef.current = setInterval(updateAtmosphere, 10000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [mapRef]);

  const onLoad = useCallback(() => {
    const mapInstance = mapRef.current?.getMap?.();
    if (mapInstance) {
      applyAtmosphere(mapInstance);
    }
    console.log("Map loaded");
    if (onMapLoad) {
      onMapLoad();
    }
  }, [mapRef, onMapLoad]);

  const onStyleChange = useCallback(() => {
    const mapInstance = mapRef.current?.getMap?.();
    if (mapInstance) {
      applyAtmosphere(mapInstance);
    }
  }, [mapRef]);

  const onMove = useCallback(
    (event: ViewStateChangeEvent) => {
      if (onMapMove) {
        onMapMove(event);
      }
    },
    [onMapMove]
  );

  const onMoveStart = useCallback(
    (event: ViewStateChangeEvent) => {
      if (onMapMoveStart) {
        onMapMoveStart(event);
      }
    },
    [onMapMoveStart]
  );

  const onMoveEnd = useCallback(
    (e: ViewStateChangeEvent) => {
      if (onMapMoveEnd) {
        onMapMoveEnd(e);
      }
    },
    [onMapMoveEnd]
  );

  return (
    <Map
      style={{
        display: "block",
        width: "100%",
        height: "100%",
      }}
      id={id}
      ref={mapRef}
      onLoad={onLoad}
      onMove={onMove}
      onMoveStart={onMoveStart}
      onMoveEnd={onMoveEnd}
      onStyleData={onStyleChange}
      mapStyle={style}
      attributionControl={false}
      initialViewState={{
        longitude: longitude,
        latitude: latitude,
        zoom: zoom,
      }}
      projection={"globe"}
      hash={false}
      maxZoom={22}
      maxPitch={85}
      scrollZoom={enableInteractions ? true : false}
      dragPan={enableInteractions ? true : false}
    >
      {children}
      <AttributionControl
        position={
          attributionPosition
            ? (attributionPosition as ControlPosition)
            : "top-right"
        }
      />
      {enableInteractions && (
        <>
          <GlobeControl position="top-right" />
          <NavigationControl
            position="top-right"
            visualizePitch={true}
            showZoom={true}
            showCompass={true}
          />
          <GeolocateControl position="top-right" onGeolocate={onGeolocate} />
        </>
      )}
    </Map>
  );
};
