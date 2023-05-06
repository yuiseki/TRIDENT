import { sleep } from "./../../src/utils/sleep.ts";
import fs from "node:fs/promises";

const limit = 200;
for await (const offset of [
  0, 200, 400, 600, 800, 1000, 1200, 1400, 1600, 1800, 2000,
]) {
  const endpoint = "https://api.reliefweb.int/v1/disasters";
  const params = new URLSearchParams();
  params.append("appname", "TRIDENT");
  params.append("profile", "list");
  params.append("preset", "latest");
  params.append("limit", limit.toString());
  params.append("offset", offset.toString());
  const listApiUrl = `${endpoint}?${params.toString()}`;
  console.log("fetch list:", listApiUrl);
  const listApiRes = await fetch(listApiUrl);
  const listApiJson = await listApiRes.json();
  for await (const listData of listApiJson.data) {
    const disasterId = listData.id;
    const detailApiUrl = endpoint + `/${disasterId}`;
    const disasterBaseDir = `./tmp/api.reliefweb.int/v1/disasters/${disasterId.slice(
      0,
      1
    )}/${disasterId.slice(0, 2)}`;
    const disasterJsonPath = `${disasterBaseDir}/${disasterId}.json`;

    try {
      const alreadyFetched = (await fs.lstat(disasterJsonPath)).isFile();
      if (alreadyFetched) {
        console.log("already fetched, skip:", detailApiUrl);
        continue;
      }
    } catch (error) {
      console.log("fetch detail:", detailApiUrl);
    }

    const detailApiRes = await fetch(detailApiUrl);
    if (detailApiRes.ok) {
      const detailApiJson = await detailApiRes.json();

      await fs.mkdir(disasterBaseDir, {
        recursive: true,
      });
      await fs.writeFile(
        disasterJsonPath,
        JSON.stringify(detailApiJson.data, null, 2)
      );
    }
    await sleep(1000);
  }
}
