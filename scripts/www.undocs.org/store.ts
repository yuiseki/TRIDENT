import * as dotenv from "dotenv";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { HNSWLib } from "langchain/vectorstores/hnswlib";

import fs from "node:fs/promises";

dotenv.config();

const gaUrlsFile = await fs.readFile("public/www.undocs.org/urls.txt", "utf-8");
const gaUrls = gaUrlsFile.split("\n");

const secUrlsFile = await fs.readFile(
  "public/www.undocs.org/s_res_urls_uniq.txt",
  "utf-8"
);
const secUrls = secUrlsFile.split("\n");

const urls = [...gaUrls, ...secUrls];

console.info("urls:", urls.length);

const allDocs: any = [];
for await (const url of urls.reverse()) {
  console.log("----- ----- -----");
  console.info("load:", url);
  if (0 === url.length) {
    continue;
  }
  const resolutionId = url
    .replace("http://", "")
    .replace("https://", "")
    .replace("www.undocs.org/", "")
    .replace("undocs.org/", "")
    .replace("en/", "");
  console.log("resolutionId:", resolutionId);
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
    allDocs.push(updatedDocs);
  } catch (error) {
    console.log(error);
  }
}

console.log(allDocs.length);
console.log(allDocs.flat().length);

const vectorStoreSaveDir = "public/www.undocs.org/vector_stores/base";
const vectorStore = await HNSWLib.fromDocuments(
  allDocs.flat(),
  new OpenAIEmbeddings()
);
await vectorStore.save(vectorStoreSaveDir);
