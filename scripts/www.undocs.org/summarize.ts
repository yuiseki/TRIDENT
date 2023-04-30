import * as dotenv from "dotenv";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores";

import { OpenAI } from "langchain/llms/openai";
import { loadSummarizationChain } from "langchain/chains";

import fs from "node:fs/promises";

dotenv.config();
const model = new OpenAI({ temperature: 0 });

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

// load all documents
for await (const url of urls.slice(0, 500)) {
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
  const summaryFilePath = `./tmp/www.undocs.org/en/pdfs/${resolutionId}/summary.txt`;
  const metadataFilePath = `./tmp/www.undocs.org/en/pdfs/${resolutionId}/metadata.json`;

  try {
    const isPdfFileExist = (await fs.lstat(pdfFilePath)).isFile();

    console.log(pdfFilePath, isPdfFileExist);
    if (!isPdfFileExist) {
      continue;
    }
    const loader = new PDFLoader(pdfFilePath);
    const docs = await loader.load();

    let summary = "";
    try {
      const isSummaryFileExist = (await fs.lstat(summaryFilePath)).isFile();
      console.log(summaryFilePath, isSummaryFileExist);
      if (isSummaryFileExist) {
        summary = await fs.readFile(summaryFilePath, "utf-8");
        console.log("load summary", summary.length);
      }
    } catch (error) {
      const charLength = docs
        .map((d) => d.pageContent.length)
        .reduce((sum, element) => {
          return sum + element;
        }, 0);
      console.log(
        "generate summary...",
        docs.length,
        "pages,",
        charLength,
        "chars"
      );
      if (30000 < charLength) {
        console.error("!!!!! !!!!! !!!!!");
        console.error("!!!!! SKIP");
        console.error("!!!!! number of chars too long!");
        console.error("!!!!! SKIP");
        console.error("!!!!! !!!!! !!!!!");
        continue;
      }
      const chain = loadSummarizationChain(model);
      const res = await chain.call({
        input_documents: docs,
      });
      if ("text" in res) {
        summary = res.text;
        console.log("summarized", summary.length, "chars");
        if (summary.length === 0) {
          console.log("generate summary failed!!", pdfFilePath);
          continue;
        } else {
          console.log(resolutionId);
          console.log(summary);
        }
        console.log("save summary text...");
        await fs.writeFile(summaryFilePath, summary);
      } else {
        console.log("generate summary failed!!", pdfFilePath);
        continue;
      }
    }

    try {
      const isMetadataFileExist = (await fs.lstat(metadataFilePath)).isFile();
      console.log(metadataFilePath, isMetadataFileExist);
    } catch (error) {
      console.log("save metadata json...");
      const updatedDocs = docs.map((doc) => {
        doc.metadata.source = url;
        doc.metadata.summary = summary;
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
        delete doc.metadata.loc;
        return doc;
      });
      const metadata = updatedDocs[0].metadata;
      const metadataJson = JSON.stringify(metadata, null, 2);
      await fs.writeFile(metadataFilePath, metadataJson);
    }
  } catch (error) {
    console.log(error);
  }
}
