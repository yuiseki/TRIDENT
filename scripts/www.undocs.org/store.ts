import * as dotenv from "dotenv";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";

import fs from "node:fs/promises";
import { TokenTextSplitter } from "langchain/text_splitter";

dotenv.config();

// list of all documents
const gaUrlsFile = await fs.readFile("public/www.undocs.org/urls.txt", "utf-8");
const gaUrls = gaUrlsFile.split("\n");
const secUrlsFile = await fs.readFile(
  "public/www.undocs.org/s_res_urls_uniq.txt",
  "utf-8"
);
const secUrls = secUrlsFile.split("\n");
const urls = [...gaUrls, ...secUrls];
console.info("urls:", urls.length);

// TODO: もっと小さくする
const splitter = new TokenTextSplitter({
  encodingName: "p50k_base",
  chunkSize: 300,
  chunkOverlap: 5,
});

// load all documents
const allDocsPerPage: any = [];
const allSplittedDocs: any = [];
for await (const url of urls.reverse()) {
  if (0 === url.length) {
    continue;
  }
  const resolutionId = url
    .replace("http://", "")
    .replace("https://", "")
    .replace("www.undocs.org/", "")
    .replace("undocs.org/", "")
    .replace("en/", "");
  const pdfFilePath = `./tmp/www.undocs.org/en/pdfs/${resolutionId}/resolution.pdf`;

  try {
    const alreadyFetched = (await fs.lstat(pdfFilePath)).isFile();
    if (!alreadyFetched) {
      continue;
    }

    const loader = new PDFLoader(pdfFilePath);
    const docs = await loader.load();
    const updatedDocs = docs.map((doc) => {
      doc.metadata.source = url;
      doc.metadata.id = resolutionId;
      if (doc.metadata.pdf.info.Author) {
        doc.metadata.author = doc.metadata.pdf.info.Author;
      }
      if (doc.metadata.pdf.info.Subject && doc.metadata.pdf.info.Title) {
        doc.metadata.title =
          doc.metadata.pdf.info.Subject + "; " + doc.metadata.pdf.info.Title;
      } else {
        doc.metadata.title = resolutionId;
      }
      return doc;
    });
    allDocsPerPage.push(updatedDocs);
    const splittedDocs = await splitter.splitDocuments(updatedDocs);
    allSplittedDocs.push(splittedDocs);
  } catch (error) {}
}

console.log("all docs", allDocsPerPage.length);
console.log("all docs flat", allDocsPerPage.flat().length);
console.log("all splits", allSplittedDocs.length);
console.log("all splits flat", allSplittedDocs.flat().length);

// initialize pinecone
const client = new PineconeClient();
await client.init({
  apiKey: process.env.PINECONE_API_KEY || "",
  environment: process.env.PINECONE_ENVIRONMENT || "",
});
const pineconeIndex = client.Index(process.env.PINECONE_INDEX || "");

// vectorize and store documents
await PineconeStore.fromDocuments(
  allSplittedDocs.flat(),
  new OpenAIEmbeddings(),
  {
    pineconeIndex,
  }
);
