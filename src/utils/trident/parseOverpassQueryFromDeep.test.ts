import { parseOverpassQueryFromDeep } from "./parseOverpassQueryFromDeep";

const FENCED = [
  "```",
  "[out:json][timeout:30];",
  'nwr["amenity"="cafe"];',
  "out geom;",
  "```",
].join("\n");

const BARE = [
  "[out:json][timeout:30];",
  'nwr["amenity"="cafe"];',
  "out geom;",
].join("\n");

describe("parseOverpassQueryFromDeep", () => {
  it("unwraps a fenced query, as the few-shot prompt asks for", () => {
    expect(parseOverpassQueryFromDeep(FENCED)).toBe(BARE);
  });

  it("accepts a bare query, as the fine-tuned model returns", () => {
    // The fine-tuning data has no code fence, so the finetuned prompt style
    // produces none. Splitting on ``` would yield undefined here.
    expect(parseOverpassQueryFromDeep(BARE)).toBe(BARE);
  });

  it("handles a language tag on the fence", () => {
    expect(parseOverpassQueryFromDeep("```overpassql\n" + BARE + "\n```")).toBe(
      BARE
    );
  });

  it("tolerates an unclosed fence", () => {
    expect(parseOverpassQueryFromDeep("```\n" + BARE)).toBe(BARE);
  });

  it("strips prose that precedes a fenced query", () => {
    expect(parseOverpassQueryFromDeep("Here you go:\n```\n" + BARE + "\n```")).toBe(
      BARE
    );
  });

  it("drops prose that precedes an unfenced query", () => {
    // The fine-tuned model returns no fence, so a one-line preamble leaves the
    // prose glued to the query and Overpass fails to parse it.
    expect(
      parseOverpassQueryFromDeep("Sure! Here is the query:\n" + BARE)
    ).toBe(BARE);
  });

  it("keeps comment lines that sit inside a fence", () => {
    // The model sometimes explains a tag choice above the settings block.
    // Overpass accepts those comments, so do not cut them off.
    const commented = "// Hotel is not an amenity.\n" + BARE;
    expect(parseOverpassQueryFromDeep("```\n" + commented + "\n```")).toBe(
      commented
    );
  });

  it("returns null when there is no query at all", () => {
    expect(parseOverpassQueryFromDeep("No valid query for this input.")).toBeNull();
    expect(parseOverpassQueryFromDeep("")).toBeNull();
  });
});
