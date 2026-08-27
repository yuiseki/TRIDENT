import { matchStyleForLine } from "./matchStyleForLine";

const RED = { emoji: "🍣", color: "red" };
const BLUE = { emoji: "☕", color: "blue" };

describe("matchStyleForLine", () => {
  it("finds the style whose concern the line names", () => {
    expect(
      matchStyleForLine("AreaWithConcern: Taito, Tokyo, Sushi shops", {
        "Sushi shops": RED,
      })
    ).toEqual(RED);
  });

  it("ignores case, because the model varies it between its own two lines", () => {
    // Measured on 5874 assembled pairs: 728 of 1391 unmatched styles differ
    // only in case — "Police Stations" against "Police stations".
    expect(
      matchStyleForLine("AreaWithConcern: Taito, Tokyo, Police Stations", {
        "Police stations": RED,
      })
    ).toEqual(RED);
  });

  it("still matches a singular key against a plural line", () => {
    expect(
      matchStyleForLine("AreaWithConcern: Taito, Tokyo, Airports", {
        Airport: RED,
      })
    ).toEqual(RED);
  });

  it("returns nothing when no concern is named", () => {
    expect(
      matchStyleForLine("AreaWithConcern: Taito, Tokyo, Bakeries", {
        "Sushi shops": RED,
      })
    ).toBeUndefined();
  });

  it("prefers the longest matching concern when several match", () => {
    // "Museums" and "Art museums" both appear in a line naming art museums;
    // the longer one is the more specific reading.
    expect(
      matchStyleForLine("AreaWithConcern: Ueno, Tokyo, Art museums", {
        Museums: RED,
        "Art museums": BLUE,
      })
    ).toEqual(BLUE);
  });

  it("handles an empty style set", () => {
    expect(matchStyleForLine("AreaWithConcern: Taito, Tokyo, Cafes", {})).toBeUndefined();
  });

  it("ignores an empty concern key rather than matching everything", () => {
    expect(
      matchStyleForLine("AreaWithConcern: Taito, Tokyo, Cafes", { "": RED })
    ).toBeUndefined();
  });
});
