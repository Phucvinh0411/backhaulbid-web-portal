import { apiService } from "./apiService";

export const carrierProfileApi = {
  getCompany: (carrierId) =>
    apiService.get(`/api/v1/business-verifications/public/${encodeURIComponent(carrierId)}`),
  getVehicles: (carrierId) =>
    apiService.get(`/api/v1/vehicles/carrier/${encodeURIComponent(carrierId)}`),
  getDrivers: (carrierId) =>
    apiService.get(`/api/v1/drivers/carrier/${encodeURIComponent(carrierId)}`),
};
