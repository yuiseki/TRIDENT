import { sleep } from "../../src/utils/sleep.js";
import fs from "node:fs/promises";

const limit = 200;
for await (const offset of [
  0, 200, 400, 600, 800, 1000, 1200, 1400, 1600, 1800, 2000,
]) {
  // Disasters
  const disastersEndpoint = "https://api.reliefweb.int/v1/disasters";
  const disastersParams = new URLSearchParams();
  disastersParams.append("appname", "TRIDENT");
  disastersParams.append("profile", "list");
  disastersParams.append("preset", "latest");
  disastersParams.append("limit", limit.toString());
  disastersParams.append("offset", offset.toString());
  const disastersListApiUrl = `${disastersEndpoint}?${disastersParams.toString()}`;
  console.log("fetch disaster list:", disastersListApiUrl);
  const disastersListApiRes = await fetch(disastersListApiUrl);
  const disastersListApiJson = await disastersListApiRes.json();
  for await (const disastersListData of disastersListApiJson.data) {
    const disasterId = disastersListData.id;
    const disastersDetailApiUrl = disastersEndpoint + `/${disasterId}`;
    const disasterBaseDir = `./tmp/api.reliefweb.int/v1/disasters/${disasterId.slice(
      0,
      1
    )}/${disasterId.slice(0, 2)}`;
    const disasterJsonPath = `${disasterBaseDir}/${disasterId}.json`;

    try {
      const disastersAlreadyFetched = (
        await fs.lstat(disasterJsonPath)
      ).isFile();
      if (disastersAlreadyFetched) {
        console.log("already fetched, skip:", disastersDetailApiUrl);
        continue;
      }
    } catch (error) {
      console.log("fetch detail:", disastersDetailApiUrl);
    }

    const disastersDetailApiRes = await fetch(disastersDetailApiUrl);
    if (disastersDetailApiRes.ok) {
      const disastersDetailApiJson = await disastersDetailApiRes.json();

      await fs.mkdir(disasterBaseDir, {
        recursive: true,
      });
      await fs.writeFile(
        disasterJsonPath,
        JSON.stringify(disastersDetailApiJson.data, null, 2)
      );
    }
    await sleep(1000);
  }

  // Reports
  const reportsEndpoint = "https://api.reliefweb.int/v1/reports";
  const reportsParams = new URLSearchParams();
  reportsParams.append("appname", "TRIDENT");
  reportsParams.append("profile", "list");
  reportsParams.append("preset", "latest");
  reportsParams.append("limit", limit.toString());
  reportsParams.append("offset", offset.toString());
  const reportsListApiUrl = `${reportsEndpoint}?${reportsParams.toString()}`;
  console.log("fetch report list:", reportsListApiUrl);
  const reportsListApiRes = await fetch(reportsListApiUrl);
  const reportsListApiJson = await reportsListApiRes.json();
  for await (const reportsListData of reportsListApiJson.data) {
    const reportId = reportsListData.id;
    const reportsDetailApiUrl = reportsEndpoint + `/${reportId}`;
    const reportBaseDir = `./tmp/api.reliefweb.int/v1/reports/${reportId.slice(
      0,
      1
    )}/${reportId.slice(0, 2)}`;
    const reportJsonPath = `${reportBaseDir}/${reportId}.json`;

    try {
      const reportsAlreadyFetched = (await fs.lstat(reportJsonPath)).isFile();
      if (reportsAlreadyFetched) {
        console.log("already fetched, skip:", reportsDetailApiUrl);
        continue;
      }
    } catch (error) {
      console.log("fetch detail:", reportsDetailApiUrl);
    }

    const reportsDetailApiRes = await fetch(reportsDetailApiUrl);
    if (reportsDetailApiRes.ok) {
      const reportsDetailApiJson = await reportsDetailApiRes.json();

      await fs.mkdir(reportBaseDir, {
        recursive: true,
      });
      await fs.writeFile(
        reportJsonPath,
        JSON.stringify(reportsDetailApiJson.data, null, 2)
      );
    }
    await sleep(1000);
  }
}
