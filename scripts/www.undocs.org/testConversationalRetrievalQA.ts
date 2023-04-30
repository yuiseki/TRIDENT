import * as dotenv from "dotenv";
import { OpenAI } from "langchain/llms/openai";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";

dotenv.config();

// initialize pinecone
const client = new PineconeClient();
await client.init({
  apiKey: process.env.PINECONE_API_KEY || "",
  environment: process.env.PINECONE_ENVIRONMENT || "",
});
const pineconeIndex = client.Index(process.env.PINECONE_INDEX || "");

// initialize vector store
const vectorStore = await PineconeStore.fromExistingIndex(
  new OpenAIEmbeddings(),
  { pineconeIndex }
);

// initialize the LLM and chain
const model = new OpenAI({ temperature: 0 });
const chain = ConversationalRetrievalQAChain.fromLLM(
  model,
  vectorStore.asRetriever(10)
);

const queries = [
  "What is the name of the UN mission in South Sudan?",
  "When that mission has started?",
  "Who is the latest head of that mission?",
  "Where is the headquarters of that mission?",
];

const chatHistory: string[] = [];

for (const query of queries) {
  console.log("----- ----- -----");
  const res = await chain.call({
    question: query,
    chat_history: chatHistory.join(" "),
  });
  console.log("Q:", query);
  console.log("A:", res.text);
  chatHistory.push(query);
  chatHistory.push(res.text);
  console.log("----- ----- -----");
}
