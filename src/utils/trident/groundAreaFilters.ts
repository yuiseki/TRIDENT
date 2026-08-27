// Replace name-matched area filters in a generated Overpass query with the
// relation id Nominatim says the name means.
//
//   area["name:en"="Hiroshima"]->.searchArea;
//   -> area(3603218753)->.searchArea;
//
// The deep model writes name filters because that is what its training data
// contains, and retraining it to emit ids would mean regenerating the dataset.
// Rewriting afterwards gets the grounding without touching the model, and
// leaves the query untouched when the geocoder cannot answer.

const AREA_FILTER = /area\[("name(?::en)?")="((?:[^"\\]|\\.)*)"\]/g;

export type AreaResolver = (name: string) => Promise<number | null>;

/**
 * Ground every area filter it can. A name that does not resolve keeps its
 * original filter: a partly grounded query still beats no query.
 */
export const groundAreaFilters = async (
  query: string,
  resolve: AreaResolver
): Promise<{ query: string; grounded: string[]; unresolved: string[] }> => {
  const grounded: string[] = [];
  const unresolved: string[] = [];
  if (!query) return { query, grounded, unresolved };

  const names = Array.from(query.matchAll(AREA_FILTER)).map(
    (match) => match[2]
  );
  const unique = Array.from(new Set(names));
  if (unique.length === 0) return { query, grounded, unresolved };

  const ids = new Map<string, number | null>();
  await Promise.all(
    unique.map(async (name) => {
      ids.set(name, await resolve(name));
    })
  );

  const rewritten = query.replace(AREA_FILTER, (whole, _key, name) => {
    const areaId = ids.get(name);
    if (typeof areaId !== "number") {
      unresolved.push(name);
      return whole;
    }
    grounded.push(name);
    return `area(${areaId})`;
  });

  return { query: rewritten, grounded, unresolved };
};
