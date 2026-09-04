export const COMPLAINT_STATUS_META = Object.freeze({
  PENDING: { label: "Chờ xử lý", tone: "warning", color: "warning", closed: false },
  PROCESSING: { label: "Đang xử lý", tone: "info", color: "info", closed: false },
  RESOLVED: { label: "Đã giải quyết", tone: "success", color: "success", closed: true },
  REJECTED: { label: "Đã từ chối", tone: "danger", color: "error", closed: true },
});

export const COMPLAINT_DECISION_LABELS = Object.freeze({
  SHIPPER_WIN: "Chủ hàng thắng khiếu nại",
  CARRIER_WIN: "Nhà xe thắng khiếu nại",
  BOTH: "Hai bên cùng chịu trách nhiệm",
});

export const COMPLAINT_ROLE_LABELS = Object.freeze({
  CARRIER: "Nhà xe",
  SHIPPER: "Chủ hàng",
  ADMIN: "Quản trị viên",
});

export function getComplaintStatusMeta(status) {
  return COMPLAINT_STATUS_META[status] || {
    label: status || "Chưa xác định",
    tone: "neutral",
    color: "default",
    closed: false,
  };
}

export function isComplaintClosed(status) {
  return getComplaintStatusMeta(status).closed;
}

export function getComplaintDecisionLabel(decision) {
  return COMPLAINT_DECISION_LABELS[decision] || decision || "Chưa có kết luận";
}

export function formatComplaintTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa cập nhật";
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export function normalizeComplaintCollection(response) {
  if (Array.isArray(response)) return response;
  return Array.isArray(response?.data) ? response.data : [];
}
