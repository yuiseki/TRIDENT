// The deep layer returns an Overpass QL query, but how it is wrapped depends on
// which prompt style produced it. The few-shot prompt mandates a code fence; the
// fine-tuned model was trained without one and returns the query bare. Splitting
// on "```" only works for the former, so accept both shapes here.

const FENCE = /```[^\n]*\n([\s\S]*?)(?:\n```|$)/;

// A query always opens with the settings block, so that is where it starts.
const SETTINGS = "[out:";

export const parseOverpassQueryFromDeep = (
  deepText: string | undefined | null
): string | null => {
  if (!deepText) return null;

  const fenced = deepText.match(FENCE);
  if (fenced) {
    // Inside a fence, everything is meant to be the query. Comment lines above
    // the settings block are valid Overpass QL, so keep them.
    const query = fenced[1].trim();
    return query.includes(SETTINGS) ? query : null;
  }

  // Unfenced, the model may put a sentence in front of the query. Anything
  // before the settings block is prose, and sending it on gives Overpass a
  // parse error.
  const start = deepText.indexOf(SETTINGS);
  if (start === -1) return null;

  const query = deepText.slice(start).trim();
  return query || null;
};
