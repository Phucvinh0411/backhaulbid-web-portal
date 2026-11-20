"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { ResponsiveDialog } from "@/components/ui";

export function WalletDetailRow({ label, value }) {
  return (
    <Box className="flex items-start justify-between gap-4 border-b border-line py-2 last:border-b-0">
      <Typography variant="body2" className="text-ink-muted">{label}</Typography>
      <Typography variant="body2" className="text-right font-semibold text-ink break-all">{value || "Chưa cập nhật"}</Typography>
    </Box>
  );
}

export default function WalletDetailDialog({ open, onClose, title, loading, children }) {
  return (
    <ResponsiveDialog
      open={open}
      onClose={onClose}
      title={title}
      titleId="wallet-detail-dialog-title"
      maxWidth="sm"
      actions={
        <Button onClick={onClose} variant="text">Đóng</Button>
      }
    >
      {loading ? (
        <Box className="flex min-h-32 items-center justify-center">
          <CircularProgress aria-label="Đang tải chi tiết" />
        </Box>
      ) : children}
    </ResponsiveDialog>
  );
}
