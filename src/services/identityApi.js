import { apiService } from "./apiService";

export const identityApi = {
  getCurrentAccount: () => apiService.get("/api/v1/accounts/me"),
  listAdminAccounts: (params) => apiService.get("/api/v1/admin/accounts", params),
  updateAdminAccountStatus: (accountId, status) =>
    apiService.patch(`/api/v1/admin/accounts/${accountId}/status`, { status }),
};
