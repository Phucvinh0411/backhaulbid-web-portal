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
  if (Array.isArray(payload?.errors) && payload.errors.length > 0) {
    const errorStrings = payload.errors
      .map((e) => (typeof e === "string" ? e : e?.defaultMessage || e?.message))
      .filter(Boolean);
    if (errorStrings.length > 0) return errorStrings.join("; ");
  }
  const message = payload?.error?.message
    || payload?.message
    || (typeof payload?.error === "string" ? payload.error : undefined)
    || error?.message;

  return Array.isArray(message) ? message.join(", ") : message;
}

const BID_MESSAGES = [
  [/bid must be lower than the current lowest bid/i, "Giá vừa có người đặt thấp hơn. Hãy nhập giá thấp hơn giá thấp nhất hiện tại."],
  [/improve the current lowest bid by at least the price step/i, "Giá phải thấp hơn giá thấp nhất hiện tại ít nhất một bước giá."],
  [/maximum number of bids/i, "Bạn đã dùng hết số lượt đặt giá của phiên này."],
  [/auction is not accepting bids/i, "Phiên không còn nhận giá. Có thể phiên vừa kết thúc."],
  [/positive and not exceed maxprice/i, "Giá phải lớn hơn 0 và không vượt giá trần."],
  [/carrier cannot bid: ?payment_incomplete/i, "Bạn cần hoàn tất thanh toán đăng ký trước khi đặt giá."],
  [/carrier cannot bid: ?(waiting_for_start)/i, "Phòng chưa mở. Bạn chỉ đặt giá được khi đến giờ bắt đầu."],
  [/carrier cannot bid: ?(registration_required|registration_closed|registration_cancelled)/i, "Bạn chưa có đăng ký hợp lệ cho phiên này."],
  [/carrier cannot bid: ?(auction_completed|auction_cancelled)/i, "Phiên đã kết thúc hoặc đã bị hủy."],
  [/carrier cannot bid: ?reputation_too_low/i, "Điểm uy tín chưa đạt mức tối thiểu để tham gia phiên."],
  [/registration for this auction is closed/i, "Phiên đã đóng đăng ký."],
  [/auction is not accepting registrations/i, "Phiên hiện không nhận đăng ký."],
  [/only sealed auctions require winner selection/i, "Chỉ phiên đấu giá kín mới cần chọn người thắng."],
  [/auction must be completed before selecting a winner/i, "Chỉ chọn người thắng được sau khi phiên kết thúc."],
  [/only pending or open auctions can be cancelled/i, "Chỉ hủy được phiên chưa kết thúc."],
  [/carrier must sign the contract first/i, "Nhà xe cần ký hợp đồng trước, sau đó chủ hàng mới ký."],
  [/contract signing deadline has passed/i, "Đã quá hạn ký hợp đồng."],
  [/complaint is already closed/i, "Khiếu nại đã đóng, không thể cập nhật thêm."],
  [/invalid trip status transition/i, "Trạng thái chuyến đã thay đổi. Hãy tải lại để xem bước tiếp theo."],
  [/cannot (update|add proof to|add tracking to|update location for) a closed trip/i, "Chuyến đã kết thúc, không thể cập nhật thêm."],
  [/incident note is required/i, "Vui lòng mô tả sự cố."],
];

export function translateBidMessage(message) {
  const normalized = String(message || "");
  const match = BID_MESSAGES.find(([pattern]) => pattern.test(normalized));
  return match ? match[1] : undefined;
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
  if (/contact phone is invalid/i.test(normalized)) {
    return "Số điện thoại người liên hệ không hợp lệ (cần từ 8 đến 30 chữ số).";
  }
  if (/contact phone is required/i.test(normalized)) {
    return "Vui lòng nhập số điện thoại người liên hệ.";
  }
  if (/contact name is required/i.test(normalized)) {
    return "Vui lòng nhập tên người liên hệ.";
  }
  if (/address label is required/i.test(normalized)) {
    return "Vui lòng nhập tên địa chỉ kho.";
  }
  if (/coordinates must be a complete pair/i.test(normalized)) {
    return "Tọa độ vị trí kho không hợp lệ hoặc thiếu kinh độ/vĩ độ.";
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
  const bidMessage = translateBidMessage(normalized);
  if (bidMessage) return bidMessage;
  if (/insufficient (available )?balance/i.test(normalized)) {
    return "Số dư ví không đủ để thanh toán. Vui lòng nạp thêm tiền rồi thử lại.";
  }
  if (/wallet did not return a creation fee hold|wallet service did not return a valid creation fee hold|wallet service returned an invalid response/i.test(normalized)) {
    return "Dịch vụ ví chưa trả về mã giữ phí tạo phiên. Giao dịch chưa hoàn tất; vui lòng thử lại sau hoặc liên hệ quản trị viên.";
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
