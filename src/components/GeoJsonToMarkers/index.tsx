import * as turf from "@turf/turf";
import { Feature, FeatureCollection, GeoJsonProperties, Point } from "geojson";
import { useCallback, useEffect, useState } from "react";
import { Marker, useMap } from "react-map-gl";

export const GeoJsonToMarkers: React.FC<{
  geojson?: FeatureCollection;
  emoji?: string;
}> = ({ geojson, emoji = "🇺🇳" }) => {
  const { current: map } = useMap();

  const [currentZoom, setCurrentZoom] = useState<number | undefined>(8);

  useEffect(() => {
    if (!map) return;
    map.on("load", () => {
      setCurrentZoom(map.getZoom());
    });
    map.on("move", () => {
      setCurrentZoom(map.getZoom());
    });
    setCurrentZoom(map.getZoom());
  }, [map]);

  const onClickMarker = useCallback(
    (center: Feature<Point, GeoJsonProperties> | undefined) => {
      if (map === undefined || center === undefined) {
        return;
      }
      const zoomTo = map.getZoom() < 10 ? 10 : 14;
      map.flyTo({
        center: [
          center.geometry.coordinates[0],
          center.geometry.coordinates[1],
        ],
        zoom: zoomTo,
      });
    },
    [map]
  );

  if (geojson === undefined || geojson.features === undefined) {
    return null;
  }

  return (
    <>
      {geojson.features.map((feature) => {
        if (feature.geometry === undefined) {
          return null;
        }
        if (
          feature.geometry.type !== "Polygon" &&
          feature.geometry.type !== "LineString" &&
          feature.geometry.type !== "Point"
        ) {
          return null;
        }

        let zIndex = 100;
        let fontSize = "1.5em";
        let icon = emoji;
        let title = "No name";

        if (
          feature.properties &&
          feature.properties.name &&
          feature.properties.name.length > 0
        ) {
          title = feature.properties.name;
        }

        // United Nations
        if (
          (feature.properties &&
            feature.properties.operator &&
            (feature.properties.operator.includes("UN") ||
              feature.properties.operator.includes("United Nations"))) ||
          (feature.properties &&
            feature.properties.name &&
            (feature.properties.name.includes("UN") ||
              feature.properties.name.includes("United Nations")))
        ) {
          icon = "🇺🇳";
          zIndex = 110;
        }

        let center: Feature<Point, GeoJsonProperties> | undefined = undefined;
        switch (feature.geometry.type) {
          case "Polygon":
            const polygonFeatures = turf.polygon(feature.geometry.coordinates);
            center = turf.centroid(polygonFeatures);
            break;
          case "LineString":
            const bbox = turf.bbox(feature);
            const polygon = turf.bboxPolygon(bbox);
            center = turf.centroid(polygon);
            break;
          case "Point":
            center = turf.point(feature.geometry.coordinates);
          default:
            break;
        }
        if (center === undefined) {
          return null;
        }
        let opacity = 0.8;
        if (currentZoom) {
          if (13 < currentZoom) {
            opacity = 1.0;
          } else if (12 < currentZoom) {
            opacity = 0.95;
          } else if (10 < currentZoom) {
            opacity = 0.9;
          } else if (8 < currentZoom) {
            opacity = 0.85;
          } else {
          }
        }
        return (
          <Marker
            key={feature.id}
            longitude={center.geometry.coordinates[0]}
            latitude={center.geometry.coordinates[1]}
            onClick={() => onClickMarker(center)}
            style={{ zIndex: zIndex }}
          >
            <div
              title={title}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "pointer",
                opacity: opacity,
              }}
            >
              <div
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.5)",
                  backdropFilter: "blur(4px)",
                  borderRadius: "4px",
                  padding: "6px",
                  fontSize: fontSize,
                  fontFamily: "sans-serif, emoji",
                }}
              >
                {icon}
              </div>
            </div>
          </Marker>
        );
      })}
    </>
  );
};
