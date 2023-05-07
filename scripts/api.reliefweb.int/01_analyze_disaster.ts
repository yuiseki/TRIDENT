import fs from "node:fs/promises";
import * as dotenv from "dotenv";
import { OpenAI } from "langchain/llms/openai";
import { AnalyzeDocumentChain, loadSummarizationChain } from "langchain/chains";
import { exit } from "node:process";

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

const ongoingDisastersJsonList = [];
for await (const jsonFilePath of jsonFilePathList) {
  if (jsonFilePath.includes("summary")) {
    continue;
  }
  const jsonFile = await fs.readFile(jsonFilePath, "utf-8");
  const json = JSON.parse(jsonFile);
  if (json.length === 1 && json[0] && json[0].fields) {
    if (json[0].fields.status !== "past") {
      ongoingDisastersJsonList.push(json[0]);
    }
  } else {
    console.log("unexpected json structure");
    console.log(jsonFilePath);
    exit(1);
  }
}

console.log("num of ongoing disasters: ", ongoingDisastersJsonList.length);

// generate summary for each ongoing disasters
const ongoingDisasterSummaryJsonList = [];
for await (const ongoingDisasterJson of ongoingDisastersJsonList.reverse()) {
  console.log("----- ----- -----");
  const disasterId = ongoingDisasterJson.id;
  console.log(disasterId);
  console.log(ongoingDisasterJson.fields.name);
  const changedUnixTime = new Date(
    ongoingDisasterJson.fields.date.changed
  ).getTime();

  const disasterSummaryBaseDirPublic = `./public/api.reliefweb.int/disasters/${disasterId.slice(
    0,
    1
  )}/${disasterId.slice(0, 2)}/${disasterId}`;
  const disasterSummaryPublicPath = `${disasterSummaryBaseDirPublic}/${changedUnixTime}.json`;
  try {
    const alreadyExists = (await fs.lstat(disasterSummaryPublicPath)).isFile();
    if (alreadyExists) {
      console.log(
        "already generated summary, load:",
        disasterSummaryPublicPath
      );
      const disasterSummaryJsonFile = await fs.readFile(
        disasterSummaryPublicPath,
        "utf-8"
      );
      const disasterSummaryJson = JSON.parse(disasterSummaryJsonFile);
      delete disasterSummaryJson.original;
      delete disasterSummaryJson.text;
      ongoingDisasterSummaryJsonList.push(disasterSummaryJson);
      continue;
    }
  } catch (error) {
    console.log("generate summary for:", disasterSummaryPublicPath);
  }

  // main content
  const disasterPageContent: string | any = `${ongoingDisasterJson.fields.name}

${ongoingDisasterJson.fields.description}`;

  // metadata
  const disasterMetadata = {
    id: ongoingDisasterJson.id,
    name: ongoingDisasterJson.fields.name,
    date_event: new Date(ongoingDisasterJson.fields.date.event).getTime(),
    date_changed: new Date(ongoingDisasterJson.fields.date.changed).getTime(),
    date_created: new Date(ongoingDisasterJson.fields.date.created).getTime(),
    primary_country_id: ongoingDisasterJson.fields.primary_country.id,
    primary_country_name: ongoingDisasterJson.fields.primary_country.name,
    primary_country_iso3: ongoingDisasterJson.fields.primary_country.iso3,
    primary_country_location:
      ongoingDisasterJson.fields.primary_country.location,
    primary_type_id: ongoingDisasterJson.fields.primary_type.id,
    primary_type_code: ongoingDisasterJson.fields.primary_type.code,
    primary_type_name: ongoingDisasterJson.fields.primary_type.name,
  };

  // summarize
  console.log("summarize:", disasterPageContent.length);
  const combineDocsChain = loadSummarizationChain(model);
  const chain = new AnalyzeDocumentChain({
    combineDocumentsChain: combineDocsChain,
  });
  const res = await chain.call({
    input_document: disasterPageContent,
  });
  if ("text" in res) {
    console.log(res.text);
    console.log("summarized:", res.text.length);
    // save result to file
    const disasterSummarizedJson = {
      original: ongoingDisasterJson,
      text: disasterPageContent,
      summary: res.text,
      metadata: disasterMetadata,
    };
    await fs.mkdir(disasterSummaryBaseDirPublic, {
      recursive: true,
    });
    await fs.writeFile(
      disasterSummaryPublicPath,
      JSON.stringify(disasterSummarizedJson, null, 2)
    );
    delete disasterSummarizedJson.original;
    delete disasterSummarizedJson.text;
    ongoingDisasterSummaryJsonList.push(disasterSummarizedJson);
  } else {
    console.error("!!!!! generate summary failed !!!!!");
    console.log(res);
  }
  console.log("----- ----- -----");
}

console.log("----- ----- -----");

// generate summary for today
console.log(ongoingDisasterSummaryJsonList.length);
//console.log(ongoingDisasterSummaryJsonList[0]);
const ongoingDisastersSummaryJoined = ongoingDisasterSummaryJsonList
  .sort((a, b) => b.metadata.date_event - a.metadata.date_event)
  .slice(0, 15)
  .map((d) => d.summary)
  .join("\n")
  .replaceAll("\n\n\n", "\n")
  .replaceAll("\n\n", "\n");
//console.log(ongoingDisastersSummaryJoined);
console.log(ongoingDisastersSummaryJoined.length);

const ongoingDisastersSummaryJoinedBaseDir = `./public/api.reliefweb.int/disasters/summaries/${new Date().getFullYear()}/${
  new Date().getMonth() + 1
}/${new Date().getDate()}`;
const ongoingDisastersSummaryJoinedJsonPath = `${ongoingDisastersSummaryJoinedBaseDir}/summary.json`;

try {
  const alreadyFetched = (
    await fs.lstat(ongoingDisastersSummaryJoinedJsonPath)
  ).isFile();
  if (alreadyFetched) {
    console.log("already generated summary for today, nothing to do");
  }
} catch (error) {
  console.log("generate summary of summaries");
  const combineDocsChain = loadSummarizationChain(model);
  const chain = new AnalyzeDocumentChain({
    combineDocumentsChain: combineDocsChain,
  });
  const res = await chain.call({
    input_document: ongoingDisastersSummaryJoined,
  });
  if ("text" in res) {
    console.log(res.text);
    // save result to file
    const ongoingDisastersSummaryJoinedJson = {
      summary: res.text,
      disasters: ongoingDisasterSummaryJsonList,
    };
    await fs.mkdir(ongoingDisastersSummaryJoinedBaseDir, {
      recursive: true,
    });
    await fs.writeFile(
      `${ongoingDisastersSummaryJoinedBaseDir}/summary.json`,
      JSON.stringify(ongoingDisastersSummaryJoinedJson, null, 2)
    );
    await fs.writeFile(
      `${ongoingDisastersSummaryJoinedBaseDir}/summary.txt`,
      res.text
    );
    await fs.writeFile(
      "./public/api.reliefweb.int/disasters/summaries/latest_summary.json",
      JSON.stringify(ongoingDisastersSummaryJoinedJson, null, 2)
    );
    await fs.writeFile(
      "./public/api.reliefweb.int/disasters/summaries/latest_summary.txt",
      res.text
    );
  }
}
