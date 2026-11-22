const activeRequests = new Map();

/**
 * Coalesces concurrent calls sharing the same key into a single in-flight Promise.
 * Once settled, the entry is cleared so subsequent refreshes fetch fresh data.
 */
export function dedupeInFlight(key, factory) {
  if (activeRequests.has(key)) {
    return activeRequests.get(key);
  }
  const promise = Promise.resolve()
    .then(factory)
    .finally(() => {
      activeRequests.delete(key);
    });
  activeRequests.set(key, promise);
  return promise;
}
