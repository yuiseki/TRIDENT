// Turning what the inner layer wrote into something Nominatim can place.
//
// Two things go wrong with a bare free-text search.
//
// The English suffix. OSM writes 広島市 as name:en "Hiroshima", so a search for
// "Hiroshima City" finds a recycling point and no boundary, and the query runs
// against nothing. Nominatim's featureType picks the right level once the
// suffix is removed: settlement for a municipality, state for a prefecture.
//
// The missing context. "Hiroshima, Hiroshima" as free text returns the railway
// station. The same pair as a structured city/state search returns 広島市.

export type AreaFeatureType = "settlement" | "state" | "country";

export type AreaSearch = {
  term: string;
  featureType?: AreaFeatureType;
};

const SUFFIXES: Array<{ pattern: RegExp; featureType: AreaFeatureType }> = [
  { pattern: /\s+City$/i, featureType: "settlement" },
  { pattern: /-shi$/i, featureType: "settlement" },
  { pattern: /\s+Ward$/i, featureType: "settlement" },
  { pattern: /-ku$/i, featureType: "settlement" },
  { pattern: /\s+Prefecture$/i, featureType: "state" },
  { pattern: /-ken$/i, featureType: "state" },
];

/** Strip a level-naming suffix and remember which level it named. */
export const toAreaSearch = (name: string): AreaSearch => {
  const trimmed = name.trim();
  for (const { pattern, featureType } of SUFFIXES) {
    const stripped = trimmed.replace(pattern, "").trim();
    // Only when something is left: "City" alone is not a suffix on a name.
    if (stripped && stripped !== trimmed) return { term: stripped, featureType };
  }
  return { term: trimmed };
};

const AREA_LINE = /^\s*(AreaWithConcern|Area)(?::|\s)\s*(.+?)\s*$/;

/**
 * The areas an inner line names, smallest first.
 *
 * An AreaWithConcern line ends with the concern, so it is dropped: the areas
 * are everything before it. Used to give each name the outer areas around it,
 * which is what makes a structured search possible.
 */
export const areaChainFromLine = (line: string): string[] => {
  const matched = (line ?? "").match(AREA_LINE);
  if (!matched) return [];

  const parts = matched[2]
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (matched[1] === "AreaWithConcern") {
    // Everything but the concern. One token is a concern with no area.
    return parts.slice(0, -1);
  }
  return parts;
};
