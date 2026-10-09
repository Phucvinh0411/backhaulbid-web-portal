import { apiService } from "./apiService";

// Screens render their own inline errors, so the global toast is skipped to avoid duplicates.
const quiet = { skipGlobalNotification: true };

export const complaintApi = {
  /** `category`: a ComplaintCategory code or "UNCATEGORIZED"; filtered server-side over the full visible set. */
  list: ({ category } = {}) => apiService.get("/api/v1/complaints", category ? { category } : undefined, quiet),
  create: (payload) => apiService.post("/api/v1/complaints", payload, quiet),
  get: (complaintId) => apiService.get(`/api/v1/complaints/${complaintId}`, undefined, quiet),
  addMessage: (complaintId, message) => apiService.post(`/api/v1/complaints/${complaintId}/messages`, { message }, quiet),
  resolve: (complaintId, payload) => apiService.patch(`/api/v1/complaints/${complaintId}/decision`, payload, quiet),
};
