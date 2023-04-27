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
  const sites = ["github.com", "qiita.com"];

  for await (const site of sites) {
    const vectorStoreDirectory = path.join(
      process.cwd(),
      "public",
      site,
      "vector_stores",
      "base"
    );
    console.info(vectorStoreDirectory);
    try {
      await fs.lstat(vectorStoreDirectory);
      const vectorStore = await HNSWLib.load(
        vectorStoreDirectory,
        new OpenAIEmbeddings()
      );
      const results = await vectorStore.similaritySearchWithScore(
        queryString,
        4
      );
      finalResults.push(results);
    } catch (error) {
      console.error(error);
    }
  }

  res.status(200).json(finalResults.flat().sort((a, b) => a[1] - b[1]));
}
