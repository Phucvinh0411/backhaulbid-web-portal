"use client";

import AccessTimeIcon from "@mui/icons-material/AccessTimeOutlined";
import LocalShippingIcon from "@mui/icons-material/LocalShippingOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircleOutlined";
import CancelIcon from "@mui/icons-material/CancelOutlined";
import EmojiEventsIcon from "@mui/icons-material/EmojiEventsOutlined";

const STATUS_CONFIG = {
  // Shipper statuses
  pending_bids: {
    label: "Chờ đấu giá",
    bgColor: "bg-info-soft",
    textColor: "text-info",
    borderColor: "border-info-soft",
    icon: <AccessTimeIcon className="!text-[0.8rem]" />,
  },
  active_bids: {
    label: "Đang đấu giá",
    bgColor: "bg-success-soft",
    textColor: "text-success",
    borderColor: "border-success-soft",
    pulse: true,
  },
  awarded: {
    label: "Đã chốt thầu",
    bgColor: "bg-brand-soft",
    textColor: "text-brand",
    borderColor: "border-brand-soft",
    icon: <EmojiEventsIcon className="!text-[0.8rem]" />,
  },
  shipping: {
    label: "Đang vận chuyển",
    bgColor: "bg-warning-soft",
    textColor: "text-warning",
    borderColor: "border-warning-soft",
    icon: <LocalShippingIcon className="!text-[0.8rem]" />,
  },
  completed: {
    label: "Hoàn thành",
    bgColor: "bg-surface-sunken",
    textColor: "text-ink-muted",
    borderColor: "border-line",
    icon: <CheckCircleIcon className="!text-[0.8rem]" />,
  },
  cancelled: {
    label: "Đã hủy",
    bgColor: "bg-danger-soft",
    textColor: "text-danger",
    borderColor: "border-danger-soft",
    icon: <CancelIcon className="!text-[0.8rem]" />,
  },

  // Carrier statuses
  OPEN_REGISTER: {
    label: "Chờ mở phiên",
    bgColor: "bg-info-soft",
    textColor: "text-info",
    borderColor: "border-info-soft",
  },
  BIDDING: {
    label: "Đang đấu giá",
    bgColor: "bg-success-soft",
    textColor: "text-success",
    borderColor: "border-success-soft",
    pulse: true,
  },
  CLOSED: {
    label: "Đã đóng",
    bgColor: "bg-surface-sunken",
    textColor: "text-ink-muted",
    borderColor: "border-line",
  },
};

export default function AuctionStatusBadge({
  status,
  labelOverride,
  size = "md",
  showPulse = true,
  className = "",
}) {
  const cfg = STATUS_CONFIG[status] || {
    label: labelOverride || status || "Khác",
    bgColor: "bg-surface-sunken",
    textColor: "text-ink-muted",
    borderColor: "border-line",
  };

  const label = labelOverride || cfg.label;
  const isPulse = showPulse && cfg.pulse;

  const sizeClasses = {
    sm: "text-[0.62rem] px-2 py-0.5 gap-1",
    md: "text-[0.68rem] px-2.5 py-1 gap-1.5",
    lg: "text-xs px-3 py-1.5 gap-1.5 font-bold",
  };

  return (
    <span
      className={`inline-flex items-center font-extrabold rounded-full border whitespace-nowrap shrink-0 transition-colors ${
        sizeClasses[size] || sizeClasses.md
      } ${cfg.bgColor} ${cfg.textColor} ${cfg.borderColor} ${className}`}
    >
      {isPulse ? (
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
        </span>
      ) : (
        cfg.icon
      )}
      {label}
    </span>
  );
}
