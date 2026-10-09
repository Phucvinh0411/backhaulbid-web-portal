"use client";

import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

/** Detail surface: centered dialog ("modal") or right drawer; full screen on phones either way. */
export const DetailDrawer = ({ open, onClose, title, children, width = 450, variant = "drawer" }) => {
  const theme = useTheme();
  const phone = useMediaQuery(theme.breakpoints.down("sm"));

  const header = (
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
      <Typography component="h2" sx={{ fontWeight: 700, fontSize: "1.0625rem", overflowWrap: "anywhere" }}>
        {title}
      </Typography>
      <IconButton onClick={onClose} aria-label="Đóng chi tiết" sx={{ width: 44, height: 44, mr: -1, flexShrink: 0 }}>
        <CloseIcon />
      </IconButton>
    </Box>
  );

  if (variant === "modal") {
    return (
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="md" fullScreen={phone} scroll="paper">
        <DialogTitle sx={{ py: 1, borderBottom: "1px solid", borderColor: "divider" }}>{header}</DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 3 }, pb: "calc(16px + var(--safe-bottom))" }}>{children}</DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: "100%", sm: width } } }}>
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <Box sx={{ px: 2, py: 1, position: "sticky", top: 0, bgcolor: "background.paper", borderBottom: "1px solid", borderColor: "divider", zIndex: 1 }}>{header}</Box>
        <Box sx={{ p: 2, flex: 1, overflowY: "auto", pb: "calc(16px + var(--safe-bottom))" }}>{children}</Box>
      </Box>
    </Drawer>
  );
};
