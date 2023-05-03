export const getOverpassResponse = async (overpassQuery: string) => {
  const queryString = `data=${encodeURIComponent(overpassQuery)}`;
  const overpassApiUrl = `https://overpass-api.de/api/interpreter?${queryString}`;
  const res = await fetch(overpassApiUrl);
  if (res.ok) {
    const json = await res.json();
    return json;
  } else {
    console.error(JSON.stringify(res));
  }
};
