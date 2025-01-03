import { MapProvider, MapRef, MapStyle } from "react-map-gl/maplibre";
import { BaseMap } from "../BaseMap";
import { useEffect, useRef } from "react";
import { TridentMapsStyle } from "@/types/TridentMaps";
import { FeatureCollection } from "geojson";
import * as turf from "@turf/turf";
import { GeoJsonToSourceLayer } from "../GeoJsonToSourceLayer";

export const StaticMap: React.FC<{
  style: string | MapStyle;
  geojsonWithStyleList?: Array<{
    id: string;
    style: TridentMapsStyle;
    geojson: FeatureCollection;
  }>;
  mapPadding?: number;
}> = ({
  style = "/map_styles/fiord-color-gl-style/style.json",
  geojsonWithStyleList = [],
  mapPadding = 200,
}) => {
  const mapRef = useRef<MapRef | null>(null);

  useEffect(() => {
    setTimeout(() => {
      if (!mapRef || !mapRef.current) return;
      if (geojsonWithStyleList.length === 0) return;
      try {
        console.log(geojsonWithStyleList);
        geojsonWithStyleList.map((item) =>
          console.log(JSON.stringify(item.geojson))
        );
        const everything: FeatureCollection = {
          type: "FeatureCollection",
          features: geojsonWithStyleList
            .map((item) => item.geojson.features)
            .flat(),
        };
        const [minLng, minLat, maxLng, maxLat] = turf.bbox(everything);
        mapRef.current.fitBounds(
          [
            [minLng, minLat],
            [maxLng, maxLat],
          ],
          { padding: mapPadding, duration: 1000 }
        );
      } catch (error) {
        console.error(error);
      }
    }, 500);
  }, [geojsonWithStyleList, mapPadding]);

  return (
    <MapProvider>
      <BaseMap
        mapRef={mapRef}
        style={style}
        longitude={0}
        latitude={0}
        zoom={1}
        enableInteractions={false}
        attributionPosition="bottom-right"
      >
        {geojsonWithStyleList &&
          geojsonWithStyleList.map((geojsonWithStyle) => {
            return (
              <GeoJsonToSourceLayer
                key={geojsonWithStyle.id}
                geojson={geojsonWithStyle.geojson}
                style={geojsonWithStyle.style}
              />
            );
          })}
      </BaseMap>
    </MapProvider>
  );
};
