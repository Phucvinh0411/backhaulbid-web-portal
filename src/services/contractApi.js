import { apiService } from "./apiService";
import { normalizeContract, normalizeContracts } from "./contractMapper";
import { dedupeInFlight } from "@/lib/inFlightRequest";
import {
  mapCargoDocument,
  mapCargoDocumentsResponse,
  mapDelaySettlements,
  mapDeliveryProof,
  mapDeliveryProofs,
  mapInsuranceClaim,
  mapInsuranceClaims,
  mapJourneyEvent,
  mapJourneyEvents,
  mapLocationHistoryResponse,
  mapTrackingLog,
  mapTrip,
  mapTripHandover,
  mapTripHandovers,
  mapTripLocation,
  mapTripLocations,
  mapTripReview,
  mapTripReviews,
  mapTrips,
  mapTripTrackingSnapshot,
} from "./mappers/tripMapper";

export const contractApi = {
  listMine: (params) =>
    dedupeInFlight(`contracts:mine:${JSON.stringify(params || {})}`, () =>
      apiService.get("/api/v1/contracts/mine", params).then(normalizeContracts),
    ),
  get: (contractId) =>
    apiService.get(`/api/v1/contracts/${contractId}`).then(normalizeContract),
  requestSignOtp: (contractId, config) =>
    apiService.post(`/api/v1/contracts/${contractId}/sign/otp`, {}, config),
  sign: (contractId, payload, config) =>
    apiService.patch(`/api/v1/contracts/${contractId}/sign`, payload, config).then(normalizeContract),
  listTrips: (params, config) =>
    apiService.get("/api/v1/trips/mine", params, config).then(mapTrips),
  getTrip: (tripId, config) =>
    apiService.get(`/api/v1/trips/${tripId}`, undefined, config).then(mapTrip),
  getTracking: (tripId, config) =>
    apiService.get(`/api/v1/trips/${tripId}/tracking`, undefined, config).then(mapTripTrackingSnapshot),
  listLocationHistory: (tripId, params, config) =>
    apiService.get(`/api/v1/trips/${tripId}/locations/history`, params, config).then(mapLocationHistoryResponse),
  updateRoutePoints: (tripId, payload) =>
    apiService.patch(`/api/v1/trips/${tripId}/route-points`, payload).then(mapTrip),
  cancelLateTrip: (tripId, payload = {}) =>
    apiService.post(`/api/v1/trips/${tripId}/cancel-late`, payload).then(mapTrip),
  listTripDelaySettlements: (tripId, config) =>
    apiService.get(`/api/v1/trips/${tripId}/delay-settlements`, undefined, config).then(mapDelaySettlements),
  listDelaySettlementsForAdmin: () =>
    apiService.get("/api/v1/trips/admin/late-settlements").then(mapDelaySettlements),
  updateTripStatus: (tripId, payload) =>
    apiService.patch(`/api/v1/trips/${tripId}/status`, payload).then(mapTrip),
  assignDriver: (tripId, payload) =>
    apiService.patch(`/api/v1/trips/${tripId}/assignment`, payload),
  // New one-time driver code for the same profile on an active trip; status and history stay.
  reissueDriverAccess: (tripId) =>
    apiService.post(`/api/v1/trips/${tripId}/driver-access/reissue`, {}),
  // Insurance claim drafts. Preparing a claim never sends it to a provider; the server marks it ready only.
  listTripClaims: (tripId) =>
    apiService.get(`/api/v1/trips/${tripId}/claims`).then(mapInsuranceClaims),
  createTripClaim: (tripId, payload) =>
    apiService.post(`/api/v1/trips/${tripId}/claims`, payload).then(mapInsuranceClaim),
  addClaimEvidence: (claimId, payload) =>
    apiService.post(`/api/v1/claims/${claimId}/evidence`, payload).then(mapInsuranceClaim),
  markClaimReady: (claimId) =>
    apiService.post(`/api/v1/claims/${claimId}/ready`, {}).then(mapInsuranceClaim),
  // Evidence is private: fetched with the signed-in session as a blob, never linked publicly.
  downloadClaimEvidence: (fileLink) =>
    apiService.get(fileLink, undefined, { responseType: "blob" }),
  // Sharing hands a ready claim to the trip's carrier only. The carrier's receipt is recorded separately.
  shareTripClaim: (claimId) =>
    apiService.post(`/api/v1/claims/${claimId}/share`, {}).then(mapInsuranceClaim),
  listSharedClaims: () =>
    apiService.get("/api/v1/claims/shared").then(mapInsuranceClaims),
  acknowledgeSharedClaim: (claimId) =>
    apiService.post(`/api/v1/claims/${claimId}/acknowledge`, {}).then(mapInsuranceClaim),
  // The claim pack is a ZIP read with the signed-in session; it is never a public link.
  downloadClaimPackage: (claimId) =>
    apiService.get(`/api/v1/claims/${claimId}/package`, undefined, { responseType: "blob" }),
  // Goods-value documents of the trip: the shipper and admins only. The file is read as a blob, never linked publicly.
  listTripCargoDocuments: (tripId) =>
    apiService.get(`/api/v1/trips/${tripId}/cargo-documents`).then(mapCargoDocumentsResponse),
  addTripCargoDocument: (tripId, payload) =>
    apiService.post(`/api/v1/trips/${tripId}/cargo-documents`, payload).then(mapCargoDocument),
  downloadTripCargoDocument: (fileLink) =>
    apiService.get(fileLink, undefined, { responseType: "blob" }),
  // Pickup handover: the driver records it in the app; the shipper confirms it. Zero or one record per trip.
  getTripHandover: (tripId) =>
    apiService.get(`/api/v1/trips/${tripId}/handover`).then(mapTripHandovers),
  confirmTripHandover: (tripId, payload) =>
    apiService.post(`/api/v1/trips/${tripId}/handover/confirm`, payload).then(mapTripHandover),
  // A handover photo is read through the trip check with the signed-in session, as a blob. Never a storage link.
  getTripHandoverPhoto: (tripId, index) =>
    apiService.get(`/api/v1/trips/${tripId}/handover/photos/${index}`, undefined, { responseType: "blob" }),
  // Shipper review of a COMPLETED trip (one per trip). Separate from fleet reputation.
  getTripReviews: (tripId) =>
    apiService.get(`/api/v1/trips/${tripId}/reviews`).then(mapTripReviews),
  createTripReview: (tripId, payload) =>
    apiService.post(`/api/v1/trips/${tripId}/reviews`, payload).then(mapTripReview),
  addTracking: (tripId, payload) =>
    apiService.post(`/api/v1/trips/${tripId}/tracking`, payload).then(mapTrackingLog),
  listJourneyEvents: (tripId, config) =>
    apiService.get(`/api/v1/trips/${tripId}/journey-events`, undefined, config).then(mapJourneyEvents),
  addJourneyEvent: (tripId, payload) =>
    apiService.post(`/api/v1/trips/${tripId}/journey-events`, payload).then(mapJourneyEvent),
  listDeliveryProofs: (tripId, config) =>
    apiService.get(`/api/v1/trips/${tripId}/delivery-proofs`, undefined, config).then(mapDeliveryProofs),
  addDeliveryProof: (tripId, payload) =>
    apiService.post(`/api/v1/trips/${tripId}/delivery-proofs`, payload).then(mapDeliveryProof),
  listLocations: (tripId, config) =>
    apiService.get(`/api/v1/trips/${tripId}/locations`, undefined, config).then(mapTripLocations),
  addLocation: (tripId, payload) =>
    apiService.post(`/api/v1/trips/${tripId}/locations`, payload).then(mapTripLocation),
  latestLocation: (tripId) =>
    apiService.get(`/api/v1/trips/${tripId}/locations/latest`).then(mapTripLocation),
};
