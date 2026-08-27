import { resolveInnerExampleCount } from "./prompt";

describe("resolveInnerExampleCount", () => {
  it("defaults to five, which measured best on Qwen3-0.6B", () => {
    expect(resolveInnerExampleCount({})).toBe(5);
  });

  it("accepts zero, so the layer can be measured without examples", () => {
    expect(resolveInnerExampleCount({ TRIDENT_INNER_EXAMPLES: "0" })).toBe(0);
  });

  it("accepts another count", () => {
    expect(resolveInnerExampleCount({ TRIDENT_INNER_EXAMPLES: "2" })).toBe(2);
  });

  it("falls back to the default for anything unusable", () => {
    for (const value of ["", "abc", "-1", "3.5"]) {
      expect(resolveInnerExampleCount({ TRIDENT_INNER_EXAMPLES: value })).toBe(5);
    }
  });
});
