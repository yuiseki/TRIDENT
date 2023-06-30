import fs from "node:fs/promises";
import * as turf from "@turf/turf";
import { FeatureCollection } from "geojson";

const geoJsonFile = await fs.readFile("./tmp/sample/parks.geojson", "utf-8");
const geoJson: FeatureCollection = JSON.parse(geoJsonFile);

for await (const feature of geoJson.features) {
  if (feature.properties === null) {
    continue;
  }
  let area = 0;
  switch (feature.geometry.type) {
    case "Polygon":
      const polygonFeatures = turf.polygon(feature.geometry.coordinates);
      area = turf.area(polygonFeatures);
      break;
    case "MultiPolygon":
      const multiPolygonFeatures = turf.multiPolygon(
        feature.geometry.coordinates
      );
      area = turf.area(multiPolygonFeatures);
      break;
    case "LineString":
      area = 0;
      break;
    case "Point":
      area = 0;
    default:
      break;
  }
  feature.properties.area = area;
}

const sorted = geoJson.features
  .filter((f) => !!f.properties)
  .filter((f) => f.properties && f.properties.area !== 0)
  .sort((a, b) => {
    if (!a.properties || !b.properties) {
      return 0;
    }
    return b.properties.area - a.properties.area;
  });
console.log(sorted[0]);
console.log(sorted[sorted.length - 1]);
