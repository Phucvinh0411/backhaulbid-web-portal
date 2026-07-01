"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";

export default function Footer() {
  return (
    <Box
      component="footer"
      className="py-4 px-6 mt-auto flex flex-col sm:flex-row items-center justify-between gap-3"
      sx={{
        backgroundColor: "rgba(255, 255, 255, 0.6)",
        backdropFilter: "blur(16px)",
        borderRadius: "16px",
        border: "1px solid rgba(255, 255, 255, 0.45)",
        boxShadow: "0 4px 24px 0 rgba(27, 73, 101, 0.02)",
      }}
    >
      <Typography variant="body2" className="!text-[0.8rem] text-slate-400">
        © {new Date().getFullYear()} <span className="font-semibold text-slate-600">BackHaulBid</span>. Nền tảng Đấu giá & Giao dịch Vận tải.
      </Typography>
      
      <Box className="flex items-center gap-6">
        <Link
          href="#"
          underline="none"
          variant="body2"
          className="!text-[0.78rem] text-slate-400 hover:text-[#1B4965] transition-colors"
        >
          Điều khoản
        </Link>
        <Link
          href="#"
          underline="none"
          variant="body2"
          className="!text-[0.78rem] text-slate-400 hover:text-[#1B4965] transition-colors"
        >
          Bảo mật
        </Link>
        <Link
          href="#"
          underline="none"
          variant="body2"
          className="!text-[0.78rem] text-slate-400 hover:text-[#1B4965] transition-colors"
        >
          Hỗ trợ
        </Link>
      </Box>
    </Box>
  );
}
