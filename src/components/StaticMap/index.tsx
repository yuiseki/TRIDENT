import { MapProvider, MapRef } from "react-map-gl/maplibre";
import { LngLatLike, StyleSpecification } from "maplibre-gl";
import { BaseMap } from "../BaseMap";
import { useCallback, useEffect, useRef } from "react";
import { TridentMapsStyle } from "@/types/TridentMaps";
import { FeatureCollection } from "geojson";
import * as turf from "@turf/turf";
import { GeoJsonToSourceLayer } from "../GeoJsonToSourceLayer";

export const StaticMap: React.FC<{
  children?: any;
  style: string | StyleSpecification;
  geojsonWithStyleList?: Array<{
    id: string;
    style: TridentMapsStyle;
    geojson: FeatureCollection;
  }>;
  mapPadding?: number;
  maxZoom?: number;
  projection?: "mercator" | "globe";
  showAtmosphere?: boolean;
  showAttribution?: boolean;
  showControls?: boolean;
  showAsCircle?: boolean;
}> = ({
  children,
  style = "/map_styles/fiord-color-gl-style/style.json",
  geojsonWithStyleList = [],
  mapPadding = 200,
  maxZoom = 22,
  projection = "mercator",
  showAtmosphere = false,
  showAttribution = false,
  showControls = false,
  showAsCircle = false,
}) => {
  const mapRef = useRef<MapRef | null>(null);

  const onMapLoad = useCallback(() => {
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
        { padding: mapPadding, duration: 1000, maxZoom: maxZoom }
      );
    } catch (error) {
      console.error(error);
    }
  }, [geojsonWithStyleList, mapPadding, maxZoom]);

  useEffect(() => {
    setTimeout(() => {
      onMapLoad();
    }, 2000);
  }, [onMapLoad]);

  return (
    <MapProvider>
      <BaseMap
        mapRef={mapRef}
        onMapLoad={onMapLoad}
        style={style}
        longitude={0}
        latitude={0}
        zoom={1}
        maxZoom={maxZoom}
        initialProjection={projection}
        enableInteractions={false}
        showAtmosphere={showAtmosphere}
        showAttribution={showAttribution}
        showControls={showControls}
        showAsCircle={showAsCircle}
        attributionPosition="bottom-right"
      >
        {children}
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
