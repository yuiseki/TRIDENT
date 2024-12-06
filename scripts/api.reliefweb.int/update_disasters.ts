import fs from "node:fs/promises";
import { getDisasterJsonPaths } from "../../src/utils/getDisasterJsonPaths.ts";

const disasterJsonPaths = await getDisasterJsonPaths();

console.info("disasterJsonPaths:", disasterJsonPaths.length);

// disasterJsonPaths にあるJSONを一つづつ読み込む
for (const disasterJsonPath of disasterJsonPaths) {
  let disasterListJson;
  try {
    // disasterJsonPath の更新日時を取得
    const disasterStat = await fs.stat(disasterJsonPath);
    // disasterJsonPath の更新日時が24時間以内だったらスキップ
    const dateOneDayAgo = new Date();
    dateOneDayAgo.setDate(dateOneDayAgo.getDate() - 1);
    if (disasterStat.mtime > dateOneDayAgo) {
      continue;
    }
    disasterListJson = JSON.parse(await fs.readFile(disasterJsonPath, "utf-8"));
    const disasterStatus = disasterListJson[0].fields.status;
    if (disasterStatus !== "ongoing") {
      continue;
    }
    const disasterId = disasterListJson[0].id;
    console.log("Id:", disasterId);
    const disasterName = disasterListJson[0].fields.name;
    console.log("Name:", disasterName);
    console.log("Status:", disasterStatus);
    const newDisasterRes = await fetch(
      `https://api.reliefweb.int/v1/disasters/${disasterId}?appname=TRIDENT`
    );
    const newDisasterData = (await newDisasterRes.json()).data;
    const newDisasterStatus = newDisasterData[0].fields.status;
    console.log("New Status:", newDisasterStatus);
    // newDisasterData を disasterJsonPath に上書き保存
    await fs.writeFile(
      disasterJsonPath,
      JSON.stringify(newDisasterData, null, 2)
    );
  } catch (error) {
    console.error(error);
    continue;
  }
}
