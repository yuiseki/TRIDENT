// localStorage holds a few megabytes in total. A prefecture-wide Overpass
// answer is tens of megabytes on its own, so writing one is guaranteed to
// throw QuotaExceededError, and once the store is full every later write
// fails too, which quietly disables caching for the rest of the session.
//
// Two guards. Skip a write that cannot possibly fit, and when the quota is
// hit anyway, drop the oldest cached answers and try once more.

export const OVERPASS_CACHE_PREFIX = "trident-overpass-cache-";
export const TOO_LARGE_MARKER = "too large to cache";

// Well under a typical 5 MB budget, so one answer cannot crowd out the rest.
export const MAX_CACHE_ENTRY_BYTES = 1_000_000;

export type CacheWriteResult = "stored" | "too-large" | "failed";

const isQuotaError = (error: unknown): boolean =>
  error instanceof Error &&
  (error.name === "QuotaExceededError" ||
    error.name === "NS_ERROR_DOM_QUOTA_REACHED");

const overpassKeys = (storage: Storage): string[] => {
  const keys: string[] = [];
  for (let index = 0; index < storage.length; index += 1) {
    const key = storage.key(index);
    if (key?.startsWith(OVERPASS_CACHE_PREFIX)) keys.push(key);
  }
  return keys;
};

const storedAt = (storage: Storage, key: string): number => {
  try {
    const parsed = JSON.parse(storage.getItem(key) ?? "");
    return typeof parsed?.unixtime === "number" ? parsed.unixtime : -Infinity;
  } catch {
    // The marker string and any corrupted entry land here. Both are the first
    // things worth losing.
    return -Infinity;
  }
};

/** Remove up to `count` of our own cached answers, oldest first. Returns how many went. */
export const evictOldestOverpassEntries = (
  storage: Storage,
  count: number
): number => {
  const ordered = overpassKeys(storage)
    .map((key) => ({ key, unixtime: storedAt(storage, key) }))
    .sort((a, b) => a.unixtime - b.unixtime)
    .slice(0, count);

  ordered.forEach(({ key }) => storage.removeItem(key));
  return ordered.length;
};

/**
 * Write one cached answer, degrading rather than throwing.
 *
 * Only entries under this module's own prefix are ever evicted, so a full
 * cache never costs the user their map style or any other preference.
 */
export const writeOverpassCache = (
  storage: Storage,
  key: string,
  serialized: string
): CacheWriteResult => {
  const markTooLarge = (): CacheWriteResult => {
    try {
      storage.setItem(key, TOO_LARGE_MARKER);
      return "too-large";
    } catch {
      return "failed";
    }
  };

  if (serialized.length > MAX_CACHE_ENTRY_BYTES) return markTooLarge();

  try {
    storage.setItem(key, serialized);
    return "stored";
  } catch (error) {
    if (!isQuotaError(error)) return "failed";
  }

  // Full. Make room from our own entries and try once more.
  let evicted = evictOldestOverpassEntries(storage, 5);
  while (evicted > 0) {
    try {
      storage.setItem(key, serialized);
      return "stored";
    } catch (error) {
      if (!isQuotaError(error)) return "failed";
    }
    evicted = evictOldestOverpassEntries(storage, 5);
  }

  return markTooLarge();
};
