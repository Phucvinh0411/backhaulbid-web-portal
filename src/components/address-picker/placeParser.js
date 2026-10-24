// Pure helpers that turn a geocoder result into the Place the app works with.
// A Place is { id, locationName, address, province, point }; point uses the USER_CONFIRMED shape the backend expects.
import { VIETNAM_PROVINCES } from "../../utils/provinces.js";
import { PRE_MERGER_PROVINCES } from "../../utils/provinceMapping.js";

const COUNTRY_NAMES = new Set(["việt nam", "vietnam", "viet nam"]);
const POSTCODE = /^\d{5,6}$/;
const PROVINCE_PREFIX = /^(tỉnh|thành phố|tp\.?)\s+/i;

/** Lowercase, accent-free, alphanumeric-only key, so "Hoà Bình" and "Hòa Bình" compare equal. */
export function normalizeKey(text) {
  return String(text ?? "")
    .trim()
    .replace(PROVINCE_PREFIX, "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]/g, "");
}

// Every known spelling (current names, pre-merger names, aliases) points at one of the 34 current units.
const PROVINCE_INDEX = (() => {
  const index = new Map();
  for (const province of VIETNAM_PROVINCES) index.set(normalizeKey(province.name), province.name);
  for (const row of PRE_MERGER_PROVINCES) {
    for (const name of [row.legacy, ...row.aliases]) {
      const key = normalizeKey(name);
      if (!index.has(key)) index.set(key, row.current);
    }
  }
  return index;
})();

/** Address segments without the country and postcode, in display order. */
export function addressSegments(displayName) {
  return String(displayName ?? "")
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part && !COUNTRY_NAMES.has(part.toLowerCase()) && !POSTCODE.test(part));
}

/**
 * One of the 34 current province names, or "" when none can be read from the result.
 * Structured fields are tried first, then the display segments from the most general one.
 */
export function resolveProvince(address, displayName) {
  const candidates = [
    address?.state,
    address?.province,
    address?.city,
    address?.region,
    ...addressSegments(displayName).reverse(),
  ];
  for (const candidate of candidates) {
    const match = candidate ? PROVINCE_INDEX.get(normalizeKey(candidate)) : undefined;
    if (match) return match;
  }
  return "";
}

/** A short, human name for the place: its own name, else the first address segment (house number kept with street). */
export function pickLocationName(name, segments) {
  if (name?.trim()) return name.trim();
  const [first = "", second = ""] = segments;
  return /^\d+[\w/-]*$/.test(first) && second ? `${first} ${second}` : first;
}

export function toConfirmedPoint(latitude, longitude, confirmedAt = new Date().toISOString()) {
  return { latitude, longitude, coordinateSource: "USER_CONFIRMED", coordinateConfirmedAt: confirmedAt };
}

/** Place from one Nominatim item (search or reverse), or null when it is unusable or outside Vietnam. */
export function parsePlace(item) {
  if (!item || item.error) return null;
  const countryCode = item.address?.country_code;
  if (countryCode && countryCode !== "vn") return null;

  const latitude = Number(item.lat);
  const longitude = Number(item.lon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;

  const segments = addressSegments(item.display_name);
  if (segments.length === 0) return null;

  return {
    id: String(item.place_id ?? `${latitude},${longitude}`),
    locationName: pickLocationName(item.name, segments),
    address: segments.join(", "),
    province: resolveProvince(item.address, item.display_name),
    point: toConfirmedPoint(latitude, longitude),
  };
}

/** The part of the address shown under the place name in a suggestion row. */
export function secondaryText(place) {
  if (!place?.address) return "";
  const prefix = `${place.locationName}, `;
  return place.address.startsWith(prefix) ? place.address.slice(prefix.length) : place.address;
}
