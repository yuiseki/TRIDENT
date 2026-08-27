// `area["name:en"="Hiroshima"]` is not one place. Overpass unions every area
// whose name matches, and in OSM that is five objects: the city, an island in
// the Seto Inland Sea, two unnamed-level relations, and a quarter in Tokushima
// 200 km away. Asking for cafes in Hiroshima returned cafes in Tokushima.
//
// Nominatim knows which relation a name means, so resolve the name once and
// filter by that relation's id instead. Overpass area ids are the relation id
// plus this offset.

export const OVERPASS_AREA_ID_OFFSET = 3_600_000_000;

export type NominatimResult = {
  osm_type?: string;
  osm_id?: number;
  category?: string;
  type?: string;
  importance?: number;
  display_name?: string;
};

/**
 * Pick the relation a place name refers to.
 *
 * Only administrative boundaries count: an island or a building sharing the
 * name is never what "cafes in X" meant. Nominatim does not sort by
 * importance, so choose the maximum rather than the first — for "Hiroshima"
 * the prefecture (0.682) comes back after the city (0.670).
 */
export const pickAreaRelation = (
  results: NominatimResult[]
): NominatimResult | null => {
  const administrative = (results ?? []).filter(
    (result) =>
      result.osm_type === "relation" &&
      result.category === "boundary" &&
      result.type === "administrative" &&
      typeof result.osm_id === "number"
  );
  if (administrative.length === 0) return null;

  return administrative.reduce((best, candidate) =>
    (candidate.importance ?? 0) > (best.importance ?? 0) ? candidate : best
  );
};

export const toOverpassAreaId = (relationId: number): number =>
  OVERPASS_AREA_ID_OFFSET + relationId;

const nominatimBaseUrl = () =>
  process.env.NEXT_PUBLIC_NOMINATIM_BASE_URL ||
  "https://nominatim.openstreetmap.org";

// One process-lifetime cache. Place names repeat across a session and the
// answer does not move.
const resolved = new Map<string, number | null>();

/** Resolve a place name to an Overpass area id, or null when nothing fits. */
export const resolveAreaId = async (name: string): Promise<number | null> => {
  const key = name.trim();
  if (!key) return null;
  if (resolved.has(key)) return resolved.get(key) ?? null;

  let areaId: number | null = null;
  try {
    const params = new URLSearchParams({
      format: "jsonv2",
      polygon_geojson: "0",
      q: key,
    });
    const response = await fetch(`${nominatimBaseUrl()}/search?${params}`);
    if (response.ok) {
      const picked = pickAreaRelation(await response.json());
      if (picked?.osm_id) areaId = toOverpassAreaId(picked.osm_id);
    }
  } catch (error) {
    // A geocoder that is down must not take the query with it; fall back to
    // the name filter the model wrote.
    console.log("resolveAreaId failed for", key, error);
  }

  resolved.set(key, areaId);
  return areaId;
};

export const __clearResolvedAreaCache = () => resolved.clear();
