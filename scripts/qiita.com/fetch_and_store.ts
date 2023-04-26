import * as dotenv from "dotenv";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { CheerioWebBaseLoader } from "langchain/document_loaders/web/cheerio";
import { MarkdownTextSplitter } from "langchain/text_splitter";

import fs from "node:fs/promises";

dotenv.config();

const urlsFile = await fs.readFile("public/qiita.com/urls.txt", "utf-8");
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
    const loader = new CheerioWebBaseLoader(url + ".md");
    const originalDocs = await loader.load();
    const pageContents = originalDocs[0].pageContent.split("---\n");
    const frontmatterArray = pageContents[1]
      .split("\n")
      .filter((line) => 0 < line.length)
      .map((line) => {
        return [
          line.slice(0, line.indexOf(":")),
          line.slice(line.indexOf(":") + 2, line.length),
        ];
      });
    const frontmatter = Object.fromEntries(frontmatterArray);
    const mainContent = pageContents[2];
    const singleDocs = await splitter.createDocuments(
      [mainContent],
      [{ source: url, ...frontmatter }]
    );
    docs.push(singleDocs);
  } catch (error) {
    console.error(error);
  }
}

console.log(docs);
console.log(docs.length);

const vectorStoreSaveDir = "public/qiita.com/vector_stores/base";
const vectorStore = await HNSWLib.fromDocuments(
  docs.flat(),
  new OpenAIEmbeddings()
);
await vectorStore.save(vectorStoreSaveDir);
