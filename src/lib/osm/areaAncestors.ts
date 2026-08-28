// Whether one administrative area actually contains another.
//
// The inner layer writes an area as a chain, smallest first, and the deep
// layer turns that into an intersection: cafes in the inner area and in the
// outer one. When the outer is wrong the intersection is empty, and an empty
// map is worse than a coarse one.
//
// A fine-tuned inner layer writes a wrong outer often, because it learned to
// produce three or four levels and has to fill them for places it does not
// know: "Matsuyama City, Tokyo, Japan". Both names resolve — the geocoder
// finds 松山市 and 東京都 — and the query returns nothing.
//
// Names cannot settle this. Nominatim answers in the local language, so the
// model's "Tokyo" would have to be compared against "愛媛県", and a correct
// parent would look as foreign as an invented one. Nominatim's /details
// endpoint gives the containing relations by id, which needs no matching at
// all.

const nominatimBaseUrl = () =>
  process.env.NEXT_PUBLIC_NOMINATIM_BASE_URL ||
  "https://nominatim.openstreetmap.org";

/** The relation ids of a place and every administrative area above it. */
export const parseAncestorRelationIds = (details: unknown): Set<number> => {
  const ids = new Set<number>();
  const address = (details as { address?: unknown } | null)?.address;
  if (!Array.isArray(address)) return ids;

  for (const entry of address) {
    const row = entry as { osm_id?: unknown; osm_type?: unknown };
    if (row?.osm_type !== "R") continue;
    if (typeof row.osm_id !== "number") continue;
    ids.add(row.osm_id);
  }
  return ids;
};

/**
 * Does `outerRelationId` contain the place these ancestors describe?
 *
 * An empty set means the chain could not be read, and then the answer is yes:
 * a geocoder that is down must not start deleting filters the model wrote.
 */
export const isContainedBy = (
  ancestors: Set<number>,
  outerRelationId: number
): boolean => ancestors.size === 0 || ancestors.has(outerRelationId);

// One process-lifetime cache, like the resolver's. A place's parents do not
// move during a session.
const ancestorCache = new Map<number, Set<number>>();

/** The containing relations of one relation, empty when they cannot be read. */
export const fetchAreaAncestors = async (
  relationId: number
): Promise<Set<number>> => {
  const cached = ancestorCache.get(relationId);
  if (cached) return cached;

  let ancestors = new Set<number>();
  try {
    const query = new URLSearchParams({
      osmtype: "R",
      osmid: String(relationId),
      addressdetails: "1",
      format: "json",
    });
    const response = await fetch(`${nominatimBaseUrl()}/details?${query}`);
    if (response.ok) ancestors = parseAncestorRelationIds(await response.json());
  } catch (error) {
    console.log("fetchAreaAncestors failed for", relationId, error);
  }

  ancestorCache.set(relationId, ancestors);
  return ancestors;
};

export const __clearAncestorCache = () => ancestorCache.clear();
