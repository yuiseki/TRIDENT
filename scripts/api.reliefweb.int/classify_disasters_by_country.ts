import * as fs from "fs/promises";
import * as path from "path";

// 生成されたGeoJSONのベースディレクトリ
const baseDir = "./tmp/geojson";
// GeoJSONを保存するpublicディレクトリ
const outputBaseDir = "./public/data/voyager";

// 現在の年月日を取得してフォーマット
const now = new Date();
const year = String(now.getUTCFullYear());
const month = String(now.getUTCMonth() + 1).padStart(2, "0");
const day = String(now.getUTCDate()).padStart(2, "0");

// 出力先ディレクトリとファイルパス
const outputDir = path.join(outputBaseDir, year, month, day);
const outputFilePath = path.join(outputDir, "data.geojson");

// 結果をまとめるGeoJSON
let combinedGeoJSON = { type: "FeatureCollection", features: [] };

async function mergeOngoingDisasters() {
  async function processDirectory(dirPath: string) {
    // ディレクトリが存在しない場合は作成
    await fs.mkdir(dirPath, { recursive: true }).catch(() => {
      console.warn(`Directory not found and created: ${dirPath}`);
    });

    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        // 再帰的に処理
        await processDirectory(fullPath);
      } else if (entry.isFile() && entry.name === "data.geojson") {
        try {
          // GeoJSONを読み込み
          const fileContent = await fs.readFile(fullPath, "utf-8");
          const data = JSON.parse(fileContent);

          // フィーチャーをフィルタリング: statusが"ongoing"のもののみ
          const ongoingFeatures = data.features.filter(
            (feature: any) => feature.properties?.status === "ongoing"
          );

          // フィルタリング結果をマージ
          combinedGeoJSON.features =
            combinedGeoJSON.features.concat(ongoingFeatures);
        } catch (error) {
          console.error(`Error processing file ${fullPath}:`, error);
        }
      }
    }
  }

  // ベースディレクトリ全体を処理
  await processDirectory(baseDir);

  // GeoJSONを保存
  try {
    await fs.mkdir(outputDir, { recursive: true });
    await fs.writeFile(
      outputFilePath,
      JSON.stringify(combinedGeoJSON, null, 2)
    );
    console.log(`Ongoing disasters saved to: ${outputFilePath}`);
  } catch (error) {
    console.error(`Error saving file to ${outputFilePath}:`, error);
  }
}

// 実行
mergeOngoingDisasters().catch((error) => {
  console.error("Error:", error);
});
