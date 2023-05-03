import React, { MutableRefObject, useCallback } from "react";
import {
  Map,
  MapRef,
  NavigationControl,
  ViewStateChangeEvent,
} from "react-map-gl";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import * as pmtiles from "pmtiles";

export const BaseMap: React.FC<{
  id: string;
  mapRef: MutableRefObject<MapRef | null>;
  longitude: number;
  latitude: number;
  zoom: number;
  children?: any;
  style?: string;
  onMapLoad?: () => void;
  onMapMove?: () => void;
  onMapMoveEnd?: (e: ViewStateChangeEvent) => void;
}> = ({
  id,
  mapRef,
  longitude,
  latitude,
  zoom,
  children,
  style = "https://tile.openstreetmap.jp/styles/osm-bright/style.json",
  onMapLoad,
  onMapMove,
  onMapMoveEnd,
}) => {
  // pmtiles protocol
  let pmtilesProtocol = new pmtiles.Protocol();
  maplibregl.addProtocol("pmtiles", pmtilesProtocol.tile);

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
        height: "25vh",
      }}
      id={id}
      ref={mapRef}
      onLoad={onLoad}
      onMove={onMove}
      onMoveEnd={onMoveEnd}
      mapLib={maplibregl}
      mapStyle={style}
      attributionControl={true}
      initialViewState={{
        longitude: longitude,
        latitude: latitude,
        zoom: zoom,
      }}
      hash={false}
      maxZoom={16}
      maxPitch={85}
    >
      {children}
      <NavigationControl
        position="bottom-right"
        visualizePitch={true}
        showZoom={true}
        showCompass={true}
      />
    </Map>
  );
};
