import { MapProvider, MapRef } from "react-map-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { BaseMap } from "../BaseMap";
import { GeoJsonToMarkers } from "../GeoJsonToMarkers";
import { Feature, FeatureCollection, GeoJsonProperties, Point } from "geojson";
import { useCallback, useEffect, useRef, useState } from "react";
import * as turf from "@turf/turf";

export const GeoJsonMap = ({ geojson }: { geojson: FeatureCollection }) => {
  const mapRef = useRef<MapRef | null>(null);
  const [currentCenter, setCurrentCenter] = useState<number[] | undefined>(
    undefined
  );

  // 初回のみ地図をデータにあわせる
  useEffect(() => {
    setTimeout(() => {
      if (!mapRef || !mapRef.current) return;
      if (geojson === undefined) return;
      try {
        console.log(geojson);
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

  const updateCurrentCenter = useCallback(() => {
    if (!mapRef || !mapRef.current) return;
    setCurrentCenter([
      mapRef.current.getCenter().lng,
      mapRef.current.getCenter().lat,
    ]);
  }, []);

  if (!geojson) return null;

  return (
    <div style={{ width: "100%" }}>
      <MapProvider>
        <div style={{ margin: "0px" }}>
          <BaseMap
            id="mainMap"
            mapRef={mapRef}
            longitude={0}
            latitude={0}
            zoom={11}
            onMapLoad={updateCurrentCenter}
            onMapMoveEnd={updateCurrentCenter}
            style={"https://tile.openstreetmap.jp/styles/osm-bright/style.json"}
          >
            <GeoJsonToMarkers geojson={geojson} />
          </BaseMap>
        </div>
      </MapProvider>
    </div>
  );
};
