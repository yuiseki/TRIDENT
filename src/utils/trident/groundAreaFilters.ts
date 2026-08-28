import { toAreaSearch } from "@/lib/osm/areaSearchTerms";

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

export type AreaResolver = (
  name: string,
  outer: string[]
) => Promise<number | null>;

/**
 * Ground every area filter it can. A name that does not resolve keeps its
 * original filter: a partly grounded query still beats no query.
 */
export const groundAreaFilters = async (
  query: string,
  resolve: AreaResolver,
  // The areas the inner layer named, smallest first. A name found here is
  // resolved with the areas around it, which is what lets the geocoder tell
  // 広島市 from the railway station of the same name.
  chain: string[] = []
): Promise<{
  query: string;
  grounded: string[];
  unresolved: string[];
  // The area ids the chain resolved to, smallest first. The caller needs
  // these to check that each outer area really contains the inner one.
  chainAreaIds: number[];
}> => {
  const grounded: string[] = [];
  const unresolved: string[] = [];
  const chainAreaIds: number[] = [];
  if (!query) return { query, grounded, unresolved, chainAreaIds };

  const names = Array.from(query.matchAll(AREA_FILTER)).map(
    (match) => match[2]
  );
  const unique = Array.from(new Set(names));
  if (unique.length === 0) return { query, grounded, unresolved, chainAreaIds };

  // The model often writes a shorter name than the inner layer gave it:
  // "Hiroshima City" comes back as area["name:en"="Hiroshima"]. Match on the
  // stripped form too, and resolve using the chain entry, which still carries
  // the level the suffix declared.
  const chainIndexOf = (name: string): number => {
    const exact = chain.indexOf(name);
    if (exact !== -1) return exact;
    return chain.findIndex((entry) => toAreaSearch(entry).term === name);
  };

  const ids = new Map<string, number | null>();
  await Promise.all(
    unique.map(async (name) => {
      const index = chainIndexOf(name);
      const searchName = index === -1 ? name : chain[index];
      const outer = index === -1 ? [] : chain.slice(index + 1);
      ids.set(name, await resolve(searchName, outer));
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

  for (const entry of chain) {
    const areaId =
      ids.get(entry) ?? ids.get(toAreaSearch(entry).term) ?? null;
    if (typeof areaId === "number") chainAreaIds.push(areaId);
  }

  return { query: rewritten, grounded, unresolved, chainAreaIds };
};
