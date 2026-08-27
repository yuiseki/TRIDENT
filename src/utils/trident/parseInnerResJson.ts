// Parses the inner layer's structured reply.
//
// Small models get the content right but drop the colon after the key, so the
// separator is optional here. Anything that cannot be read is skipped rather
// than thrown: a missing emoji should cost the map its colour, not the whole
// render. The previous implementation did the parsing inside an async callback
// passed to Array.map, which turned a TypeError on a colon-less line into an
// unhandled rejection and silently produced empty styles.

const KEYS = [
  "ConfirmHelpful",
  "TitleOfMap",
  "AreaWithConcern",
  "Area",
  "EmojiForConcern",
  "ColorForConcern",
] as const;

const DEFAULT_CONFIRM_MESSAGE =
  "Mapping has been completed. Have we been helpful to you? Do you have any other requests?";

// Longest key first so "AreaWithConcern" is not matched as "Area".
const LINE = new RegExp(`^\\s*(${KEYS.join("|")})\\s*:?\\s*(.*)$`);

type Style = { emoji?: string; color?: string };

const readLine = (line: string): { key: string; value: string } | null => {
  const matched = line.match(LINE);
  if (!matched) return null;
  const value = matched[2].trim();
  if (!value) return null;
  return { key: matched[1], value };
};

// "Cafes, ☕️" -> ["Cafes", "☕️"]. The concern itself never contains a comma.
const splitConcernAndValue = (
  value: string
): { concern: string; rest: string } | null => {
  const comma = value.indexOf(",");
  if (comma === -1) return null;
  const concern = value.slice(0, comma).trim();
  const rest = value.slice(comma + 1).trim();
  if (!concern || !rest) return null;
  return { concern, rest };
};

export const parseInnerResJson = (innerResJson: {
  inner: string;
}): {
  styles: { [key: string]: Style };
  mapTitle?: string;
  confirmMessage: string;
  linesWithAreaAndOrConcern: string[];
} => {
  const styles: { [key: string]: Style } = {};
  const lines = innerResJson.inner.split("\n");

  let mapTitle: string | undefined;
  let confirmMessage: string | undefined;
  const linesWithAreaAndOrConcern: string[] = [];

  for (const line of lines) {
    const parsed = readLine(line);
    if (!parsed) continue;
    const { key, value } = parsed;

    if (key === "TitleOfMap") {
      mapTitle = mapTitle ?? value;
      continue;
    }
    if (key === "ConfirmHelpful") {
      confirmMessage = confirmMessage ?? value;
      continue;
    }
    if (key === "Area" || key === "AreaWithConcern") {
      // These lines are handed straight to the deep layer, whose fine-tuned
      // model is the most sensitive thing here to the shape of its input: its
      // training data always wrote "AreaWithConcern: ...". Passing on what the
      // inner model actually typed would forward the very colon it drops, so
      // normalise instead of preserving.
      linesWithAreaAndOrConcern.push(`${key}: ${value}`);
      continue;
    }

    const pair = splitConcernAndValue(value);
    if (!pair) continue;
    const style = styles[pair.concern] ?? (styles[pair.concern] = {});
    if (key === "EmojiForConcern") style.emoji = pair.rest;
    if (key === "ColorForConcern") style.color = pair.rest;
  }

  return {
    styles,
    mapTitle,
    confirmMessage: confirmMessage || DEFAULT_CONFIRM_MESSAGE,
    linesWithAreaAndOrConcern,
  };
};
