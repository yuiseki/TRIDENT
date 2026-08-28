import {
  isContainedBy,
  parseAncestorRelationIds,
} from "./areaAncestors";

// Nominatim /details for 松山市 (relation 4050217).
const MATSUYAMA = {
  localname: "松山市",
  address: [
    { osm_id: 4050217, osm_type: "R", localname: "松山市", admin_level: 7 },
    { osm_id: 3795063, osm_type: "R", localname: "愛媛県", admin_level: 4 },
    { osm_id: null, osm_type: null, localname: "jp" },
    { osm_id: null, osm_type: null, localname: "日本" },
  ],
};

describe("parseAncestorRelationIds", () => {
  it("collects the relation ids of the place and everything above it", () => {
    expect(parseAncestorRelationIds(MATSUYAMA)).toEqual(
      new Set([4050217, 3795063])
    );
  });

  it("skips entries with no relation id", () => {
    // "jp" and "日本" carry no osm_id and must not become NaN members.
    expect(parseAncestorRelationIds(MATSUYAMA).has(NaN)).toBe(false);
  });

  it("ignores anything that is not a relation", () => {
    const withNode = {
      address: [{ osm_id: 99, osm_type: "N", localname: "a point" }],
    };
    expect(parseAncestorRelationIds(withNode).size).toBe(0);
  });

  it("returns an empty set for a response with no address", () => {
    expect(parseAncestorRelationIds({}).size).toBe(0);
  });

  it("returns an empty set rather than throwing on rubbish", () => {
    expect(parseAncestorRelationIds(null).size).toBe(0);
    expect(parseAncestorRelationIds("nope").size).toBe(0);
  });
});

describe("isContainedBy", () => {
  const ancestors = parseAncestorRelationIds(MATSUYAMA);

  it("accepts a real parent", () => {
    expect(isContainedBy(ancestors, 3795063)).toBe(true); // 愛媛県
  });

  it("rejects an invented parent", () => {
    // The fine-tuned inner layer writes "Matsuyama City, Tokyo, Japan".
    expect(isContainedBy(ancestors, 1543125)).toBe(false); // 東京都
  });

  it("accepts the place as its own container", () => {
    expect(isContainedBy(ancestors, 4050217)).toBe(true);
  });

  it("keeps the parent when the chain could not be read", () => {
    // An unreachable geocoder must not start deleting correct filters.
    expect(isContainedBy(new Set<number>(), 3795063)).toBe(true);
  });
});
