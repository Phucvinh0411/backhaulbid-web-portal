import { useEffect, useState } from "react";
import { isAbortError, searchPlaces } from "./nominatimClient";

export const MIN_QUERY_LENGTH = 3;
// One request per typing pause, which also keeps us within Nominatim's fair-use limit.
const DEBOUNCE_MS = 450;
const IDLE = { query: "", places: [], status: "idle" };
const cache = new Map();

/**
 * Address suggestions for the typed text. status is idle, loading, ready, empty or error.
 * Text shorter than MIN_QUERY_LENGTH never hits the network.
 */
export function usePlaceSearch(text) {
  const query = text.trim();
  const ready = query.length >= MIN_QUERY_LENGTH;
  const [state, setState] = useState(IDLE);

  useEffect(() => {
    if (!ready) return undefined;
    if (cache.has(query)) {
      const places = cache.get(query);
      setState({ query, places, status: places.length ? "ready" : "empty" });
      return undefined;
    }

    const controller = new AbortController();
    setState((old) => ({ ...old, query, status: "loading" }));
    const timer = setTimeout(async () => {
      try {
        const places = await searchPlaces(query, { signal: controller.signal });
        cache.set(query, places);
        setState({ query, places, status: places.length ? "ready" : "empty" });
      } catch (error) {
        if (!isAbortError(error)) setState({ query, places: [], status: "error" });
      }
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query, ready]);

  return ready ? state : IDLE;
}
