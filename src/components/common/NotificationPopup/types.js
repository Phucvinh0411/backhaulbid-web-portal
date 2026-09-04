/**
 * Notification severity types and default configuration
 * for the global NotificationPopup system.
 */

export const NOTIFICATION_TYPES = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
};

export const DEFAULT_DURATION_MS = 6000;
export const MIN_DURATION_MS = 2000;
export const MAX_STACK_COUNT = 5;

export const TYPE_CONFIG = {
  [NOTIFICATION_TYPES.SUCCESS]: {
    icon: "check_circle",
    tone: "success",
    label: "Thành công",
  },
  [NOTIFICATION_TYPES.ERROR]: {
    icon: "error",
    tone: "error",
    label: "Lỗi",
  },
  [NOTIFICATION_TYPES.WARNING]: {
    icon: "warning",
    tone: "warning",
    label: "Cảnh báo",
  },
  [NOTIFICATION_TYPES.INFO]: {
    icon: "info",
    tone: "info",
    label: "Thông báo",
  },
};
