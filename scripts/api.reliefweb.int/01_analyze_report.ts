import fs from "node:fs/promises";
import * as dotenv from "dotenv";
import { OpenAI } from "langchain/llms/openai";
import { AnalyzeDocumentChain, loadSummarizationChain } from "langchain/chains";
import { exit } from "node:process";
import { MarkdownTextSplitter } from "langchain/text_splitter";

dotenv.config();
const model = new OpenAI({ temperature: 0 });
const splitter = new MarkdownTextSplitter();

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

const baseDirPath = "./tmp/api.reliefweb.int/v1/reports";

const jsonFilePathList = await readdirRecursively(baseDirPath);

const recentReportsJsonList = [];
for await (const jsonFilePath of jsonFilePathList) {
  const jsonFile = await fs.readFile(jsonFilePath, "utf-8");
  const json = JSON.parse(jsonFile);
  const originalDate = new Date(json[0].fields.date.original).getTime();
  const oneDay = 24 * 60 * 60 * 1000;
  const daysAgo = new Date().getTime() - oneDay * 30;
  if (originalDate < daysAgo) {
    continue;
  }
  if (json[0].fields.language[0].name !== "English") {
    continue;
  }
  // Analysis is possibly useful
  // News and Press Release are useful but noisy
  if (
    !["Situation Report", "Analysis"].includes(json[0].fields.format[0].name)
  ) {
    continue;
  }
  if (json[0].fields.source[0].type.id !== 272) {
    continue;
  }
  if (json[0].fields.source[0].name.includes("Europe")) {
    continue;
  }
  recentReportsJsonList.push(json[0]);
}

console.log(
  "num of recent reports: ",
  recentReportsJsonList.length,
  "/",
  jsonFilePathList.length
);

const recentReportsSummaryJsonList = [];
for await (const reportJson of recentReportsJsonList) {
  console.log("----- ----- -----");
  const reportId = reportJson.id;
  console.log(reportId);
  console.log(reportJson.fields.title);
  const reportSummaryPublicDir = `./public/api.reliefweb.int/reports/${reportId.slice(
    0,
    1
  )}/${reportId.slice(0, 2)}/${reportId}`;
  const reportSummaryPublicPath = `${reportSummaryPublicDir}/summary.json`;

  try {
    const alreadyExists = (await fs.lstat(reportSummaryPublicPath)).isFile();
    if (alreadyExists) {
      console.log("already generated summary, load:", reportSummaryPublicPath);
      const reportSummaryJsonFile = await fs.readFile(
        reportSummaryPublicPath,
        "utf-8"
      );
      const reportSummaryJson = JSON.parse(reportSummaryJsonFile);
      delete reportSummaryJson.original;
      delete reportSummaryJson.text;
      recentReportsSummaryJsonList.push(reportSummaryJson);
      continue;
    }
  } catch (error) {
    console.log("generate summary for:", reportSummaryPublicPath);
  }

  // main content
  const reportPageContent: string | any = `# ${reportJson.fields.title}

${reportJson.fields.body}`;

  // metadata
  const reportMetadata = {
    id: reportJson.id,
    name: reportJson.fields.title,
    date_original: new Date(reportJson.fields.date.original).getTime(),
    date_changed: new Date(reportJson.fields.date.changed).getTime(),
    date_created: new Date(reportJson.fields.date.created).getTime(),
    primary_country_id: reportJson.fields.primary_country.id,
    primary_country_name: reportJson.fields.primary_country.name,
    primary_country_iso3: reportJson.fields.primary_country.iso3,
    primary_country_location: reportJson.fields.primary_country.location,
  };

  /*
  const splittedDocs = await splitter.createDocuments(
    [reportPageContent],
    [reportMetadata]
  );
  console.log(splittedDocs.length);
  */

  // summarize
  console.log("summarize:", reportPageContent.length);
  const combineDocsChain = loadSummarizationChain(model);
  const chain = new AnalyzeDocumentChain({
    combineDocumentsChain: combineDocsChain,
  });
  const res = await chain.call({
    input_document: reportPageContent,
  });
  if ("text" in res) {
    console.log(res.text);
    console.log("summarized:", res.text.length);
    // save result to file
    const reportSummarizedJson = {
      original: reportJson,
      text: reportPageContent,
      summary: res.text,
      metadata: reportMetadata,
    };
    await fs.mkdir(reportSummaryPublicDir, {
      recursive: true,
    });
    await fs.writeFile(
      reportSummaryPublicPath,
      JSON.stringify(reportSummarizedJson, null, 2)
    );
    delete reportSummarizedJson.original;
    delete reportSummarizedJson.text;
    recentReportsSummaryJsonList.push(reportSummarizedJson);
  } else {
    console.error("!!!!! generate summary failed !!!!!");
    console.log(res);
  }
  console.log("----- ----- -----");
}

console.log("----- ----- -----");

// generate summary for today
console.log(recentReportsSummaryJsonList.length);
//console.log(ongoingDisasterSummaryJsonList[0]);
const recentReportsSummaryJoined = recentReportsSummaryJsonList
  .sort((a, b) => b.metadata.date_original - a.metadata.date_original)
  .slice(0, 15)
  .map((d) => d.summary)
  .join("\n")
  .replaceAll("\n\n\n", "\n")
  .replaceAll("\n\n", "\n");
//console.log(ongoingDisastersSummaryJoined);
console.log(recentReportsSummaryJoined.length);

const recentReportsSummaryJoinedBaseDir = `./public/api.reliefweb.int/reports/summaries/${new Date().getFullYear()}/${
  new Date().getMonth() + 1
}/${new Date().getDate()}`;
const recentReportsSummaryJoinedJsonPath = `${recentReportsSummaryJoinedBaseDir}/summary.json`;

try {
  const alreadyFetched = (
    await fs.lstat(recentReportsSummaryJoinedJsonPath)
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
    input_document: recentReportsSummaryJoined,
  });
  if ("text" in res) {
    console.log(res.text);
    // save result to file
    const recentReportsSummaryJoinedJson = {
      summary: res.text,
      reports: recentReportsSummaryJsonList,
    };
    await fs.mkdir(recentReportsSummaryJoinedBaseDir, {
      recursive: true,
    });
    await fs.writeFile(
      `${recentReportsSummaryJoinedBaseDir}/summary.json`,
      JSON.stringify(recentReportsSummaryJoinedJson, null, 2)
    );
    await fs.writeFile(
      `${recentReportsSummaryJoinedBaseDir}/summary.txt`,
      res.text
    );
    await fs.writeFile(
      "./public/api.reliefweb.int/reports/summaries/latest_summary.json",
      JSON.stringify(recentReportsSummaryJoinedJson, null, 2)
    );
    await fs.writeFile(
      "./public/api.reliefweb.int/reports/summaries/latest_summary.txt",
      res.text
    );
  }
}
