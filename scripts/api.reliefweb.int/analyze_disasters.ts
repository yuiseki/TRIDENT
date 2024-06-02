import { loadAreaWithConcernExtractorChain } from "../../src/utils/langchain/chains/loadAreaWithConcernExtractorChain/index.ts";
import { loadListedSummarizationChain } from "../../src/utils/langchain/chains/loadListedSummarizationChain/index.ts";
import { ChatOpenAI } from "@langchain/openai";
import fs from "node:fs/promises";
import { exit } from "node:process";
import * as dotenv from "dotenv";
import { ChatOllama } from "@langchain/community/chat_models/ollama";
dotenv.config();

const now = new Date();
const today = now
  .toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
  .split("/")
  .join("-");

const modelAndDirList = [
  {
    modelName: "phi3:3.8b",
    concernDirName: "concerns/phi3/3.8b",
  },
  {
    modelName: "phi3:14b",
    concernDirName: "concerns/phi3/14b",
  },
  {
    modelName: "gemma:7b-instruct",
    concernDirName: "concerns/gemma/7b-instruct",
  },
  {
    modelName: "mistral:7b-instruct",
    concernDirName: "concerns/mistral/7b-instruct",
  },
  {
    modelName: "mixtral:8x7b",
    concernDirName: "concerns/mixtral/8x7b",
  },
];

const { modelName, concernDirName } = modelAndDirList[0];

const concernsTodayJsonFilePath = `public/data/api.reliefweb.int/${concernDirName}/${today}_concerns.json`;

try {
  const alreadyFetched = (await fs.lstat(concernsTodayJsonFilePath)).isFile();
  if (alreadyFetched) {
    console.log("already extracted, finish:", concernsTodayJsonFilePath);
    exit(0);
  }
} catch (error) {
  console.log("not yet extracted:", concernsTodayJsonFilePath);
}

const disastersBaseDir = `./tmp/api.reliefweb.int/v1/disasters`;

// tmp/api.reliefweb.int/v1/disasters/9/90/9014.json のようなパスにJSONがある
// disastersBaseDir内のディレクトリ内を再帰的に探索して、すべてのファイルの一覧を生成する
// 関数を定義して再帰呼び出しする
const disasterJsonPaths: string[] = [];
const walk = async (dir: string) => {
  const dirents = await fs.readdir(dir, { withFileTypes: true });
  for (const dirent of dirents) {
    if (dirent.isDirectory()) {
      await walk(`${dir}/${dirent.name}`);
    } else {
      disasterJsonPaths.push(`${dir}/${dirent.name}`);
    }
  }
};
await walk(disastersBaseDir);

//console.log("disasterJsonPaths:", disasterJsonPaths);

// const llm = new ChatOpenAI({ temperature: 0 });
const llm = new ChatOllama({
  model: modelName,
});
const listedSummarizationChain = loadListedSummarizationChain({ llm });
const areaWithConcernExtractorChain = loadAreaWithConcernExtractorChain({
  llm,
});

type Concern = {
  url: string;
  description: string;
  title: string;
  pubDate: string;
  currentDate: string;
  whatHappenings: string[];
  displayMaps: string[];
};

const concerns: Concern[] = [];

// JSONを一つづつ読み込む
for (const disasterJsonPath of disasterJsonPaths) {
  const disasterListJson = JSON.parse(
    await fs.readFile(disasterJsonPath, "utf-8")
  );
  for (const disasterData of disasterListJson) {
    // disasterData.fields.statusがpastだったらスキップ
    if (disasterData.fields.status === "past") {
      continue;
    }
    // disasterData.fields.date.changedの日付を取得
    const disasterDateChanged = new Date(disasterData.fields.date.changed);
    // disasterDateChangedが一週間前より古かったらスキップ
    const dateOneWeekAgo = new Date();
    dateOneWeekAgo.setDate(dateOneWeekAgo.getDate() - 7);
    if (disasterDateChanged < dateOneWeekAgo) {
      continue;
    }
    // disasterData.fields.nameの文字列を取得
    const disasterName = disasterData.fields.name;
    // disasterData.fields.primary_country.nameの文字列を取得
    const disasterPrimaryCountryName = disasterData.fields.primary_country.name;
    // disasterData.fields.primary_type.nameの文字列を取得
    const disasterTypeName = disasterData.fields.primary_type.name;
    // disasterData.fields.descriptionの文字列を取得
    const disasterDescription = disasterData.fields.description;
    // disasterNameとdisasterPrimaryCountryNameとdisasterTypeNameを改行区切りで出力
    console.log("===== ===== ===== =====");
    console.log("===== ===== ===== =====");
    console.log(disasterJsonPath);
    console.log(
      `${disasterName}\n${disasterPrimaryCountryName}\n${disasterTypeName}`
    );
    //console.log(disasterDescription);
    // disasterDescriptionをlistedSummarizationChainに入力して結果を出力
    const listedSummarizationResult = await listedSummarizationChain.invoke({
      input: disasterDescription,
    });
    console.log("----- ----- ----- ----- -----");
    console.log("Generated Summary");
    console.log(listedSummarizationResult.text);
    // disasterDescriptionをareaWithConcernExtractorChainに入力して結果を出力
    const areaWithConcernResult = await areaWithConcernExtractorChain.invoke({
      input: disasterDescription,
    });
    console.log("----- ----- ----- ----- -----");
    console.log("Generated AreaWithConcern");
    console.log(areaWithConcernResult.text);
    console.log("----- ----- ----- ----- -----");
    console.log("----- ----- ----- ----- -----");
    const concern: Concern = {
      url: disasterData.fields.url_alias,
      description: disasterDescription,
      title: disasterName,
      pubDate: disasterData.fields.date.created,
      currentDate: disasterData.fields.date.changed,
      whatHappenings: listedSummarizationResult.text.split("\n"),
      displayMaps: areaWithConcernResult.text.split("\n"),
    };
    concerns.push(concern);
  }
}

console.log(concerns.length);

const concernsLatestJsonFilePath = `public/data/api.reliefweb.int/${concernDirName}/latest_concerns.json`;

await fs.writeFile(
  concernsLatestJsonFilePath,
  JSON.stringify(concerns, null, 2)
);

await fs.writeFile(
  concernsTodayJsonFilePath,
  JSON.stringify(concerns, null, 2)
);
