"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Box, Grid, Typography, TextField, Button, Checkbox, FormControlLabel, Divider, useTheme } from "@mui/material";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";

export default function LoginPage() {
  const router = useRouter();
  const theme = useTheme();

  const handleLogin = (e, role) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      window.localStorage.setItem("userRole", role);
    }
    if (role === "admin") {
      router.push("/admin");
    } else {
      router.push(`/${role}/dashboard`);
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
          {/* Dark overlay for text contrast - WCAG compliant */}
          <Box sx={{
            position: "absolute",
            inset: 0,
            bgcolor: "rgba(15, 23, 42, 0.85)",
            zIndex: 1
          }} />
          <Box sx={{
            position: "relative",
            zIndex: 2,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            px: { xs: 4, md: 6, lg: 8, xl: 12 },
            py: 8,
            color: "white",
            width: "100%",
            maxWidth: { xs: 560, xl: 800 },
          }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 5 }}>
              <Box sx={{
                width: 42,
                height: 42,
                bgcolor: "white",
                borderRadius: 2.5,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <LocalShippingIcon sx={{ color: "#1e40af", fontSize: 22 }} />
              </Box>
              <Typography variant="h6" fontWeight={700} sx={{ letterSpacing: "-0.02em" }}>BackHaulBid</Typography>
            </Box>
            <Typography
              variant="h2"
              fontWeight={800}
              mb={3}
              sx={{ lineHeight: 1.1, letterSpacing: "-0.03em", fontSize: { xs: "2.5rem", md: "3rem", lg: "3.75rem", xl: "4.5rem" } }}
            >
              Tối ưu vận tải,<br />Tối đa lợi nhuận.
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "rgba(255,255,255,0.85)",
                maxWidth: { xs: 440, xl: 560 },
                fontWeight: 400,
                lineHeight: 1.6,
                fontSize: { xs: "1.05rem", lg: "1.15rem", xl: "1.25rem" },
              }}
            >
              Nền tảng B2B Logistics thông minh. Kết nối chủ hàng và nhà xe thông qua cơ chế đấu giá minh bạch, hiệu quả.
            </Typography>
          </Box>
        </Grid>

        {/* Right section - Form */}
        <Grid item xs={12} md={5} sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: { xs: 4, sm: 6, md: 6, lg: 8 },
          bgcolor: "#ffffff"
        }}>
          <Box sx={{ width: "100%", maxWidth: 420 }}>
            <Box sx={{ mb: 5 }}>
              <Typography
                variant="h4"
                fontWeight={800}
                color="text.primary"
                gutterBottom
                sx={{ letterSpacing: "-0.02em" }}
              >
                Đăng nhập
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Chưa có tài khoản doanh nghiệp?{" "}
                <Link href="/register" style={{ color: theme.palette.primary.main, fontWeight: 600, textDecoration: "none" }}>
                  Đăng ký ngay
                </Link>
              </Typography>
            </Box>

            <form onSubmit={(e) => handleLogin(e, "shipper")}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <Box>
                  <Typography variant="body2" fontWeight={600} mb={0.75} color="text.primary">Email / Số điện thoại</Typography>
                  <TextField
                    fullWidth
                    required
                    placeholder="name@company.com"
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 1,
                        backgroundColor: "#f8fafc",
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: theme.palette.primary.light,
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: theme.palette.primary.main,
                          borderWidth: 2,
                        },
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
                    fullWidth
                    required
                    type="password"
                    placeholder="••••••••"
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: "10px",
                        backgroundColor: "#f8fafc",
                        "&:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: theme.palette.primary.light,
                        },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: theme.palette.primary.main,
                          borderWidth: 2,
                        },
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
                  sx={{
                    py: 1.5,
                    fontSize: "0.95rem",
                    borderRadius: "10px",
                  }}
                >
                  Đăng nhập
                </Button>
              </Box>

              <Box sx={{ mt: 5 }}>
                <Divider sx={{ "&::before, &::after": { borderColor: "divider" } }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={500} sx={{ px: 1 }}>Đăng nhập thử nghiệm (Mock)</Typography>
                </Divider>

                <Grid container spacing={1.5} sx={{ mt: 2 }}>
                  <Grid item xs={4}>
                    <Button
                      variant="outlined"
                      fullWidth
                      size="small"
                      onClick={(e) => handleLogin(e, "admin")}
                      sx={{
                        borderColor: "divider",
                        color: "text.primary",
                        borderRadius: "10px",
                        py: 1,
                        fontSize: "0.8rem",
                        "&:hover": { bgcolor: "grey.50", borderColor: "primary.light" }
                      }}
                    >
                      Admin
                    </Button>
                  </Grid>
                  <Grid item xs={4}>
                    <Button
                      variant="outlined"
                      fullWidth
                      size="small"
                      onClick={(e) => handleLogin(e, "carrier")}
                      sx={{
                        borderColor: "divider",
                        color: "text.primary",
                        borderRadius: "10px",
                        py: 1,
                        fontSize: "0.8rem",
                        "&:hover": { bgcolor: "grey.50", borderColor: "primary.light" }
                      }}
                    >
                      Nhà xe
                    </Button>
                  </Grid>
                  <Grid item xs={4}>
                    <Button
                      variant="outlined"
                      fullWidth
                      size="small"
                      onClick={(e) => handleLogin(e, "shipper")}
                      sx={{
                        borderColor: "divider",
                        color: "text.primary",
                        borderRadius: "10px",
                        py: 1,
                        fontSize: "0.8rem",
                        "&:hover": { bgcolor: "grey.50", borderColor: "primary.light" }
                      }}
                    >
                      Chủ hàng
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </form>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
