import { apiService } from "./apiService";
import { mapComplaint, mapComplaints } from "./mappers/complaintMapper";

// Screens render their own inline errors, so the global toast is skipped to avoid duplicates.
const quiet = { skipGlobalNotification: true };

export const complaintApi = {
  /** `category`: a ComplaintCategory code or "UNCATEGORIZED"; filtered server-side over the full visible set. */
  list: ({ category } = {}) =>
    apiService
      .get("/api/v1/complaints", category ? { category } : undefined, quiet)
      .then(mapComplaints),
  create: (payload) =>
    apiService.post("/api/v1/complaints", payload, quiet).then(mapComplaint),
  get: (complaintId) =>
    apiService.get(`/api/v1/complaints/${complaintId}`, undefined, quiet).then(mapComplaint),
  addMessage: (complaintId, message) =>
    apiService
      .post(`/api/v1/complaints/${complaintId}/messages`, { message }, quiet)
      .then(mapComplaint),
  resolve: (complaintId, payload) =>
    apiService
      .patch(`/api/v1/complaints/${complaintId}/decision`, payload, quiet)
      .then(mapComplaint),
};
