"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AuthShell from "@/components/auth/AuthShell";
import { useGlobalNotification } from "@/components/common/NotificationPopup";

const DASHBOARD_BY_ROLE = {
  ADMIN: "/admin",
  CARRIER: "/carrier/dashboard",
  SHIPPER: "/shipper/dashboard",
};

export default function LoginPage() {
  const router = useRouter();
  const notify = useGlobalNotification();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (event) => {
    event.preventDefault();
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phone.trim(), password }),
      });
      const data = await res.json();
      if (res.ok) {
        const role = String(data.data?.role || data.role || "").toUpperCase();
        if (role === "DRIVER") {
          // Drivers work in the BackHaulBid app; the web portal has no driver area.
          await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
          notify.warning("Tài khoản tài xế dùng ứng dụng BackHaulBid trên điện thoại. Cổng web dành cho chủ hàng, chủ xe và quản trị viên.");
          return;
        }
        router.push(DASHBOARD_BY_ROLE[role] || "/");
        router.refresh();
      } else {
        setError(data.message || "Sai số điện thoại hoặc mật khẩu.");
      }
    } catch {
      setError("Không kết nối được máy chủ. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Đăng nhập"
      subtitle="Dành cho chủ hàng, chủ xe và quản trị viên."
      footer={
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Chưa có tài khoản?{" "}
          <Box component={Link} href="/register" sx={{ color: "primary.main", fontWeight: 600 }}>
            Tạo tài khoản
          </Box>
        </Typography>
      }
    >
      <Box component="form" onSubmit={handleLogin} noValidate sx={{ display: "grid", gap: 2.5 }}>
        {error && <Alert severity="error" role="alert">{error}</Alert>}
        <TextField
          label="Số điện thoại"
          required
          fullWidth
          size="medium"
          autoComplete="tel"
          inputMode="tel"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
        />
        <TextField
          label="Mật khẩu"
          type="password"
          required
          fullWidth
          size="medium"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: -1 }}>
          <Box component={Link} href="/forgot-password" sx={{ color: "primary.main", fontWeight: 500, fontSize: "0.875rem" }}>
            Quên mật khẩu?
          </Box>
        </Box>
        <Button type="submit" variant="contained" size="large" fullWidth disabled={loading || !phone.trim() || !password}>
          {loading ? <CircularProgress size={22} color="inherit" aria-label="Đang đăng nhập" /> : "Đăng nhập"}
        </Button>
      </Box>
    </AuthShell>
  );
}
