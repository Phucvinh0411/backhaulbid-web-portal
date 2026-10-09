// Pure presentation of a pickup handover record. Wording follows the saved record only: a record without the
// shipper's confirmation never reads as handed over, and the handover never reads as insurance or a policy.

export const HANDOVER_CONDITION_LABEL = {
  GOOD: "Nguyên vẹn",
  DAMAGED: "Có hư hỏng (đã ghi chú)",
};

export const HANDOVER_RECORDER_LABEL = {
  DRIVER: "Tài xế ghi",
  CARRIER: "Nhà xe ghi",
};

/**
 * What the shipper or carrier should see for the pickup handover.
 * `canConfirm` is true only for the shipper's confirmation step: the trip still waits for pickup and the
 * record has at least one photo. The server enforces the same rules.
 */
export function getHandoverState({ handover, tripStatus }) {
  if (!handover) {
    return {
      state: "NONE",
      canConfirm: false,
      message: tripStatus === "WAITING_PICKUP"
        ? "Tài xế chưa ghi biên bản bàn giao. Biên bản cần có ảnh hàng hóa và xác nhận của chủ hàng trước khi lấy hàng."
        : "Chuyến này không có biên bản bàn giao.",
    };
  }
  if (handover.shipperConfirmedAt) {
    return { state: "CONFIRMED", canConfirm: false, message: "Chủ hàng đã xác nhận bàn giao hàng cho tài xế." };
  }
  const hasPhotos = Array.isArray(handover.photoPaths) && handover.photoPaths.length > 0;
  const canConfirm = tripStatus === "WAITING_PICKUP" && hasPhotos;
  return {
    state: "PENDING_CONFIRMATION",
    canConfirm,
    message: canConfirm
      ? "Kiểm tra biên bản và ảnh, rồi xác nhận đã giao hàng cho tài xế."
      : "Biên bản chưa có ảnh hàng hóa nên chưa xác nhận được.",
  };
}

/** Name the shipper must type to confirm: required, trimmed, at most 120 characters. */
export function validateSignerName(value) {
  const name = String(value ?? "").trim();
  if (!name) return "Nhập tên người giao hàng để xác nhận.";
  if (name.length > 120) return "Tên người giao hàng tối đa 120 ký tự.";
  return "";
}
