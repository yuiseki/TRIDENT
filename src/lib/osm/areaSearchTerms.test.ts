import { areaChainFromLine, toAreaSearch } from "./areaSearchTerms";

describe("toAreaSearch", () => {
  it("turns an English City suffix into a settlement search", () => {
    // OSM writes 広島市 as name:en "Hiroshima", so "Hiroshima City" matches
    // no boundary at all and the query came back empty.
    expect(toAreaSearch("Hiroshima City")).toEqual({
      term: "Hiroshima",
      featureType: "settlement",
    });
  });

  it("turns a Prefecture suffix into a state search", () => {
    expect(toAreaSearch("Miyagi Prefecture")).toEqual({
      term: "Miyagi",
      featureType: "state",
    });
  });

  it("handles the Japanese suffixes the inner layer sometimes keeps", () => {
    expect(toAreaSearch("Hiroshima-shi").featureType).toBe("settlement");
    expect(toAreaSearch("Miyagi-ken").featureType).toBe("state");
  });

  it("leaves a plain name alone", () => {
    expect(toAreaSearch("Taito")).toEqual({ term: "Taito" });
    expect(toAreaSearch("Japan")).toEqual({ term: "Japan" });
  });

  it("does not strip a suffix that is part of the name", () => {
    // "Cityscape" must not become "Citysca".
    expect(toAreaSearch("Kansas City Kansas").term).toBe("Kansas City Kansas");
  });

  it("trims surrounding whitespace", () => {
    expect(toAreaSearch("  Taito  ").term).toBe("Taito");
  });
});

describe("areaChainFromLine", () => {
  it("reads every area from an AreaWithConcern line, dropping the concern", () => {
    expect(areaChainFromLine("AreaWithConcern: Taito, Tokyo, Cafes")).toEqual([
      "Taito",
      "Tokyo",
    ]);
  });

  it("reads every area from a bare Area line", () => {
    expect(areaChainFromLine("Area: Taito, Tokyo")).toEqual(["Taito", "Tokyo"]);
  });

  it("keeps a single area", () => {
    expect(areaChainFromLine("Area: Japan")).toEqual(["Japan"]);
  });

  it("returns nothing for a one-token AreaWithConcern, which is only a concern", () => {
    expect(areaChainFromLine("AreaWithConcern: Cafes")).toEqual([]);
  });

  it("tolerates a missing colon", () => {
    expect(areaChainFromLine("AreaWithConcern Taito, Tokyo, Cafes")).toEqual([
      "Taito",
      "Tokyo",
    ]);
  });

  it("ignores lines that are not area lines", () => {
    expect(areaChainFromLine("TitleOfMap: Cafes in Taito")).toEqual([]);
    expect(areaChainFromLine("")).toEqual([]);
  });
});
