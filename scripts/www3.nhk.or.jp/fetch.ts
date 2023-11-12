import * as dotenv from "dotenv";
dotenv.config();

import { OpenAI, OpenAIChat } from "langchain/llms/openai";
import { loadConcernPlaceExtractorChain } from "../../src/utils/langchain/chains/loadConcernPlaceExtractorChain/index.ts";

import fs from "node:fs/promises";
import { exit } from "node:process";

const now = new Date();
const today = now
  .toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
  .split("/")
  .join("-");
const concernsTodayJsonFilePath = `public/data/www3.nhk.or.jp/concerns/${today}_concerns.json`;

try {
  const alreadyFetched = (await fs.lstat(concernsTodayJsonFilePath)).isFile();
  if (alreadyFetched) {
    console.log("already extracted, finish:", concernsTodayJsonFilePath);
    exit(0);
  }
} catch (error) {
  console.log("not yet extracted:", concernsTodayJsonFilePath);
}

const newsUrl1 =
  "https://noa-api.nhk.jp/r1/db/_search?q=%28%22%E5%9B%BD%E9%80%A3%22%29&index=news&fields=title%2Cdescription&_source=link%2CpubDate%2Ctitle%2Cdescription&sortkey=pubDate&order=desc&from=0&limit=30";

const newsUrl2 =
  "https://noa-api.nhk.jp/r1/db/_search?q=%28%22%E5%9C%B0%E9%9C%87%22%29&index=news&fields=title%2Cdescription&_source=link%2CpubDate%2Ctitle%2Cdescription&sortkey=pubDate&order=desc&from=0&limit=30";

const newsUrl3 =
  "https://noa-api.nhk.jp/r1/db/_search?q=%28%22%E6%B4%AA%E6%B0%B4%22%29&index=news&fields=title%2Cdescription&_source=link%2CpubDate%2Ctitle%2Cdescription&sortkey=pubDate&order=desc&from=0&limit=30";

const newsUrlList = [newsUrl1, newsUrl2, newsUrl3];

const llm = new OpenAIChat({ temperature: 0 });
const chain = loadConcernPlaceExtractorChain({ llm });

const newsItems: Array<{
  link: string;
  description: string;
  title: string;
  pubDate: string;
}> = [];

for await (const newsUrl of newsUrlList) {
  console.log("news search url:", newsUrl);
  const res = await fetch(newsUrl);
  const json = await res.json();
  for await (const result of json.result) {
    newsItems.push(result);
  }
}

console.log(newsItems.length);

const concerns = [];
for await (const newsItem of newsItems) {
  const cacheOfNewsItemJsonFileDirPath = `tmp/www3.nhk.or.jp/news/${
    newsItem.link.split("/")[1]
  }`;
  const cacheOfNewsItemJsonFilePath = `tmp/www3.nhk.or.jp/news/${
    newsItem.link.split("/")[1]
  }/${newsItem.link.split("/")[2].split(".")[0]}.json`;
  try {
    const alreadyFetched = (
      await fs.lstat(cacheOfNewsItemJsonFilePath)
    ).isFile();
    if (alreadyFetched) {
      console.log("already extracted, finish:", cacheOfNewsItemJsonFilePath);
      // cacheOfNewsItemJsonFilePathを読んで、concernsに追加する
      const data = await fs.readFile(cacheOfNewsItemJsonFilePath, "utf-8");
      const concern = JSON.parse(data);
      concerns.push(concern);
      continue;
    } else {
      await fs.mkdir(cacheOfNewsItemJsonFileDirPath, { recursive: true });
    }
  } catch (error) {
    console.log("not yet extracted:", cacheOfNewsItemJsonFilePath);
    await fs.mkdir(cacheOfNewsItemJsonFileDirPath, { recursive: true });
  }

  try {
    const text = `${newsItem.pubDate.split(" ")[0]} 配信
${newsItem.title}
${newsItem.description}`;
    console.log("----- ----- ----- ----- -----");
    console.log("Input text:");
    console.log(text);
    console.log("");
    const result = await chain.call({ text });
    console.log("Output text:", result.text);
    const lines: string[] = result.text.split("\n");
    const currentDate = lines
      .filter((line) => line.includes("CurrentDate:"))[0]
      .split(": ")[1];
    const whereHappening = lines
      .filter((line) => line.includes("WhereHappening:"))[0]
      .split(": ")[1];
    const whatHappenings = lines
      .filter((line) => line.includes("WhoAndWhatHappening:"))
      .map((line) => line.split(": ")[1]);
    const requestToDisplayMaps = lines
      .filter((line) => line.includes("RequestToDisplayMap:"))
      .map((line) => line.split(": ")[1]);

    const concern = {
      url: `https://www3.nhk.or.jp/news/${newsItem.link}`,
      title: newsItem.title,
      description: newsItem.description,
      pubDate: new Date(newsItem.pubDate),
      currentDate: new Date(currentDate),
      where: whereHappening,
      whatHappenings,
      requestToDisplayMaps,
    };
    console.log("");
    console.log("concern:", concern);
    await fs.writeFile(
      cacheOfNewsItemJsonFilePath,
      JSON.stringify(concern, null, 2)
    );
    console.log("----- ----- ----- ----- -----");
    concerns.push(concern);
  } catch (error) {
    console.error(error);
  }
}

console.log(concerns.length);

const concernsLatestJsonFilePath =
  "public/data/www3.nhk.or.jp/concerns/latest_concerns.json";

await fs.writeFile(
  concernsLatestJsonFilePath,
  JSON.stringify(concerns, null, 2)
);

await fs.writeFile(
  concernsTodayJsonFilePath,
  JSON.stringify(concerns, null, 2)
);
