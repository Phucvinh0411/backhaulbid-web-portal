"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { AppCard } from "@/components/common";
import { RouteLine, StatusBadge } from "@/components/ui";

const STATUS_DESIGN = {
  PENDING_SIGNATURE: {
    label: "Chờ ký xác nhận",
    bgColor: "var(--color-warning-soft)",
    textColor: "var(--color-warning)",
    borderColor: "var(--color-warning-soft)",
    pulse: true,
  },
  ACTIVE: {
    label: "Đang hoạt động",
    bgColor: "var(--color-success-soft)",
    textColor: "var(--color-success)",
    borderColor: "var(--color-success-soft)",
  },
  COMPLETED: {
    label: "Đã hoàn thành",
    bgColor: "var(--color-surface-sunken)",
    textColor: "var(--color-ink-muted)",
    borderColor: "var(--color-line)",
  },
  CANCELLED: {
    label: "Đã hủy",
    bgColor: "var(--color-danger-soft)",
    textColor: "var(--color-danger)",
    borderColor: "var(--color-danger-soft)",
  },
  EXPIRED: {
    label: "Hợp đồng hết hạn",
    bgColor: "var(--color-surface-sunken)",
    textColor: "var(--color-ink-muted)",
    borderColor: "var(--color-line-strong)",
  },
};

export function getContractStatusDesign(status) {
  return (
    STATUS_DESIGN[status] || {
      label: status,
      bgColor: "var(--color-surface-sunken)",
      textColor: "var(--color-ink-muted)",
      borderColor: "var(--color-line)",
    }
  );
}


const TONES = { PENDING_SIGNATURE: "warning", ACTIVE: "brand", COMPLETED: "success", CANCELLED: "danger", EXPIRED: "neutral" };

function deadlineLabel(value) {
  const date = new Date(value);
  return value && Number.isFinite(date.getTime())
    ? new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short", timeZone: "Asia/Ho_Chi_Minh" }).format(date)
    : "";
}

export default function ContractItem({ contract, partnerLabel = "Đối tác", trackingHref, onSign, onViewDetail }) {
  const pending = contract.status === "PENDING_SIGNATURE";
  const deadline = pending ? deadlineLabel(contract.signingDeadlineAt) : "";
  return (
    <AppCard component="article" sx={{ height: "100%" }}>
      <Box sx={{ p: { xs: 2, sm: 2.5 }, display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1, flexWrap: "wrap" }}>
          <Typography variant="caption" sx={{ overflowWrap: "anywhere", color: "text.secondary" }}>{contract.id}</Typography>
          <StatusBadge label={getContractStatusDesign(contract.status).label} tone={TONES[contract.status] || "neutral"} />
        </Box>
        <RouteLine from={contract.origin} to={contract.destination} compact />
        <Typography className="tabular" sx={{ fontSize: "1.3rem", fontWeight: 700 }}>{contract.value}</Typography>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="caption" color="text.secondary">{partnerLabel}</Typography>
          <Typography variant="body2" sx={{ overflowWrap: "anywhere" }}>{contract.partner}</Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">Ngày lập: {contract.date}</Typography>
        {deadline && <Typography variant="body2" color="warning.dark">Hạn ký: {deadline}</Typography>}
        {pending && <Typography variant="body2" role="status" color="text.secondary">{contract.pendingMessage}</Typography>}
      </Box>
      <Box sx={{ p: 2, borderTop: "1px solid", borderColor: "divider", display: "flex", flexWrap: "wrap", gap: 1 }}>
        <Button variant="outlined" onClick={() => onViewDetail?.(contract)} sx={{ flex: 1 }}>Chi tiết</Button>
        {pending && contract.canSign && <Button variant="contained" onClick={() => onSign?.(contract)} sx={{ flex: 1 }}>Xác nhận ký</Button>}
        {["ACTIVE", "COMPLETED"].includes(contract.status) && trackingHref && <Button variant="contained" href={trackingHref} sx={{ flex: 1 }}>Theo dõi chuyến</Button>}
        {contract.pdfUrl && <Button variant="text" href={contract.pdfUrl} target="_blank" rel="noopener noreferrer">Mở PDF</Button>}
      </Box>
    </AppCard>
  );
}
