import { MapRef, PaddingOptions } from "react-map-gl/maplibre";
import * as turf from "@turf/turf";
import { MutableRefObject } from "react";

export const fitBoundsToGeoJson = (
  mapRef: MutableRefObject<MapRef | null>,
  geoJson: GeoJSON.FeatureCollection,
  padding?: PaddingOptions
) => {
  if (!mapRef || !mapRef.current) return;

  const [minLng, minLat, maxLng, maxLat] = turf.bbox(geoJson);
  mapRef.current.fitBounds(
    [
      [minLng, minLat],
      [maxLng, maxLat],
    ],
    {
      padding: padding,
      duration: 1000,
    }
  );
};
