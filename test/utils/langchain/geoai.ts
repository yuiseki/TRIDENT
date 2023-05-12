import { LLMChain } from "langchain/chains";
import { AgentStep } from "langchain/schema";
import { OpenAI } from "langchain/llms/openai";
import { AgentExecutor, LLMSingleActionAgent } from "langchain/agents";

import {
  loadAreaDetermineTool,
  loadOverpassQueryBuilderTool,
  loadTagsDetermineTool,
} from "../../../src/utils/langchain/tools/openstreetmap/index.ts";

import * as dotenv from "dotenv";
import {
  GeoAIOutputParser,
  GeoAIPromptTemplate,
} from "../../../src/utils/langchain/agents/geoai/index.ts";
dotenv.config();

const model = new OpenAI({ temperature: 0 });

const tools = [
  await loadAreaDetermineTool(model),
  await loadTagsDetermineTool(model),
  await loadOverpassQueryBuilderTool(model),
];

const llmChain = new LLMChain({
  prompt: new GeoAIPromptTemplate({
    tools,
    inputVariables: ["input", "agent_scratchpad"],
  }),
  llm: model,
});

const agent = new LLMSingleActionAgent({
  llmChain,
  outputParser: new GeoAIOutputParser(),
  stop: ["\nObservation"],
});

const executor = new AgentExecutor({
  agent,
  tools,
  returnIntermediateSteps: true,
});
console.log("Loaded agent.");

const questions = [
  "松本市の病院を探すOverpass APIクエリ",
  "松本市のホテルを探すOverpass APIクエリ",
  "松本市の居酒屋を探すOverpass APIクエリ",
];

for await (const input of questions) {
  console.log("\n----- ----- ----- ----- ----- -----\n");
  console.log("Q:", input);
  console.log("");
  const result = await executor.call({ input });
  let idx = 0;
  for (const step of result.intermediateSteps as AgentStep[]) {
    idx++;
    console.log("Iteration:", idx);
    console.log("\tTool:", step.action.tool);
    console.log("\tTool Input:", step.action.toolInput);
    console.log("\tObservation:", step.observation.replaceAll("\n", ".. "));
  }
  console.log("");
  console.log("A:", result.output);
  console.log("\n----- ----- ----- ----- ----- -----\n");
}
