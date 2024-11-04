import * as dotenv from "dotenv";
dotenv.config();

import fs from "node:fs/promises";
import { LLMModel } from "../../src/types/LLMModel.ts";
import { getDisasterJsonPaths } from "../../src//utils/getDisasterJsonPaths.ts";
import { ollamaModels } from "../../src/utils/ollamaModels.ts";
import { ChatOllama } from "@langchain/ollama";

const disasterJsonPaths = await getDisasterJsonPaths();

const getOllamaLlm = async (llmModel: LLMModel) => {
  const { modelName } = llmModel;
  const llm = new ChatOllama({
    model: modelName,
    temperature: 0.0,
    repeatPenalty: 1.1,
    numCtx: 1024,
    numPredict: 128,
  });
  return llm;
};

const extractAffectedAreasFromDisasters = async (
  llmModel: LLMModel,
  disasterDescription: string
) => {
  console.log(`>>>>> ----- ----- ${llmModel.modelName} ----- ----- -----`);
  const llm = await getOllamaLlm(llmModel);
  const affectedAreas = await llm.invoke(
    `You are a text mining system that extracts only the affected areas from descriptions of disasters.

### Rules ###

You will always reply according to the following rules:
- You MUST reply only with the affected areas.
- You MUST specify which country if the area is a state or province.
- You MUST ALWAYS respond in a Markdown list format.
- You MUST represent one area per one line.

### Disaster Description ###
${disasterDescription}

### Examples of Output ###
- Japan
- Tokyo, Japan
- Taito, Tokyo, Japan
- Kanagawa Prefecture, Japan
- Yokohama, Kanagawa Prefecture, Japan
- Chiba City, Chiba Prefecture, Japan
- Afghanistan
- Kabul Province, Afghanistan
- Panjshir Province, Afghanistan
- Parwan Province, Afghanistan
- Jalalabad, Nangarhar Province, Afghanistan
- Nangarhar Province, Afghanistan
- Kunar Province, Afghanistan

### Rules ###

You will always reply according to the following rules:
- You MUST reply only with the affected areas.
- You MUST specify which country if the area is a state or province.
- You MUST ALWAYS respond in a Markdown list format.
- You MUST represent one area per one line.

### Disaster Affected areas (Markdown list format) ###`,
    {
      stop: ["\n\n"],
    }
  );
  console.log(affectedAreas.content);
  console.log(`----- ----- ----- ${llmModel.modelName} ----- ----- <<<<<`);
  console.log("\n");
};

for (const disasterJsonPath of disasterJsonPaths) {
  let disasterListJson;
  try {
    disasterListJson = JSON.parse(await fs.readFile(disasterJsonPath, "utf-8"));
  } catch (error) {
    console.error("error:", error);
    continue;
  }
  for (const disasterData of disasterListJson) {
    if (disasterData.fields.status === "past") {
      continue;
    }
    if (disasterData.fields.primary_country === undefined) {
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
    const disasterPrimaryCountryName = disasterData.fields.primary_country.name;
    // disasterData.fields.primary_type.nameの文字列を取得
    const disasterTypeName = disasterData.fields.primary_type.name;
    // disasterData.fields.descriptionの文字列を取得
    const disasterDescription = `${disasterName}
${disasterPrimaryCountryName}
${disasterTypeName}

${disasterData.fields.description}`;
    console.log("===== ===== ===== =====");
    console.log("===== ===== ===== =====");
    console.log(disasterJsonPath);
    // disasterIdとdisasterNameとdisasterPrimaryCountryNameとdisasterTypeNameを改行区切りで出力
    console.log(
      `${disasterId}\n${disasterName}\n${disasterPrimaryCountryName}\n${disasterTypeName}`
    );
    for (const llmModel of ollamaModels) {
      await extractAffectedAreasFromDisasters(llmModel, disasterDescription);
    }
  }
}
