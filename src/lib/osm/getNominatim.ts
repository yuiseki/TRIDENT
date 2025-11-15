import { Md5 } from "ts-md5";

export const getNominatimResponse = async (query: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_NOMINATIM_BASE_URL
    ? process.env.NEXT_PUBLIC_NOMINATIM_BASE_URL
    : "https://nominatim.openstreetmap.org";

  const params = new URLSearchParams();
  params.append("format", "jsonv2");
  params.append("polygon_geojson", "0");
  params.append("q", query);

  const nominatimUrl = `${baseUrl}/search?${params.toString()}`;
  return await fetch(nominatimUrl);
};

export const getNominatimResponseJson = async (overpassQuery: string) => {
  const res = await getNominatimResponse(overpassQuery);
  return await res.json();
};

export const getNominatimResponseJsonWithCache = async (
  query: string,
  cacheSeconds: number = 21600 // 6 hours
) => {
  const md5 = new Md5();
  md5.appendStr(query);
  const hash = md5.end();
  const key = `trident-nominatim-cache-${hash}`;
  const unixtime = Math.floor(new Date().getTime() / 1000);

  console.log(query);

  const getAndCache = async () => {
    const json = await getNominatimResponseJson(query);
    const valueToStore = {
      query: query,
      json: json,
      resJson: json,
      unixtime: unixtime,
    };
    try {
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error("getNominatimResponseJsonWithCache error:", error);
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
