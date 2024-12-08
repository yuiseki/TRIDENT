import { Md5 } from "ts-md5";

export type LonLat = {
  lon: number;
  lat: number;
};

export const getValhalla = async (departure: LonLat, destination: LonLat) => {
  const json = {
    costing: "pedestrian",
    costing_options: {
      pedestrian: {
        exclude_polygons: [],
        use_ferry: 1,
        use_living_streets: 0.5,
        use_tracks: 0,
        service_penalty: 15,
        service_factor: 1,
        shortest: false,
        use_hills: 0.5,
        walking_speed: 5.1,
        walkway_factor: 1,
        sidewalk_factor: 1,
        alley_factor: 2,
        driveway_factor: 5,
        step_penalty: 0,
        max_hiking_difficulty: 1,
        use_lit: 0,
        transit_start_end_max_distance: 2145,
        transit_transfer_max_distance: 800,
      },
    },
    exclude_polygons: [],
    locations: [departure, destination],
    directions_options: { units: "kilometers" },
    id: "valhalla_directions",
  };
  const params = new URLSearchParams();
  params.append("json", JSON.stringify(json));

  const valhallaUrl = `https://valhalla1.openstreetmap.de/route?${params.toString()}`;
  return await fetch(valhallaUrl);
};

export const getValhallaResponseJson = async (
  departure: LonLat,
  destination: LonLat
) => {
  const res = await getValhalla(departure, destination);
  return await res.json();
};

export const getValhallaResponseJsonWithCache = async (
  departure: LonLat,
  destination: LonLat,
  cacheSeconds: number = 21600 // 6 hours
) => {
  const md5 = new Md5();
  md5.appendStr(JSON.stringify(departure) + JSON.stringify(destination));
  const hash = md5.end();
  const key = `trident-valhalla-cache-${hash}`;
  const unixtime = Math.floor(new Date().getTime() / 1000);

  const getAndCache = async () => {
    const json = await getValhallaResponseJson(departure, destination);
    const valueToStore = {
      departure: departure,
      destination: destination,
      resJson: json,
      unixtime: unixtime,
    };
    try {
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error("getValhallaResponseJsonWithCache error:", error);
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
