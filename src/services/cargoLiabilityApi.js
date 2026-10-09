import { apiService } from "./apiService";

const QUIET = { skipGlobalNotification: true };
export const CARGO_LIABILITY_PATH = "/api/v1/cargo-liability";

/** The carrier's own certificate state: eligible, verifiedUntil and the newest submission. */
export const loadMyCargoLiability = () =>
  apiService.get(`${CARGO_LIABILITY_PATH}/me`, undefined, QUIET);

export const submitCargoLiability = (body) =>
  apiService.post(CARGO_LIABILITY_PATH, body, QUIET);

export const loadCargoLiabilityReviews = ({ status = "PENDING", page = 0, pageSize = 20 } = {}) =>
  apiService.get(`${CARGO_LIABILITY_PATH}/reviews`, { status, page, pageSize }, QUIET);

export const reviewCargoLiability = (id, { decision, rejectionReason }) =>
  apiService.patch(
    `${CARGO_LIABILITY_PATH}/reviews/${encodeURIComponent(id)}`,
    { decision, rejectionReason },
    QUIET,
  );

/** The private file, read by the admin through identity. It is returned as a Blob, never as a public URL. */
export const fetchCargoLiabilityCertificate = (id) =>
  apiService.get(
    `${CARGO_LIABILITY_PATH}/reviews/${encodeURIComponent(id)}/certificate`,
    undefined,
    { ...QUIET, responseType: "blob" },
  );
