"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import AuthShell from "@/components/auth/AuthShell";

// identity-service has no password-reset endpoint yet, so this page does not offer a form.
export default function ForgotPasswordPage() {
  return (
    <AuthShell title="Quên mật khẩu" subtitle="Hệ thống chưa hỗ trợ tự khôi phục mật khẩu trực tuyến.">
      <Box sx={{ display: "grid", gap: 2 }}>
        <Typography sx={{ color: "text.secondary" }}>
          Liên hệ quản trị viên BackHaulBid để được đặt lại mật khẩu cho số điện thoại đã đăng ký.
        </Typography>
        <Button component={Link} href="/login" variant="contained" size="large" fullWidth>
          Quay lại đăng nhập
        </Button>
      </Box>
    </AuthShell>
  );
}
