import { apiService } from "./apiService";

/** API boundary for wallet reads, SePay checkout/audit, and admin wallet reviews. */
export const walletApi = {
  getMyWallet: () => apiService.get("/api/v1/wallets/me"),
  listTransactions: (params) => apiService.get("/api/v1/wallets/me/transactions", params),
  getTransaction: (transactionId) => apiService.get(`/api/v1/wallets/me/transactions/${transactionId}`),
  createSepayTopUp: (amount, returnUrl) =>
    apiService.post("/api/v1/payments/sepay/top-ups", { amount, returnUrl }),
  listTopUps: (params) => apiService.get("/api/v1/payments/sepay/top-ups", params),
  getSepayTopUpStatus: (invoiceNumber) => apiService.get(`/api/v1/payments/sepay/top-ups/${invoiceNumber}`),
  cancelTopUp: (invoiceNumber) => apiService.post(`/api/v1/payments/sepay/top-ups/${invoiceNumber}/cancel`),
  createWithdrawal: (payload) => apiService.post("/api/v1/wallets/me/withdrawals", payload),
  listWithdrawals: (params) => apiService.get("/api/v1/wallets/me/withdrawals", params),
  getAdminSummary: () => apiService.get("/api/v1/admin/wallet-withdrawals/summary"),
  getAdminWithdrawals: (params) => apiService.get("/api/v1/admin/wallet-withdrawals", params),
  getAdminTopUps: (params) => apiService.get("/api/v1/admin/sepay/top-ups", params),
  getAdminTopUp: (invoiceNumber) => apiService.get(`/api/v1/admin/sepay/top-ups/${invoiceNumber}`),
  getAdminWallet: (accountId) => apiService.get(`/api/v1/admin/wallets/${accountId}`),
  approveAdminWithdrawal: (withdrawalId) =>
    apiService.patch(`/api/v1/admin/wallet-withdrawals/${withdrawalId}/approve`),
  rejectAdminWithdrawal: (withdrawalId, reason) =>
    apiService.patch(`/api/v1/admin/wallet-withdrawals/${withdrawalId}/reject`, { reason }),
};
