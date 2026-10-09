import { VIETNAM_PROVINCES } from "../../../utils/provinces.js";

/** Province code from its display name, or null when the name is not one of the 34 units. */
export function provinceCodeOf(name) {
  const match = VIETNAM_PROVINCES.find((province) => province.name === name);
  return match ? match.code : null;
}

/** Ward names and codes from the administrative API response. Blank names are dropped. */
export function normalizeWards(data) {
  const list = Array.isArray(data?.wards) ? data.wards : [];
  return list
    .map((ward) => ({ code: ward.code, name: ward.name }))
    .filter((ward) => typeof ward.name === "string" && ward.name.trim() !== "");
}
