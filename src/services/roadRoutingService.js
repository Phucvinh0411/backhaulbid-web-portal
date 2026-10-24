import { fetchRoadPreview } from "./roadPreviewApi";
import { calculateDistanceKm } from "@/utils/geocoding";
import { formatDuration } from "@/components/shipper/create-auction/steps/route/routeFormat";

const PUBLIC_OSRM_URL = "https://router.project-osrm.org/route/v1/driving";

/**
 * Same QL1A via points as the backend's VietnamCorridor ([lng, lat], north to south). The public fallback has no
 * border check, so a long north-south trip is pinned to QL1A instead of the provider's shortcut through Laos.
 */
const QL1A = [
  [105.776, 19.807], // Thanh Hóa
  [105.672, 18.699], // Vinh
  [106.618, 17.468], // Đồng Hới
  [107.1, 16.818], // Đông Hà
  [108.18, 16.02], // Đà Nẵng (Hòa Cầm)
  [108.8, 15.12], // Quảng Ngãi
  [109.13, 13.81], // Quy Nhơn (Phú Tài)
  [109.1, 12.27], // Nha Trang (Diên Khánh)
  [108.08, 10.97], // Phan Thiết
];
const END_MARGIN_DEGREES = 0.3;

function corridorBetween(from, to) {
  const north = Math.max(from.lat, to.lat) - END_MARGIN_DEGREES;
  const south = Math.min(from.lat, to.lat) + END_MARGIN_DEGREES;
  const via = QL1A.filter(([, lat]) => lat < north && lat > south);
  return from.lat < to.lat ? via.reverse() : via;
}

export { formatDuration };

/** Backend answered but has no road for this pair (or rejected it, e.g. it leaves Vietnam). */
const NO_BACKEND_ROAD = Symbol("NO_BACKEND_ROAD");

/**
 * Tries fetching road preview from the backend service first. The backend may need two provider calls (direct, then
 * through QL1A when the direct road leaves Vietnam), about 5 s, so PENDING is polled for up to ~12 s.
 */
async function fetchFromBackend(from, to, signal, maxAttempts = 10) {
  let attempts = 0;
  while (attempts < maxAttempts) {
    if (signal?.aborted) {
      const error = new Error("Aborted");
      error.name = "AbortError";
      throw error;
    }
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
      await new Promise((res) => setTimeout(res, 1200));
    } else if (data?.status === "NO_ROUTE" || data?.status === "REJECTED") {
      return NO_BACKEND_ROAD;
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
  const points = [[from.lng, from.lat], ...corridorBetween(from, to), [to.lng, to.lat]];
  const url = `${PUBLIC_OSRM_URL}/${points.map(([lng, lat]) => `${lng},${lat}`).join(";")}?overview=full&geometries=geojson`;
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
 * Priority: Road route via backend OSRM -> Public OSRM driving (only when the backend has no answer) -> Straight line.
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
  let backendResult = null;
  try {
    backendResult = await fetchFromBackend(from, to, signal);
    if (backendResult && backendResult !== NO_BACKEND_ROAD) return backendResult;
  } catch (err) {
    if (err?.name === "AbortError") throw err;
    // Continue to public OSRM fallback
  }

  // 2. Try Public OSRM API, unless the backend already refused every road (it would show the unchecked one).
  if (backendResult !== NO_BACKEND_ROAD) {
    try {
      const osrmResult = await fetchFromPublicOsrm(from, to, signal);
      if (osrmResult) return osrmResult;
    } catch (err) {
      if (err?.name === "AbortError") throw err;
      // Continue to Haversine straight line fallback
    }
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
