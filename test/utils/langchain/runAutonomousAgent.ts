import { BabyAGI } from "langchain/experimental/babyagi";
import { AutoGPT } from "langchain/experimental/autogpt";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";
import { PromptTemplate } from "langchain/prompts";
import { LLMChain, VectorDBQAChain } from "langchain/chains";
import { ChainTool, Tool } from "langchain/tools";
import { initializeAgentExecutorWithOptions } from "langchain/agents";
import { ChatOpenAI } from "langchain/chat_models/openai";

import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";

import * as dotenv from "dotenv";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { placeholders } from "../../../src/const/placeholders.ts";
dotenv.config();

const model = new OpenAI({ temperature: 0 });

/**
 * UN Resolutions QA Tool
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

const resolutionsQATool = new ChainTool({
  name: "QA for UN Resolutions",
  chain: VectorDBQAChain.fromLLM(model, resolutionsVectorStore, {
    returnSourceDocuments: false,
  }),
  description:
    "useful for when you need to ask about the UN resolutions. Input: a question about the UN resolution. Output: answer for the question.",
  //returnDirect: true,
});

/**
 * ReliefWeb QA Tool
 */
const situationsVectorStoreSaveDir =
  "public/api.reliefweb.int/reports/summaries/vector_stores/";
const situationsVectorStore = await HNSWLib.load(
  situationsVectorStoreSaveDir,
  new OpenAIEmbeddings()
);
const reliefWebQATool = new ChainTool({
  name: "QA for latest humanitarian situation",
  chain: VectorDBQAChain.fromLLM(model, situationsVectorStore, {
    returnSourceDocuments: false,
  }),
  description:
    "useful for when you need to ask latest humanitarian situation. Input: a question about humanitarian situation. Output: answer for the question.",
  //returnDirect: true,
});

// tools
const tools: Tool[] = [resolutionsQATool, reliefWebQATool];

// agent executor
const agentExecutor = await initializeAgentExecutorWithOptions(tools, model, {
  agentType: "zero-shot-react-description",
  agentArgs: {
    prefix: `You are an AI who answers the following questions: {question}.`,
    suffix: `
{agent_scratchpad}`,
    inputVariables: ["question", "agent_scratchpad"],
  },
});
console.log("Loaded agent.");

for await (const query of placeholders) {
  console.log("Q:", query);
  const result = await agentExecutor.call({
    question: query,
  });
  console.log("A:", result.output);
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
