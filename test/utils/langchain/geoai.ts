import { OpenAI } from "langchain/llms/openai";
import { AgentExecutor } from "langchain/agents";

import { loadGeoAIDeepAgent } from "../../../src/utils/langchain/agents/geoai/index.ts";
import {
  loadGeoAISurfaceChain,
  loadGeoAIInnerChain,
} from "../../../src/utils/langchain/chains/geoai/index.ts";

import {
  loadAreaDetermineTool,
  loadOverpassQueryBuilderTool,
  loadTagsDetermineTool,
} from "../../../src/utils/langchain/tools/openstreetmap/index.ts";
import { loadEnglishTranslatorChainTool } from "../../../src/utils/langchain/tools/translator/index.ts";

import * as readline from "node:readline/promises";
import { stdin, stdout } from "node:process";
import * as dotenv from "dotenv";
import { BufferMemory } from "langchain/memory";
dotenv.config();

const model = new OpenAI({ temperature: 0 });
const memory = new BufferMemory();

const surfaceChain = loadGeoAISurfaceChain({ llm: model, memory });
const middleChain = loadGeoAIInnerChain({ llm: model });
const tools = [
  await loadAreaDetermineTool(model),
  await loadTagsDetermineTool(model),
  await loadOverpassQueryBuilderTool(model),
  await loadEnglishTranslatorChainTool(model),
];

const deepAgent = loadGeoAIDeepAgent({ llm: model, tools });
const deepAgentExecutor = new AgentExecutor({
  agent: deepAgent,
  tools,
  returnIntermediateSteps: true,
});
console.log("Loaded agent.");

const rl = readline.createInterface({ input: stdin, output: stdout });

while (1) {
  const userInput = await rl.question("Waiting your input...: ");
  console.log("Surface Agent thinking...");
  const result1 = await surfaceChain.call({ input: userInput });
  console.log("Surface Agent output:", result1.response);
  console.log("Middle Agent thinking...");
  const result2 = await middleChain.call({ input: undefined });
  const output = result2.response;
  console.log("Middle Agent output:", output);
  if (
    output.toLowerCase().includes("not enough") ||
    output.toLowerCase().includes("no map")
  ) {
    continue;
  }
  console.log("GeoAI Agent thinking...");
  const agentResult = await deepAgentExecutor.call(
    { input: "Build query for Overpass API: " + output },
    [
      {
        handleAgentAction(action, _runId) {
          console.log("\thandleAgentAction");
          console.log("\t\tTool:", action.tool);
          console.log("\t\tTool Input:", action.toolInput);
        },
        handleToolEnd(output, _runId) {
          console.log("\thandleToolEnd");
          console.log("\t\tOutput:", output);
        },
      },
    ]
  );
  console.log("GeoAI Agent output:", agentResult.output);
  console.log("");
}
