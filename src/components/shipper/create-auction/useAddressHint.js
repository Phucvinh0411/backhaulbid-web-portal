import { useEffect, useState } from "react";
import { buildHintQuery, isHintReady, parseHintResult } from "./addressHint";

const SEARCH_API = "https://nominatim.openstreetmap.org/search";
// Wait after the last keystroke, so one search runs per pause and not per letter.
const PAUSE_MS = 650;

/**
 * Where the typed address sits on the map. Returns { point, status }; status is idle, loading, found, notFound or error.
 * The caller shows the point as a hint only. Nothing is saved until the shipper places the pin.
 */
export function useAddressHint({ detail, ward, province }) {
  const query = buildHintQuery({ detail, ward, province });
  const ready = isHintReady({ detail, province, query });
  const [state, setState] = useState({ point: null, status: "idle" });

  useEffect(() => {
    if (!ready) {
      setState({ point: null, status: "idle" });
      return undefined;
    }
    let ignore = false;
    const timer = setTimeout(async () => {
      setState((old) => ({ ...old, status: "loading" }));
      try {
        const response = await fetch(`${SEARCH_API}?format=json&limit=1&countrycodes=vn&q=${encodeURIComponent(query)}`, {
          headers: { Accept: "application/json" },
        });
        if (!response.ok) throw new Error("address search failed");
        const point = parseHintResult(await response.json());
        if (!ignore) setState({ point, status: point ? "found" : "notFound" });
      } catch {
        if (!ignore) setState({ point: null, status: "error" });
      }
    }, PAUSE_MS);
    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [query, ready]);

  return state;
}
