import { parseInnerResJson } from "./parseInnerResJson";

const inner = (lines: string[]) => ({ inner: lines.join("\n") });

describe("parseInnerResJson", () => {
  it("parses well-formed output", () => {
    const r = parseInnerResJson(
      inner([
        "ConfirmHelpful: Mapping has been completed.",
        "TitleOfMap: Cafes in Taito, Tokyo",
        "Area: Taito, Tokyo",
        "AreaWithConcern: Taito, Tokyo, Cafes",
        "EmojiForConcern: Cafes, ☕️",
        "ColorForConcern: Cafes, brown",
      ])
    );
    expect(r.mapTitle).toBe("Cafes in Taito, Tokyo");
    expect(r.confirmMessage).toBe("Mapping has been completed.");
    expect(r.styles).toEqual({ Cafes: { emoji: "☕️", color: "brown" } });
    expect(r.linesWithAreaAndOrConcern).toEqual([
      "Area: Taito, Tokyo",
      "AreaWithConcern: Taito, Tokyo, Cafes",
    ]);
  });

  it("recovers styles when the model omits the colon", () => {
    // Small models drop it. Losing one character should not lose the styling.
    const r = parseInnerResJson(
      inner([
        "TitleOfMap: Shinjuku, Tokyo hotels",
        "AreaWithConcern Shinjuku, Tokyo, Hotels",
        "EmojiForConcern Hotels, 🏨",
        "ColorForConcern Hotels, lightblue",
      ])
    );
    expect(r.styles).toEqual({
      Hotels: { emoji: "🏨", color: "lightblue" },
    });
    // The deep layer is prompt-sensitive and its training data always had the
    // colon, so hand it the normalised form rather than what the model wrote.
    expect(r.linesWithAreaAndOrConcern).toEqual([
      "AreaWithConcern: Shinjuku, Tokyo, Hotels",
    ]);
  });

  it("trims the surrounding whitespace off keys and values", () => {
    const r = parseInnerResJson(
      inner(["EmojiForConcern:  Cafes ,  ☕️ ", "TitleOfMap:  Cafes "])
    );
    expect(Object.keys(r.styles)).toEqual(["Cafes"]);
    expect(r.styles.Cafes.emoji).toBe("☕️");
    expect(r.mapTitle).toBe("Cafes");
  });

  it("keeps a colon that appears inside the value", () => {
    const r = parseInnerResJson(inner(["TitleOfMap: Tokyo: the east capital"]));
    expect(r.mapTitle).toBe("Tokyo: the east capital");
  });

  it("falls back to a default confirm message", () => {
    const r = parseInnerResJson(inner(["TitleOfMap: Cafes"]));
    expect(r.confirmMessage.length).toBeGreaterThan(0);
  });

  it("survives a colour line with no emoji line and vice versa", () => {
    const r = parseInnerResJson(
      inner(["ColorForConcern: Parks, green", "EmojiForConcern: Zoos, 🦁"])
    );
    expect(r.styles).toEqual({
      Parks: { color: "green" },
      Zoos: { emoji: "🦁" },
    });
  });

  it("ignores malformed style lines instead of throwing", () => {
    expect(() =>
      parseInnerResJson(inner(["EmojiForConcern:", "ColorForConcern"]))
    ).not.toThrow();
  });

  it("normalises the spacing of area lines it passes on", () => {
    const r = parseInnerResJson(
      inner(["  AreaWithConcern :   Taito, Tokyo, Cafes  ", "Area  Taito, Tokyo"])
    );
    expect(r.linesWithAreaAndOrConcern).toEqual([
      "AreaWithConcern: Taito, Tokyo, Cafes",
      "Area: Taito, Tokyo",
    ]);
  });

  it("returns empty results for empty input", () => {
    const r = parseInnerResJson(inner([]));
    expect(r.styles).toEqual({});
    expect(r.mapTitle).toBeUndefined();
    expect(r.linesWithAreaAndOrConcern).toEqual([]);
  });
});
