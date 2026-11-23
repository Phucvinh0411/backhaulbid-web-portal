import {
  toId,
  toIsoString,
  toNullableNumber,
  toNumber,
  unwrapData,
  unwrapList,
} from "./primitives.js";

export const VEHICLE_TYPE_LABELS = {
  TRUCK_SMALL: "Xe tải nhỏ",
  TRUCK_MEDIUM: "Xe tải trung",
  TRUCK_HEAVY: "Xe tải nặng",
  CONTAINER_TRACTOR: "Xe đầu kéo container",
  REFRIGERATED_TRUCK: "Xe tải đông lạnh",
  SPECIALIZED_TRUCK: "Xe chuyên dụng",
};

export function mapVehicle(response) {
  const raw = unwrapData(response);
  if (!raw || typeof raw !== "object") return null;

  const rawCap = toNumber(raw.payloadCapacity, 0);
  const capacityTonsStr =
    rawCap >= 500 ? (rawCap / 1000).toFixed(1).replace(/\.0$/, "") : String(rawCap);
  const typeLabel =
    VEHICLE_TYPE_LABELS[raw.vehicleType] || raw.vehicleType || "Chưa phân loại";

  return {
    id: toId(raw),
    carrierId: raw.carrierId ?? null,
    licensePlate: raw.licensePlate ?? "",
    vehicleType: raw.vehicleType ?? null,
    bodyType: raw.bodyType || "",
    payloadCapacity: rawCap,
    status: raw.status ?? null,
    verificationStatus: raw.verificationStatus ?? null,
    rejectionReason: raw.rejectionReason ?? null,
    registrationDocumentUrl: raw.registrationDocumentUrl ?? null,
    inspectionDocumentUrl: raw.inspectionDocumentUrl ?? null,
    // Derived UI aliases preserved for existing carrier/admin fleet screens.
    plate: raw.licensePlate ?? "",
    capacity: `${capacityTonsStr} tấn`,
    capacityTons: Number(capacityTonsStr) || 0,
    type: typeLabel,
    vehicleTypeLabel: typeLabel,
    verification: raw.status ?? null,
    active: raw.status !== "INACTIVE",
  };
}

export function mapVehicles(response) {
  return unwrapList(response).map(mapVehicle).filter(Boolean);
}

export function mapDriver(response) {
  const raw = unwrapData(response);
  if (!raw || typeof raw !== "object") return null;

  return {
    id: toId(raw),
    carrierId: raw.carrierId ?? null,
    fullName: raw.fullName ?? "",
    phone: raw.phone ?? "",
    licenseNumber: raw.licenseNumber ?? "",
    licenseImageUrl: raw.licenseImageUrl ?? null,
    status: raw.status ?? null,
    rejectionReason: raw.rejectionReason ?? null,
    reviewedBy: raw.reviewedBy ?? null,
    // Derived UI aliases preserved for existing carrier/admin driver screens.
    name: raw.fullName ?? "",
    licenseClass: raw.licenseNumber ?? "",
    verification: raw.status ?? null,
    active: raw.status === "VERIFIED",
  };
}

export function mapDrivers(response) {
  return unwrapList(response).map(mapDriver).filter(Boolean);
}

export function mapEmptyRoute(response) {
  const raw = unwrapData(response);
  if (!raw || typeof raw !== "object") return null;

  return {
    id: toId(raw),
    truckId: raw.truckId ?? "",
    truckType: raw.truckType ?? null,
    companyId: raw.companyId ?? null,
    availableCapacity: toNullableNumber(raw.availableCapacity),
    origin: raw.origin ?? "",
    latitude: toNullableNumber(raw.latitude),
    longitude: toNullableNumber(raw.longitude),
    destination: raw.destination ?? "",
    destLatitude: toNullableNumber(raw.destLatitude),
    destLongitude: toNullableNumber(raw.destLongitude),
    expectedEmptyTime: toIsoString(raw.expectedEmptyTime),
    expectedArrivalTime: toIsoString(raw.expectedArrivalTime),
    searchRadius: toNullableNumber(raw.searchRadius),
    status: raw.status ?? "PENDING",
  };
}

export function mapEmptyRoutes(response) {
  return unwrapList(response).map(mapEmptyRoute).filter(Boolean);
}
