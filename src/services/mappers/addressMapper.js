import {
  toId,
  toIsoString,
  toNullableNumber,
  unwrapData,
  unwrapList,
} from "./primitives.js";

export function mapAddress(response) {
  const raw = unwrapData(response);
  if (!raw || typeof raw !== "object") return null;

  return {
    id: toId(raw),
    accountId: raw.accountId ?? null,
    label: raw.label ?? "",
    contactName: raw.contactName ?? "",
    contactPhone: raw.contactPhone ?? "",
    province: raw.province ?? "",
    detail: raw.detail ?? "",
    latitude: toNullableNumber(raw.latitude),
    longitude: toNullableNumber(raw.longitude),
    coordinateSource: raw.coordinateSource ?? null,
    coordinateConfirmedAt: toIsoString(raw.coordinateConfirmedAt),
    createdAt: toIsoString(raw.createdAt),
    updatedAt: toIsoString(raw.updatedAt),
  };
}

export function mapAddresses(response) {
  return unwrapList(response).map(mapAddress).filter(Boolean);
}
