import { fetchRoadPreview } from "./roadPreviewApi";
import { calculateDistanceKm } from "@/utils/geocoding";
import { formatDuration } from "@/components/shipper/create-auction/steps/route/routeFormat";

const PUBLIC_OSRM_URL = "https://router.project-osrm.org/route/v1/driving";

export { formatDuration };

/**
 * Tries fetching road preview from the backend service first.
 */
async function fetchFromBackend(from, to, maxAttempts = 3) {
  let attempts = 0;
  while (attempts < maxAttempts) {
    const data = await fetchRoadPreview(from, to);
    if (data?.status === "READY" && Array.isArray(data?.geometry?.coordinates) && data.geometry.coordinates.length > 0) {
      // GeoJSON has [lng, lat], Leaflet expects [lat, lng]
      const coordinates = data.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
      const distanceMeters = Number(data.distanceMeters) || 0;
      const distanceKm = Number((distanceMeters / 1000).toFixed(1));
      return {
        coordinates,
        distanceMeters,
        distanceKm,
        durationText: formatDuration((distanceMeters / 1000 / 50) * 3600), // ~50km/h truck avg speed
        isRoad: true,
        source: "BACKEND",
      };
    }
    if (data?.status === "PENDING") {
      attempts += 1;
      await new Promise((res) => setTimeout(res, 800));
    } else {
      break;
    }
  }
  return null;
}

/**
 * Fallback to public OSRM router.
 */
async function fetchFromPublicOsrm(from, to, signal) {
  const url = `${PUBLIC_OSRM_URL}/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
  const res = await fetch(url, { signal, headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`OSRM request failed with status ${res.status}`);
  const json = await res.json();
  const route = json?.routes?.[0];
  if (route && Array.isArray(route.geometry?.coordinates) && route.geometry.coordinates.length > 0) {
    const coordinates = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
    const distanceMeters = Number(route.distance) || 0;
    const distanceKm = Number((distanceMeters / 1000).toFixed(1));
    const durationSeconds = Number(route.duration) || 0;
    return {
      coordinates,
      distanceMeters,
      distanceKm,
      durationText: formatDuration(durationSeconds),
      isRoad: true,
      source: "OSRM_PUBLIC",
    };
  }
  return null;
}

/**
 * Calculates road route between from and to coordinates.
 * Priority: Road route via backend OSRM -> Public OSRM driving -> Straight line fallback.
 * 
 * @param {{ lat: number, lng: number }} from
 * @param {{ lat: number, lng: number }} to
 * @param {{ signal?: AbortSignal }} options
 */
export async function getRoadRoute(from, to, { signal } = {}) {
  if (!from || !to || !Number.isFinite(from.lat) || !Number.isFinite(from.lng) ||
      !Number.isFinite(to.lat) || !Number.isFinite(to.lng)) {
    return null;
  }

  // 1. Try Backend Road Preview
  try {
    const backendResult = await fetchFromBackend(from, to);
    if (backendResult) return backendResult;
  } catch {
    // Continue to public OSRM fallback
  }

  // 2. Try Public OSRM API
  try {
    const osrmResult = await fetchFromPublicOsrm(from, to, signal);
    if (osrmResult) return osrmResult;
  } catch {
    // Continue to Haversine straight line fallback
  }

  // 3. Straight line Haversine fallback
  const distanceKm = calculateDistanceKm(from.lat, from.lng, to.lat, to.lng);
  return {
    coordinates: [
      [from.lat, from.lng],
      [to.lat, to.lng],
    ],
    distanceMeters: distanceKm * 1000,
    distanceKm: Number(distanceKm.toFixed(1)),
    durationText: formatDuration((distanceKm / 50) * 3600),
    isRoad: false,
    source: "HAVERSINE_STRAIGHT",
  };
}
