import {
  buildAreaSearches,
  pickAreaRelation,
  toOverpassAreaId,
} from "./resolveAreaRelationId";

// Trimmed from what nominatim.yuiseki.net actually returns for "Hiroshima".
const HIROSHIMA = [
  {
    osm_type: "relation",
    osm_id: 4097196,
    category: "boundary",
    type: "administrative",
    importance: 0.67,
    display_name: "広島市, 広島県, 日本",
  },
  {
    osm_type: "way",
    osm_id: 131168662,
    category: "place",
    type: "island",
    importance: 0.376,
    display_name: "広島, 丸亀市, 香川県",
  },
  {
    osm_type: "relation",
    osm_id: 3218753,
    category: "boundary",
    type: "administrative",
    importance: 0.682,
    display_name: "広島県, 日本",
  },
];

describe("pickAreaRelation", () => {
  it("prefers importance over position, since Nominatim does not sort", () => {
    // The prefecture (0.682) is returned third, behind the city (0.670).
    expect(pickAreaRelation(HIROSHIMA)?.osm_id).toBe(3218753);
  });

  it("never picks a non-administrative match", () => {
    const islandOnly = HIROSHIMA.filter((r) => r.category === "place");
    expect(pickAreaRelation(islandOnly)).toBeNull();
  });

  it("ignores ways and nodes even when administrative", () => {
    expect(
      pickAreaRelation([
        { osm_type: "way", osm_id: 1, category: "boundary", type: "administrative", importance: 9 },
      ])
    ).toBeNull();
  });

  it("returns null for an empty or missing answer", () => {
    expect(pickAreaRelation([])).toBeNull();
    expect(pickAreaRelation(undefined as never)).toBeNull();
  });

  it("copes with a result carrying no importance", () => {
    const picked = pickAreaRelation([
      { osm_type: "relation", osm_id: 7, category: "boundary", type: "administrative" },
    ]);
    expect(picked?.osm_id).toBe(7);
  });
});

describe("toOverpassAreaId", () => {
  it("offsets the relation id", () => {
    expect(toOverpassAreaId(3218753)).toBe(3603218753);
  });
});

describe("buildAreaSearches", () => {
  it("tries the structured search first when outer areas are known", () => {
    const attempts = buildAreaSearches("Taito", ["Tokyo"]);
    expect(attempts[0]).toEqual({ city: "Taito", state: "Tokyo" });
  });

  it("carries the outermost area as the country", () => {
    expect(buildAreaSearches("Taito", ["Tokyo", "Japan"])[0]).toEqual({
      city: "Taito",
      state: "Tokyo",
      country: "Japan",
    });
  });

  it("uses the level a suffix declares", () => {
    // Free text for "Hiroshima City" finds a recycling point, not a boundary.
    expect(buildAreaSearches("Hiroshima City")).toEqual([
      { q: "Hiroshima", featureType: "settlement" },
      { q: "Hiroshima" },
    ]);
  });

  it("falls back to the plain search last", () => {
    const attempts = buildAreaSearches("Taito", ["Tokyo"]);
    expect(attempts[attempts.length - 1]).toEqual({ q: "Taito" });
  });

  it("has only the plain search for a bare name", () => {
    expect(buildAreaSearches("Japan")).toEqual([{ q: "Japan" }]);
  });
});

describe("pickAreaRelation with respectOrder", () => {
  it("keeps Nominatim's order when a level was asked for", () => {
    // featureType=settlement leads with 広島市 but still lists 広島県, whose
    // importance is higher. Taking the maximum would undo the hint.
    expect(pickAreaRelation(HIROSHIMA, { respectOrder: true })?.osm_id).toBe(
      4097196
    );
  });

  it("still skips non-administrative results", () => {
    const withIslandFirst = [
      HIROSHIMA[1],
      HIROSHIMA[0],
    ];
    expect(
      pickAreaRelation(withIslandFirst, { respectOrder: true })?.osm_id
    ).toBe(4097196);
  });
});
