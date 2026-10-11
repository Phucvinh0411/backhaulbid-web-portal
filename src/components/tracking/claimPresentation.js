// Pure presentation of insurance claims for the shipper and the carrier. The wording never says a claim was sent to an
// insurer or approved by one. The platform prepares the file and hands it to the trip's carrier; the carrier deals
// with the insurer. Provider states appear only for a provider's own confirmed answer, which this version never sets.
import { VALUE_DOCUMENT_KIND_LABEL } from "../shipper/create-auction/valueDocumentChecklist.js";

export const CLAIM_INCIDENT_LABEL = {
  DAMAGE: "Hư hỏng hàng hóa",
  LOSS: "Thất lạc",
  THEFT: "Mất trộm",
};

export const CLAIM_EVIDENCE_KIND_LABEL = {
  INVOICE: "Hóa đơn",
  RECEIPT: "Biên nhận",
  CONTRACT: "Hợp đồng mua bán",
  PAYMENT_PROOF: "Chứng từ thanh toán",
  PHOTO: "Ảnh hàng",
  VIDEO: "Video",
  PACKAGING: "Ảnh bao bì hoặc phần hư hỏng",
  CARRIER_CONFIRMATION: "Xác nhận của nhà vận chuyển",
  POLICE_REPORT: "Báo công an",
  OTHER: "Tài liệu khác",
};

/** Labels for the trip's order documents (goods-value documents). Same kinds as the auction form. */
export const CARGO_DOCUMENT_KIND_LABEL = VALUE_DOCUMENT_KIND_LABEL;

export const CLAIM_STATUS_LABEL = {
  DRAFT: "Nháp",
  NEEDS_EVIDENCE: "Cần bổ sung chứng cứ",
  READY_TO_SHARE: "Sẵn sàng chia sẻ với nhà xe",
  SHARED_WITH_CARRIER: "Đã chia sẻ với nhà xe",
  CARRIER_ACKNOWLEDGED: "Nhà xe đã xác nhận nhận hồ sơ",
  // Reserved for a provider's own confirmed answer. This application never sets these states.
  SUBMITTED: "Nhà bảo hiểm đã nhận hồ sơ (do nhà cung cấp xác nhận)",
  UNDER_REVIEW: "Nhà bảo hiểm đang xem xét (do nhà cung cấp xác nhận)",
  APPROVED: "Nhà bảo hiểm chấp nhận (do nhà cung cấp xác nhận)",
  DENIED: "Nhà bảo hiểm từ chối (do nhà cung cấp xác nhận)",
  CLOSED: "Đã đóng",
};

/** Shown on every claim panel. Guidance for preparing the file, not a legal condition or a promise of payment. */
export const CLAIM_GUIDANCE_TEXT =
  "Giữ nguyên bao bì và hàng hư hỏng để nhà bảo hiểm kiểm tra. Chuẩn bị mã chuyến, chứng từ giá trị hàng, ảnh hoặc video và các tài liệu đơn vị bảo hiểm yêu cầu. Nền tảng chỉ chuẩn bị và chuyển hồ sơ cho nhà xe; không phải cam kết bồi thường.";

export const CLAIM_SHARE_CONFIRM_TEXT =
  "Nhà xe của chuyến này sẽ xem và tải được hồ sơ ở phiên bản này. Nền tảng không gửi hồ sơ cho nhà bảo hiểm và không bảo đảm nhà bảo hiểm chấp nhận hồ sơ.";

/** Claim statuses that still take new evidence. A shared claim takes it as a new revision that must be shared again. */
const EVIDENCE_OPEN = ["DRAFT", "NEEDS_EVIDENCE", "READY_TO_SHARE", "SHARED_WITH_CARRIER", "CARRIER_ACKNOWLEDGED"];
const PREPARING = ["DRAFT", "NEEDS_EVIDENCE", "READY_TO_SHARE"];

export function claimAcceptsEvidence(claim) {
  return EVIDENCE_OPEN.includes(claim.status);
}

export function claimCanBeChecked(claim) {
  return PREPARING.includes(claim.status);
}

/** The share button shows only when the server says the checklist is complete. */
export function claimCanBeShared(claim) {
  return claim.status === "READY_TO_SHARE" && claim.canShare === true;
}

export function claimIsShared(claim) {
  return claim.sharedRevision != null;
}

function formatShareTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" }).format(date);
}

/** One line for the shipper about where the claim stands. */
export function getClaimNotice(claim) {
  if (claim.status === "READY_TO_SHARE") {
    if (claim.shareStale) {
      return "Có chứng cứ bổ sung sau lần chia sẻ trước. Chia sẻ lại để nhà xe nhận phiên bản mới; phiên bản đã chia sẻ không bị thay đổi.";
    }
    return "Hồ sơ đã đủ chứng cứ để chia sẻ với nhà xe. Chưa chia sẻ: nền tảng chỉ chuyển hồ sơ, không gửi cho nhà bảo hiểm.";
  }
  if (claim.status === "SHARED_WITH_CARRIER") {
    return `Đã chia sẻ với nhà xe${claim.sharedAt ? ` lúc ${formatShareTime(claim.sharedAt)}` : ""} (phiên bản ${claim.sharedRevision}). Đang chờ nhà xe xác nhận đã nhận.`;
  }
  if (claim.status === "CARRIER_ACKNOWLEDGED") {
    return "Nhà xe đã xác nhận nhận hồ sơ. Nhà xe tự làm việc với đơn vị bảo hiểm; nền tảng không biết kết quả.";
  }
  if (claim.status === "DRAFT" || claim.status === "NEEDS_EVIDENCE") {
    const missing = Array.isArray(claim.missingItems) ? claim.missingItems : [];
    return missing.length > 0 ? `Còn thiếu: ${missing.join("; ")}.` : "Thêm chứng cứ rồi kiểm tra hồ sơ.";
  }
  return CLAIM_STATUS_LABEL[claim.status] ?? "Trạng thái chưa xác định.";
}

/** Carrier-side line: what was shared and whether the carrier confirmed receiving it. */
export function getCarrierClaimNotice(claim) {
  const shared = formatShareTime(claim.sharedAt);
  const sharedLine = `Chủ hàng chia sẻ${shared ? ` lúc ${shared}` : ""} (phiên bản ${claim.sharedRevision}).`;
  if (claim.acknowledged) {
    return `${sharedLine} Bạn đã xác nhận nhận hồ sơ. Việc làm với đơn vị bảo hiểm do nhà xe thực hiện ngoài nền tảng.`;
  }
  return `${sharedLine} Hãy tải gói hồ sơ và xác nhận đã nhận. Xác nhận này chỉ ghi nhận việc nhận hồ sơ, không phải quyết định của bảo hiểm.`;
}

/** Largest file the shipper may attach as evidence, in bytes (the upload service has its own limit too). */
export const CLAIM_EVIDENCE_MAX_BYTES = 10 * 1024 * 1024;

export function validateClaimDraft({ incidentType, occurredAt, description, claimedAmount, now = new Date() }) {
  if (!CLAIM_INCIDENT_LABEL[incidentType]) return "Chọn loại sự cố.";
  if (!occurredAt) return "Nhập thời điểm xảy ra sự cố.";
  const when = new Date(occurredAt);
  if (Number.isNaN(when.getTime()) || when.getTime() > now.getTime() + 5 * 60 * 1000) {
    return "Thời điểm sự cố không được ở tương lai.";
  }
  const text = String(description ?? "").trim();
  if (text.length < 10) return "Mô tả sự cố cần ít nhất 10 ký tự.";
  if (text.length > 1000) return "Mô tả sự cố tối đa 1000 ký tự.";
  const amount = String(claimedAmount ?? "").trim();
  if (amount && (!/^\d{1,12}(\.\d{1,2})?$/.test(amount) || Number(amount) <= 0)) {
    return "Số tiền yêu cầu phải là số dương, tối đa 2 chữ số thập phân.";
  }
  return "";
}

export function validateEvidenceFile(file) {
  if (!file) return "Chọn một tệp.";
  if (file.size > CLAIM_EVIDENCE_MAX_BYTES) return "Tệp tối đa 10 MB.";
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];
  if (!allowed.includes(file.type)) return "Chỉ nhận ảnh JPEG, PNG, WebP, GIF hoặc PDF.";
  return "";
}
