import { apiService } from "./apiService";

const QUIET = { skipGlobalNotification: true };

export const carrierProfileApi = {
  getCompany: (carrierId) =>
    apiService.get(`/api/v1/business-verifications/public/${encodeURIComponent(carrierId)}`),
  getVehicles: (carrierId) =>
    apiService.get(`/api/v1/vehicles/carrier/${encodeURIComponent(carrierId)}`),
  getDrivers: (carrierId) =>
    apiService.get(`/api/v1/drivers/carrier/${encodeURIComponent(carrierId)}`),
  getReputation: (carrierId) =>
    apiService.get(`/api/v1/fleet/reputation/carrier/${encodeURIComponent(carrierId)}/history`),
  // Trip reviews from completed trips; separate from the 0-100 reputation score above.
  getReviewSummary: (carrierId) =>
    apiService.get(`/api/v1/carrier-reviews/${encodeURIComponent(carrierId)}/summary`),
  getReviews: (carrierId, { page = 1, pageSize = 10 } = {}) =>
    apiService.get(`/api/v1/carrier-reviews/${encodeURIComponent(carrierId)}`, { page, pageSize }),
  getFleetStatistics: () =>
    apiService.get("/api/v1/fleet/statistics/me", undefined, QUIET),
};
