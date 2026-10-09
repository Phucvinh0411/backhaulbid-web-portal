"use client";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";

/** Dialog that becomes full-screen on phones so forms are not squeezed under the keyboard. */
export default function ResponsiveDialog({ open, onClose, title, children, actions, maxWidth = "sm", busy = false, titleId = "responsive-dialog-title" }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const handleClose = (event, reason) => {
    if (busy) return;
    onClose?.(event, reason);
  };
  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth={maxWidth} fullScreen={fullScreen} aria-labelledby={titleId}>
      <DialogTitle
        id={titleId}
        sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, borderBottom: "1px solid", borderColor: "divider", py: 1 }}
      >
        {title}
        <IconButton onClick={handleClose} aria-label="Đóng" disabled={busy} sx={{ width: 44, height: 44, mr: -1 }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{ pt: "16px !important" }}>{children}</DialogContent>
      {actions && (
        <DialogActions sx={{ px: 3, pt: 1.5, pb: "calc(12px + var(--safe-bottom))", borderTop: "1px solid", borderColor: "divider", gap: 1, flexWrap: "wrap" }}>
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
}
