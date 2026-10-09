import { cargoLiabilityLabel } from "../lib/cargoLiabilityPresentation.js";

const UNKNOWN = "Chưa cập nhật";
// Metrics with no live API yet. Shown as "no data", never as a number.
const NO_DATA = "Chưa có dữ liệu";

const formatPayload = (value) =>
  value === null || value === undefined ? UNKNOWN : `${value} tấn`;

const getInitials = (name) => {
  const parts = String(name || "N").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts.at(-1)[0]}`.toUpperCase();
};

/**
 * Review summary from the carrier-reviews API. Returns null when the summary did not load, so the UI can
 * say "chưa tải được" instead of claiming the carrier has no reviews.
 */
const normalizeReviewSummary = (summary) => {
  if (!summary) return null;
  return {
    averageRating: typeof summary.averageRating === "number" ? summary.averageRating : null,
    reviewCount: Number(summary.reviewCount) || 0,
    distribution: summary.distribution || {},
  };
};

/** Only the public review fields reach the UI: no trip, shipper or contact data. */
const toReview = (review) => ({
  id: review.id,
  rating: review.rating,
  comment: review.comment || "",
  createdAt: review.createdAt,
});

/**
 * Builds the carrier profile shown to a shipper choosing a winner. `reviewSummary` and `reviews` come from
 * the carrier-reviews API; pass null/[] when they did not load.
 */
export function mapCarrierProfile({ company, vehicles = [], drivers = [], reviewSummary = null, reviews = [] }) {
  const companyName = company?.companyName || "Nhà xe chưa cập nhật tên";
  const verified = company?.verificationStatus === "VERIFIED";

  return {
    code: company?.accountId || UNKNOWN,
    carrierName: companyName,
    representative: company?.legalRepresentative || UNKNOWN,
    avatar: getInitials(companyName),
    badge: verified ? "Nhà xe đã xác minh" : "Chưa hoàn tất xác minh",
    verified,
    reviewSummary: normalizeReviewSummary(reviewSummary),
    reviews: (reviews || []).map(toReview),
    completedTrips: NO_DATA,
    onTimeRate: NO_DATA,
    cancellationRate: NO_DATA,
    taxCode: company?.taxCode || UNKNOWN,
    foundingYear: UNKNOWN,
    address: company?.address || UNKNOWN,
    hotline: company?.contactPhone || UNKNOWN,
    email: company?.contactEmail || UNKNOWN,
    licenseNo: UNKNOWN,
    // Only an admin-verified, unexpired cargo-liability certificate reads as verified; nothing here says "đã bảo hiểm".
    insuranceAmount: cargoLiabilityLabel(company?.cargoLiabilityVerifiedUntil),
    cargoLiabilityVerified: Boolean(company?.cargoLiabilityVerifiedUntil),
    fleet: vehicles.map((vehicle) => ({
      id: vehicle.id,
      plate: vehicle.licensePlate || UNKNOWN,
      type: vehicle.vehicleType || UNKNOWN,
      brand: vehicle.bodyType || UNKNOWN,
      dims: UNKNOWN,
      volume: UNKNOWN,
      payload: formatPayload(vehicle.payloadCapacity),
      gpsActive: false,
      status: vehicle.status || UNKNOWN,
    })),
    drivers: drivers.map((driver) => ({
      id: driver.id,
      name: driver.fullName || UNKNOWN,
      birthYear: UNKNOWN,
      phone: driver.phone || UNKNOWN,
      license: driver.licenseNumber || UNKNOWN,
      experience: UNKNOWN,
      safetyRecord: driver.status === "VERIFIED" ? "Đã xác thực" : "Chưa xác thực",
    })),
  };
}
