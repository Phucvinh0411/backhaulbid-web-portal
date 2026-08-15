import { apiService } from "./apiService";

export const complaintApi = {
  list: () => apiService.get("/api/v1/complaints"),
  get: (complaintId) => apiService.get(`/api/v1/complaints/${complaintId}`),
  addMessage: (complaintId, message) => apiService.post(`/api/v1/complaints/${complaintId}/messages`, { message }),
  resolve: (complaintId, payload) => apiService.patch(`/api/v1/complaints/${complaintId}/decision`, payload),
};
