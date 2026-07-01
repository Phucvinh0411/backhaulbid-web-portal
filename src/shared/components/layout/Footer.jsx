// ============================================
// src/shared/components/layout/Footer.jsx
// Premium 2026 Design - Clean Minimal Footer
// ============================================

import Typography from "@mui/material/Typography";
import FavoriteIcon from "@mui/icons-material/Favorite";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-white/80 backdrop-blur-sm">
      {/* Top gradient line */}
      <div
        className="h-px w-full"
        style={{
          background: "linear-gradient(90deg, transparent 0%, rgba(95,168,211,0.2) 30%, rgba(6,182,212,0.15) 70%, transparent 100%)",
        }}
      />

      <div className="flex flex-col sm:flex-row justify-between items-center px-6 py-3.5 gap-2">
        {/* Copyright */}
        <div className="flex items-center gap-1.5">
          <Typography className="!text-[0.72rem]" sx={{ color: "#94A3B8" }}>
            © {currentYear}
          </Typography>
          <Typography
            className="!text-[0.72rem] !font-bold"
            sx={{
              background: "linear-gradient(135deg, #1B4965, #5FA8D3)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            BackHaulBid
          </Typography>
          <Typography className="!text-[0.72rem]" sx={{ color: "#CBD5E1" }}>
            •
          </Typography>
          <Typography className="!text-[0.72rem]" sx={{ color: "#94A3B8" }}>
            Crafted with
          </Typography>
          <FavoriteIcon sx={{ fontSize: 11, color: "#F43F5E", mx: -0.3 }} />
          <Typography className="!text-[0.72rem]" sx={{ color: "#94A3B8" }}>
            in Vietnam
          </Typography>
        </div>

        {/* Links */}
        <div className="flex items-center gap-4">
          {["Điều khoản", "Bảo mật", "Hỗ trợ"].map((text) => (
            <Typography
              key={text}
              className="cursor-pointer !text-[0.7rem] !font-medium"
              sx={{
                color: "#94A3B8",
                transition: "color 0.2s ease",
                "&:hover": { color: "#5FA8D3" },
              }}
            >
              {text}
            </Typography>
          ))}
          <div
            className="flex items-center gap-1 px-2 py-0.5 rounded-md"
            style={{
              backgroundColor: "rgba(95, 168, 211, 0.06)",
              border: "1px solid rgba(95, 168, 211, 0.1)",
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <Typography className="!text-[0.62rem] !font-mono !font-medium" sx={{ color: "#5FA8D3" }}>
              v0.1.0
            </Typography>
          </div>
        </div>
      </div>
    </footer>
  );
}
