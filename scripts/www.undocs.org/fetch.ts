import * as dotenv from "dotenv";

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

const gaUrlsFile = await fs.readFile("public/www.undocs.org/urls.txt", "utf-8");
const gaUrls = gaUrlsFile.split("\n");

const secUrlsFile = await fs.readFile(
  "public/www.undocs.org/s_res_urls_uniq.txt",
  "utf-8"
);
const secUrls = secUrlsFile.split("\n");

const urls = [...gaUrls, ...secUrls];

console.info("urls:", urls.length);

for await (const url of urls.reverse()) {
  console.log("----- ----- -----");
  console.info("fetch:", url);
  if (0 === url.length) {
    continue;
  }
  try {
    const resolutionId = url
      .replace("http://", "")
      .replace("https://", "")
      .replace("www.undocs.org/", "")
      .replace("undocs.org/", "");
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

    const englishUrl = "https://www.undocs.org/en/" + resolutionId;
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