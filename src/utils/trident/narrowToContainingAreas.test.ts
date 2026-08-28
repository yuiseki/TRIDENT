import { narrowToContainingAreas } from "./narrowToContainingAreas";

const QUERY = `[out:json][timeout:30];
area(3601543125)->.outer;
area(3604050217)->.inner;
(
  nwr["amenity"="cafe"](area.inner)(area.outer);
);
out geom;`;

// 松山市 sits under 愛媛県 (3795063) and nothing else.
const ancestorsOf = async (relationId: number) =>
  relationId === 4050217 ? new Set([4050217, 3795063]) : new Set<number>();

describe("narrowToContainingAreas", () => {
  it("repoints an outer area that does not contain the inner one", async () => {
    // 東京都 does not contain 松山市, so the intersection is empty. Pointing
    // the outer at the inner leaves the query intersecting 松山市 with itself.
    const { query, narrowed } = await narrowToContainingAreas(
      QUERY,
      [4050217, 1543125],
      ancestorsOf
    );
    expect(query).not.toContain("3601543125");
    expect(query.match(/area\(3604050217\)/g)).toHaveLength(2);
    expect(narrowed).toEqual([1543125]);
  });

  it("leaves a real parent alone", async () => {
    const withEhime = QUERY.replace("3601543125", "3603795063");
    const { query, narrowed } = await narrowToContainingAreas(
      withEhime,
      [4050217, 3795063],
      ancestorsOf
    );
    expect(query).toBe(withEhime);
    expect(narrowed).toEqual([]);
  });

  it("leaves a query with a single area alone", async () => {
    const single = `[out:json];area(3604050217)->.a;(nwr["amenity"="cafe"](area.a););out geom;`;
    const { query } = await narrowToContainingAreas(single, [4050217], ancestorsOf);
    expect(query).toBe(single);
  });

  it("keeps everything when the containing relations cannot be read", async () => {
    const blind = async () => new Set<number>();
    const { query, narrowed } = await narrowToContainingAreas(
      QUERY,
      [4050217, 1543125],
      blind
    );
    expect(query).toBe(QUERY);
    expect(narrowed).toEqual([]);
  });

  it("does nothing to a query with no area ids", async () => {
    const named = `area["name:en"="Hiroshima"]->.a;`;
    const { query } = await narrowToContainingAreas(named, [], ancestorsOf);
    expect(query).toBe(named);
  });

  it("handles an empty query", async () => {
    const { query } = await narrowToContainingAreas("", [], ancestorsOf);
    expect(query).toBe("");
  });

  it("narrows several wrong outers at once", async () => {
    const three = QUERY.replace(
      "area(3601543125)->.outer;",
      "area(3601543125)->.outer;\narea(3600123456)->.outermost;"
    );
    const { narrowed } = await narrowToContainingAreas(
      three,
      [4050217, 1543125, 123456],
      ancestorsOf
    );
    expect(narrowed.sort()).toEqual([123456, 1543125]);
  });
});
