/**
 * Simple in-memory TTL cache.
 * Resets on process restart — suitable for caching BigQuery query results
 * within a single batch run to avoid redundant API calls.
 */

const store = new Map();

/**
 * @param {string} key
 * @param {number} ttlMs  Time-to-live in milliseconds (default 1 hour)
 * @returns {any|null}
 */
export function getCached(key, ttlMs = 3_600_000) {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > ttlMs) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

/**
 * @param {string} key
 * @param {any} value
 */
export function setCached(key, value) {
  store.set(key, { value, timestamp: Date.now() });
}

/** Remove a specific cache entry. */
export function invalidate(key) {
  store.delete(key);
}

/** Clear the entire cache. */
export function clearAll() {
  store.clear();
}
