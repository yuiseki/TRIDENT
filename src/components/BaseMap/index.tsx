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
  TerrainControl,
  Source,
  Layer,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { GlobeControl } from "../GlobeControl";

export const BaseMap: React.FC<{
  children?: any;
  id?: string;
  mapRef: MutableRefObject<MapRef | null>;
  longitude: number;
  latitude: number;
  zoom: number;
  maxZoom?: number;
  projection?: "mercator" | "globe";
  style?: string | StyleSpecification;
  enableInteractions?: boolean;
  showControls?: boolean;
  attributionPosition?: string;
  showAttribution?: boolean;
  showAtmosphere?: boolean;
  showAsCircle?: boolean;
  showTerrain?: boolean;
  autoRotate?: boolean;
  onMapLoad?: () => void;
  onMapMove?: (e: ViewStateChangeEvent) => void;
  onMapMoveStart?: (e: ViewStateChangeEvent) => void;
  onMapMoveEnd?: (e: ViewStateChangeEvent) => void;
  onMapGeolocate?: ((e: GeolocateResultEvent) => void) | undefined;
}> = ({
  children,
  id,
  mapRef,
  longitude,
  latitude,
  zoom,
  maxZoom = 22,
  projection = "mercator",
  style = "/map_styles/fiord-color-gl-style/style.json",
  enableInteractions = true,
  showControls = true,
  attributionPosition = "top-right",
  showAttribution = true,
  showAtmosphere = false,
  showAsCircle = false,
  showTerrain = true,
  autoRotate = false,
  onMapLoad,
  onMapMove,
  onMapMoveStart,
  onMapMoveEnd,
  onMapGeolocate,
}) => {
  const terrain = { source: "terrain-dem", exaggeration: 1.5 };

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

  // 自動回転用の状態とインターバル
  const [isAutoRotating, setIsAutoRotating] = React.useState(autoRotate);
  const [mapLoaded, setMapLoaded] = React.useState(false);
  const rotationIntervalRef = useRef<number | null>(null);

  // autoRotate propの変更を監視してisAutoRotatingを更新
  useEffect(() => {
    setIsAutoRotating(autoRotate);
  }, [autoRotate]);

  useEffect(() => {
    if (!showAtmosphere) return;

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
  }, [mapRef, showAtmosphere]);

  // 自動回転の処理
  useEffect(() => {
    if (!isAutoRotating || projection !== "globe" || !mapLoaded) {
      if (rotationIntervalRef.current) {
        cancelAnimationFrame(rotationIntervalRef.current);
        rotationIntervalRef.current = null;
      }
      return;
    }

    const mapInstance = mapRef.current?.getMap?.();
    if (!mapInstance) return;

    let currentLng = mapInstance.getCenter().lng;
    const rotationSpeed = 0.05; // 回転速度（度/フレーム）
    console.log("[BaseMap] Starting auto-rotation (clockwise)");

    let frameCount = 0;
    const rotate = () => {
      if (!isAutoRotating) return;

      const mapInstance = mapRef.current?.getMap?.();
      if (!mapInstance) return;

      // 時計回りに回転（経度を増加）
      currentLng += rotationSpeed;
      if (currentLng > 180) {
        currentLng -= 360;
      }

      mapInstance.easeTo({
        center: [currentLng, mapInstance.getCenter().lat],
        duration: 0,
        easing: (t: number) => t,
      });

      rotationIntervalRef.current = requestAnimationFrame(rotate);
    };

    rotate();

    return () => {
      if (rotationIntervalRef.current) {
        cancelAnimationFrame(rotationIntervalRef.current);
        rotationIntervalRef.current = null;
      }
    };
  }, [isAutoRotating, projection, mapRef, mapLoaded]);

  const onLoad = useCallback(() => {
    const mapInstance = mapRef.current?.getMap?.();
    if (mapInstance && showAtmosphere) {
      applyAtmosphere(mapInstance);
    }

    // ユーザーインタラクションの直接検知
    if (mapInstance && autoRotate) {
      const stopRotation = () => {
        console.log(
          "[BaseMap] User interaction detected via direct event. Stopping auto-rotation."
        );
        setIsAutoRotating(false);
      };

      mapInstance.on("mousedown", stopRotation);
      mapInstance.on("touchstart", stopRotation);
      mapInstance.on("wheel", stopRotation);
      mapInstance.on("dragstart", stopRotation);
    }

    console.log("[BaseMap] Map loaded");
    setMapLoaded(true);
    if (onMapLoad) {
      onMapLoad();
    }
  }, [mapRef, onMapLoad, showAtmosphere, autoRotate]);

  const onStyleChange = useCallback(() => {
    const mapInstance = mapRef.current?.getMap?.();
    if (mapInstance && showAtmosphere) {
      applyAtmosphere(mapInstance);
    }
  }, [mapRef, showAtmosphere]);

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
      // ユーザーの操作による移動の場合、自動回転を停止
      if (isAutoRotating && event.originalEvent) {
        console.log(
          "[BaseMap] User interaction detected. Stopping auto-rotation."
        );
        setIsAutoRotating(false);
      }
      if (onMapMoveStart) {
        onMapMoveStart(event);
      }
    },
    [onMapMoveStart, isAutoRotating]
  );

  const onMoveEnd = useCallback(
    (e: ViewStateChangeEvent) => {
      if (onMapMoveEnd) {
        onMapMoveEnd(e);
      }
    },
    [onMapMoveEnd]
  );

  const onGeolocate = useCallback(
    (e: GeolocateResultEvent) => {
      if (isAutoRotating) {
        console.log("[BaseMap] Geolocation triggered. Stopping auto-rotation.");
        setIsAutoRotating(false);
      }
      if (onMapGeolocate) {
        onMapGeolocate(e);
      } else {
        setTimeout(() => {
          mapRef.current?.flyTo({
            center: [e.coords.longitude, e.coords.latitude],
            zoom: 16,
            duration: 5000,
          });
        }, 500);
      }
    },
    [onMapGeolocate]
  );

  return (
    <Map
      style={{
        display: "block",
        width: "100%",
        height: "100%",
        borderRadius: `${showAsCircle ? "50%" : "0px"}`,
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
      projection={projection}
      terrain={terrain}
      hash={false}
      maxZoom={maxZoom}
      maxPitch={85}
      scrollZoom={enableInteractions ? true : false}
      dragPan={enableInteractions ? true : false}
    >
      {children}
      <>
        <Source
          id="terrain-dem"
          type="raster-dem"
          url="https://tiles.mapterhorn.com/tilejson.json"
          tileSize={256}
        />
        <Source
          id="hillshade-dem"
          type="raster-dem"
          url="https://tiles.mapterhorn.com/tilejson.json"
          tileSize={256}
        >
          <Layer
            type="hillshade"
            layout={{ visibility: "visible" }}
            paint={{ "hillshade-shadow-color": "#473B24" }}
          />
        </Source>
      </>
      {showAttribution && (
        <AttributionControl
          position={
            attributionPosition
              ? (attributionPosition as ControlPosition)
              : "top-right"
          }
        />
      )}
      {enableInteractions && showControls && (
        <>
          <GlobeControl position="top-right" />
          <NavigationControl
            position="top-right"
            visualizePitch={true}
            showZoom={true}
            showCompass={true}
          />
          <TerrainControl {...terrain} position="top-right" />
          <GeolocateControl position="top-right" onGeolocate={onGeolocate} />
        </>
      )}
    </Map>
  );
};
