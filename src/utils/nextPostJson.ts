import { Md5 } from "ts-md5";

export const nextPostJson = async (apiPath: string, object: any) => {
  return fetch(apiPath, {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify(object),
  });
};

export const nextPostJsonWithCache = async (
  url: string,
  bodyJson: any,
  cacheSeconds: number = 21600 // 6 hours
) => {
  const bodyJsonString = JSON.stringify(bodyJson);
  const md5 = new Md5();
  md5.appendStr(`${url}\n${bodyJsonString}`);
  const hash = md5.end();
  const key = `trident-cache_2024-11-09_002_${hash}`;
  const unixtime = Math.floor(new Date().getTime() / 1000);

  const fetchAndCache = async () => {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: bodyJsonString,
    });
    const json = await res.json();
    const valueToStore = {
      url: url,
      reqJson: bodyJson,
      resJson: json,
      unixtime: unixtime,
    };
    try {
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error("nextPostJsonWithCache error:", error);
    }
    return json;
  };

  const cache = window.localStorage.getItem(key);
  if (cache) {
    const valueFromStore = JSON.parse(cache);
    if (unixtime - cacheSeconds < valueFromStore.unixtime) {
      return valueFromStore.resJson;
    } else {
      return await fetchAndCache();
    }
  } else {
    return await fetchAndCache();
  }
};
