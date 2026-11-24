import { shortId } from "../lib/format.js";

const UUID_REGEX = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

export const TRANSACTION_TYPE_LABELS = {
  DEPOSIT: "Nạp tiền vào ví",
  WITHDRAW: "Rút tiền về ngân hàng",
  FREEZE: "Tạm giữ tiền đặt cọc",
  UNFREEZE: "Hoàn trả tiền đặt cọc",
  AUCTION_FEE: "Phí tham gia phiên đấu giá",
  REFUND: "Hoàn tiền",
  TRANSFER: "Điều chuyển số dư",
  PENALTY: "Khấu trừ tiền phạt",
};

const TRANSACTION_STATUS_LABELS = {
  SUCCESS: "Thành công",
  COMPLETED: "Thành công",
  PENDING: "Đang xử lý",
  FAILED: "Thất bại",
  CANCELLED: "Đã hủy",
};

const PAYMENT_METHOD_LABELS = {
  INTERNAL_WALLET: "Ví nội bộ BackhaulBid",
  WALLET: "Ví nội bộ BackhaulBid",
  SEPAY: "Chuyển khoản ngân hàng (SePay)",
  SEPAY_QR: "Chuyển khoản QR (SePay)",
  VIETQR: "Chuyển khoản QR (SePay)",
  BANK_TRANSFER: "Chuyển khoản ngân hàng",
  MANUAL: "Chuyển khoản thủ công",
  SYSTEM: "Hệ thống tự động",
};

function shortenUuidsInText(text) {
  return String(text || "").replace(UUID_REGEX, (uuid) => `#${shortId(uuid)}`);
}

function isAuctionCreationFeeContext(transaction) {
  const ref = String(transaction?.referenceCode || "").toLowerCase();
  const desc = String(transaction?.description || "").toLowerCase();
  return ref.includes("auction_creation_fee") || desc.includes("auction_creation_fee");
}

function isWithdrawalHoldContext(transaction) {
  const ref = String(transaction?.referenceCode || "").toLowerCase();
  const desc = String(transaction?.description || "").toLowerCase();
  return ref.includes("withdrawal_hold") || ref.includes("withdrawal_release") || ref.startsWith("withdrawal:") || desc.includes("withdrawal request") || desc.includes("yêu cầu rút");
}

export function formatTransactionShortId(id) {
  return id ? `#${shortId(id)}` : "—";
}

export function formatTransactionTypeLabel(transaction) {
  const type = String(transaction?.type || "").toUpperCase();
  const ref = String(transaction?.referenceCode || "").toLowerCase();
  const desc = String(transaction?.description || "").toLowerCase();

  if (type === "PENALTY" && (isAuctionCreationFeeContext(transaction) || desc.includes("forfeit auction deposit hold"))) {
    return "Phí tạo phiên đấu giá";
  }
  if (type === "AUCTION_FEE") {
    return isAuctionCreationFeeContext(transaction) ? "Phí tạo phiên đấu giá" : "Phí tham gia phiên đấu giá";
  }
  if (type === "FREEZE") {
    if (ref.startsWith("withdrawal_hold:") || desc.includes("withdrawal")) {
      return "Tạm giữ yêu cầu rút tiền";
    }
    if (isAuctionCreationFeeContext(transaction)) {
      return "Tạm giữ phí tạo phiên đấu giá";
    }
    return "Tạm giữ tiền đặt cọc";
  }
  if (type === "UNFREEZE") {
    if (ref.startsWith("withdrawal_release:") || desc.includes("withdrawal")) {
      return "Hoàn tạm giữ yêu cầu rút tiền";
    }
    return "Hoàn trả tiền đặt cọc";
  }
  if (type === "TRANSFER" && (desc.includes("bồi thường") || ref.includes("delay"))) {
    return "Bồi thường giao hàng";
  }
  return TRANSACTION_TYPE_LABELS[type] || (isWithdrawalHoldContext(transaction) ? "Giao dịch rút tiền" : "Giao dịch ví");
}

export function formatTransactionStatusLabel(status) {
  const key = String(status || "").toUpperCase();
  return TRANSACTION_STATUS_LABELS[key] || "Không xác định";
}

export function formatPaymentMethodLabel(paymentMethod) {
  if (!paymentMethod) return "—";
  const key = String(paymentMethod).trim().toUpperCase();
  return PAYMENT_METHOD_LABELS[key] || paymentMethod;
}

export function formatTransactionReference(referenceCode) {
  if (!referenceCode) return "—";
  const raw = String(referenceCode).trim();
  let match = raw.match(/^auction_creation_fee_([^:]+)(?::(forfeit|refund))?$/i);
  if (match) {
    return `Phiên #${shortId(match[1])}`;
  }
  match = raw.match(/^WITHDRAWAL_(?:HOLD|RELEASE):(.+)$/i) || raw.match(/^WITHDRAWAL:(.+)$/i);
  if (match) {
    return `Yêu cầu rút #${shortId(match[1])}`;
  }
  match = raw.match(/^TOPUP:(.+)$/i);
  if (match) {
    return `Đơn nạp #${shortId(match[1])}`;
  }
  match = raw.match(/^([^:]+):deposit(?::(?:hold|release|forfeit))?$/i);
  if (match) {
    return `Đặt cọc #${shortId(match[1])}`;
  }
  if (/^[0-9a-f-]{36}$/i.test(raw)) {
    return `#${shortId(raw)}`;
  }
  return shortenUuidsInText(raw);
}

export function formatTransactionDescription(transaction) {
  const raw = String(transaction?.description || "").trim();
  const ref = String(transaction?.referenceCode || "").trim();
  if (!raw) return formatTransactionTypeLabel(transaction);

  const auctionMatch =
    raw.match(/auction_creation_fee.*auction\s+([^\s,]+)/i) ||
    ref.match(/^auction_creation_fee_([^:]+)/i);

  if (/^AUCTION_CREATION_FEE_REFUND/i.test(raw)) {
    const id = auctionMatch?.[1] || raw.split(/\s+/).pop();
    return `Hoàn phí tạo phiên đấu giá #${shortId(id)}`;
  }
  if (/^AUCTION_CREATION_FEE/i.test(raw)) {
    const id = auctionMatch?.[1] || raw.split(/\s+/).pop();
    return `Phí tạo phiên đấu giá #${shortId(id)}`;
  }
  if (/^Forfeit auction deposit hold\s+/i.test(raw)) {
    if (auctionMatch?.[1]) {
      return `Thanh toán phí tạo phiên đấu giá #${shortId(auctionMatch[1])}`;
    }
    const holdId = raw.replace(/^Forfeit auction deposit hold\s+/i, "").trim();
    return `Khấu trừ khoản tạm giữ #${shortId(holdId)}`;
  }
  if (/^Release auction deposit hold\s+/i.test(raw)) {
    const holdId = raw.replace(/^Release auction deposit hold\s+/i, "").trim();
    return `Hoàn trả khoản tạm giữ đặt cọc #${shortId(holdId)}`;
  }
  if (/^Hold for withdrawal request\s+/i.test(raw)) {
    const wdId = raw.replace(/^Hold for withdrawal request\s+/i, "").trim();
    return `Tạm giữ số dư cho yêu cầu rút tiền #${shortId(wdId)}`;
  }
  if (/^Release withdrawal hold\s+/i.test(raw) || /^Reject(?:ed)? withdrawal\s+/i.test(raw)) {
    const wdId = raw.split(/\s+/).pop();
    return `Hoàn tạm giữ do từ chối yêu cầu rút tiền #${shortId(wdId)}`;
  }
  if (/^Approved manual withdrawal\s+/i.test(raw)) {
    const wdId = raw.replace(/^Approved manual withdrawal\s+/i, "").trim();
    return `Chi trả yêu cầu rút tiền #${shortId(wdId)}`;
  }
  if (/^Top\s?up/i.test(raw)) {
    const orderId = raw.split(/\s+/).pop();
    return `Nạp tiền vào ví qua SePay (${/order|sepay/i.test(raw) ? `#${shortId(orderId)}` : shortenUuidsInText(raw)})`;
  }
  return shortenUuidsInText(raw);
}
