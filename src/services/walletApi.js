import { apiService } from "./apiService";
import {
  mapAdminWalletSummary,
  mapPaymentOrder,
  mapPaymentOrderPage,
  mapTopUpResponse,
  mapTopUpStatus,
  mapWallet,
  mapWalletTransaction,
  mapWalletTransactionPage,
  mapWithdrawal,
  mapWithdrawalPage,
} from "./mappers/walletMapper";

/** API boundary for wallet reads, SePay checkout/audit, and admin wallet reviews. */
export const walletApi = {
  getMyWallet: () =>
    apiService.get("/api/v1/wallets/me").then(mapWallet),
  listTransactions: (params) =>
    apiService.get("/api/v1/wallets/me/transactions", params).then(mapWalletTransactionPage),
  getTransaction: (transactionId) =>
    apiService.get(`/api/v1/wallets/me/transactions/${transactionId}`).then(mapWalletTransaction),
  createSepayTopUp: (amount, returnUrl) =>
    apiService.post("/api/v1/payments/sepay/top-ups", { amount, returnUrl }).then(mapTopUpResponse),
  listTopUps: (params) =>
    apiService.get("/api/v1/payments/sepay/top-ups", params).then(mapPaymentOrderPage),
  getSepayTopUpStatus: (invoiceNumber) =>
    apiService.get(`/api/v1/payments/sepay/top-ups/${invoiceNumber}`).then(mapTopUpStatus),
  cancelTopUp: (invoiceNumber) =>
    apiService.post(`/api/v1/payments/sepay/top-ups/${invoiceNumber}/cancel`).then(mapPaymentOrder),
  createWithdrawal: (payload) =>
    apiService.post("/api/v1/wallets/me/withdrawals", payload).then(mapWithdrawal),
  listWithdrawals: (params) =>
    apiService.get("/api/v1/wallets/me/withdrawals", params).then(mapWithdrawalPage),
  getAdminSummary: () =>
    apiService.get("/api/v1/admin/wallet-withdrawals/summary").then(mapAdminWalletSummary),
  getAdminWithdrawals: (params) =>
    apiService.get("/api/v1/admin/wallet-withdrawals", params).then(mapWithdrawalPage),
  getAdminTopUps: (params) =>
    apiService.get("/api/v1/admin/sepay/top-ups", params).then(mapPaymentOrderPage),
  getAdminTopUp: (invoiceNumber) =>
    apiService.get(`/api/v1/admin/sepay/top-ups/${invoiceNumber}`).then(mapPaymentOrder),
  getAdminWallet: (accountId) =>
    apiService.get(`/api/v1/admin/wallets/${accountId}`).then(mapWallet),
  approveAdminWithdrawal: (withdrawalId) =>
    apiService.patch(`/api/v1/admin/wallet-withdrawals/${withdrawalId}/approve`).then(mapWithdrawal),
  rejectAdminWithdrawal: (withdrawalId, reason) =>
    apiService
      .patch(`/api/v1/admin/wallet-withdrawals/${withdrawalId}/reject`, { reason })
      .then(mapWithdrawal),
};
