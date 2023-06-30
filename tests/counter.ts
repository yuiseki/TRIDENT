import fs from "node:fs/promises";

const geoJsonFile = await fs.readFile("./tmp/sample/parks.geojson", "utf-8");
const geoJson = JSON.parse(geoJsonFile);

console.log(geoJson.features.length);
