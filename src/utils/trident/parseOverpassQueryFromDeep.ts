// The deep layer returns an Overpass QL query, but how it is wrapped depends on
// which prompt style produced it. The few-shot prompt mandates a code fence; the
// fine-tuned model was trained without one and returns the query bare. Splitting
// on "```" only works for the former, so accept both shapes here.

const FENCE = /```[^\n]*\n([\s\S]*?)(?:\n```|$)/;

export const parseOverpassQueryFromDeep = (
  deepText: string | undefined | null
): string | null => {
  if (!deepText) return null;

  const fenced = deepText.match(FENCE);
  const query = (fenced ? fenced[1] : deepText).trim();
  if (!query) return null;

  // A query always opens with the settings block. Anything else is the model
  // declining or chatting, and there is nothing to send to Overpass.
  if (!query.includes("[out:")) return null;

  return query;
};
