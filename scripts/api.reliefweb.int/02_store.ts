import fs from "node:fs/promises";
import * as dotenv from "dotenv";
import { OpenAI } from "langchain/llms/openai";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { HNSWLib } from "langchain/vectorstores";
import { Document } from "langchain/document";

dotenv.config();

const latestSummaryFilePath =
  "public/api.reliefweb.int/disasters/summaries/latest_summary.json";
const latestSummaryFile = await fs.readFile(latestSummaryFilePath, "utf-8");
const latestSummaryJson = JSON.parse(latestSummaryFile);

const docs: Document[] = [];
for await (const disaster of latestSummaryJson.disasters) {
  const doc = new Document({
    pageContent: disaster.summary,
    metadata: disaster.metadata,
  });
  docs.push(doc);
}

console.log(docs[0]);

const vectorStoreSaveDir =
  "public/api.reliefweb.int/disasters/summaries/vector_stores/";
const vectorStore = await HNSWLib.fromDocuments(docs, new OpenAIEmbeddings());
await vectorStore.save(vectorStoreSaveDir);
