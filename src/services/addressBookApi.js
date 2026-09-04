import { apiService } from "./apiService";

export const addressBookApi = {
  list: () => apiService.get("/api/v1/addresses"),
  create: (payload) => apiService.post("/api/v1/addresses", payload),
  update: (addressId, payload) =>
    apiService.patch(`/api/v1/addresses/${addressId}`, payload),
  remove: (addressId) => apiService.delete(`/api/v1/addresses/${addressId}`),
};
