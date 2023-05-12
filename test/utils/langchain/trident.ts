import { LLMChain } from "langchain/chains";
import { AgentStep } from "langchain/schema";
import { OpenAI } from "langchain/llms/openai";
import { AgentExecutor, LLMSingleActionAgent } from "langchain/agents";
import {
  TridentOutputParser,
  TridentPromptTemplate,
} from "../../../src/utils/langchain/trident/index.ts";
import { Calculator } from "langchain/tools/calculator";
import { Wikipedia } from "../../../src/utils/langchain/tools/wikipedia/index.ts";
import { loadResolutionChainTool } from "../../../src/utils/langchain/tools/resolutions/index.ts";
import { loadSituationChainTool } from "../../../src/utils/langchain/tools/situations/index.ts";
import { loadSummarizationChainTool } from "../../../src/utils/langchain/tools/summarization/index.ts";
import { loadDateTimeChainTool } from "../../../src/utils/langchain/tools/datetime/index.ts";

import * as dotenv from "dotenv";
dotenv.config();

const model = new OpenAI({ temperature: 0 });

const tools = [
  new Calculator(),
  new Wikipedia(),
  await loadResolutionChainTool(model),
  await loadSituationChainTool(model),
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

//const input = `How old is the UN Secretary General?`;
const input = "How many days ago was the UN Secretary General born?";
//const input = "What time is it now in Japan?";

console.log("Q:", input);
const result = await executor.call({ input });

let idx = 0;
for (const step of result.intermediateSteps as AgentStep[]) {
  console.log("Iteration:", idx);
  console.log("\tTool:", step.action.tool);
  console.log("\tTool Input:", step.action.toolInput);
  console.log("\tObservation:", step.observation.replaceAll("\n", ".. "));
  idx++;
}

console.log("A:", result.output);
