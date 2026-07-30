"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Box, Grid, Typography, TextField, Button,
  Checkbox, FormControlLabel, Divider, useTheme, Alert, CircularProgress
} from "@mui/material";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";

export default function LoginPage() {
  const router = useRouter();
  const theme = useTheme();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Map role -> dashboard path
  const getDashboardByRole = (role) => {
    const roleMap = {
      ADMIN: "/admin",
      CARRIER: "/carrier/dashboard",
      SHIPPER: "/shipper/dashboard",
    };
    return roleMap[role?.toUpperCase()] || "/";
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();
      if (res.ok) {
        // Đọc role từ response → redirect thẳng dashboard tương ứng
        const role = data.data?.role || data.role;
        router.push(getDashboardByRole(role));
        router.refresh();
      } else {
        setError(data.message || "Sai số điện thoại hoặc mật khẩu.");
      }
    } catch {
      setError("Lỗi kết nối tới server. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", width: "100%" }}>
      <Grid container sx={{ flex: 1 }}>
        {/* Left section - Image/Branding */}
        <Grid item xs={12} md={7} sx={{
          display: { xs: "none", md: "flex" },
          position: "relative",
          overflow: "hidden"
        }}>
          <Box
            component="img"
            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop"
            alt="Logistics warehouse"
            sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
          <Box sx={{
            position: "absolute", inset: 0,
            background: "linear-gradient(135deg, rgba(15,23,42,0.82) 0%, rgba(30,64,175,0.70) 100%)",
          }} />
          <Box sx={{
            position: "relative", zIndex: 1, color: "white",
            display: "flex", flexDirection: "column", justifyContent: "flex-end",
            p: { md: 6, lg: 8, xl: 10 }, pb: { md: 8, lg: 10, xl: 12 },
          }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 5 }}>
              <Box sx={{
                width: 42, height: 42, bgcolor: "white", borderRadius: 2.5,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <LocalShippingIcon sx={{ color: "#1e40af", fontSize: 22 }} />
              </Box>
              <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: "-0.02em" }}>BackHaulBid</Typography>
            </Box>
            <Typography variant="h2" fontWeight={800} mb={3}
              sx={{ lineHeight: 1.1, letterSpacing: "-0.03em", fontSize: { xs: "2.5rem", md: "3rem", lg: "3.75rem", xl: "4.5rem" } }}
            >
              Tối ưu vận tải,<br />Tối đa lợi nhuận.
            </Typography>
            <Typography variant="body1" sx={{
              color: "rgba(255,255,255,0.85)", maxWidth: { xs: 440, xl: 560 },
              fontWeight: 400, lineHeight: 1.6, fontSize: { xs: "1.05rem", lg: "1.15rem", xl: "1.25rem" },
            }}>
              Nền tảng B2B Logistics thông minh. Kết nối chủ hàng và nhà xe thông qua cơ chế đấu giá minh bạch, hiệu quả.
            </Typography>
          </Box>
        </Grid>

        {/* Right section - Form */}
        <Grid item xs={12} md={5} sx={{
          display: "flex", alignItems: "center", justifyContent: "center",
          p: { xs: 4, sm: 6, md: 6, lg: 8 }, bgcolor: "#ffffff"
        }}>
          <Box sx={{ width: "100%", maxWidth: 420 }}>
            <Box sx={{ mb: 5 }}>
              <Typography variant="h4" fontWeight={800} color="text.primary" gutterBottom sx={{ letterSpacing: "-0.02em" }}>
                Đăng nhập
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Chưa có tài khoản doanh nghiệp?{" "}
                <Link href="/register" style={{ color: theme.palette.primary.main, fontWeight: 600, textDecoration: "none" }}>
                  Đăng ký ngay
                </Link>
              </Typography>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2, borderRadius: "10px" }}>{error}</Alert>}

            <form onSubmit={handleLogin}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <Box>
                  <Typography variant="body2" fontWeight={600} mb={0.75} color="text.primary">Số điện thoại</Typography>
                  <TextField
                    fullWidth required
                    placeholder="090 123 4567"
                    variant="outlined"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px", backgroundColor: "#f8fafc",
                        "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: theme.palette.primary.light },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: theme.palette.primary.main, borderWidth: 2 },
                      },
                    }}
                  />
                </Box>

                <Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.75 }}>
                    <Typography variant="body2" fontWeight={600} color="text.primary">Mật khẩu</Typography>
                    <Link href="/forgot-password" style={{ color: theme.palette.primary.main, fontWeight: 600, textDecoration: "none", fontSize: "0.8rem" }}>
                      Quên mật khẩu?
                    </Link>
                  </Box>
                  <TextField
                    fullWidth required type="password"
                    placeholder="••••••••"
                    variant="outlined"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px", backgroundColor: "#f8fafc",
                        "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: theme.palette.primary.light },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: theme.palette.primary.main, borderWidth: 2 },
                      },
                    }}
                  />
                </Box>

                <FormControlLabel
                  control={<Checkbox color="primary" size="small" />}
                  label={<Typography variant="body2" color="text.secondary">Ghi nhớ đăng nhập</Typography>}
                />

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  disabled={loading}
                  sx={{ py: 1.5, fontSize: "0.95rem", borderRadius: "10px" }}
                >
                  {loading ? <CircularProgress size={22} color="inherit" /> : "Đăng nhập"}
                </Button>
              </Box>

              <Box sx={{ mt: 5 }}>
                <Divider sx={{ "&::before, &::after": { borderColor: "divider" } }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ px: 1 }}>Đăng nhập thử nghiệm (Mock)</Typography>
                </Divider>

                <Grid container spacing={1.5} sx={{ mt: 2 }}>
                  {[
                    { label: "Admin", phone: "0900000001", password: "Admin@123" },
                    { label: "Nhà xe", phone: "0900000002", password: "Carrier@123" },
                    { label: "Chủ hàng", phone: "0900000003", password: "Shipper@123" },
                  ].map((mock) => (
                    <Grid item xs={4} key={mock.label}>
                      <Button
                        variant="outlined"
                        fullWidth size="small"
                        onClick={() => { setPhone(mock.phone); setPassword(mock.password); }}
                        sx={{
                          borderColor: "divider", color: "text.primary", borderRadius: "10px", py: 1, fontSize: "0.8rem",
                          "&:hover": { bgcolor: "grey.50", borderColor: "primary.light" }
                        }}
                      >
                        {mock.label}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </form>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
