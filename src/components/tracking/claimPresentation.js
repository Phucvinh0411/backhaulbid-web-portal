// Pure presentation of insurance claim drafts for the shipper. The wording never says a claim was sent or
// approved by a provider: this application only prepares the file. "Đã gửi" or "chấp nhận" appear only for
// states a provider has confirmed, which this version never sets.

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

export const CLAIM_STATUS_LABEL = {
  DRAFT: "Nháp",
  NEEDS_EVIDENCE: "Cần bổ sung chứng cứ",
  READY_FOR_PROVIDER: "Đủ chứng cứ để chuẩn bị gửi (chưa gửi)",
  SUBMITTED: "Nhà cung cấp đã nhận hồ sơ",
  UNDER_REVIEW: "Nhà cung cấp đang xem xét",
  APPROVED: "Nhà cung cấp chấp nhận",
  DENIED: "Nhà cung cấp từ chối",
  CLOSED: "Đã đóng",
};

/** Shown on every claim panel. Guidance for preparing the file, not a legal condition or a promise of payment. */
export const CLAIM_GUIDANCE_TEXT =
  "Giữ nguyên bao bì và hàng hư hỏng để nhà cung cấp kiểm tra. Chuẩn bị mã chuyến, chứng từ giá trị hàng, ảnh hoặc video và các tài liệu nhà cung cấp yêu cầu. Đây chỉ là hướng dẫn chuẩn bị hồ sơ, không phải cam kết bồi thường.";

/** One line for the shipper about where the claim stands. */
export function getClaimNotice(claim) {
  if (claim.status === "READY_FOR_PROVIDER") {
    return "Hồ sơ đã đủ chứng cứ để chuẩn bị. BackhaulBid chưa gửi hồ sơ cho nhà cung cấp; hãy nộp theo hướng dẫn của nhà cung cấp.";
  }
  if (claim.status === "DRAFT" || claim.status === "NEEDS_EVIDENCE") {
    const missing = Array.isArray(claim.missingItems) ? claim.missingItems : [];
    return missing.length > 0 ? `Còn thiếu: ${missing.join("; ")}.` : "Thêm chứng cứ rồi kiểm tra hồ sơ.";
  }
  return CLAIM_STATUS_LABEL[claim.status] ?? "Trạng thái chưa xác định.";
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
