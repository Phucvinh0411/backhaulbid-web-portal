"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import BrandMark from "@/components/layout/BrandMark";

// Only capabilities the platform has today; no customer counts or testimonials.
const POINTS = [
  { title: "Đấu giá ngược", text: "Công khai hoặc kín. Giá thấp nhất hợp lệ thắng, chủ hàng chọn người thắng với phiên kín." },
  { title: "Hợp đồng tự tạo", text: "Sau trao thầu, nhà xe ký trước rồi chủ hàng ký; quá hạn thì mời nhà xe dự phòng." },
  { title: "Theo dõi đến khi giao", text: "Hành trình, cột mốc, ảnh bằng chứng và xác nhận nhận hàng trên cùng một chuyến." },
];

/**
 * Sign-in / sign-up frame (DESIGN.md): a navy band on wide screens, the form on white.
 * On phones the band collapses to the brand line above the form.
 */
export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <Box component="main" sx={{ minHeight: "100dvh", display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(0, 5fr) minmax(0, 6fr)" }, bgcolor: "background.paper" }}>
      <Box
        component="section"
        aria-label="Giới thiệu BackHaulBid"
        sx={{ display: { xs: "none", md: "flex" }, flexDirection: "column", justifyContent: "space-between", gap: 6, bgcolor: "var(--color-band)", color: "common.white", p: { md: 6, lg: 8 } }}
      >
        <BrandMark inverted />
        <Box sx={{ maxWidth: 480 }}>
          <Typography component="p" sx={{ fontSize: { md: "2.25rem", lg: "2.75rem" }, fontWeight: 700, lineHeight: 1.2, mb: 2 }}>
            Xe chiều về có hàng, chủ hàng có giá tốt.
          </Typography>
          <Typography sx={{ color: "var(--color-on-band-soft)", fontSize: "1.0625rem", lineHeight: 1.6 }}>
            Sàn đấu giá vận tải cho chủ hàng, chủ xe và tài xế.
          </Typography>
        </Box>
        <Box component="ul" sx={{ m: 0, p: 0, display: "grid", gap: 2.5 }}>
          {POINTS.map((point) => (
            <Box component="li" key={point.title} sx={{ listStyle: "none", borderTop: "1px solid rgba(255,255,255,0.16)", pt: 2 }}>
              <Typography sx={{ fontWeight: 600, mb: 0.5 }}>{point.title}</Typography>
              <Typography variant="body2" sx={{ color: "var(--color-on-band-soft)", maxWidth: 440 }}>{point.text}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", px: { xs: 2, sm: 4 }, py: { xs: 4, md: 6 } }}>
        <Box sx={{ width: "100%", maxWidth: 440 }}>
          <Box sx={{ display: { xs: "block", md: "none" }, mb: 4 }}>
            <BrandMark />
          </Box>
          <Typography component="h1" sx={{ fontSize: { xs: "1.75rem", md: "2rem" }, fontWeight: 700, lineHeight: 1.25 }}>
            {title}
          </Typography>
          {subtitle ? <Typography sx={{ color: "text.secondary", mt: 1, mb: 4 }}>{subtitle}</Typography> : <Box sx={{ mb: 4 }} />}
          {children}
          {footer ? <Box sx={{ mt: 4 }}>{footer}</Box> : null}
        </Box>
      </Box>
    </Box>
  );
}
