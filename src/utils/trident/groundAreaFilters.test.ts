import { groundAreaFilters } from "./groundAreaFilters";

const resolver = (table: Record<string, number>) => async (name: string) =>
  table[name] ?? null;

const HIROSHIMA = [
  "[out:json][timeout:30];",
  'area["name:en"="Hiroshima"]->.searchArea;',
  "(",
  '  nwr["amenity"="cafe"](area.searchArea);',
  ");",
  "out geom;",
].join("\n");

describe("groundAreaFilters", () => {
  it("replaces a resolved name with its area id", async () => {
    const result = await groundAreaFilters(
      HIROSHIMA,
      resolver({ Hiroshima: 3603218753 })
    );
    expect(result.query).toContain("area(3603218753)->.searchArea;");
    expect(result.query).not.toContain('"name:en"="Hiroshima"');
    expect(result.grounded).toEqual(["Hiroshima"]);
  });

  it("grounds both levels of a two-area query", async () => {
    const query = [
      'area["name:en"="Tokyo"]->.outer;',
      'area["name:en"="Taito"]->.inner;',
      '  nwr["amenity"="cafe"](area.inner)(area.outer);',
    ].join("\n");
    const result = await groundAreaFilters(
      query,
      resolver({ Tokyo: 3601543125, Taito: 3601758888 })
    );
    expect(result.query).toContain("area(3601543125)->.outer;");
    expect(result.query).toContain("area(3601758888)->.inner;");
    // The set filters name the labels, not the areas, so they stay put.
    expect(result.query).toContain("(area.inner)(area.outer)");
  });

  it("leaves a name the geocoder cannot place", async () => {
    const result = await groundAreaFilters(HIROSHIMA, resolver({}));
    expect(result.query).toBe(HIROSHIMA);
    expect(result.unresolved).toEqual(["Hiroshima"]);
    expect(result.grounded).toEqual([]);
  });

  it("grounds what it can and keeps the rest", async () => {
    const query = [
      'area["name:en"="Tokyo"]->.outer;',
      'area["name:en"="Nowhereville"]->.inner;',
    ].join("\n");
    const result = await groundAreaFilters(
      query,
      resolver({ Tokyo: 3601543125 })
    );
    expect(result.query).toContain("area(3601543125)->.outer;");
    expect(result.query).toContain('area["name:en"="Nowhereville"]->.inner;');
    expect(result.grounded).toEqual(["Tokyo"]);
    expect(result.unresolved).toEqual(["Nowhereville"]);
  });

  it("also grounds a plain name filter, which the retry path writes", async () => {
    const result = await groundAreaFilters(
      'area["name"="広島県"]->.searchArea;',
      resolver({ 広島県: 3603218753 })
    );
    expect(result.query).toBe("area(3603218753)->.searchArea;");
  });

  it("asks the geocoder once per distinct name", async () => {
    const seen: string[] = [];
    const query = [
      'area["name:en"="Tokyo"]->.a;',
      'area["name:en"="Tokyo"]->.b;',
    ].join("\n");
    await groundAreaFilters(query, async (name) => {
      seen.push(name);
      return 3601543125;
    });
    expect(seen).toEqual(["Tokyo"]);
  });

  it("leaves a query that already uses ids", async () => {
    const query = "area(3601543125)->.searchArea;";
    const result = await groundAreaFilters(query, resolver({}));
    expect(result.query).toBe(query);
    expect(result.unresolved).toEqual([]);
  });

  it("passes an empty query through", async () => {
    expect((await groundAreaFilters("", resolver({}))).query).toBe("");
  });
});
