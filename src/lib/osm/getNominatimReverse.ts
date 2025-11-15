import { Md5 } from "ts-md5";

export const getNominatimReverseResponse = async (
  lat: number,
  lon: number,
  zoom: number
) => {
  const baseUrl = process.env.NOMINATIM_BASE_URL
    ? process.env.NOMINATIM_BASE_URL
    : "https://nominatim.openstreetmap.org";

  const params = new URLSearchParams();
  params.append("format", "jsonv2");
  params.append("lat", lat.toString());
  params.append("lon", lon.toString());
  params.append("zoom", zoom.toString());

  const nominatimUrl = `${baseUrl}/reverse?${params.toString()}`;
  return await fetch(nominatimUrl);
};

export const getNominatimReverseResponseJson = async (
  lat: number,
  lon: number,
  zoom: number
) => {
  const res = await getNominatimReverseResponse(lat, lon, zoom);
  return await res.json();
};

export const getNominatimReverseResponseJsonWithCache = async (
  lat: number,
  lon: number,
  zoom: number,
  cacheSeconds: number = 21600 // 6 hours
) => {
  const md5 = new Md5();
  md5.appendStr(`${lat},${lon},${zoom}`);
  const hash = md5.end();
  const key = `trident-nominatim-reverse-cache-${hash}`;
  const unixtime = Math.floor(new Date().getTime() / 1000);

  console.log(`${lat},${lon},${zoom}`);

  const getAndCache = async () => {
    const json = await getNominatimReverseResponseJson(lat, lon, zoom);
    const valueToStore = {
      query: `${lat},${lon},${zoom}`,
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
