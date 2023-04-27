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
    const metadataUrl =
      "https://api.github.com/repos/" + url.replace("https://github.com/", "");
    const metadataRes = await fetch(metadataUrl);
    const metadataJson = await metadataRes.json();

    const metadata = {
      name: metadataJson.name,
      full_name: metadataJson.full_name,
      author: metadataJson.owner.login,
      authorUrl: metadataJson.owner.html_url,
      title: metadataJson.full_name + " " + metadataJson.description,
      license: metadataJson.license.name,
    };

    let readMeUrl = "";

    const ghPagesBranchReadMeUrl = url + "/raw/gh-pages/README.md";
    const ghPagesBranchReadMeHeadRes = await fetch(ghPagesBranchReadMeUrl, {
      method: "HEAD",
      redirect: "follow",
    });
    if (ghPagesBranchReadMeHeadRes.ok) {
      readMeUrl = ghPagesBranchReadMeUrl;
    }

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
      [{ source: url, ...metadata }]
    );
    docs.push(singleDocs);
    console.log();
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
