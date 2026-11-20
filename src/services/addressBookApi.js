import { apiService } from "./apiService";
import { mapAddress, mapAddresses } from "./mappers/addressMapper";

export const addressBookApi = {
  list: () => apiService.get("/api/v1/addresses").then(mapAddresses),
  create: (payload) => apiService.post("/api/v1/addresses", payload).then(mapAddress),
  update: (addressId, payload) =>
    apiService.patch(`/api/v1/addresses/${addressId}`, payload).then(mapAddress),
  remove: (addressId) => apiService.delete(`/api/v1/addresses/${addressId}`),
};
