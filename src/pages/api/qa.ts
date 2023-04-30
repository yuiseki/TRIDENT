import type { NextApiRequest, NextApiResponse } from "next";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import path from "path";
import { Document } from "langchain/dist/document";
import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { OpenAI } from "langchain/llms/openai";
import { RetrievalQAChain } from "langchain/chains";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  let query = undefined;
  const { query: queryInQuery } = req.query;
  if (queryInQuery !== undefined) {
    query = queryInQuery;
  }
  const { query: queryInBody } = req.body;
  if (queryInBody !== undefined) {
    query = queryInBody;
  }
  if (query === undefined) {
    res.status(400).json({ status: "ng", message: "query is missing" });
    return;
  }
  const queryString = query as string;
  if (queryString.length > 400) {
    res.status(400).json({ status: "ng", message: "query is too long" });
    return;
  }

  if (
    queryString.toLowerCase().includes("ignore") ||
    queryString.toLowerCase().includes("instruction")
  ) {
    res.status(400).json({ status: "ng", message: "invalid query" });
    return;
  }

  // initialize pinecone
  const client = new PineconeClient();
  await client.init({
    apiKey: process.env.PINECONE_API_KEY || "",
    environment: process.env.PINECONE_ENVIRONMENT || "",
  });
  const pineconeIndex = client.Index(process.env.PINECONE_INDEX || "");
  const vectorStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings(),
    { pineconeIndex }
  );

  // initialize the LLM and chain
  const model = new OpenAI({ temperature: 0, maxTokens: 1500 });
  const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever(10), {
    returnSourceDocuments: true,
  });
  const answer = await chain.call({
    query: query,
  });

  res.status(200).json(answer);
}
