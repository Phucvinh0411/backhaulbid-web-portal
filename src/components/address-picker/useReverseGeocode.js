import { useCallback, useEffect, useRef } from "react";
import { reversePlace } from "./nominatimClient";

/**
 * Returns resolve(point) → Promise<Place|null>. A newer call aborts the older one, and unmounting aborts the last,
 * so a slow answer never overwrites a newer pin. Aborted calls reject with an AbortError.
 */
export function useReverseGeocode() {
  const controllerRef = useRef(null);

  useEffect(() => () => controllerRef.current?.abort(), []);

  return useCallback((point) => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    return reversePlace(point, { signal: controller.signal });
  }, []);
}
