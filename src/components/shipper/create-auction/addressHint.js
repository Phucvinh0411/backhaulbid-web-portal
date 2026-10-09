// Pure helpers for the map hint. A hint only shows where the map should look; it is never stored as a pin.
export const HINT_MIN_QUERY_LENGTH = 6;

const VIETNAM = { minLat: 8, maxLat: 24, minLng: 102, maxLng: 110 };

/** Search text from the parts the shipper typed or picked. Empty parts are dropped. */
export function buildHintQuery({ detail, ward, province }) {
  return [detail, ward, province].map((part) => (part || "").trim()).filter(Boolean).join(", ");
}

export function isHintQueryReady(query) {
  return query.length >= HINT_MIN_QUERY_LENGTH;
}

/** A search needs the street part and a province. A ward or a province alone would only point at a whole area. */
export function isHintReady({ detail, province, query }) {
  return Boolean(detail?.trim()) && Boolean(province?.trim()) && isHintQueryReady(query);
}

/** First search result as a point inside Vietnam, or null when there is no usable result. */
export function parseHintResult(data) {
  const first = Array.isArray(data) ? data[0] : null;
  const latitude = Number(first?.lat);
  const longitude = Number(first?.lon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  const inside = latitude >= VIETNAM.minLat && latitude <= VIETNAM.maxLat && longitude >= VIETNAM.minLng && longitude <= VIETNAM.maxLng;
  return inside ? { latitude, longitude } : null;
}
