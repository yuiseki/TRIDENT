import { LLMChain } from "langchain/chains";
import { AgentStep } from "langchain/schema";
import { OpenAI } from "langchain/llms/openai";
import { AgentExecutor, LLMSingleActionAgent } from "langchain/agents";
import {
  TridentOutputParser,
  TridentPromptTemplate,
} from "../../../src/utils/langchain/agents/trident/index.ts";
import { Calculator } from "langchain/tools/calculator";
import { Wikipedia } from "../../../src/utils/langchain/tools/wikipedia/index.ts";
import { loadResolutionChainTool } from "../../../src/utils/langchain/tools/resolutions/index.ts";
import { loadSituationChainTool } from "../../../src/utils/langchain/tools/situations/index.ts";
import { loadSummarizationChainTool } from "../../../src/utils/langchain/tools/summarization/index.ts";
import { loadDateTimeChainTool } from "../../../src/utils/langchain/tools/datetime/index.ts";

import * as dotenv from "dotenv";
import { questions } from "../../questions.ts";
import { ReliefWeb } from "../../../src/utils/langchain/tools/reliefweb/index.ts";
dotenv.config();

const model = new OpenAI({ temperature: 0 });

const tools = [
  //new Calculator(),
  new Wikipedia(),
  new ReliefWeb(),
  await loadResolutionChainTool(model),
  //await loadSituationChainTool(model),
  await loadSummarizationChainTool(model),
  await loadDateTimeChainTool(model),
];

const llmChain = new LLMChain({
  prompt: new TridentPromptTemplate({
    tools,
    inputVariables: ["input", "agent_scratchpad"],
  }),
  llm: model,
});

const agent = new LLMSingleActionAgent({
  llmChain,
  outputParser: new TridentOutputParser(),
  stop: ["\nObservation"],
});

const executor = new AgentExecutor({
  agent,
  tools,
  returnIntermediateSteps: true,
});
console.log("Loaded agent.");

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