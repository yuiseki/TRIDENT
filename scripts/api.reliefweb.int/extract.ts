import * as dotenv from "dotenv";
dotenv.config();

import fs from "node:fs/promises";
import { LLMModel } from "../../src/types/LLMModel.ts";
import { getDisasterJsonPaths } from "../../src/utils/getDisasterJsonPaths.ts";
import { ollamaModels } from "../../src/utils/ollamaModels.ts";
import { ChatOllama } from "@langchain/ollama";
import { OllamaEmbeddings } from "@langchain/ollama";
import { loadAreaExtractorChain } from "../../src/utils/langchain/chains/loadAreaExtractorChain/index.ts";

const disasterJsonPaths = await getDisasterJsonPaths();

const getOllamaModel = async (llmModel: LLMModel) => {
  const { modelName } = llmModel;
  const model = new ChatOllama({
    model: modelName,
    temperature: 0.0,
    repeatPenalty: 1.1,
    numCtx: 2048,
    numPredict: 128,
    stop: ["\n\n"],
  });
  return model;
};

const extractAffectedAreasFromDisasters = async (
  llmModel: LLMModel,
  disasterDescription: string
) => {
  console.log(`>>>>> ----- ----- ${llmModel.modelName} ----- ----- -----`);
  const llm = await getOllamaModel(llmModel);
  const embeddings = new OllamaEmbeddings({
    model: "snowflake-arctic-embed:22m",
  });
  const chain = await loadAreaExtractorChain({
    llm,
    embeddings,
  });
  const result = await chain.invoke({ input: disasterDescription });

  console.log(result.content);
  console.log(`----- ----- ----- ${llmModel.modelName} ----- ----- <<<<<`);
};

for (const llmModel of ollamaModels) {
  // gemma2:2b や qwen2.5:1.5b から 2000000000, 1500000000 というパラメーターサイズを得る
  let modelParamSize;
  if (llmModel.modelName.endsWith("b")) {
    modelParamSize =
      parseFloat(llmModel.modelName.split(":")[1].replace("b", "")) *
      1000000000;
  }
  if (llmModel.modelName.endsWith("m")) {
    modelParamSize =
      parseFloat(llmModel.modelName.split(":")[1].replace("m", "")) * 1000000;
  }
  // 2000000000 よりの大きかったらスキップ
  if (!modelParamSize) {
    continue;
  }
  if (modelParamSize > 2000000000) {
    continue;
  }
  console.log("modelName:", llmModel.modelName);
  console.log("modelParamSize:", modelParamSize);

  for (const disasterJsonPath of disasterJsonPaths.reverse()) {
    let disasterListJson;
    try {
      disasterListJson = JSON.parse(
        await fs.readFile(disasterJsonPath, "utf-8")
      );
    } catch (error) {
      console.error("error:", error);
      continue;
    }
    for (const disasterData of disasterListJson) {
      if (disasterData.fields.status !== "ongoing") {
        continue;
      }

      const disasterId = disasterListJson[0].id;
      const disasterName = disasterListJson[0].fields.name;
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
      // lengthが 2000 文字以上だったらスキップ
      if (disasterDescription.length > 2000) {
        continue;
      }
      console.log("===== ===== ===== =====");
      console.log("description length", disasterDescription.length);
      // disasterIdとdisasterNameとdisasterPrimaryCountryNameとdisasterTypeNameを改行区切りで出力
      console.log(
        `ID: ${disasterId}
Name: ${disasterName}
Countries: ${disasterCountries}
Types: ${disasterTypes}`
      );
      await extractAffectedAreasFromDisasters(llmModel, disasterDescription);
    }
  }
}
