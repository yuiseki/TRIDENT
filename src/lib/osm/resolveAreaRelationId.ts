import { toAreaSearch } from "./areaSearchTerms";

// `area["name:en"="Hiroshima"]` is not one place. Overpass unions every area
// whose name matches, and in OSM that is five objects: the city, an island in
// the Seto Inland Sea, two unnamed-level relations, and a quarter in Tokushima
// 200 km away. Asking for cafes in Hiroshima returned cafes in Tokushima.
//
// Nominatim knows which relation a name means, so resolve the name once and
// filter by that relation's id instead. Overpass area ids are the relation id
// plus this offset.
//
// Asked with just a name, Nominatim answers poorly for Japanese places:
// "Hiroshima City" finds a recycling point, "Hiroshima, Hiroshima" finds the
// railway station. Two searches are tried before the plain one. A structured
// city/state search when the inner layer gave outer areas, and a featureType
// search when the name carries its own level ("... City", "... Prefecture").

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
 * name is never what "cafes in X" meant.
 *
 * With no level asked for, take the most important: Nominatim does not sort by
 * importance, and for "Hiroshima" the prefecture (0.682) comes back after the
 * city (0.670). But when the caller did ask for a level, Nominatim's own order
 * answers that question and importance would overrule it — a settlement search
 * for "Hiroshima" leads with 広島市 and still lists 広島県 behind it.
 */
export const pickAreaRelation = (
  results: NominatimResult[],
  { respectOrder = false }: { respectOrder?: boolean } = {}
): NominatimResult | null => {
  const administrative = (results ?? []).filter(
    (result) =>
      result.osm_type === "relation" &&
      result.category === "boundary" &&
      result.type === "administrative" &&
      typeof result.osm_id === "number"
  );
  if (administrative.length === 0) return null;
  if (respectOrder) return administrative[0];

  return administrative.reduce((best, candidate) =>
    (candidate.importance ?? 0) > (best.importance ?? 0) ? candidate : best
  );
};

export const toOverpassAreaId = (relationId: number): number =>
  OVERPASS_AREA_ID_OFFSET + relationId;

const nominatimBaseUrl = () =>
  process.env.NEXT_PUBLIC_NOMINATIM_BASE_URL ||
  "https://nominatim.openstreetmap.org";

const search = async (
  params: Record<string, string>
): Promise<NominatimResult | null> => {
  const query = new URLSearchParams({
    format: "jsonv2",
    polygon_geojson: "0",
    ...params,
  });
  const response = await fetch(`${nominatimBaseUrl()}/search?${query}`);
  if (!response.ok) return null;
  // A structured or featureType search already expresses which level is
  // wanted, so keep Nominatim's order for those.
  const respectOrder = "featureType" in params || "city" in params;
  return pickAreaRelation(await response.json(), { respectOrder });
};

/**
 * The searches to try, in order. The first administrative relation wins, so
 * the most contextful attempt goes first.
 */
export const buildAreaSearches = (
  name: string,
  outer: string[] = []
): Array<Record<string, string>> => {
  const { term, featureType } = toAreaSearch(name);
  const attempts: Array<Record<string, string>> = [];

  // Structured, using the areas the inner layer put around this one.
  if (outer.length > 0) {
    const [state, ...rest] = outer;
    attempts.push({
      city: term,
      state,
      ...(rest.length > 0 ? { country: rest[rest.length - 1] } : {}),
    });
  }

  // The level the name declared for itself.
  if (featureType) attempts.push({ q: term, featureType });

  // What we did before.
  attempts.push({ q: term });
  return attempts;
};

// One process-lifetime cache. Place names repeat across a session and the
// answer does not move.
const resolved = new Map<string, number | null>();

/**
 * Resolve a place name to an Overpass area id, or null when nothing fits.
 * `outer` is the containing areas from the same inner line, largest last.
 */
export const resolveAreaId = async (
  name: string,
  outer: string[] = []
): Promise<number | null> => {
  const key = [name.trim(), ...outer].join("|");
  if (!name.trim()) return null;
  if (resolved.has(key)) return resolved.get(key) ?? null;

  let areaId: number | null = null;
  try {
    for (const params of buildAreaSearches(name, outer)) {
      const picked = await search(params);
      if (picked?.osm_id) {
        areaId = toOverpassAreaId(picked.osm_id);
        break;
      }
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
