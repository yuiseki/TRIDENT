import * as dotenv from "dotenv";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";

import fs from "node:fs/promises";
import { TokenTextSplitter } from "langchain/text_splitter";
import { sleep } from "../../src/utils/sleep.ts";

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

// D:20210330172515-04'00'
// D:20210330172515+04'00'
// D:20210330172515
const parsePdfDateUnixTime = (pdfDateString: string): number => {
  const date = new Date(pdfDateString);
  if (!Number.isNaN(date.getTime())) {
    return date.getTime();
  }

  try {
    if (pdfDateString.includes("-")) {
      const dateString = pdfDateString.split(":")[1].split("-")[0];
      const timezoneString = pdfDateString.split(":")[1].split("-")[1];
      const timezoneHour = parseInt(timezoneString.split("'")[0]);
      const timezoneMinute = parseInt(timezoneString.split("'")[1]);
      const year = parseInt(dateString.slice(0, 4));
      const month = parseInt(dateString.slice(4, 6)) - 1;
      const day = parseInt(dateString.slice(6, 8));
      const hour = parseInt(dateString.slice(8, 10)) - timezoneHour;
      const minute = parseInt(dateString.slice(10, 12)) - timezoneMinute;
      const second = parseInt(dateString.slice(12, 14));
      return new Date(year, month, day, hour, minute, second).getTime();
    }
    if (pdfDateString.includes("+")) {
      const dateString = pdfDateString.split(":")[1].split("+")[0];
      const timezoneString = pdfDateString.split(":")[1].split("+")[1];
      const timezoneHour = parseInt(timezoneString.split("'")[0]);
      const timezoneMinute = parseInt(timezoneString.split("'")[1]);
      const year = parseInt(dateString.slice(0, 4));
      const month = parseInt(dateString.slice(4, 6)) - 1;
      const day = parseInt(dateString.slice(6, 8));
      const hour = parseInt(dateString.slice(8, 10)) + timezoneHour;
      const minute = parseInt(dateString.slice(10, 12)) + timezoneMinute;
      const second = parseInt(dateString.slice(12, 14));
      return new Date(year, month, day, hour, minute, second).getTime();
    }
    if (!pdfDateString.includes("-") && !pdfDateString.includes("+")) {
      const dateString = pdfDateString.split(":")[1];
      const year = parseInt(dateString.slice(0, 4));
      const month = parseInt(dateString.slice(4, 6)) - 1;
      const day = parseInt(dateString.slice(6, 8));
      const hour = parseInt(dateString.slice(8, 10));
      const minute = parseInt(dateString.slice(10, 12));
      const second = parseInt(dateString.slice(12, 14));
      return new Date(year, month, day, hour, minute, second).getTime();
    }
    return new Date(0).getTime();
  } catch (error) {
    console.error(error);
    return new Date(0).getTime();
  }
};

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

// TODO: Where is the Permanent Mission of Japan to the United Nations? -> I don't know.
// TODO: try to increase overlap
const splitter = new TokenTextSplitter({
  encodingName: "p50k_base",
  chunkSize: 200,
  chunkOverlap: 20,
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

      // author
      if (doc.metadata.pdf.info.Author) {
        doc.metadata.author = doc.metadata.pdf.info.Author;
      }

      // title
      if (doc.metadata.pdf.info.Title) {
        doc.metadata.title = doc.metadata.pdf.info.Title;
      }

      // date
      // created_at
      let created_at = new Date(0).getTime();
      try {
        if (doc.metadata["pdf.metadata._metadata.xmp:createdate"]) {
          created_at = new Date(
            doc.metadata["pdf.metadata._metadata.xmp:createdate"]
          ).getTime();
        } else {
          const pdfDateString = doc.metadata.pdf.info.CreationDate;
          created_at = parsePdfDateUnixTime(pdfDateString);
        }
      } catch (error) {
        console.log(error);
      }
      doc.metadata.created_at = Math.floor(created_at / 1000);

      // updated_at
      let updated_at = new Date(0).getTime();
      try {
        if (doc.metadata["pdf.metadata._metadata.xmp:modifydate"]) {
          updated_at = new Date(
            doc.metadata["pdf.metadata._metadata.xmp:modifydate"]
          ).getTime();
        } else {
          const pdfDateString = doc.metadata.pdf.info.ModDate;
          updated_at = parsePdfDateUnixTime(pdfDateString);
        }
      } catch (error) {
        console.log(error);
      }
      doc.metadata.updated_at = Math.floor(updated_at / 1000);

      if (
        doc.metadata.created_at === null ||
        Number.isNaN(doc.metadata.created_at)
      ) {
        doc.metadata.created_at = 0;
      }
      if (
        doc.metadata.updated_at === null ||
        Number.isNaN(doc.metadata.updated_at)
      ) {
        doc.metadata.updated_at = 0;
      }

      return doc;
    });
    if (updatedDocs === undefined || updatedDocs[0] === undefined) {
      continue;
    }
    allDocsPerPage.push(updatedDocs);
    const splittedDocs = (await splitter.splitDocuments(updatedDocs)).map(
      (doc) => {
        doc.pageContent = `Resolution: ${doc.metadata.id}${
          doc.metadata.title ?? `, Title: ${doc.metadata.title}`
        }, File created at: ${new Date(
          doc.metadata.created_at * 1000
        ).toLocaleDateString()}
${doc.pageContent
  .replace("\n ", "\n")
  .replace("\n\n\n", "\n")
  .replace("\n\n", "\n")}`;
        return doc;
      }
    );
    allSplittedDocs.push(splittedDocs);
    await sleep(100);
    try {
      console.log(resolutionId);
      console.log(JSON.stringify(splittedDocs[0]));
      vectorStore.addDocuments(splittedDocs);
    } catch (error) {
      console.info(resolutionId);
      console.error(error);
      continue;
    }
  } catch (error) {
    console.info(resolutionId);
    console.log(error);
    continue;
  }
}

console.log("all docs", allDocsPerPage.length);
console.log("all docs flat", allDocsPerPage.flat().length);
console.log("all splits", allSplittedDocs.length);
console.log("all splits flat", allSplittedDocs.flat().length);
console.log("finished.");
