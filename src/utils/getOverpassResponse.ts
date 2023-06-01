import { Md5 } from "ts-md5";

export const getOverpassResponse = async (overpassQuery: string) => {
  const queryString = `data=${encodeURIComponent(overpassQuery)}`;
  const overpassApiUrl = `https://overpass-api.de/api/interpreter?${queryString}`;
  return await fetch(overpassApiUrl);
};

export const getOverpassResponseJson = async (overpassQuery: string) => {
  const res = await getOverpassResponse(overpassQuery);
  return await res.json();
};

export const getOverpassResponseJsonWithCache = async (
  overpassQuery: string,
  cacheSeconds: number = 21600 // 6 hours
) => {
  const md5 = new Md5();
  md5.appendStr(overpassQuery);
  const hash = md5.end();
  const key = `trident-overpass-cache-${hash}`;
  const unixtime = Math.floor(new Date().getTime() / 1000);

  console.log(overpassQuery);

  const getAndCache = async () => {
    const json = await getOverpassResponseJson(overpassQuery);
    const valueToStore = {
      query: overpassQuery,
      json: json,
      resJson: json,
      unixtime: unixtime,
    };
    try {
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error("getOverpassResponseJsonWithCache error:", error);
    }
    return json;
  };

  const cache = window.localStorage.getItem(key);
  if (cache) {
    const valueFromStore = JSON.parse(cache);
    if (
      "resJson" in valueFromStore &&
      unixtime - cacheSeconds < valueFromStore.unixtime
    ) {
      return valueFromStore.resJson;
    } else {
      return await getAndCache();
    }
  } else {
    return await getAndCache();
  }
};
