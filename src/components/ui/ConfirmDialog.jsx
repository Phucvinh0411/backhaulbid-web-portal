"use client";

import { useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";

/**
 * Replaces window.confirm: states what will happen, keeps "Hủy" as the safe default and
 * stays open (buttons disabled) while the action runs.
 */
export default function ConfirmDialog({ open, title, message, confirmLabel, tone = "error", onConfirm, onClose }) {
  const [busy, setBusy] = useState(false);
  const close = () => {
    if (!busy) onClose?.();
  };
  const confirm = async () => {
    setBusy(true);
    try {
      await onConfirm?.();
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog open={open} onClose={close} maxWidth="xs" fullWidth aria-labelledby="confirm-dialog-title" aria-describedby="confirm-dialog-message">
      <DialogTitle id="confirm-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <Typography id="confirm-dialog-message" variant="body2" sx={{ color: "text.secondary" }}>
          {message}
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button variant="outlined" onClick={close} disabled={busy} autoFocus>
          Hủy
        </Button>
        <Button variant="contained" color={tone} onClick={confirm} disabled={busy}>
          {busy ? "Đang xử lý..." : confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
