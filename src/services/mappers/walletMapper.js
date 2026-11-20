import {
  mapPageResponse,
  toId,
  toIsoString,
  toNumber,
  unwrapData,
} from "./primitives.js";

export function mapWallet(response) {
  const raw = unwrapData(response);
  if (!raw || typeof raw !== "object") return null;

  const balance = toNumber(raw.balance, 0);
  const frozenBalance = toNumber(raw.frozenBalance, 0);
  const availableBalance = toNumber(
    raw.availableBalance,
    Math.max(0, balance - frozenBalance),
  );

  return {
    ...raw,
    id: toId(raw),
    accountId: raw.accountId ?? null,
    balance,
    frozenBalance,
    availableBalance,
    currency: raw.currency ?? "VND",
    updatedAt: toIsoString(raw.updatedAt),
  };
}

export function mapWalletTransaction(response) {
  const raw = unwrapData(response);
  if (!raw || typeof raw !== "object") return null;

  return {
    ...raw,
    id: toId(raw),
    walletId: raw.walletId ?? null,
    type: raw.type ?? null,
    amount: toNumber(raw.amount, 0),
    status: raw.status ?? null,
    paymentMethod: raw.paymentMethod ?? null,
    referenceCode: raw.referenceCode ?? null,
    description: raw.description ?? "",
    createdAt: toIsoString(raw.createdAt),
  };
}

export function mapWalletTransactionPage(response) {
  return mapPageResponse(response, mapWalletTransaction);
}

export function mapPaymentOrder(response) {
  const raw = unwrapData(response);
  if (!raw || typeof raw !== "object") return null;

  return {
    ...raw,
    paymentOrderId: raw.paymentOrderId ?? toId(raw),
    accountId: raw.accountId ?? null,
    invoiceNumber: raw.invoiceNumber ?? "",
    amount: toNumber(raw.amount, 0),
    provider: raw.provider ?? "SEPAY",
    status: raw.status ?? null,
    checkoutUrl: raw.checkoutUrl ?? null,
    providerTransactionId: raw.providerTransactionId ?? null,
    expiresAt: toIsoString(raw.expiresAt),
    paidAt: toIsoString(raw.paidAt),
    createdAt: toIsoString(raw.createdAt),
    updatedAt: toIsoString(raw.updatedAt),
  };
}

export function mapPaymentOrderPage(response) {
  return mapPageResponse(response, mapPaymentOrder);
}

export function mapTopUpResponse(response) {
  const raw = unwrapData(response);
  if (!raw || typeof raw !== "object") return null;

  return {
    ...raw,
    paymentOrderId: raw.paymentOrderId ?? toId(raw),
    invoiceNumber: raw.invoiceNumber ?? "",
    amount: toNumber(raw.amount, 0),
    status: raw.status ?? null,
    checkoutUrl: raw.checkoutUrl ?? null,
    formFields:
      raw.formFields && typeof raw.formFields === "object" ? raw.formFields : {},
    expiresAt: toIsoString(raw.expiresAt),
  };
}

export function mapTopUpStatus(response) {
  const raw = unwrapData(response);
  if (!raw || typeof raw !== "object") return null;

  return {
    ...raw,
    invoiceNumber: raw.invoiceNumber ?? "",
    status: raw.status ?? null,
    amount: toNumber(raw.amount, 0),
    paidAt: toIsoString(raw.paidAt),
    expiresAt: toIsoString(raw.expiresAt),
  };
}

export function mapWithdrawal(response) {
  const raw = unwrapData(response);
  if (!raw || typeof raw !== "object") return null;

  return {
    ...raw,
    id: toId(raw),
    accountId: raw.accountId ?? null,
    amount: toNumber(raw.amount, 0),
    bankName: raw.bankName ?? "",
    maskedBankAccountNumber: raw.maskedBankAccountNumber ?? "****",
    accountHolderName: raw.accountHolderName ?? "",
    status: raw.status ?? null,
    processedBy: raw.processedBy ?? null,
    rejectionReason: raw.rejectionReason ?? null,
    createdAt: toIsoString(raw.createdAt),
    processedAt: toIsoString(raw.processedAt),
  };
}

export function mapWithdrawalPage(response) {
  return mapPageResponse(response, mapWithdrawal);
}

export function mapAdminWalletSummary(response) {
  const raw = unwrapData(response);
  if (!raw || typeof raw !== "object") return null;

  const auctionFees = toNumber(
    raw.auctionFees ?? raw.totalPlatformFeeRevenue,
    0,
  );
  const deposits = toNumber(raw.deposits ?? raw.totalDeposits, 0);
  const withdrawals = toNumber(raw.withdrawals ?? raw.totalWithdrawals, 0);
  const successfulTransactions = toNumber(
    raw.successfulTransactions ?? raw.totalTransactions,
    0,
  );

  return {
    ...raw,
    auctionFees,
    deposits,
    withdrawals,
    successfulTransactions,
    totalPlatformFeeRevenue: auctionFees,
    totalDeposits: deposits,
    totalWithdrawals: withdrawals,
  };
}
