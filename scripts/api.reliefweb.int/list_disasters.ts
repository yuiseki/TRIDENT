import fs from "node:fs/promises";
import { getDisasterJsonPaths } from "../../src/utils/getDisasterJsonPaths.ts";

const disasterJsonPaths = await getDisasterJsonPaths();

console.info("disasterJsonPaths:", disasterJsonPaths.length);

// disasterJsonPaths にあるJSONを一つづつ読み込む
for (const disasterJsonPath of disasterJsonPaths.slice(0, 500)) {
  let disasterListJson;
  try {
    disasterListJson = JSON.parse(await fs.readFile(disasterJsonPath, "utf-8"));
    const disasterStatus = disasterListJson[0].fields.status;
    if (disasterStatus !== "ongoing") {
      continue;
    }
    console.log("----- ----- -----");
    console.log("");
    console.log("");
    const disasterId = disasterListJson[0].id;
    console.log("Id:", disasterId);
    const disasterName = disasterListJson[0].fields.name;
    console.log("Name:", disasterName);
    console.log("Status:", disasterStatus);
    const disasterCountries = disasterListJson[0].fields.country
      .map((c: any) => c.shortname)
      .join(", ");
    const disasterTypes = disasterListJson[0].fields.type
      .map((t: any) => t.name)
      .join(", ");
    const disasterOverview = disasterListJson[0].fields.profile.overview;
    const disasterDescription = `# ${disasterName}
Countries: ${disasterCountries}
Types: ${disasterTypes}

${disasterOverview}`;
    //console.log(disasterDescription);
    console.log("");
    console.log("");
    console.log("----- ----- -----");
  } catch (error) {
    console.error(error);
    continue;
  }
}
