import React, { MutableRefObject, useCallback } from "react";
import {
  AttributionControl,
  ControlPosition,
  GeolocateControl,
  Map,
  MapRef,
  NavigationControl,
  ViewStateChangeEvent,
} from "react-map-gl";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export const BaseMap: React.FC<{
  id?: string;
  mapRef: MutableRefObject<MapRef | null>;
  longitude: number;
  latitude: number;
  zoom: number;
  children?: any;
  style?: string | mapboxgl.Style;
  onMapLoad?: () => void;
  onMapMove?: () => void;
  onMapMoveEnd?: (e: ViewStateChangeEvent) => void;
  enableInteractions?: boolean;
  attributionPosition?: string;
}> = ({
  id,
  mapRef,
  longitude,
  latitude,
  zoom,
  children,
  style = "/map_styles/fiord-color-gl-style/style.json",
  //style = "/map_styles/arcgis-world-imagery/style.json",
  //style = "/map_styles/osm-hot/style.json",
  onMapLoad,
  onMapMove,
  onMapMoveEnd,
  enableInteractions = true,
  attributionPosition = "top-right",
}) => {
  const onLoad = useCallback(() => {
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
      onLoad={onLoad}
      onMove={onMove}
      onMoveEnd={onMoveEnd}
      mapLib={maplibregl}
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
      {enableInteractions && (
        <>
          <GeolocateControl position="bottom-right" />
          <NavigationControl
            position="bottom-right"
            visualizePitch={true}
            showZoom={true}
            showCompass={true}
          />
        </>
      )}
      <AttributionControl
        position={
          attributionPosition
            ? (attributionPosition as ControlPosition)
            : "bottom-right"
        }
      />
    </Map>
  );
};
