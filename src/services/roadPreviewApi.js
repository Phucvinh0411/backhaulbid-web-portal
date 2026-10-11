import { apiService } from "./apiService";

/**
 * Road preview between two points for the empty-route map. The backend answers READY with a GeoJSON geometry,
 * PENDING while the road fetch runs (ask again), or another status when no road route exists.
 */
export const fetchRoadPreview = (from, to) =>
  apiService.get("/api/v1/trips/road-preview", {
    fromLat: from.lat,
    fromLng: from.lng,
    toLat: to.lat,
    toLng: to.lng,
  });
