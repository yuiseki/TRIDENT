import * as dotenv from "dotenv";
import { RetrievalQAChain } from "langchain/chains";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { OpenAI } from "langchain/llms/openai";
import { HNSWLib } from "langchain/vectorstores";

dotenv.config();

const model = new OpenAI({
  temperature: 0,
  maxTokens: 3000,
  modelName: "text-davinci-003",
});

const vectorStoreSaveDir =
  "public/api.reliefweb.int/reports/summaries/vector_stores/";
const vectorStore = await HNSWLib.load(
  vectorStoreSaveDir,
  new OpenAIEmbeddings()
);

const retrievalQAChain = RetrievalQAChain.fromLLM(
  model,
  vectorStore.asRetriever(4),
  {
    returnSourceDocuments: true,
  }
);

const queries = [
  /*
  "What is the latest statement from WHO?",
  "What is the latest statement from UNICEF?",
  "What is the latest statement from UNHCR?",
  "What is latest situation in Ukraine?",
  "What is latest situation in Sudan?",
  "What is latest situation in Afghanistan?",
  "What is latest situation in Syria?",
  "What is latest situation in Japan?",
  */
  "What is the geopolitical risk in the Asia-Pacific region.",
  "What is the peacekeeping and security strategy advice in the Asia-Pacific region.",
  "What is the resource allocation in the Asia-Pacific region.",
];

for await (const query of queries) {
  console.log("----- ----- -----");
  console.log("Q:", query);
  const answer = await retrievalQAChain.call({
    query: query,
  });
  console.log("A:", answer.text);
  console.log("----- ----- -----");
}
