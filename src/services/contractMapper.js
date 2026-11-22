import { mapTrip } from "./mappers/tripMapper.js";
import { shortId } from "../lib/format.js";
import { toId, toIsoString, toNumber, unwrapData, unwrapList } from "./mappers/primitives.js";

function formatCurrency(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "Chưa cập nhật";
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(value) {
  if (!value) {
    return "Chưa cập nhật";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Chưa cập nhật";
  }

  return new Intl.DateTimeFormat("vi-VN").format(date);
}

function getPartnerLabel(id, roleLabel) {
  return id ? `${roleLabel} #${shortId(id)}` : `Chưa cập nhật ${roleLabel.toLowerCase()}`;
}

function mapStatus(status, tripStatus) {
  if (status === "EXPIRED") {
    return "EXPIRED";
  }

  if (status === "CANCELLED" || tripStatus === "CANCELLED") {
    return "CANCELLED";
  }

  if (status === "SIGNED") {
    return tripStatus === "COMPLETED" ? "COMPLETED" : "ACTIVE";
  }

  return "PENDING_SIGNATURE";
}

function mapSignature(signature) {
  if (!signature || typeof signature !== "object") return null;
  return {
    accountId: signature.accountId ?? null,
    role: signature.role ?? null,
    signedAt: toIsoString(signature.signedAt),
  };
}

/**
 * Normalizes a raw ContractResponse DTO at the API boundary (`contractApi.js`).
 * Preserves backend statuses and nested trip/signatures while guaranteeing numeric prices
 * and clean arrays so dashboards, action inboxes, and role-specific presenters share one model.
 */
export function normalizeContract(response) {
  const raw = unwrapData(response);
  if (!raw || typeof raw !== "object") return null;

  const trip = raw.trip ? mapTrip(raw.trip) : null;
  const signatures = Array.isArray(raw.signatures)
    ? raw.signatures.map(mapSignature).filter(Boolean)
    : [];

  return {
    id: toId(raw),
    tripId: raw.tripId ?? trip?.id ?? null,
    shipperId: raw.shipperId ?? null,
    carrierId: raw.carrierId ?? null,
    contractCode: raw.contractCode ?? null,
    shipperName: raw.shipperName ?? null,
    carrierName: raw.carrierName ?? null,
    cargoType: raw.cargoType ?? trip?.cargoType ?? null,
    pdfUrl: raw.pdfUrl ?? "",
    pdfHashSha256: raw.pdfHashSha256 ?? null,
    status: raw.status ?? "DRAFT",
    signingDeadlineAt: toIsoString(raw.signingDeadlineAt),
    createdAt: toIsoString(raw.createdAt),
    updatedAt: toIsoString(raw.updatedAt),
    trip,
    signatures,
    agreedPrice: toNumber(trip?.agreedPrice ?? raw.agreedPrice, 0),
    auctionId: trip?.auctionId ?? raw.auctionId ?? null,
  };
}

export function normalizeContracts(response) {
  return unwrapList(response).map(normalizeContract).filter(Boolean);
}

export function mapContractResponse(response = {}, role = "carrier") {
  const normalized = normalizeContract(response) || {};
  const trip = normalized.trip || {};
  const isShipper = role === "shipper";
  const signatures = Array.isArray(normalized.signatures) ? normalized.signatures : [];
  const carrierSigned = signatures.some(
    (signature) => signature.role === "CARRIER" && signature.signedAt,
  );
  const actorRole = isShipper ? "SHIPPER" : "CARRIER";
  const actorSigned = signatures.some(
    (signature) => signature.role === actorRole && signature.signedAt,
  );

  return {
    backendId: normalized.id,
    id: normalized.contractCode || normalized.id || "Chưa có mã hợp đồng",
    tripId: normalized.tripId || trip.id || null,
    auctionId: trip.auctionId || "Chưa có mã phiên",
    origin: trip.pickupLocation || "Chưa cập nhật điểm nhận",
    destination: trip.deliveryLocation || "Chưa cập nhật điểm giao",
    pickupAddress: trip.pickupLocation || "",
    deliveryAddress: trip.deliveryLocation || "",
    cargoType: normalized.cargoType || trip.cargoType || "Vận chuyển hàng hóa",
    agreedPrice: normalized.agreedPrice,
    value: formatCurrency(trip.agreedPrice),
    date: formatDate(normalized.createdAt || trip.createdAt),
    status: mapStatus(normalized.status, trip.status),
    signingDeadlineAt: normalized.signingDeadlineAt || null,
    canSign:
      !actorSigned && (!isShipper || carrierSigned) &&
      normalized.status !== "EXPIRED" && normalized.status !== "CANCELLED",
    pendingMessage: isShipper && !carrierSigned
      ? "Chưa ký được: cần chờ nhà xe ký trước."
      : actorSigned
        ? "Bạn đã ký. Đang chờ đối tác ký."
        : "Bạn được mời ký hợp đồng.",
    shipperName: normalized.shipperName || getPartnerLabel(normalized.shipperId, "Chủ hàng"),
    carrierName: normalized.carrierName || getPartnerLabel(normalized.carrierId, "Nhà xe"),
    partnerId: isShipper ? normalized.carrierId : normalized.shipperId,
    pdfUrl: normalized.pdfUrl || "",
    signatures,
  };
}

export function mapContractResponses(response, role = "carrier") {
  const values = Array.isArray(response) ? response : response?.data;
  return Array.isArray(values)
    ? values.map((contract) => mapContractResponse(contract, role))
    : [];
}

export function getContractTrackingHref(contract, role = "carrier") {
  const base = role === "shipper" ? "/shipper/tracking" : "/carrier/transports";
  if (!contract.tripId) return base;
  const tripId = encodeURIComponent(contract.tripId);
  return role === "shipper" ? `${base}?id=${tripId}` : `${base}/${tripId}`;
}
