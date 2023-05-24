import { MapProvider, MapRef } from "react-map-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { BaseMap } from "../BaseMap";
import { GeoJsonToMarkers } from "../GeoJsonToMarkers";
import { Feature, FeatureCollection, GeoJsonProperties, Point } from "geojson";
import { useCallback, useEffect, useRef, useState } from "react";
import * as turf from "@turf/turf";

export const GeoJsonMap = ({ geojson }: { geojson: FeatureCollection }) => {
  const mapRef = useRef<MapRef | null>(null);

  // 初回のみ地図をデータにあわせる
  useEffect(() => {
    setTimeout(() => {
      if (!mapRef || !mapRef.current) return;
      if (geojson === undefined) return;
      try {
        const [minLng, minLat, maxLng, maxLat] = turf.bbox(geojson);
        mapRef.current.fitBounds(
          [
            [minLng, minLat],
            [maxLng, maxLat],
          ],
          { padding: 40, duration: 1000 }
        );
      } catch (e) {
        console.error(e);
      }
    }, 500);
  }, [geojson]);

  if (!geojson) return null;

  return (
    <div
      style={{
        width: "100%",
        height: "200px",
        minHeight: "10vh",
        maxHeight: "25vh",
      }}
    >
      <MapProvider>
        <div style={{ margin: "0px", height: "100%" }}>
          <BaseMap
            id="mainMap"
            mapRef={mapRef}
            longitude={0}
            latitude={0}
            zoom={11}
            style={"https://tile.openstreetmap.jp/styles/osm-bright/style.json"}
          >
            <GeoJsonToMarkers geojson={geojson} />
          </BaseMap>
        </div>
      </MapProvider>
    </div>
  );
};
