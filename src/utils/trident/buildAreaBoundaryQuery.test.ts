import {
  areaLineTarget,
  buildAreaBoundaryQuery,
  buildGroundedAreaBoundaryQuery,
} from "./buildAreaBoundaryQuery";

describe("buildAreaBoundaryQuery", () => {
  it("builds a country boundary from a single name", () => {
    expect(buildAreaBoundaryQuery("Area: Japan")).toBe(
      [
        "[out:json][timeout:30];",
        'relation["boundary"="administrative"]["name:en"="Japan"];',
        "out geom;",
      ].join("\n")
    );
  });

  it("narrows by each containing area, smallest first", () => {
    expect(buildAreaBoundaryQuery("Area: Taito, Tokyo")).toBe(
      [
        "[out:json][timeout:30];",
        'area["name:en"="Tokyo"]->.outer0;',
        'relation["boundary"="administrative"]["name:en"="Taito"](area.outer0);',
        "out geom;",
      ].join("\n")
    );
  });

  it("handles three levels", () => {
    const query = buildAreaBoundaryQuery("Area: Taito, Tokyo, Japan");
    expect(query).toContain('area["name:en"="Tokyo"]->.outer0;');
    expect(query).toContain('area["name:en"="Japan"]->.outer1;');
    expect(query).toContain("(area.outer0)(area.outer1);");
  });

  it("tolerates a missing colon, as small inner models emit", () => {
    expect(buildAreaBoundaryQuery("Area Taito, Tokyo")).toBe(
      buildAreaBoundaryQuery("Area: Taito, Tokyo")
    );
  });

  it("leaves AreaWithConcern to the model", () => {
    // That line has a concern, which is exactly what deep is for.
    expect(buildAreaBoundaryQuery("AreaWithConcern: Taito, Tokyo, Cafes")).toBeNull();
  });

  it("ignores anything that is not an area line", () => {
    expect(buildAreaBoundaryQuery("TitleOfMap: Taito")).toBeNull();
    expect(buildAreaBoundaryQuery("Area:")).toBeNull();
    expect(buildAreaBoundaryQuery("")).toBeNull();
  });

  it("escapes quotes so a name cannot break out of the filter", () => {
    const query = buildAreaBoundaryQuery('Area: He said "hi"');
    expect(query).toContain('\\"hi\\"');
  });
});

describe("areaLineTarget", () => {
  it("returns the innermost place", () => {
    expect(areaLineTarget("Area: Taito, Tokyo")).toBe("Taito");
    expect(areaLineTarget("Area Taito, Tokyo")).toBe("Taito");
    expect(areaLineTarget("Area: Japan")).toBe("Japan");
  });

  it("declines anything that is not a bare area line", () => {
    expect(areaLineTarget("AreaWithConcern: Taito, Tokyo, Cafes")).toBeNull();
    expect(areaLineTarget("TitleOfMap: Taito")).toBeNull();
    expect(areaLineTarget("Area:")).toBeNull();
  });
});

describe("buildGroundedAreaBoundaryQuery", () => {
  it("addresses the boundary by relation id", () => {
    expect(buildGroundedAreaBoundaryQuery(1758888)).toBe(
      ["[out:json][timeout:30];", "relation(1758888);", "out geom;"].join("\n")
    );
  });
});
