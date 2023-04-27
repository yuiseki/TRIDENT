import type { NextApiRequest, NextApiResponse } from "next";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import path from "path";
import { Document } from "langchain/dist/document";
import fs from "node:fs/promises";

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

  const finalResults: [Document, number][][] = [];

  // qiita.com
  const vectorStoreSaveDir1 = path.resolve(
    `public/qiita.com/vector_stores/base`
  );
  const vectorStore1 = await HNSWLib.load(
    vectorStoreSaveDir1,
    new OpenAIEmbeddings()
  );
  const results1 = await vectorStore1.similaritySearchWithScore(queryString, 4);
  finalResults.push(results1);

  // github.com
  const vectorStoreSaveDir2 = path.resolve(
    `public/github.com/vector_stores/base`
  );
  const vectorStore2 = await HNSWLib.load(
    vectorStoreSaveDir2,
    new OpenAIEmbeddings()
  );
  const results2 = await vectorStore1.similaritySearchWithScore(queryString, 4);
  finalResults.push(results2);

  res.status(200).json(finalResults.flat().sort((a, b) => a[1] - b[1]));
}
