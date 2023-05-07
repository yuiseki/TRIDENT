import { BabyAGI } from "langchain/experimental/babyagi";
import { AutoGPT } from "langchain/experimental/autogpt";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import {
  LLMChain,
  VectorDBQAChain,
  loadSummarizationChain,
} from "langchain/chains";
import { ChainTool, Tool } from "langchain/tools";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { ChatOpenAI } from "langchain/chat_models/openai";

import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";

import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { questions } from "../../questions.js";

import * as dotenv from "dotenv";
dotenv.config();

const model = new OpenAI({ temperature: 0 });

/**
 * Tool for QA of UN resolutions
 */
const client = new PineconeClient();
await client.init({
  apiKey: process.env.PINECONE_API_KEY || "",
  environment: process.env.PINECONE_ENVIRONMENT || "",
});
const pineconeIndex = client.Index(process.env.PINECONE_INDEX || "");
const resolutionsVectorStore = await PineconeStore.fromExistingIndex(
  new OpenAIEmbeddings(),
  { pineconeIndex }
);

const qaToolResolutions = new ChainTool({
  name: "qa-un-resolutions",
  chain: VectorDBQAChain.fromLLM(model, resolutionsVectorStore),
  description:
    "useful for when you need to ask about the UN resolutions. Input: a question about the UN resolution. Output: answer for the question.",
});

/**
 * Tool for QA of ReliefWeb situation report
 */
const situationsVectorStoreSaveDir =
  "public/api.reliefweb.int/reports/summaries/vector_stores/";
const situationsVectorStore = await HNSWLib.load(
  situationsVectorStoreSaveDir,
  new OpenAIEmbeddings()
);

const qaToolSituations = new ChainTool({
  name: "qa-latest-worlds-situation",
  chain: VectorDBQAChain.fromLLM(model, situationsVectorStore),
  description:
    "useful for when you need to ask latest humanitarian situation. Input: a question about humanitarian situation. Output: answer for the question.",
});

/**
 * Tool for summarization
 */
const summarizationPrompt = PromptTemplate.fromTemplate(
  "You are a AI who always concisely summarize given text as short as possible. Summarise the following sentences in a nutshell: {text}"
);
const summarizationTool = new ChainTool({
  name: "summarization",
  chain: new LLMChain({ llm: model, prompt: summarizationPrompt }),
  description:
    "useful for when you need to summarize a text. Input: a text for summarize. Output: a summary of text. Only use long text!!",
});

// tools
const tools: Tool[] = [qaToolResolutions, qaToolSituations, summarizationTool];

// agent executor
const agentExecutor = await initializeAgentExecutorWithOptions(tools, model, {
  agentType: "zero-shot-react-description",
  agentArgs: {
    prefix: `You are an AI who answers the question from user. You answer as concise as possible. Question from user: {question}.`,
    suffix: `{agent_scratchpad}`,
    inputVariables: ["question", "agent_scratchpad"],
  },
  maxIterations: 5,
});
console.log("Loaded agent.");

for await (const query of questions) {
  console.log("----- ----- -----");
  console.log("Q:", query);
  const result = await agentExecutor.call({
    question: query,
  });
  console.log("A:", result.output);
  console.log("----- ----- -----");
}

/*
const agentExecutor = await initializeAgentExecutorWithOptions(tools, model, {
  agentType: "zero-shot-react-description",
  agentArgs: {
    prefix: `You are an AI who performs one task based on the following objective: {objective}. Take into account these previously completed tasks: {context}.`,
    suffix: `Your task: {task}
{agent_scratchpad}`,
    inputVariables: ["objective", "task", "context", "agent_scratchpad"],
  },
});
*/

/*
const agentMemoryVectorStore = new MemoryVectorStore(new OpenAIEmbeddings());
const babyAGI = BabyAGI.fromLLM({
  llm: model,
  executionChain: agentExecutor,
  vectorstore: agentMemoryVectorStore,
  maxIterations: 10,
});

const input =
  "Write a short, concise report for the latest situation in Sudan.";
console.log(`Executing with input "${input}"...`);

await babyAGI.call({
  objective: input,
});
*/

/*
// bugってる
const agentMemoryVectorStore = new MemoryVectorStore(new OpenAIEmbeddings());
const autogpt = AutoGPT.fromLLMAndTools(
  new ChatOpenAI({ temperature: 0 }),
  tools,
  {
    memory: agentMemoryVectorStore.asRetriever(),
    aiName: "UN-AGI",
    aiRole: "Assistant",
    maxIterations: 10,
  }
);

await autogpt.run([
  "Your Objective: Write a short, concise report for the latest situation in Sudan.",
]);
*/

/**
 * TODO Tool
 */
/*
const todoTool = new ChainTool({
  name: "TODO",
  chain: new LLMChain({
    llm: model,
    prompt: PromptTemplate.fromTemplate(
      "You are a planner who is an expert at coming up with a concise todo list for a given objective. Come up with a concise todo list for this objective: {objective}"
    ),
  }),
  description:
    "useful for when you need to come up with todo lists. Input: an objective to create a todo list for. Output: a todo list for that objective. Please be very clear what the objective is!",
});
*/
