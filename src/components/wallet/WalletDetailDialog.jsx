"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";

export function WalletDetailRow({ label, value }) {
  return (
    <Box className="flex items-start justify-between gap-4 border-b border-slate-100 py-2 last:border-b-0">
      <Typography variant="body2" className="text-slate-500">{label}</Typography>
      <Typography variant="body2" className="text-right font-semibold text-slate-800 break-all">{value || "Chưa cập nhật"}</Typography>
    </Box>
  );
}

export default function WalletDetailDialog({ open, onClose, title, loading, children }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ className: "!rounded-3xl !p-2" }}>
      <DialogTitle className="!font-bold text-slate-800">{title}</DialogTitle>
      <DialogContent className="!pt-2">
        {loading ? (
          <Box className="flex min-h-32 items-center justify-center">
            <CircularProgress aria-label="Đang tải chi tiết" />
          </Box>
        ) : children}
      </DialogContent>
      <DialogActions className="!px-6 !pb-4">
        <Button onClick={onClose} variant="text" className="!font-bold !capitalize !rounded-xl">Đóng</Button>
      </DialogActions>
    </Dialog>
  );
}
