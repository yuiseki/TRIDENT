import fs from "node:fs/promises";
import * as turf from "@turf/turf";
import { FeatureCollection } from "geojson";
import { exit } from "node:process";

const geoJsonFileStations = await fs.readFile(
  "./tmp/sample/stations.geojson",
  "utf-8"
);
const geoJsonStations: FeatureCollection = JSON.parse(geoJsonFileStations);
const geoJsonFileParks = await fs.readFile(
  "./tmp/sample/parks.geojson",
  "utf-8"
);
const geoJsonParks: FeatureCollection = JSON.parse(geoJsonFileParks);

const myStation = geoJsonStations.features.filter(
  (f) => f.properties && f.properties.name === "御徒町"
)[0];
let myStationCenter;
switch (myStation.geometry.type) {
  case "Polygon":
    const myStationPolygon = turf.polygon(myStation.geometry.coordinates);
    myStationCenter = turf.centroid(myStationPolygon);
    break;
  case "MultiPolygon":
    const multiPolygonFeatures = turf.multiPolygon(
      myStation.geometry.coordinates
    );
    myStationCenter = turf.centroid(multiPolygonFeatures);
    break;
  case "Point":
    myStationCenter = turf.point(myStation.geometry.coordinates);
  default:
    break;
}

console.log(myStationCenter);
if (!myStationCenter) {
  exit(0);
}

for await (const feature of geoJsonParks.features) {
  if (feature.properties === null) {
    continue;
  }
  let center = undefined;
  let distance = 0;
  switch (feature.geometry.type) {
    case "Polygon":
      const polygonFeatures = turf.polygon(feature.geometry.coordinates);
      center = turf.centroid(polygonFeatures);
      distance = turf.distance(myStationCenter, center);
      break;
    case "MultiPolygon":
      const multiPolygonFeatures = turf.multiPolygon(
        feature.geometry.coordinates
      );
      center = turf.centroid(multiPolygonFeatures);
      distance = turf.distance(myStationCenter, center);
      break;
    case "LineString":
      distance = 0;
      break;
    case "Point":
      center = turf.point(feature.geometry.coordinates);
      distance = turf.distance(myStationCenter, center);
    default:
      break;
  }
  feature.properties.distance = distance;
}

const sorted = geoJsonParks.features
  .filter((f) => !!f.properties)
  .filter((f) => f.properties && f.properties.distance !== 0)
  .sort((a, b) => {
    if (!a.properties || !b.properties) {
      return 0;
    }
    return a.properties.distance - b.properties.distance;
  });
console.log(sorted[0]);
console.log(sorted[sorted.length - 1]);
