import * as dotenv from "dotenv";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { MarkdownTextSplitter } from "langchain/text_splitter";

import fs from "node:fs/promises";

dotenv.config();

const urlsFile = await fs.readFile("public/github.com/urls.txt", "utf-8");
const urls = urlsFile.split("\n");
console.info(urls.length);

const docs = [];

const splitter = new MarkdownTextSplitter();

for await (const url of urls) {
  console.info(url);
  if (0 === url.length) {
    continue;
  }
  try {
    let readMeUrl = "";

    const masterBranchReadMeUrl = url + "/raw/master/README.md";
    const masterBranchReadMeHeadRes = await fetch(masterBranchReadMeUrl, {
      method: "HEAD",
      redirect: "follow",
    });
    if (masterBranchReadMeHeadRes.ok) {
      readMeUrl = masterBranchReadMeUrl;
    }

    const mainBranchReadMeUrl = url + "/raw/main/README.md";
    const mainBranchReadMeHeadRes = await fetch(mainBranchReadMeUrl, {
      method: "HEAD",
      redirect: "follow",
    });
    if (mainBranchReadMeHeadRes.ok) {
      readMeUrl = mainBranchReadMeUrl;
    }

    console.log(readMeUrl);
    const readMeMarkdownRes = await fetch(readMeUrl, { redirect: "follow" });
    const readMeContent = await readMeMarkdownRes.text();

    const singleDocs = await splitter.createDocuments(
      [readMeContent],
      [{ source: url }]
    );
    docs.push(singleDocs);
  } catch (error) {
    console.error(error);
  }
}

console.log(docs.length);

const vectorStoreSaveDir = "public/github.com/vector_stores/base";
const vectorStore = await HNSWLib.fromDocuments(
  docs.flat(),
  new OpenAIEmbeddings()
);
await vectorStore.save(vectorStoreSaveDir);
