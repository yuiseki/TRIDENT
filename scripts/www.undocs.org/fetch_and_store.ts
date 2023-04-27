import * as dotenv from "dotenv";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { HNSWLib } from "langchain/vectorstores/hnswlib";
import { MarkdownTextSplitter } from "langchain/text_splitter";

import fs from "node:fs/promises";

dotenv.config();

const sleep = (msec: number) =>
  new Promise((resolve) => setTimeout(resolve, msec));

const followRedirect = async (
  url: string,
  cookies: string | null
): Promise<[string, string | null]> => {
  console.log("followRedirect url:", url);
  const res = await fetch(url, {
    method: "HEAD",
    redirect: "manual",
    headers: { Cookie: cookies ? cookies : "" },
  });
  console.log("followRedirect status:", res.status, res.statusText);
  const newCookies = res.headers.get("Set-Cookie") || cookies;
  console.log("followRedirect cookies:", newCookies?.length);
  if (res.status >= 300 && res.status < 400) {
    const location = res.headers.get("location");
    if (location) {
      if (location.startsWith("http")) {
        return await followRedirect(location, newCookies);
      } else {
        const origin = new URL(url).origin;
        return await followRedirect(origin + location, newCookies);
      }
    }
  }
  return [url, newCookies];
};

const followRefresh = async (
  url: string,
  cookies: string | null
): Promise<[string, string | null]> => {
  console.log("followRefresh url:", url);
  const res = await fetch(url, {
    headers: { Cookie: cookies ? cookies : "" },
  });
  console.log("followRefresh status:", res.status, res.statusText);
  const resText = await res.text();
  const newCookies = res.headers.get("Set-Cookies") || cookies;
  console.log("followRefresh cookies:", newCookies?.length);
  const metaRefreshList = resText
    .split("\n")
    .filter(
      (line) =>
        line.toLowerCase().startsWith("<meta") &&
        line.toLowerCase().includes("refresh")
    );
  if (metaRefreshList.length === 0) {
    return [url, newCookies];
  }
  const refreshPath = metaRefreshList[0]
    .replaceAll('"', "")
    .split("=")[3]
    .replace(">", "");
  console.log("followRefresh", refreshPath);
  if (refreshPath.startsWith("http")) {
    return await followRefresh(refreshPath, newCookies);
  } else {
    const origin = new URL(url).origin;
    return await followRefresh(origin + refreshPath, newCookies);
  }
};

const urlsFile = await fs.readFile("public/www.undocs.org/urls.txt", "utf-8");
const urls = urlsFile.split("\n");
console.info("urls:", urls.length);

for await (const url of urls.reverse()) {
  console.log("----- ----- -----");
  console.info("fetch:", url);
  if (0 === url.length) {
    continue;
  }
  try {
    const resolutionId = url.replace("https://www.undocs.org/", "");

    try {
      const alreadyFetched = (
        await fs.lstat(
          `./tmp/www.undocs.org/en/pdfs/${resolutionId}/resolution.pdf`
        )
      ).isFile();
      if (alreadyFetched) {
        continue;
      }
    } catch (error) {
      console.log("");
    }

    const englishUrl = url.replace(
      "https://www.undocs.org/",
      "https://www.undocs.org/en/"
    );
    console.log(englishUrl);

    const myCookies = process.env["UN_COOKIES"] || "";

    const [redirectedUrl, redirectCookies] = await followRedirect(
      englishUrl,
      myCookies
    );
    const [refreshedUrl, cookies] = await followRefresh(
      redirectedUrl,
      redirectCookies
    );

    console.log();
    console.log(refreshedUrl);
    console.log();

    const userAgent =
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36";

    const res = await fetch(refreshedUrl, {
      referrer: new URL(refreshedUrl).origin,
      headers: { Cookie: cookies ? cookies : "", "User-Agent": userAgent },
    });
    const content = await res.blob();
    const buffer = Buffer.from(await content.arrayBuffer());

    await fs.mkdir(`./tmp/www.undocs.org/en/pdfs/${resolutionId}/`, {
      recursive: true,
    });
    await fs.writeFile(
      `./tmp/www.undocs.org/en/pdfs/${resolutionId}/resolution.pdf`,
      buffer
    );
  } catch (error) {
    console.error(error);
  }
  await sleep(1500);
  console.log("----- ----- -----");
}

const allDocs: any = [];
for await (const url of urls.reverse()) {
  console.log("----- ----- -----");
  console.info("load:", url);
  if (0 === url.length) {
    continue;
  }
  const resolutionId = url.replace("https://www.undocs.org/", "");
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

const vectorStoreSaveDir = "public/www.undocs.org/vector_stores/base";
const vectorStore = await HNSWLib.fromDocuments(
  allDocs.flat(),
  new OpenAIEmbeddings()
);
await vectorStore.save(vectorStoreSaveDir);
