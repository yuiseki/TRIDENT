import fs from "node:fs/promises";
import path from "node:path";
import { getDisasterJsonPaths } from "../../src/utils/getDisasterJsonPaths.ts";

// 現在の年月日を取得してフォーマット
const now = new Date();
const year = String(now.getUTCFullYear());
const month = String(now.getUTCMonth() + 1).padStart(2, "0");
const day = String(now.getUTCDate()).padStart(2, "0");

// 出力先ディレクトリのベースパス
const outputBaseDir = "./public/data/voyager";

// GeoJSONの構造
interface GeoJSONFeature {
  type: string;
  geometry: {
    type: string;
    coordinates: number[];
  };
  properties: {
    id: any;
    name: any;
    status: any;
    description: any;
    country: any;
    createdDate: any;
    changedDate: any;
  };
}

async function processDisasterJson(disasterJsonPath: string, countryGeoJSONMap: Map<string, { type: string; features: GeoJSONFeature[] }>) {
  try {
    const disasterListJson = JSON.parse(await fs.readFile(disasterJsonPath, "utf-8"));
    const disasterStatus = disasterListJson[0]?.fields?.status;
    if (disasterStatus !== "ongoing") return;

    const latitude = disasterListJson[0]?.fields?.primary_country?.location?.lat;
    const longitude = disasterListJson[0]?.fields?.primary_country?.location?.lon;
    if (!latitude || !longitude) return;

    const country = disasterListJson[0]?.fields?.primary_country?.name;
    if (!country) return;

    const feature: GeoJSONFeature = {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [longitude, latitude],
      },
      properties: {
        id: disasterListJson[0]?.id,
        name: disasterListJson[0]?.fields?.name,
        status: disasterStatus,
        description: disasterListJson[0]?.fields?.description,
        country: country,
        createdDate: disasterListJson[0]?.fields?.date?.created,
        changedDate: disasterListJson[0]?.fields?.date?.changed,
      },
    };

    if (!countryGeoJSONMap.has(country)) {
      countryGeoJSONMap.set(country, {
        type: "FeatureCollection",
        features: [],
      });
    }
    countryGeoJSONMap.get(country)?.features.push(feature);
  } catch (error) {
    console.error(`Error processing file ${disasterJsonPath}:`, error);
  }
}

async function saveGeoJSONFiles(countryGeoJSONMap: Map<string, { type: string; features: GeoJSONFeature[] }>) {
  for (const [country, geoJSON] of countryGeoJSONMap.entries()) {
    try {
      const countryLatestDir = path.join(outputBaseDir, "latest", country);
      const countryLatestFilePath = path.join(countryLatestDir, "data.geojson");
      await fs.mkdir(countryLatestDir, { recursive: true });
      await fs.writeFile(countryLatestFilePath, JSON.stringify(geoJSON, null, 2));
      console.log(`GeoJSON file created for ${country} at: ${countryLatestFilePath}`);

      const countryTmpDir = path.join("./tmp", "voyager", year, month, day, country);
      const countryTmpFilePath = path.join(countryTmpDir, "data.geojson");
      await fs.mkdir(countryTmpDir, { recursive: true });
      await fs.writeFile(countryTmpFilePath, JSON.stringify(geoJSON, null, 2));
    } catch (error) {
      console.error(`Error saving GeoJSON file for ${country}: ${error}`);
    }
  }
}

async function mergeAllGeoJSONFiles(countryGeoJSONMap: Map<string, { type: string; features: GeoJSONFeature[] }>) {
  const allGeoJSON: { type: string; features: GeoJSONFeature[] } = {
    type: "FeatureCollection",
    features: [],
  };
  for (const geoJSON of countryGeoJSONMap.values()) {
    allGeoJSON.features.push(...geoJSON.features);
  }
  const allGeoJSONFilePath = path.join(outputBaseDir, "latest", "data.geojson");
  await fs.writeFile(allGeoJSONFilePath, JSON.stringify(allGeoJSON, null, 2));
  console.log(`All GeoJSON file created at: ${allGeoJSONFilePath}`);
}

export async function createVoyagerGeoJSON() {
  const disasterJsonPaths = await getDisasterJsonPaths();
  console.info("Processing disaster JSON paths:", disasterJsonPaths.length);

  const countryGeoJSONMap: Map<string, { type: string; features: GeoJSONFeature[] }> = new Map();
  for (const disasterJsonPath of disasterJsonPaths) {
    await processDisasterJson(disasterJsonPath, countryGeoJSONMap);
  }

  await saveGeoJSONFiles(countryGeoJSONMap);
  await mergeAllGeoJSONFiles(countryGeoJSONMap);
}
