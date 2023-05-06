import fs from "node:fs/promises";
import * as dotenv from "dotenv";
import { OpenAI } from "langchain/llms/openai";
import { AnalyzeDocumentChain, loadSummarizationChain } from "langchain/chains";

dotenv.config();
const model = new OpenAI({ temperature: 0 });

const readdirRecursively = async (dir: string, files: string[] = []) => {
  const direntList = await fs.readdir(dir, { withFileTypes: true });
  const dirs = [];
  for (const dirent of direntList) {
    if (dirent.isDirectory()) dirs.push(`${dir}/${dirent.name}`);
    if (dirent.isFile()) files.push(`${dir}/${dirent.name}`);
  }
  for (const d of dirs) {
    files = await readdirRecursively(d, files);
  }
  return Promise.resolve(files);
};

const baseDirPath = "./tmp/api.reliefweb.int/v1/disasters";

const jsonFilePathList = await readdirRecursively(baseDirPath);

const ongoingDisasterJsonList = [];
for await (const jsonFilePath of jsonFilePathList) {
  if (jsonFilePath.includes("summary")) {
    continue;
  }
  const jsonFile = await fs.readFile(jsonFilePath, "utf-8");
  const json = JSON.parse(jsonFile);
  if (json.length === 1 && json[0] && json[0].fields) {
    if (json[0].fields.status === "ongoing") {
      ongoingDisasterJsonList.push(json[0]);
    }
  } else {
    if (
      json.data &&
      json.data.length === 1 &&
      json.data[0] &&
      json.data[0].fields
    ) {
      if (json.data[0].fields.status === "ongoing") {
        ongoingDisasterJsonList.push(json.data[0]);
      }
    } else {
      console.log(json);
      console.log(jsonFilePath);
    }
  }
}

console.log("ongoing: ", ongoingDisasterJsonList.length);

const ongoingDisasterSummaryJsonList = [];
for await (const ongoingJson of ongoingDisasterJsonList
  .reverse()
  .slice(0, 20)) {
  const disasterId = ongoingJson.id;
  const changedUnixTime = new Date(ongoingJson.fields.date.changed).getTime();
  const disasterSummaryBaseDir = `./tmp/api.reliefweb.int/v1/disasters/${disasterId.slice(
    0,
    1
  )}/${disasterId.slice(0, 2)}/${disasterId}/summary`;
  const disasterSummaryJsonPath = `${disasterSummaryBaseDir}/${changedUnixTime}.json`;
  try {
    const alreadyFetched = (await fs.lstat(disasterSummaryJsonPath)).isFile();
    if (alreadyFetched) {
      console.log("already summarized, load:", disasterSummaryJsonPath);
      const disasterSummaryJsonFile = await fs.readFile(
        disasterSummaryJsonPath,
        "utf-8"
      );
      const disasterSummaryJson = JSON.parse(disasterSummaryJsonFile);
      ongoingDisasterSummaryJsonList.push(disasterSummaryJson);
      continue;
    }
  } catch (error) {
    console.log("generate summary:", disasterSummaryJsonPath);
  }

  const disasterMetadata = {
    id: ongoingJson.id,
    date_event: new Date(ongoingJson.fields.date.event).getTime(),
    date_changed: new Date(ongoingJson.fields.date.changed).getTime(),
    date_created: new Date(ongoingJson.fields.date.created).getTime(),
    primary_country_id: ongoingJson.fields.primary_country.id,
    primary_country_name: ongoingJson.fields.primary_country.name,
    primary_country_iso3: ongoingJson.fields.primary_country.iso3,
    primary_country_location: ongoingJson.fields.primary_country.location,
    primary_type_id: ongoingJson.fields.primary_type.id,
    primary_type_name: ongoingJson.fields.primary_type.name,
    countries: ongoingJson.fields.country,
    types: ongoingJson.fields.type,
  };
  const disasterPageContent = `${ongoingJson.fields.name}

${ongoingJson.fields.description}`;

  console.log("----- ----- -----");
  console.log(disasterPageContent.length);

  // summarize
  const combineDocsChain = loadSummarizationChain(model);
  const chain = new AnalyzeDocumentChain({
    combineDocumentsChain: combineDocsChain,
  });
  const res = await chain.call({
    input_document: disasterPageContent,
  });
  if ("text" in res) {
    console.log(res.text);
    const disasterSummarizedJson = {
      original: disasterPageContent,
      summary: res.text,
      metadata: disasterMetadata,
    };
    await fs.mkdir(disasterSummaryBaseDir, {
      recursive: true,
    });
    await fs.writeFile(
      disasterSummaryJsonPath,
      JSON.stringify(disasterSummarizedJson, null, 2)
    );
    ongoingDisasterSummaryJsonList.push(disasterSummarizedJson);
  } else {
    console.error("!!!!! generate summary failed !!!!!");
    console.log(res);
  }
  console.log("----- ----- -----");
}

console.log(ongoingDisasterSummaryJsonList.length);

const ongoingDisasterSummaryJoined = ongoingDisasterSummaryJsonList
  .map((d) => d.summary)
  .join("\n")
  .replaceAll("\n\n\n", "\n")
  .replaceAll("\n\n", "\n");
console.log(ongoingDisasterSummaryJoined.length);

console.log("----- ----- -----");

const ongoingDisasterSummaryJoinedBaseDir = `./public/api.reliefweb.int/${new Date().getFullYear()}/${
  new Date().getMonth() + 1
}/${new Date().getDate()}`;
const ongoingDisasterSummaryJoinedJsonPath = `${ongoingDisasterSummaryJoinedBaseDir}/summary.json`;

try {
  const alreadyFetched = (
    await fs.lstat(ongoingDisasterSummaryJoinedJsonPath)
  ).isFile();
  if (alreadyFetched) {
    console.log("already summarized today, nothing to do");
  }
} catch (error) {
  console.log("generate summary of summaries");
  const combineDocsChain = loadSummarizationChain(model);
  const chain = new AnalyzeDocumentChain({
    combineDocumentsChain: combineDocsChain,
  });
  const res = await chain.call({
    input_document: ongoingDisasterSummaryJoined,
  });
  if ("text" in res) {
    console.log(res.text);
    const ongoingDisasterSummaryJoinedJson = {
      summary: res.text,
      disasters: ongoingDisasterSummaryJsonList,
    };
    await fs.mkdir(ongoingDisasterSummaryJoinedBaseDir, {
      recursive: true,
    });
    await fs.writeFile(
      `${ongoingDisasterSummaryJoinedBaseDir}/summary.json`,
      JSON.stringify(ongoingDisasterSummaryJoinedJson, null, 2)
    );
    await fs.writeFile(
      "./public/api.reliefweb.int/latest_summary.json",
      JSON.stringify(ongoingDisasterSummaryJoinedJson, null, 2)
    );
  }
}
