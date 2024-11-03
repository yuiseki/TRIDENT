import { loadAreaWithConcernExtractorChain } from "../../src/utils/langchain/chains/loadAreaWithConcernExtractorChain/index.ts";
import { loadListedSummarizationChain } from "../../src/utils/langchain/chains/loadListedSummarizationChain/index.ts";
import { ChatOpenAI } from "@langchain/openai";
import fs from "node:fs/promises";
import { exit } from "node:process";
import * as dotenv from "dotenv";
import { ChatOllama } from "@langchain/ollama";
dotenv.config();

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
      // jsonファイルのみを対象とする
      if (!dirent.name.endsWith(".json")) {
        continue;
      }
      disasterJsonPaths.push(`${dir}/${dirent.name}`);
    }
  }
};
await walk(disastersBaseDir);
console.info("disasterJsonPaths:", disasterJsonPaths.length);

const now = new Date();
const today = now
  .toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
  .split("/")
  .join("-");

type LLMModel = {
  modelName: string;
  modelDirName: string;
};

const LLMModelAndDirList: LLMModel[] = [
  {
    modelName: "smollm:135m",
    modelDirName: "smollm/135m",
  },
  {
    modelName: "smollm:360m",
    modelDirName: "smollm/360m",
  },
  {
    modelName: "smollm:1.7b",
    modelDirName: "smollm/1.7b",
  },
  {
    modelName: "smollm2:135m",
    modelDirName: "smollm2/135m",
  },
  {
    modelName: "smollm2:360m",
    modelDirName: "smollm2/360m",
  },
  {
    modelName: "smollm2:1.7b",
    modelDirName: "smollm2/1.7b",
  },
  {
    modelName: "qwen2.5:0.5b",
    modelDirName: "qwen2.5/0.5b",
  },
  {
    modelName: "qwen2.5:1.5b",
    modelDirName: "qwen2.5/1.5b",
  },
  {
    modelName: "qwen2:0.5b",
    modelDirName: "qwen2/0.5b",
  },
  {
    modelName: "qwen2:1.5b",
    modelDirName: "qwen2/1.5b",
  },
  {
    modelName: "qwen:0.5b",
    modelDirName: "qwen/0.5b",
  },
  {
    modelName: "qwen:1.8b",
    modelDirName: "qwen/1.8b",
  },
  {
    modelName: "llama3.2:1b",
    modelDirName: "llama3.2/1b",
  },
  {
    modelName: "gemma2:2b",
    modelDirName: "gemma2/2b",
  },
  {
    modelName: "gemma:2b-instruct",
    modelDirName: "gemma/2b-instruct",
  },
  {
    modelName: "codegemma:2b",
    modelDirName: "codegemma/2b",
  },
  {
    modelName: "orca-mini:3b",
    modelDirName: "orca-mini/3b",
  },
  {
    modelName: "phi:2.7b",
    modelDirName: "phi/2.7b",
  },
  {
    modelName: "phi3.5:3.8b",
    modelDirName: "phi3.5/3.8b",
  },
  {
    modelName: "phi3:3.8b",
    modelDirName: "phi3/3.8b",
  },
];

// 解析結果を保存するファイルパス
const getConcernsTodayJsonFilePath = (llmModel: LLMModel) => {
  const { modelDirName } = llmModel;
  const concernDirPath = `public/data/api.reliefweb.int/concerns/${modelDirName}`;
  // create directory if not exists
  fs.mkdir(concernDirPath, { recursive: true });
  return `public/data/api.reliefweb.int/concerns/${modelDirName}/${today}_concerns.json`;
};

// 既に解析済みかどうかを確認する
const checkAlreadyFetched = async (llmModel: LLMModel) => {
  // modelNameを出力
  console.log(llmModel.modelName);
  const concernsTodayJsonFilePath = getConcernsTodayJsonFilePath(llmModel);
  try {
    const alreadyFetched = (await fs.lstat(concernsTodayJsonFilePath)).isFile();
    if (alreadyFetched) {
      console.log("already extracted, finish:", concernsTodayJsonFilePath);
      // 一時的にfalseを返す
      return false;
      return true;
    }
  } catch (error) {
    console.log("not yet extracted:", concernsTodayJsonFilePath);
    return false;
  }
};

type Concern = {
  url: string;
  description: string;
  title: string;
  pubDate: string;
  currentDate: string;
  whatHappenings: string[];
  displayMaps: string[];
};

const extractConcernsFromDisasters = async (llmModel: LLMModel) => {
  if (await checkAlreadyFetched(llmModel)) {
    return;
  }
  const concerns: Concern[] = [];
  // const llm = new ChatOpenAI({ temperature: 0 });
  const { modelName, modelDirName } = llmModel;
  const llm = new ChatOllama({
    model: modelName,
    temperature: 0.0,
    repeatPenalty: 1.2,
    numCtx: 1024,
    numPredict: 512,
  });
  const listedSummarizationChain = loadListedSummarizationChain({ llm });
  const areaWithConcernExtractorChain = loadAreaWithConcernExtractorChain({
    llm,
  });

  // JSONを一つづつ読み込む
  for (const disasterJsonPath of disasterJsonPaths) {
    let disasterListJson;
    try {
      disasterListJson = JSON.parse(
        await fs.readFile(disasterJsonPath, "utf-8")
      );
    } catch (error) {
      console.error(error);
      continue;
    }
    for (const disasterData of disasterListJson) {
      // disasterData.fields.statusがpastだったらスキップ
      if (disasterData.fields === undefined) {
        continue;
      }
      if ("status" in disasterData.fields === false) {
        continue;
      }
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
      // disasterData.idの文字列を取得
      const disasterId = disasterData.id;
      // disasterData.fields.nameの文字列を取得
      const disasterName = disasterData.fields.name;
      // disasterData.fields.primary_country.nameの文字列を取得
      const disasterPrimaryCountryName =
        disasterData.fields.primary_country.name;
      // disasterData.fields.primary_type.nameの文字列を取得
      const disasterTypeName = disasterData.fields.primary_type.name;
      // disasterData.fields.descriptionの文字列を取得
      const disasterDescription = disasterData.fields.description;
      // disasterIdとdisasterNameとdisasterPrimaryCountryNameとdisasterTypeNameを改行区切りで出力
      console.log("===== ===== ===== =====");
      console.log("===== ===== ===== =====");
      console.log(disasterJsonPath);
      console.log(
        `${disasterId}\n${disasterName}\n${disasterPrimaryCountryName}\n${disasterTypeName}`
      );
      const disasterBaseDir = `./tmp/api.reliefweb.int/v1/disasters/${disasterId.slice(
        0,
        1
      )}/${disasterId.slice(0, 2)}/${disasterId}/${llmModel.modelDirName}`;
      // make directory if not exists
      await fs.mkdir(disasterBaseDir, { recursive: true });
      const disasterSummaryPath = `${disasterBaseDir}/summary_v0.0.2.txt`;
      let listedSummarizationResultText = "";
      // check disasterSummaryPath is already exists
      try {
        const alreadyExists = (await fs.lstat(disasterSummaryPath)).isFile();
        if (alreadyExists) {
          console.log("already exists, load:", disasterSummaryPath);
          listedSummarizationResultText = await fs.readFile(
            disasterSummaryPath,
            "utf-8"
          );
        }
      } catch (error) {
        console.log("not yet exists:", disasterSummaryPath);
        //console.log(disasterDescription);
        // disasterDescriptionをlistedSummarizationChainに入力して結果を出力
        const listedSummarizationResult = await listedSummarizationChain.invoke(
          {
            input: disasterDescription,
          }
        );
        listedSummarizationResultText = listedSummarizationResult.text;
        await fs.writeFile(disasterSummaryPath, listedSummarizationResultText);
      }
      console.log("Generated Summary");
      console.log(listedSummarizationResultText);
      console.log("----- ----- ----- ----- -----");
      try {
        // disasterDescriptionをareaWithConcernExtractorChainに入力して結果を出力
        const areaWithConcernPath = `${disasterBaseDir}/area_with_concern_v0.0.2.txt`;
        let areaWithConcernResultText = "";
        try {
          const alreadyExists = (await fs.lstat(areaWithConcernPath)).isFile();
          if (alreadyExists) {
            console.log("already exists, load:", areaWithConcernPath);
            areaWithConcernResultText = await fs.readFile(
              areaWithConcernPath,
              "utf-8"
            );
          }
        } catch (error) {
          console.log("not yet exists:", areaWithConcernPath);
          const areaWithConcernResult =
            await areaWithConcernExtractorChain.invoke({
              input: disasterDescription,
            });
          areaWithConcernResultText = areaWithConcernResult.text;
          await fs.writeFile(areaWithConcernPath, areaWithConcernResultText);
        }
        console.log("Generated AreaWithConcern");
        console.log(areaWithConcernResultText);
        console.log("----- ----- ----- ----- -----");
        console.log("----- ----- ----- ----- -----");
        const concern: Concern = {
          url: disasterData.fields.url_alias,
          description: disasterDescription,
          title: disasterName,
          pubDate: disasterData.fields.date.created,
          currentDate: disasterData.fields.date.changed,
          whatHappenings: listedSummarizationResultText.split("\n"),
          displayMaps: areaWithConcernResultText.split("\n"),
        };
        concerns.push(concern);
      } catch (error) {
        console.error(error);
        continue;
      }
    }
  }

  console.log(concerns.length);

  const concernsLatestJsonFilePath = `public/data/api.reliefweb.int/concerns/${modelDirName}/latest_concerns.json`;

  try {
    await fs.writeFile(
      concernsLatestJsonFilePath,
      JSON.stringify(concerns, null, 2)
    );

    await fs.writeFile(
      getConcernsTodayJsonFilePath(llmModel),
      JSON.stringify(concerns, null, 2)
    );
  } catch (error) {
    console.error(error);
  }
};

for (const llmModel of LLMModelAndDirList) {
  await extractConcernsFromDisasters(llmModel);
}
