import { apiService } from "./apiService";

export const identityApi = {
  listAdminAccounts: (params) => apiService.get("/api/v1/admin/accounts", params),
  updateAdminAccountStatus: (accountId, status) =>
    apiService.patch(`/api/v1/admin/accounts/${accountId}/status`, { status }),
};
