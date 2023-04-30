import * as dotenv from "dotenv";
import { OpenAI } from "langchain/llms/openai";
import { RetrievalQAChain } from "langchain/chains";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores";

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

// initialize the LLM
const model = new OpenAI({});

const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());
const res = await chain.call({
  query: "When did UNMISS begin?",
});
console.log(res);
