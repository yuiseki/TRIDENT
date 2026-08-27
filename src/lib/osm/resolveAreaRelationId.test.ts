import {
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
