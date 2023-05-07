import {
  VectorStoreToolkit,
  createVectorStoreAgent,
  initializeAgentExecutorWithOptions,
} from "langchain/agents";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import * as dotenv from "dotenv";
import { ChainTool } from "langchain/tools";
import { VectorDBQAChain } from "langchain/chains";
import { questions } from "../../questions";
dotenv.config();

const model = new OpenAI({ temperature: 0 });
const situationsVectorStoreSaveDir =
  "public/api.reliefweb.int/reports/summaries/vector_stores/";
const situationsVectorStore = await HNSWLib.load(
  situationsVectorStoreSaveDir,
  new OpenAIEmbeddings()
);

const qaToolSituations = new ChainTool({
  name: "qa-latest-worlds-situation",
  chain: VectorDBQAChain.fromLLM(model, situationsVectorStore, {
    returnSourceDocuments: false,
  }),
  description:
    "useful for when you need to ask latest humanitarian situation. Input: a question about humanitarian situation. Output: answer for the question.",
});

const tools = [qaToolSituations];

const executor = await initializeAgentExecutorWithOptions(tools, model, {
  agentType: "zero-shot-react-description",
  agentArgs: {
    prefix: `You are an AI who answers the following question: {question}.`,
    suffix: `{agent_scratchpad}`,
    inputVariables: ["question", "agent_scratchpad"],
  },
  verbose: true,
});

for await (const query of questions) {
  console.log("Q:", query);
  const result = await executor.call({
    question: query,
  });
  console.log("A:", result.output);
}
