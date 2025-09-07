import React, { MutableRefObject, useCallback } from "react";

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
  onMapMove?: () => void;
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
  onMapMoveEnd,
  enableInteractions = true,
  attributionPosition = "top-right",
  onGeolocate,
}) => {
  const onLoad = useCallback(() => {
    console.log("Map loaded");
    if (onMapLoad) {
      onMapLoad();
    }
  }, [onMapLoad]);

  const onMove = useCallback(() => {
    if (onMapMove) {
      onMapMove();
    }
  }, [onMapMove]);

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
      onMove={onMove}
      onMoveEnd={onMoveEnd}
      mapStyle={style}
      attributionControl={false}
      initialViewState={{
        longitude: longitude,
        latitude: latitude,
        zoom: zoom,
      }}
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
