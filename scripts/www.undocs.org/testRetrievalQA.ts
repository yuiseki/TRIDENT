import * as dotenv from "dotenv";
import { OpenAI } from "langchain/llms/openai";
import { RetrievalQAChain } from "langchain/chains";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { Document } from "langchain/dist/document";

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
const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever(10), {
  returnSourceDocuments: true,
});

const queries = [
  "What is the UN doing in South Sudan?",
  "What is the name of the UN mission in South Sudan?",
  "When did the UN start mission in South Sudan?",
  "Who is the latest head of South Sudan at the UN?",
  "Where is the headquarters of South Sudan at the UN?",
  "What is the UN doing in Kosovo?",
  "What is the name of the UN mission in Kosovo?",
  "When did the UN start mission in Kosovo?",
  "Who is the latest head of Kosovo at the UN?",
];

for (const query of queries) {
  console.log("----- ----- -----");
  const res = await chain.call({
    query: query,
  });
  console.log("Q:", query);
  console.log("A:", res.text);
  console.log(res.sourceDocuments.map((d: Document) => d.metadata.title));
  console.log("----- ----- -----");
}