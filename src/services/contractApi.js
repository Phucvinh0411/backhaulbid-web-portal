import { apiService } from "./apiService";

export const contractApi = {
  listMine: (params) => apiService.get("/api/v1/contracts/mine", params).catch(() => []),
  get: (contractId) => apiService.get(`/api/v1/contracts/${contractId}`),
  sign: (contractId) => apiService.patch(`/api/v1/contracts/${contractId}/sign`),
  listTrips: (params) => apiService.get("/api/v1/trips/mine", params).catch(() => []),
  getTrip: (tripId) => apiService.get(`/api/v1/trips/${tripId}`),
  updateTripStatus: (tripId, payload) =>
    apiService.patch(`/api/v1/trips/${tripId}/status`, payload),
  assignDriver: (tripId, payload) =>
    apiService.patch(`/api/v1/trips/${tripId}/assignment`, payload),
  addTracking: (tripId, payload) =>
    apiService.post(`/api/v1/trips/${tripId}/tracking`, payload),
  listJourneyEvents: (tripId) => apiService.get(`/api/v1/trips/${tripId}/journey-events`),
  addJourneyEvent: (tripId, payload) => apiService.post(`/api/v1/trips/${tripId}/journey-events`, payload),
  listDeliveryProofs: (tripId) => apiService.get(`/api/v1/trips/${tripId}/delivery-proofs`),
  addDeliveryProof: (tripId, payload) => apiService.post(`/api/v1/trips/${tripId}/delivery-proofs`, payload),
  listLocations: (tripId) => apiService.get(`/api/v1/trips/${tripId}/locations`),
  addLocation: (tripId, payload) => apiService.post(`/api/v1/trips/${tripId}/locations`, payload),
  latestLocation: (tripId) => apiService.get(`/api/v1/trips/${tripId}/locations/latest`),
};
