import {
  MAX_CACHE_ENTRY_BYTES,
  OVERPASS_CACHE_PREFIX,
  TOO_LARGE_MARKER,
  evictOldestOverpassEntries,
  writeOverpassCache,
} from "./overpassCache";

class FakeStorage implements Storage {
  private map = new Map<string, string>();
  constructor(private quotaBytes = Infinity) {}

  get length() {
    return this.map.size;
  }
  key(index: number) {
    return Array.from(this.map.keys())[index] ?? null;
  }
  getItem(key: string) {
    return this.map.get(key) ?? null;
  }
  removeItem(key: string) {
    this.map.delete(key);
  }
  clear() {
    this.map.clear();
  }
  setItem(key: string, value: string) {
    const used = Array.from(this.map.entries())
      .filter(([k]) => k !== key)
      .reduce((sum, [k, v]) => sum + k.length + v.length, 0);
    if (used + key.length + value.length > this.quotaBytes) {
      const error = new Error("quota exceeded");
      error.name = "QuotaExceededError";
      throw error;
    }
    this.map.set(key, value);
  }
}

const entry = (unixtime: number, padding = 10) =>
  JSON.stringify({ resJson: { elements: [] }, unixtime, pad: "x".repeat(padding) });

describe("writeOverpassCache", () => {
  it("stores an entry that fits", () => {
    const storage = new FakeStorage();
    expect(writeOverpassCache(storage, "k", entry(1))).toBe("stored");
    expect(storage.getItem("k")).toBe(entry(1));
  });

  it("does not attempt an entry that cannot possibly fit", () => {
    // A prefecture-wide query returns tens of MB. localStorage holds a few,
    // so the write is hopeless: mark it and move on rather than throw.
    const storage = new FakeStorage();
    const huge = "x".repeat(MAX_CACHE_ENTRY_BYTES + 1);
    expect(writeOverpassCache(storage, "k", huge)).toBe("too-large");
    expect(storage.getItem("k")).toBe(TOO_LARGE_MARKER);
  });

  it("evicts older overpass entries and retries when the quota is hit", () => {
    const storage = new FakeStorage(400);
    storage.setItem(`${OVERPASS_CACHE_PREFIX}old`, entry(100, 60));
    storage.setItem(`${OVERPASS_CACHE_PREFIX}newer`, entry(200, 60));
    const fresh = entry(300, 150);

    expect(writeOverpassCache(storage, `${OVERPASS_CACHE_PREFIX}fresh`, fresh)).toBe(
      "stored"
    );
    expect(storage.getItem(`${OVERPASS_CACHE_PREFIX}fresh`)).toBe(fresh);
    expect(storage.getItem(`${OVERPASS_CACHE_PREFIX}old`)).toBeNull();
  });

  it("never evicts keys belonging to anything else", () => {
    const storage = new FakeStorage(300);
    storage.setItem("trident-selected-map-style-json-url", "x".repeat(200));
    const fresh = entry(300, 150);

    writeOverpassCache(storage, `${OVERPASS_CACHE_PREFIX}fresh`, fresh);
    expect(storage.getItem("trident-selected-map-style-json-url")).not.toBeNull();
  });

  it("gives up quietly when even the marker will not fit", () => {
    const storage = new FakeStorage(0);
    expect(() =>
      writeOverpassCache(storage, `${OVERPASS_CACHE_PREFIX}k`, entry(1))
    ).not.toThrow();
    expect(writeOverpassCache(storage, `${OVERPASS_CACHE_PREFIX}k`, entry(1))).toBe(
      "failed"
    );
  });
});

describe("evictOldestOverpassEntries", () => {
  it("removes the oldest first", () => {
    const storage = new FakeStorage();
    storage.setItem(`${OVERPASS_CACHE_PREFIX}a`, entry(300));
    storage.setItem(`${OVERPASS_CACHE_PREFIX}b`, entry(100));
    storage.setItem(`${OVERPASS_CACHE_PREFIX}c`, entry(200));

    expect(evictOldestOverpassEntries(storage, 1)).toBe(1);
    expect(storage.getItem(`${OVERPASS_CACHE_PREFIX}b`)).toBeNull();
    expect(storage.getItem(`${OVERPASS_CACHE_PREFIX}a`)).not.toBeNull();
  });

  it("treats an unparseable entry as the oldest, so junk clears first", () => {
    const storage = new FakeStorage();
    storage.setItem(`${OVERPASS_CACHE_PREFIX}junk`, "not json");
    storage.setItem(`${OVERPASS_CACHE_PREFIX}good`, entry(100));

    evictOldestOverpassEntries(storage, 1);
    expect(storage.getItem(`${OVERPASS_CACHE_PREFIX}junk`)).toBeNull();
    expect(storage.getItem(`${OVERPASS_CACHE_PREFIX}good`)).not.toBeNull();
  });

  it("reports how many it could actually remove", () => {
    const storage = new FakeStorage();
    storage.setItem(`${OVERPASS_CACHE_PREFIX}a`, entry(100));
    expect(evictOldestOverpassEntries(storage, 5)).toBe(1);
  });
});
