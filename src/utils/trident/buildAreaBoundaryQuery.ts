// An inner-layer "Area:" line means "frame the map on this place", with no
// point of interest attached. The few-shot deep prompt covers it with examples
// like `Area: Japan` -> an administrative boundary relation, but the fine-tuned
// model never saw one: every training pair is an AreaWithConcern. Handed a bare
// area it invents a concern, and answers `Area: Taito, Tokyo` with buddhist and
// christian places of worship.
//
// The query is a template, so build it here instead of asking a model. Areas
// arrive smallest-first ("Taito, Tokyo"), the same order AreaWithConcern uses.

// The separator is required so a bare "Area:" does not capture its own colon.
const AREA_LINE = /^\s*Area(?::|\s)\s*(.+?)\s*$/;

// Matching on name:en alone avoids having to know the admin_level, which
// differs between a country, a prefecture and a ward.
const escape = (value: string) => value.replace(/["\\]/g, "\\$&");

export const buildAreaBoundaryQuery = (line: string): string | null => {
  const matched = line.match(AREA_LINE);
  if (!matched) return null;
  // "AreaWithConcern: ..." must not reach here; it is the model's job.
  if (/^\s*AreaWithConcern/.test(line)) return null;

  const parts = matched[1]
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length === 0) return null;

  const [inner, ...outer] = parts;
  const lines = ["[out:json][timeout:30];"];

  // Each containing area narrows the search, largest last in the input.
  outer.forEach((name, index) => {
    lines.push(`area["name:en"="${escape(name)}"]->.outer${index};`);
  });

  const filters = outer.map((_, index) => `(area.outer${index})`).join("");
  lines.push(
    `relation["boundary"="administrative"]["name:en"="${escape(inner)}"]${filters};`
  );
  lines.push("out geom;");
  return lines.join("\n");
};

/** The innermost place named by an area line, or null when it is not one. */
export const areaLineTarget = (line: string): string | null => {
  const matched = line.match(AREA_LINE);
  if (!matched || /^\s*AreaWithConcern/.test(line)) return null;
  const first = matched[1].split(",")[0]?.trim();
  return first || null;
};

/**
 * The same boundary, addressed by relation id rather than by name.
 * Preferred whenever the geocoder can place the name, since a name matches
 * more than one boundary.
 */
export const buildGroundedAreaBoundaryQuery = (relationId: number): string =>
  ["[out:json][timeout:30];", `relation(${relationId});`, "out geom;"].join("\n");
