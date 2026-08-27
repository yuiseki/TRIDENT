import { Md5 } from "ts-md5";
import {
  OVERPASS_CACHE_PREFIX,
  TOO_LARGE_MARKER,
  writeOverpassCache,
} from "./overpassCache";

export const getOverpassResponse = async (overpassQuery: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_OVERPASS_BASE_URL
    ? process.env.NEXT_PUBLIC_OVERPASS_BASE_URL
    : "https://z.overpass-api.de";
  const queryString = `data=${encodeURIComponent(overpassQuery)}`;
  const overpassApiUrl = `${baseUrl}/api/interpreter?${queryString}`;
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
  const key = `${OVERPASS_CACHE_PREFIX}${hash}`;
  const unixtime = Math.floor(new Date().getTime() / 1000);

  console.log(overpassQuery);

  const getAndCache = async (dontCache = false) => {
    const json = await getOverpassResponseJson(overpassQuery);
    const valueToStore = {
      query: overpassQuery,
      json: json,
      resJson: json,
      unixtime: unixtime,
    };
    if (dontCache) return json;
    const result = writeOverpassCache(
      window.localStorage,
      key,
      JSON.stringify(valueToStore)
    );
    if (result !== "stored") {
      console.log("getOverpassResponseJsonWithCache not cached:", result);
    }
    return json;
  };

  const cache = window.localStorage.getItem(key);
  if (cache) {
    if (cache === TOO_LARGE_MARKER) {
      return await getAndCache(true);
    }
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
