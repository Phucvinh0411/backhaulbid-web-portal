import { JOURNEY_EVENT_LABELS } from "../../lib/statusMeta.js";

export function coordinate(value) {
  const latitude = Array.isArray(value) ? value[0] : value?.latitude;
  const longitude = Array.isArray(value) ? value[1] : value?.longitude;
  if (latitude == null || longitude == null || latitude === "" || longitude === "") return null;
  const lat = Number(latitude), lng = Number(longitude);
  return Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180 ? [lat, lng] : null;
}

/**
 * Picks one anchor pair and its planned geometry from a single snapshot. A pair is never assembled
 * from two sources or two route versions: an invalid tracking object cannot hide valid trip points of
 * the same version, and a stale tracking snapshot cannot override a newer trip route.
 */
export function selectRouteAnchors({ trip, tracking } = {}) {
  const tripVersion = Number(trip?.routeVersion ?? 0);
  const trackingVersion = tracking ? Number(tracking.routeVersion ?? 0) : null;
  const pair = (source, name) => {
    const pickup = coordinate(source?.pickupPoint) ? source.pickupPoint : null;
    const delivery = coordinate(source?.deliveryPoint) ? source.deliveryPoint : null;
    return { pickup, delivery, source: name, count: (pickup ? 1 : 0) + (delivery ? 1 : 0) };
  };
  const fromTrip = pair(trip, "trip");
  const fromTracking = pair(tracking, "tracking");
  let chosen;
  let version;
  if (tracking && trackingVersion > tripVersion) {
    chosen = fromTracking;
    version = trackingVersion;
  } else if (tracking && trackingVersion === tripVersion) {
    chosen = fromTracking.count >= fromTrip.count ? fromTracking : fromTrip;
    version = tripVersion;
  } else {
    chosen = fromTrip;
    version = tripVersion;
  }
  // Geometry is computed by the server from the tracking anchors, so it only belongs to that pair.
  const geometry = chosen.source === "tracking" && chosen.count === 2 ? tracking?.routeGeometry || null : null;
  const routingStatus = chosen.source === "tracking" ? tracking?.routingStatus || null : null;
  return {
    pickup: chosen.pickup,
    delivery: chosen.delivery,
    routeVersion: version,
    geometry,
    routingStatus,
    missing: [!chosen.pickup && "pickup", !chosen.delivery && "delivery"].filter(Boolean),
  };
}

/**
 * What the map draws between the warehouses: the validated road route, or nothing. A straight A-B
 * line is never drawn, because it reads as a route and can cross the sea or a border.
 */
export function plannedRoute(pickupPoint, deliveryPoint, geometry) {
  const pickup = coordinate(pickupPoint), delivery = coordinate(deliveryPoint);
  const road = roadGeometryPoints(geometry);
  if (pickup && delivery && road.length > 1) return { kind: "ROAD", points: road };
  if (pickup && delivery) return { kind: "PENDING", points: [] };
  return { kind: "NONE", points: [], missing: [!pickup && "pickup", !delivery && "delivery"].filter(Boolean) };
}

/** Bounds for "fit": the anchors and the planned route; GPS only when no anchor exists. */
export function routeBounds({ pickup, delivery, road = [], fallback = [] }) {
  const anchors = [coordinate(pickup), coordinate(delivery)].filter(Boolean);
  if (anchors.length) return [...anchors, ...road];
  return fallback.filter(Boolean);
}

/** Short reason shown when the road route is not drawn. */
export function routeStatusText(kind, routingStatus) {
  if (kind === "ROAD") return "";
  // Missing pins are explained on the map itself.
  if (kind === "NONE") return "";
  return ({
    PENDING: "Đang lấy tuyến đường bộ. Bản đồ chỉ hiện hai điểm A và B.",
    UNAVAILABLE: "Dịch vụ tuyến đường tạm không phản hồi. Bản đồ chỉ hiện hai điểm A và B.",
    NO_ROUTE: "Không tìm được tuyến đường bộ giữa hai kho.",
    REJECTED: "Tuyến nhận về không hợp lệ nên không vẽ. Bản đồ chỉ hiện hai điểm A và B.",
    NOT_CONFIGURED: "Chưa cấu hình dịch vụ tuyến đường. Bản đồ chỉ hiện hai điểm A và B.",
  })[routingStatus] || "Chưa có tuyến đường bộ. Bản đồ chỉ hiện hai điểm A và B.";
}

export const locationTime = (point) => point?.capturedAt || point?.recordedAt;
/** @typedef {"GPS" | "CHECK_IN" | "MANUAL"} TripLocationSource */
export function latestTrackingLocation(tracking, history = []) {
  // Explicit null removes a revoked driver's old marker; history is only a compatibility fallback.
  return tracking && Object.hasOwn(tracking, "latestLocation") ? tracking.latestLocation : history[history.length - 1] || null;
}
export const locationSourceLabel = (source) => ({ GPS: "GPS của tài xế", CHECK_IN: "GPS khi check-in", MANUAL: "Vị trí cập nhật thủ công" })[source] || "Vị trí đã ghi";
export function mergeSamplingMetadata(previous, history, observedCount = 0) {
  return { historySampled: Boolean(previous.historySampled || history.sampled), historyTotalPoints: Math.max(Number(previous.historyTotalPoints) || 0, Number(history.totalPoints) || 0, observedCount) };
}
export function roadGeometryPoints(geometry) {
  if (geometry?.type !== "LineString" || !Array.isArray(geometry.coordinates) || geometry.coordinates.length > 10000) return [];
  const points = geometry.coordinates.map((point) => Array.isArray(point) ? coordinate([point[1], point[0]]) : null);
  return points.length > 1 && points.every(Boolean) ? points : [];
}
function orderedLocationHistory(previous, incoming) {
  return [...new Map([...previous, ...incoming].map((point) => [point.id, point])).values()]
    .sort((a, b) => new Date(locationTime(a)) - new Date(locationTime(b)));
}

function sampleLocationHistory(points, limit) {
  if (!Number.isInteger(limit) || limit < 2) throw new RangeError("History limit must preserve both route endpoints.");
  if (points.length <= limit) return points;
  const times = points.map((point) => new Date(locationTime(point)).getTime());
  const span = times.at(-1) - times[0];
  if (!(span > 0) || !times.every(Number.isFinite)) return Array.from({ length: limit }, (_, index) => points[Math.round(index * (points.length - 1) / (limit - 1))]);
  const selected = [points[0]];
  let previousIndex = 0;
  for (let index = 1; index < limit - 1; index++) {
    const target = times[0] + index * span / (limit - 1);
    const min = previousIndex + 1, max = points.length - (limit - index);
    let low = min, high = max;
    while (low < high) {
      const middle = Math.floor((low + high) / 2);
      if (times[middle] < target) low = middle + 1;
      else high = middle;
    }
    const nearest = low > min && Math.abs(times[low - 1] - target) <= Math.abs(times[low] - target) ? low - 1 : low;
    selected.push(points[nearest]);
    previousIndex = nearest;
  }
  selected.push(points.at(-1));
  return selected;
}

export function mergeLocationHistory(previous, incoming, limit = 3000) {
  return sampleLocationHistory(orderedLocationHistory(previous, incoming), limit);
}

/** A long open session keeps the route start and latest point within a fixed memory budget. */
export function mergeTrackingHistory(previous, history, limit = 3000) {
  const points = orderedLocationHistory(previous.locations || [], history.points || []);
  return { locations: sampleLocationHistory(points, limit), ...mergeSamplingMetadata(previous, { ...history, sampled: Boolean(history.sampled || points.length > limit) }, points.length) };
}

function distanceMeters(a, b) {
  const rad = Math.PI / 180, dLat = (b[0] - a[0]) * rad, dLng = (b[1] - a[1]) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * rad) * Math.cos(b[0] * rad) * Math.sin(dLng / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/** Connect only observed GPS samples; a gap or implausible jump is never a driven route. */
export function buildGpsSegments(locations) {
  const result = [];
  let segment = [], previous = null;
  const flush = () => { if (segment.length > 1) result.push(segment); segment = []; previous = null; };
  for (const point of locations) {
    const position = coordinate(point), time = new Date(locationTime(point)).getTime();
    if (!position || point.source !== "GPS" || !Number.isFinite(time) || Number(point.accuracyMeters || 0) > 100) { flush(); continue; }
    if (previous) {
      const elapsed = time - previous.time;
      if (elapsed <= 0 || elapsed > 5 * 60 * 1000 || distanceMeters(previous.position, position) / (elapsed / 1000) > 55.56) flush();
    }
    segment.push(position);
    previous = { position, time };
  }
  flush();
  return result;
}

export function buildJourneyTimeline(events = [], milestones = []) {
  const entries = events.map((event) => ({ ...event, key: `event-${event.id}`, title: JOURNEY_EVENT_LABELS[event.eventType] || "Cập nhật hành trình", time: event.recordedAt, incident: event.eventType === "INCIDENT_REPORTED" }));
  for (const milestone of milestones) {
    if (milestone.status !== "REACHED" || !milestone.reachedAt) continue;
    entries.push({ key: `milestone-${milestone.id}`, title: `Check-in · ${milestone.milestoneName}`, time: milestone.reachedAt, note: milestone.note });
  }
  return entries.sort((a, b) => new Date(b.time) - new Date(a.time));
}

const FRESHNESS = {
  NONE: { label: "Chưa có vị trí xe", tone: "neutral", message: "Vị trí xuất hiện khi tài xế bật chia sẻ hoặc check-in." },
  FRESH: { label: "Vị trí vừa cập nhật", tone: "success", message: "Thời gian bên dưới là lúc ghi nhận vị trí xe." },
  STALE: { label: "Vị trí chưa cập nhật", tone: "warning", message: "Đang hiển thị vị trí gần nhất; xe có thể đã di chuyển." },
  LOST: { label: "Gián đoạn vị trí", tone: "warning", message: "Chưa nhận thêm GPS. Vệt đã ghi vẫn được giữ." },
  STOPPED: { label: "Đã dừng chia sẻ", tone: "neutral", message: "Đây là vị trí cuối cùng của chuyến." },
};
export const getFreshnessMeta = (freshness) => FRESHNESS[freshness] || FRESHNESS.NONE;
