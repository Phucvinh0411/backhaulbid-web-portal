// Presentation and client checks for a carrier's cargo-liability certificate. Pure: no imports, no network.
// The server decides eligibility; these helpers only word what it returned and keep bad input off the wire.
export const CARGO_CERTIFICATE_FOLDER = "business-verifications/insurance";
export const CARGO_COVERAGE_CHECKBOX_LABEL =
  "Yêu cầu nhà xe cung cấp bằng chứng bảo hiểm trách nhiệm hàng hóa còn hiệu lực.";

const CERTIFICATE_MAX_BYTES = 15 * 1024 * 1024;
const CERTIFICATE_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/webp", "image/gif"];
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** "2027-12-31" becomes "31/12/2027". Parsed by hand so the day never shifts with the viewer's timezone. */
export function formatIsoDateVi(value) {
  const match = ISO_DATE.exec(String(value ?? "").slice(0, 10));
  return match ? `${match[3]}/${match[2]}/${match[1]}` : "";
}

/** The label on a carrier's public profile. Only an admin-verified, unexpired certificate says "Đã xác minh". */
export function cargoLiabilityLabel(verifiedUntil) {
  const date = formatIsoDateVi(verifiedUntil);
  return date ? `Đã xác minh đến ${date}` : "Chưa xác minh";
}

/**
 * What the carrier sees about the certificate. `status` is the server's Status: eligible, verifiedUntil and the newest
 * submission. canSubmit is false only while a submission is still waiting for review.
 */
export function summarizeCargoLiability({ eligible = false, verifiedUntil = null, latest = null } = {}) {
  const state = latest?.status ?? null;
  const validUntil = formatIsoDateVi(verifiedUntil);

  if (state === "PENDING") {
    return {
      tone: "warning",
      canSubmit: false,
      text: eligible && validUntil
        ? `Đã xác minh đến ${validUntil}. Chứng từ mới đang chờ quản trị viên xét duyệt.`
        : "Chứng từ đã gửi đang chờ quản trị viên xét duyệt.",
    };
  }
  if (eligible) {
    return { tone: "success", canSubmit: true, text: `Đã xác minh đến ${validUntil}.` };
  }
  if (state === "REJECTED") {
    return {
      tone: "error",
      canSubmit: true,
      text: `Chứng từ gần nhất bị từ chối: ${latest.rejectionReason || "không có lý do cụ thể"}. Vui lòng gửi lại.`,
    };
  }
  if (state === "EXPIRED" || state === "VERIFIED") {
    return { tone: "warning", canSubmit: true, text: "Chứng từ gần nhất đã hết hạn. Vui lòng gửi chứng từ mới." };
  }
  return {
    tone: "info",
    canSubmit: true,
    text: "Chưa có chứng từ. Chỉ cần gửi khi muốn tham gia các phiên đấu giá yêu cầu bằng chứng bảo hiểm.",
  };
}

/** Returns the error to show, or "" when the file may be uploaded. */
export function validateCertificateFile(file) {
  if (!file) return "Chọn một tệp chứng từ bảo hiểm.";
  if (!CERTIFICATE_TYPES.includes(file.type)) return "Chứng từ phải là PDF hoặc ảnh (PNG, JPEG, WebP, GIF).";
  if (file.size > CERTIFICATE_MAX_BYTES) return "Tệp vượt quá 15 MB.";
  return "";
}

function localIsoDate(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Checks everything except the upload, so a bad form never costs an upload. Returns the error or "". */
export function validateCertificateForm(form, file, today = new Date()) {
  if (!String(form?.providerName ?? "").trim()) return "Nhập tên công ty bảo hiểm.";
  if (!String(form?.policyNumber ?? "").trim()) return "Nhập số hợp đồng bảo hiểm.";
  if (!ISO_DATE.test(String(form?.expiredDate ?? ""))) return "Chọn ngày hết hạn của hợp đồng.";
  if (form.expiredDate < localIsoDate(today)) return "Ngày hết hạn phải từ hôm nay trở đi.";
  const limit = String(form?.coverageLimit ?? "").trim();
  if (limit && !(Number(limit) > 0)) return "Số tiền bảo hiểm phải lớn hơn 0 hoặc để trống.";
  return validateCertificateFile(file);
}

/** The body for POST /api/v1/cargo-liability. Call only after validateCertificateForm passed. */
export function buildCertificateSubmission(form, certificateKey) {
  const limit = String(form.coverageLimit ?? "").trim();
  return {
    providerName: form.providerName.trim(),
    policyNumber: form.policyNumber.trim(),
    coverageLimit: limit ? Number(limit) : null,
    expiredDate: form.expiredDate,
    certificateKey,
  };
}
