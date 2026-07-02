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
        backgroundColor: "rgba(255, 255, 255, 0.78)",
        backdropFilter: "blur(12px)",
        borderRadius: "12px",
        border: "1px solid rgba(226, 232, 240, 0.9)",
        boxShadow: "0 10px 24px rgba(15, 23, 42, 0.03)",
      }}
    >
      <Typography variant="body2" className="!text-[0.8rem] text-slate-500">
        © {new Date().getFullYear()} <span className="font-semibold text-slate-700">BackHaulBid</span>. Nền tảng đấu giá
        và giao dịch vận tải.
      </Typography>

      <Box className="flex items-center gap-6">
        <Link href="#" underline="none" variant="body2" className="!text-[0.78rem] text-slate-500 hover:text-[#1B4965]">
          Điều khoản
        </Link>
        <Link href="#" underline="none" variant="body2" className="!text-[0.78rem] text-slate-500 hover:text-[#1B4965]">
          Bảo mật
        </Link>
        <Link href="#" underline="none" variant="body2" className="!text-[0.78rem] text-slate-500 hover:text-[#1B4965]">
          Hỗ trợ
        </Link>
      </Box>
    </Box>
  );
}
