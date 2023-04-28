import * as dotenv from "dotenv";
import { load } from "cheerio";

import fs from "node:fs/promises";

dotenv.config();

const urlsFile = await fs.readFile("public/www.un.org/urls.txt", "utf-8");
const urls = urlsFile.split("\n");
console.info(urls.length);

const docs = [];

for await (const url of urls) {
  console.info(url);
  if (0 === url.length) {
    continue;
  }
  try {
    const res = await fetch(url);
    const content = await res.text();
    const $ = load(content);
    const anchors = $("a");
    for await (const anchor of anchors) {
      const href = anchor.attribs["href"];
      if (href && href.includes("undocs")) {
        console.log(href);
        docs.push(href);
      }
    }
  } catch (error) {
    console.error(error);
  }
}

console.log(docs.join("\n"));
