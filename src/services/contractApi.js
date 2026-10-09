import { apiService } from "./apiService";

export const contractApi = {
  listMine: (params) => apiService.get("/api/v1/contracts/mine", params),
  get: (contractId) => apiService.get(`/api/v1/contracts/${contractId}`),
  sign: (contractId) => apiService.patch(`/api/v1/contracts/${contractId}/sign`),
  listTrips: (params, config) => apiService.get("/api/v1/trips/mine", params, config),
  getTrip: (tripId, config) => apiService.get(`/api/v1/trips/${tripId}`, undefined, config),
  getTracking: (tripId, config) => apiService.get(`/api/v1/trips/${tripId}/tracking`, undefined, config),
  listLocationHistory: (tripId, params, config) => apiService.get(`/api/v1/trips/${tripId}/locations/history`, params, config),
  updateRoutePoints: (tripId, payload) => apiService.patch(`/api/v1/trips/${tripId}/route-points`, payload),
  cancelLateTrip: (tripId, payload = {}) =>
    apiService.post(`/api/v1/trips/${tripId}/cancel-late`, payload),
  listTripDelaySettlements: (tripId, config) =>
    apiService.get(`/api/v1/trips/${tripId}/delay-settlements`, undefined, config),
  listDelaySettlementsForAdmin: () =>
    apiService.get("/api/v1/trips/admin/late-settlements"),
  updateTripStatus: (tripId, payload) =>
    apiService.patch(`/api/v1/trips/${tripId}/status`, payload),
  assignDriver: (tripId, payload) =>
    apiService.patch(`/api/v1/trips/${tripId}/assignment`, payload),
  // New one-time driver code for the same profile on an active trip; status and history stay.
  reissueDriverAccess: (tripId) =>
    apiService.post(`/api/v1/trips/${tripId}/driver-access/reissue`, {}),
  // Insurance claim drafts. Preparing a claim never sends it to a provider; the server marks it ready only.
  listTripClaims: (tripId) => apiService.get(`/api/v1/trips/${tripId}/claims`),
  createTripClaim: (tripId, payload) => apiService.post(`/api/v1/trips/${tripId}/claims`, payload),
  addClaimEvidence: (claimId, payload) => apiService.post(`/api/v1/claims/${claimId}/evidence`, payload),
  markClaimReady: (claimId) => apiService.post(`/api/v1/claims/${claimId}/ready`, {}),
  // Evidence is private: fetched with the signed-in session as a blob, never linked publicly.
  downloadClaimEvidence: (fileLink) => apiService.get(fileLink, undefined, { responseType: "blob" }),
  // Pickup handover: the driver records it in the app; the shipper confirms it. Zero or one record per trip.
  getTripHandover: (tripId) => apiService.get(`/api/v1/trips/${tripId}/handover`),
  confirmTripHandover: (tripId, payload) => apiService.post(`/api/v1/trips/${tripId}/handover/confirm`, payload),
  // A handover photo is read through the trip check with the signed-in session, as a blob. Never a storage link.
  getTripHandoverPhoto: (tripId, index) =>
    apiService.get(`/api/v1/trips/${tripId}/handover/photos/${index}`, undefined, { responseType: "blob" }),
  // Shipper review of a COMPLETED trip (one per trip). Separate from fleet reputation.
  getTripReviews: (tripId) => apiService.get(`/api/v1/trips/${tripId}/reviews`),
  createTripReview: (tripId, payload) => apiService.post(`/api/v1/trips/${tripId}/reviews`, payload),
  addTracking: (tripId, payload) =>
    apiService.post(`/api/v1/trips/${tripId}/tracking`, payload),
  listJourneyEvents: (tripId, config) => apiService.get(`/api/v1/trips/${tripId}/journey-events`, undefined, config),
  addJourneyEvent: (tripId, payload) => apiService.post(`/api/v1/trips/${tripId}/journey-events`, payload),
  listDeliveryProofs: (tripId, config) => apiService.get(`/api/v1/trips/${tripId}/delivery-proofs`, undefined, config),
  addDeliveryProof: (tripId, payload) => apiService.post(`/api/v1/trips/${tripId}/delivery-proofs`, payload),
  listLocations: (tripId, config) => apiService.get(`/api/v1/trips/${tripId}/locations`, undefined, config),
  addLocation: (tripId, payload) => apiService.post(`/api/v1/trips/${tripId}/locations`, payload),
  latestLocation: (tripId) => apiService.get(`/api/v1/trips/${tripId}/locations/latest`),
  listMilestones: (tripId, config) => apiService.get(`/api/v1/trips/${tripId}/milestones`, undefined, config),
  createMilestone: (tripId, payload) => apiService.post(`/api/v1/trips/${tripId}/milestones`, payload),
};
