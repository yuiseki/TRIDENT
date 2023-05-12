import { LLMChain } from "langchain/chains";
import { OpenAI } from "langchain/llms/openai";
import { AgentExecutor, LLMSingleActionAgent } from "langchain/agents";
import { Calculator } from "langchain/tools/calculator";
import {
  TridentOutputParser,
  TridentPromptTemplate,
} from "../../../src/utils/langchain/trident/index.ts";
import { Wikipedia } from "../../../src/utils/langchain/tools/wikipedia/index.ts";

import { loadResolutionChainTool } from "../../../src/utils/langchain/tools/resolutions/index.ts";
import { loadSituationChainTool } from "../../../src/utils/langchain/tools/situations/index.ts";
import { loadSummarizationChainTool } from "../../../src/utils/langchain/tools/summarization/index.ts";

import * as dotenv from "dotenv";
import { AgentStep } from "langchain/schema";
dotenv.config();

const model = new OpenAI({ temperature: 0 });

const tools = [
  new Calculator(),
  new Wikipedia(),
  await loadResolutionChainTool(model),
  await loadSituationChainTool(model),
  await loadSummarizationChainTool(model),
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

const input = `Who is the secretary general of the UN?`;

console.log("Q:", input);
const result = await executor.call({ input });
console.log(
  "Steps:",
  result.intermediateSteps.map((step: AgentStep) => {
    return step.action.tool;
    //return [step.action.tool, step.action.toolInput, step.observation];
  })
);
console.log("A:", result.output);
