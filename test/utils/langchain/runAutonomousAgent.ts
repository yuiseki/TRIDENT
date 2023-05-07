import { BabyAGI } from "langchain/experimental/babyagi";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import { LLMChain, VectorDBQAChain } from "langchain/chains";
import { ChainTool, Tool } from "langchain/tools";
import { initializeAgentExecutorWithOptions } from "langchain/agents";

import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";

import * as dotenv from "dotenv";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
dotenv.config();

/**
 * UN Resolutions QA Tool
 */

// initialize pinecone
const client = new PineconeClient();
await client.init({
  apiKey: process.env.PINECONE_API_KEY || "",
  environment: process.env.PINECONE_ENVIRONMENT || "",
});
const pineconeIndex = client.Index(process.env.PINECONE_INDEX || "");

// initialize pinecone as vector store
const resolutionsVectorStore = await PineconeStore.fromExistingIndex(
  new OpenAIEmbeddings(),
  { pineconeIndex }
);

const resolutionsQATool = new ChainTool({
  name: "UN Resolutions QA",
  chain: VectorDBQAChain.fromLLM(
    new OpenAI({ temperature: 0 }),
    resolutionsVectorStore
  ),
  description:
    "UN Resolutions QA - useful for when you need to ask questions about the UN resolutions.",
});

/**
 * ReliefWeb QA Tool
 */

const reliefWebVectorStoreSaveDir =
  "public/api.reliefweb.int/reports/summaries/vector_stores/";
const reliefWebVectorStore = await HNSWLib.load(
  reliefWebVectorStoreSaveDir,
  new OpenAIEmbeddings()
);

const reliefWebQATool = new ChainTool({
  name: "Latest humanitarian information QA",
  chain: VectorDBQAChain.fromLLM(
    new OpenAI({ temperature: 0 }),
    reliefWebVectorStore
  ),
  description:
    "Latest humanitarian information QA - useful for when you need to ask latest humanitarian information.",
});

/**
 * TODO Tool
 */

const todoTool = new ChainTool({
  name: "TODO",
  chain: new LLMChain({
    llm: new OpenAI({ temperature: 0 }),
    prompt: PromptTemplate.fromTemplate(
      "You are a planner who is an expert at coming up with a concise todo list for a given objective. Come up with a concise todo list for this objective: {objective}"
    ),
  }),
  description:
    "useful for when you need to come up with todo lists. Input: an objective to create a todo list for. Output: a todo list for that objective. Please be very clear what the objective is!",
});

const tools: Tool[] = [resolutionsQATool, reliefWebQATool];

const agentExecutor = await initializeAgentExecutorWithOptions(
  tools,
  new OpenAI({ temperature: 0 }),
  {
    agentType: "zero-shot-react-description",
    agentArgs: {
      prefix: `You are an AI who performs one task based on the following objective: {objective}. Take into account these previously completed tasks: {context}.`,
      suffix: `Question: {task}
{agent_scratchpad}`,
      inputVariables: ["objective", "task", "context", "agent_scratchpad"],
    },
  }
);

console.log("Loaded agent.");

const memoryVectorStore = new MemoryVectorStore(new OpenAIEmbeddings());

const babyAGI = BabyAGI.fromLLM({
  llm: new OpenAI({ temperature: 0 }),
  executionChain: agentExecutor,
  vectorstore: memoryVectorStore,
  maxIterations: 10,
});

const input =
  "Write a short, concise report for the latest situation in Sudan.";

console.log(`Executing with input "${input}"...`);

await babyAGI.call({
  objective: input,
});
