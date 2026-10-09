"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export default function Footer() {
  return (
    <Box component="footer" sx={{ mt: "auto", py: 2, borderTop: "1px solid", borderColor: "divider" }}>
      <Typography variant="body2" sx={{ color: "text.secondary", fontSize: "0.8125rem" }}>
        © {new Date().getFullYear()} BackHaulBid · Nền tảng đấu giá và giao dịch vận tải
      </Typography>
    </Box>
  );
}
