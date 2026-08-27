type Style = { emoji?: string; color?: string };

/**
 * The style belonging to the concern an Area line names.
 *
 * The inner layer writes the concern twice — once in AreaWithConcern and
 * once in EmojiForConcern — and does not always write it the same way. The
 * two lines are produced independently, so "Police Stations" comes back
 * alongside "Police stations", and an exact match drops the style silently:
 * the map renders, unstyled, and nothing reports a failure.
 *
 * Case is therefore ignored. Measured over 5874 assembled pairs, that
 * recovers 728 of the 1391 styles an exact match loses. The remainder name a
 * different thing entirely ("Sushi shops" against "Sushi restaurants") and no
 * matching rule can recover those.
 *
 * The longest match wins, so a line naming art museums takes the style for
 * "Art museums" rather than the one for "Museums".
 */
export const matchStyleForLine = (
  line: string,
  styles: { [concern: string]: Style }
): Style | undefined => {
  const haystack = (line ?? "").toLowerCase();
  let best: { concern: string; style: Style } | undefined;

  for (const [concern, style] of Object.entries(styles ?? {})) {
    if (!concern) continue;
    if (!haystack.includes(concern.toLowerCase())) continue;
    if (!best || concern.length > best.concern.length) {
      best = { concern, style };
    }
  }
  return best?.style;
};
