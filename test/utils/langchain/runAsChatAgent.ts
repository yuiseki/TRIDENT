import { ChatOpenAI } from "langchain/chat_models/openai";

import * as dotenv from "dotenv";
dotenv.config();

import { OpenAI } from "langchain/llms/openai";
import { ChainTool } from "langchain/tools";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { AgentStep } from "langchain/schema";

import { loadResolutionChainTool } from "../../../src/utils/langchain/tools/resolutions/index.ts";
import { loadSituationChainTool } from "../../../src/utils/langchain/tools/situations/index.ts";
import { loadSummarizationChainTool } from "../../../src/utils/langchain/tools/summarization/index.ts";
import { questions } from "../../questions.ts";

const model = new OpenAI({ temperature: 0 });

// tools
const tools: ChainTool[] = [
  await loadResolutionChainTool(model),
  await loadSituationChainTool(model),
  await loadSummarizationChainTool(model),
];

// agent executor
const chatModel = new ChatOpenAI({ temperature: 0 });
const executor = await initializeAgentExecutorWithOptions(tools, chatModel, {
  agentType: "chat-zero-shot-react-description",
  agentArgs: {
    prefix: `You are an AI who answers the question from user. You answer as concise as possible. You use tools proactively. Question from user: {input}.`,
    suffix: `{agent_scratchpad}`,
    inputVariables: ["input", "agent_scratchpad"],
  },
  maxIterations: 8,
  returnIntermediateSteps: true,
});

for await (const query of questions) {
  console.log("\n----- ----- ----- ----- ----- -----");
  console.log("Q:", query);
  const result = await executor.call({
    input: query,
  });
  console.log(
    "Steps:",
    result.intermediateSteps.map((step: AgentStep) => {
      return step.action.tool;
    })
  );
  console.log("A:", result.output);
  console.log("");
  console.log("");
  console.log("----- ----- ----- ----- ----- -----\n");
}
