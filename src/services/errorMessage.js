const CODE_MESSAGES = {
  WALLET_401: "Phiên đăng nhập hoặc xác thực ví đã hết hạn. Vui lòng đăng nhập lại rồi thử lại.",
  WALLET_403: "Tài khoản hiện tại không có quyền thực hiện thao tác ví này. Vui lòng kiểm tra đúng vai trò tài khoản.",
  WALLET_404: "Không tìm thấy giao dịch hoặc đơn thanh toán. Vui lòng tải lại danh sách rồi thử lại.",
  WALLET_409: "Đơn nạp hoặc giao dịch ví đang ở trạng thái không thể tiếp tục. Vui lòng kiểm tra số dư và trạng thái đơn rồi thử lại.",
  WALLET_422: "Thông tin thanh toán chưa hợp lệ hoặc số tiền không khớp. Vui lòng kiểm tra lại trước khi thử lại.",
};

const SAFE_VIETNAMESE_MESSAGE = /[À-ỹ]/u;
const TECHNICAL_MESSAGE = /(exception|stack|\.java|\.ts|\.js|\bat\s+|must be|required|invalid|not found|forbidden|unauthorized|failed|cannot|unable|payment order|wallet service|http|axios)/i;

function getRawMessage(error) {
  const payload = error?.response?.data;
  const message = payload?.error?.message
    || payload?.message
    || (typeof payload?.error === "string" ? payload.error : undefined)
    || error?.message;

  return Array.isArray(message) ? message.join(", ") : message;
}

function translateKnownMessage(message, status, code) {
  const normalized = String(message || "").trim();
  if (!normalized) return undefined;
  if (CODE_MESSAGES[code]) return CODE_MESSAGES[code];
  if (status === 401) return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại rồi thử lại.";
  if (status === 403 || /forbidden|do not have access|role required|permission/i.test(normalized)) {
    return "Tài khoản hiện tại không có quyền thực hiện thao tác này. Vui lòng kiểm tra đúng vai trò tài khoản.";
  }
  if (status === 404 || /not found/i.test(normalized)) {
    return "Không tìm thấy dữ liệu cần xử lý. Vui lòng tải lại trang rồi thử lại.";
  }
  if (/registrationStartTime must be before registrationEndTime/i.test(normalized)) {
    return "Thời điểm mở đăng ký phải trước thời điểm đóng đăng ký. Vui lòng kiểm tra lại khung thời gian.";
  }
  if (/registrationEndTime must be in the future/i.test(normalized)) {
    return "Thời điểm đóng đăng ký phải ở tương lai. Vui lòng chọn lại thời gian.";
  }
  if (/auction time order/i.test(normalized)) {
    return "Thứ tự thời gian phiên đấu giá chưa hợp lệ. Vui lòng kiểm tra thời điểm đăng ký và đấu giá.";
  }
  if (/insufficient (available )?balance/i.test(normalized)) {
    return "Số dư ví không đủ để thanh toán. Vui lòng nạp thêm tiền rồi thử lại.";
  }
  if (/wallet did not return a creation fee hold|wallet service did not return a valid creation fee hold|wallet service returned an invalid response/i.test(normalized)) {
    return "Dá»‹ch vá»¥ vÃ­ chÆ°a tráº£ vá» mÃ£ giá»¯ phÃ­ táº¡o phiÃªn. Giao dá»‹ch chÆ°a hoÃ n táº¥t; vui lÃ²ng thá»­ láº¡i sau hoáº·c liÃªn há»‡ quáº£n trá»‹ viÃªn.";
  }
  if (/payment amount does not match/i.test(normalized)) {
    return "Số tiền thanh toán không khớp với đơn nạp. Vui lòng kiểm tra lại đơn và thử lại.";
  }
  if (/unsupported|invalid.*(file|type|format)|file.*(large|size)/i.test(normalized)) {
    return "Tệp tải lên chưa đúng định dạng hoặc quá dung lượng. Vui lòng chọn tệp được hỗ trợ rồi thử lại.";
  }
  if (SAFE_VIETNAMESE_MESSAGE.test(normalized) && !TECHNICAL_MESSAGE.test(normalized)) return normalized;
  return undefined;
}

export function getApiErrorMessage(error, fallback = "Không thể thực hiện yêu cầu.") {
  const payload = error?.response?.data;
  const code = payload?.error?.code;
  const status = error?.response?.status || payload?.error?.details?.status;
  const message = translateKnownMessage(getRawMessage(error), status, code);
  return message || fallback;
}
