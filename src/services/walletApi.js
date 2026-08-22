import { apiService } from "./apiService";

/** API boundary for wallet reads, SePay checkout creation, and admin withdrawal reviews. */
export const walletApi = {
  getMyWallet: () => apiService.get("/api/v1/wallets/me"),
  listTransactions: (params) => apiService.get("/api/v1/wallets/me/transactions", params),
  createSepayTopUp: (amount, returnUrl) =>
    apiService.post("/api/v1/payments/sepay/top-ups", { amount, returnUrl }),
  getSepayTopUpStatus: (invoiceNumber) => apiService.get(`/api/v1/payments/sepay/top-ups/${invoiceNumber}`),
  createWithdrawal: (payload) => apiService.post("/api/v1/wallets/me/withdrawals", payload),
  listWithdrawals: (params) => apiService.get("/api/v1/wallets/me/withdrawals", params),
  getAdminSummary: () => apiService.get("/api/v1/admin/wallet-withdrawals/summary"),
  getAdminWithdrawals: (params) => apiService.get("/api/v1/admin/wallet-withdrawals", params),
  approveAdminWithdrawal: (withdrawalId) =>
    apiService.patch(`/api/v1/admin/wallet-withdrawals/${withdrawalId}/approve`),
  rejectAdminWithdrawal: (withdrawalId, reason) =>
    apiService.patch(`/api/v1/admin/wallet-withdrawals/${withdrawalId}/reject`, { reason }),
};
