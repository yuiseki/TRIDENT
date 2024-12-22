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

async function createVoyagerGeoJSON() {
  const disasterJsonPaths = await getDisasterJsonPaths();

  console.info("Processing disaster JSON paths:", disasterJsonPaths.length);

  // 国ごとのGeoJSONを保持するMap
  const countryGeoJSONMap: Map<
    string,
    { type: string; features: GeoJSONFeature[] }
  > = new Map();

  for (const disasterJsonPath of disasterJsonPaths) {
    try {
      // JSONファイルを読み込む
      const disasterListJson = JSON.parse(
        await fs.readFile(disasterJsonPath, "utf-8")
      );

      // `status`が`ongoing`かどうか確認
      const disasterStatus = disasterListJson[0]?.fields?.status;
      if (disasterStatus !== "ongoing") {
        continue;
      }

      // 緯度経度を取得（存在しない場合はスキップ）
      const latitude =
        disasterListJson[0]?.fields?.primary_country?.location?.lat;
      const longitude =
        disasterListJson[0]?.fields?.primary_country?.location?.lon;
      if (!latitude || !longitude) {
        continue;
      }

      // 国名を取得（存在しない場合はスキップ）
      const country = disasterListJson[0]?.fields?.primary_country?.name;
      if (!country) {
        continue;
      }

      // GeoJSONのFeatureを作成
      const feature: GeoJSONFeature = {
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: [longitude, latitude], // GeoJSON形式: [lon, lat]
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

      // 国ごとのGeoJSONにフィーチャーを追加
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

  // 国ごとにGeoJSONを保存
  for (const [country, geoJSON] of countryGeoJSONMap.entries()) {
    const countryDir = path.join(outputBaseDir, year, month, day, country);
    const countryFilePath = path.join(countryDir, "data.geojson");

    try {
      await fs.mkdir(countryDir, { recursive: true });
      await fs.writeFile(countryFilePath, JSON.stringify(geoJSON, null, 2));
      console.log(`GeoJSON file created for ${country} at: ${countryFilePath}`);
    } catch (error) {
      console.error(`Error saving GeoJSON file for ${country}: ${error}`);
    }
  }
}

// 実行
createVoyagerGeoJSON().catch((error) => {
  console.error("Error in createVoyagerGeoJSON:", error);
});
