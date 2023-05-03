export const getOverpassResponse = async (overpassQuery: string) => {
  const queryString = `data=${encodeURIComponent(overpassQuery)}`;
  const overpassApiUrl = `https://overpass-api.de/api/interpreter?${queryString}`;
  return await fetch(overpassApiUrl);
};
