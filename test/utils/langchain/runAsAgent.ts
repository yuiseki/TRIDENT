import { OpenAI } from "langchain/llms/openai";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { ChainTool } from "langchain/tools";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { AgentStep } from "langchain/schema";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

import * as dotenv from "dotenv";
dotenv.config();

import { loadResolutionChainTool } from "../../../src/utils/langchain/tools/resolutions/index.ts";
import { loadSituationChainTool } from "../../../src/utils/langchain/tools/situations/index.ts";
import { loadSummarizationChainTool } from "../../../src/utils/langchain/tools/summarization/index.ts";
import { questions } from "../../questions.ts";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";

const model = new OpenAI({ temperature: 0 });

// tools
const tools: ChainTool[] = [
  await loadResolutionChainTool(model),
  await loadSituationChainTool(model),
  await loadSummarizationChainTool(model),
];

// agent executor
//const chatModel = new ChatOpenAI({ temperature: 0 });
//const embeddings = new OpenAIEmbeddings();
//const vectorStore = new MemoryVectorStore(embeddings);
const executor = await initializeAgentExecutorWithOptions(tools, model, {
  agentType: "zero-shot-react-description",
  agentArgs: {
    prefix: `You are an AI who answers the question from user. You answer as concise as possible. You use tools proactively. You have access to the following tools:`,
    suffix: `Begin!

Question: {input}
Thought: {agent_scratchpad}`,
    inputVariables: ["input", "agent_scratchpad"],
  },
  maxIterations: 8,
  returnIntermediateSteps: true,
});

for await (const query of questions) {
  console.log("\n----- ----- ----- ----- ----- -----\n");
  console.log("Q:", query);
  //agentExecutor.agent.plan([], "")
  const result = await executor.call({
    input: query,
  });
  console.log(
    "Steps:",
    result.intermediateSteps.map((step: AgentStep) => {
      return step.action.tool;
      //return [step.action.tool, step.action.toolInput, step.observation];
    })
  );
  console.log("A:", result.output);
  console.log("\n----- ----- ----- ----- ----- -----\n");
}
