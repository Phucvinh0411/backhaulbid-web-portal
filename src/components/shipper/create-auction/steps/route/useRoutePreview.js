import { useEffect, useRef, useState } from "react";
import { coordinate } from "@/components/tracking/trackingPresentation";
import { getRoadRoute } from "@/services/roadRoutingService";

/**
 * Hook to compute road route and distance (km) between fromPlace and toPlace.
 */
export function useRoutePreview(fromPlace, toPlace) {
  const fromCoord = coordinate(fromPlace?.point);
  const toCoord = coordinate(toPlace?.point);

  const [state, setState] = useState({
    routeData: null,
    loading: false,
    error: null,
  });

  const abortControllerRef = useRef(null);

  useEffect(() => {
    if (!fromCoord || !toCoord) {
      setState({ routeData: null, loading: false, error: null });
      return undefined;
    }

    const from = { lat: fromCoord[0], lng: fromCoord[1] };
    const to = { lat: toCoord[0], lng: toCoord[1] };

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setState((prev) => ({ ...prev, loading: true, error: null }));

    getRoadRoute(from, to, { signal: controller.signal })
      .then((data) => {
        if (!controller.signal.aborted) {
          setState({ routeData: data, loading: false, error: null });
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted && err.name !== "AbortError") {
          setState({ routeData: null, loading: false, error: "Không thể tính toán lộ trình" });
        }
      });

    return () => {
      controller.abort();
    };
  }, [fromCoord?.[0], fromCoord?.[1], toCoord?.[0], toCoord?.[1]]);

  return {
    ...state,
    hasBothPoints: Boolean(fromCoord && toCoord),
    fromCoord,
    toCoord,
  };
}
