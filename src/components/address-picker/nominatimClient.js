// Thin client for OpenStreetMap Nominatim. Every call is abortable; results come back as Places.
import { parsePlace } from "./placeParser.js";

const BASE_URL = "https://nominatim.openstreetmap.org";
const COMMON_PARAMS = { format: "jsonv2", addressdetails: "1", "accept-language": "vi" };
const SEARCH_LIMIT = 6;

async function request(path, params, signal) {
  const query = new URLSearchParams({ ...COMMON_PARAMS, ...params });
  const response = await fetch(`${BASE_URL}/${path}?${query}`, { signal, headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Nominatim ${path} failed with status ${response.status}`);
  return response.json();
}

/** Places in Vietnam matching free text, best match first. */
export async function searchPlaces(text, { signal } = {}) {
  const data = await request("search", { q: text, countrycodes: "vn", limit: String(SEARCH_LIMIT), dedupe: "1" }, signal);
  return (Array.isArray(data) ? data : []).map(parsePlace).filter(Boolean);
}

/** The address at a point, or null when nothing in Vietnam is found there. */
export async function reversePlace({ latitude, longitude }, { signal } = {}) {
  const data = await request("reverse", { lat: String(latitude), lon: String(longitude), zoom: "18" }, signal);
  return parsePlace(data);
}

export const isAbortError = (error) => error?.name === "AbortError";
