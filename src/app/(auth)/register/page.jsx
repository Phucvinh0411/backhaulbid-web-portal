"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Box, 
  Grid, 
  Typography, 
  TextField, 
  Button, 
  useTheme, 
  Paper, 
  Divider,
  InputAdornment
} from "@mui/material";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import GavelIcon from "@mui/icons-material/Gavel";

import EkycModal from "@/components/eKYC/EkycModal";

export default function RegisterPage() {
  const router = useRouter();
  const theme = useTheme();
  const [showEkycModal, setShowEkycModal] = useState(false);
  const [formData, setFormData] = useState({
    role: "shipper", // 'shipper' or 'carrier'
    fullName: "",
    email: "",
    phone: "",
    password: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowEkycModal(true);
  };

  const handleSkipEkyc = () => {
    setShowEkycModal(false);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("userRole", formData.role);
    }
    router.push(`/${formData.role}/dashboard`);
  };

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", width: "100%" }}>
      <Grid container sx={{ flex: 1 }}>
        
        {/* Left section - Image/Branding (Consistent with Login) */}
        <Grid item xs={12} md={7} sx={{
          display: { xs: "none", md: "flex" },
          position: "relative",
          overflow: "hidden"
        }}>
          <Box
            component="img"
            src="https://images.unsplash.com/photo-1519003722824-194d4455aeb0?auto=format&fit=crop&q=80&w=1920"
            alt="Logistics transport fleet"
            sx={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
          />
          {/* Dark overlay for contrast */}
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
              Tham gia mạng lưới<br />vận tải thông minh.
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
              Nền tảng đấu giá ngược tối ưu chi phí cho chủ hàng và tối đa hiệu suất xe chạy chiều về cho nhà xe.
            </Typography>
          </Box>
        </Grid>

        {/* Right section - Register Form (Styled consistently) */}
        <Grid item xs={12} md={5} sx={{
          display: "flex",
          flexDirection: "column",
          p: { xs: 4, sm: 6, md: 6, lg: 8 },
          bgcolor: "#ffffff",
          overflowY: "auto",
          height: "100vh"
        }}>
          {/* Back to Login Link */}
          <Box sx={{ mb: 4, display: "flex", justifySelf: "flex-start" }}>
            <Link 
              href="/login" 
              style={{ 
                display: "inline-flex", 
                alignItems: "center", 
                gap: "8px", 
                fontSize: "0.85rem", 
                fontWeight: 600, 
                color: theme.palette.text.secondary, 
                textDecoration: "none" 
              }}
            >
              <ArrowBackIcon sx={{ fontSize: 16 }} />
              Quay lại Đăng nhập
            </Link>
          </Box>

          <Box sx={{ width: "100%", maxWidth: 440, mx: "auto", my: "auto" }}>
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h4"
                fontWeight={800}
                color="text.primary"
                gutterBottom
                sx={{ letterSpacing: "-0.02em" }}
              >
                Tạo tài khoản mới
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Vui lòng điền thông tin để bắt đầu trải nghiệm.
              </Typography>
            </Box>

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                
                {/* 1. Role Selection */}
                <Box>
                  <Typography variant="body2" fontWeight={700} color="text.primary" mb={1.5}>
                    1. Bạn tham gia với vai trò nào?
                  </Typography>
                  <Grid container spacing={2}>
                    
                    {/* Shipper Card */}
                    <Grid item xs={6} sx={{ display: "flex" }}>
                      <Paper
                        onClick={() => setFormData({ ...formData, role: "shipper" })}
                        elevation={0}
                        sx={{
                          p: 2,
                          border: "2px solid",
                          borderColor: formData.role === "shipper" ? theme.palette.primary.main : "#e2e8f0",
                          backgroundColor: formData.role === "shipper" ? "rgba(30, 64, 175, 0.04)" : "transparent",
                          borderRadius: "12px",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          width: "100%",
                          "&:hover": {
                            borderColor: theme.palette.primary.main,
                          }
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                          <GavelIcon sx={{ color: formData.role === "shipper" ? theme.palette.primary.main : "#94a3b8", fontSize: 20 }} />
                          <Typography variant="subtitle2" fontWeight={700} color={formData.role === "shipper" ? "primary.main" : "text.primary"}>
                            Chủ Hàng
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.68rem" }}>
                          Cần đăng tin và đấu giá vận tải.
                        </Typography>
                      </Paper>
                    </Grid>

                    {/* Carrier Card */}
                    <Grid item xs={6} sx={{ display: "flex" }}>
                      <Paper
                        onClick={() => setFormData({ ...formData, role: "carrier" })}
                        elevation={0}
                        sx={{
                          p: 2,
                          border: "2px solid",
                          borderColor: formData.role === "carrier" ? theme.palette.primary.main : "#e2e8f0",
                          backgroundColor: formData.role === "carrier" ? "rgba(30, 64, 175, 0.04)" : "transparent",
                          borderRadius: "12px",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          width: "100%",
                          "&:hover": {
                            borderColor: theme.palette.primary.main,
                          }
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                          <LocalShippingIcon sx={{ color: formData.role === "carrier" ? theme.palette.primary.main : "#94a3b8", fontSize: 20 }} />
                          <Typography variant="subtitle2" fontWeight={700} color={formData.role === "carrier" ? "primary.main" : "text.primary"}>
                            Chủ Xe
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.68rem" }}>
                          Tìm nguồn hàng và đấu giá chạy xe.
                        </Typography>
                      </Paper>
                    </Grid>

                  </Grid>
                </Box>

                <Divider />

                {/* 2. Personal Info */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Typography variant="body2" fontWeight={700} color="text.primary">
                    2. Thông tin cá nhân
                  </Typography>

                  {/* Họ và tên */}
                  <Box>
                    <Typography variant="body2" fontWeight={600} mb={0.75} color="text.primary">Họ và tên</Typography>
                    <TextField
                      fullWidth
                      required
                      placeholder="Nguyễn Văn A"
                      variant="outlined"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PersonOutlineIcon sx={{ fontSize: 20, color: "#94a3b8" }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "10px",
                          backgroundColor: "#f8fafc",
                        },
                      }}
                    />
                  </Box>

                  {/* Email */}
                  <Box>
                    <Typography variant="body2" fontWeight={600} mb={0.75} color="text.primary">Email doanh nghiệp</Typography>
                    <TextField
                      fullWidth
                      required
                      type="email"
                      placeholder="name@company.com"
                      variant="outlined"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <MailOutlineIcon sx={{ fontSize: 20, color: "#94a3b8" }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "10px",
                          backgroundColor: "#f8fafc",
                        },
                      }}
                    />
                  </Box>

                  {/* Điện thoại */}
                  <Box>
                    <Typography variant="body2" fontWeight={600} mb={0.75} color="text.primary">Số điện thoại</Typography>
                    <TextField
                      fullWidth
                      required
                      type="tel"
                      placeholder="090 123 4567"
                      variant="outlined"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneOutlinedIcon sx={{ fontSize: 20, color: "#94a3b8" }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "10px",
                          backgroundColor: "#f8fafc",
                        },
                      }}
                    />
                  </Box>

                  {/* Mật khẩu */}
                  <Box>
                    <Typography variant="body2" fontWeight={600} mb={0.75} color="text.primary">Mật khẩu</Typography>
                    <TextField
                      fullWidth
                      required
                      type="password"
                      placeholder="••••••••"
                      variant="outlined"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LockOutlinedIcon sx={{ fontSize: 20, color: "#94a3b8" }} />
                          </InputAdornment>
                        ),
                      }}
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "10px",
                          backgroundColor: "#f8fafc",
                        },
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5, fontSize: "0.68rem" }}>
                      Ít nhất 8 ký tự, bao gồm chữ và số.
                    </Typography>
                  </Box>
                </Box>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  fullWidth
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    py: 1.5,
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    borderRadius: "10px",
                    textTransform: "none",
                    mt: 1
                  }}
                >
                  Tạo tài khoản
                </Button>

                {/* Agree policy */}
                <Typography variant="caption" color="text.secondary" align="center" sx={{ display: "block" }}>
                  Bằng việc đăng ký, bạn đồng ý với{" "}
                  <a href="#" style={{ color: theme.palette.primary.main, textDecoration: "none", fontWeight: 600 }}>Điều khoản</a> và{" "}
                  <a href="#" style={{ color: theme.palette.primary.main, textDecoration: "none", fontWeight: 600 }}>Bảo mật</a> của chúng tôi.
                </Typography>

                <Divider sx={{ my: 1 }} />

                {/* Back to login option */}
                <Box sx={{ display: "flex", justifyContent: "center", gap: 0.5, fontSize: "0.85rem" }}>
                  <Typography variant="body2" color="text.secondary">Đã có tài khoản?</Typography>
                  <Link href="/login" style={{ color: theme.palette.primary.main, fontWeight: 700, textDecoration: "none" }}>
                    Đăng nhập
                  </Link>
                </Box>

              </Box>
            </form>
          </Box>

          {/* Footer Rights */}
          <Box sx={{ mt: "auto", pt: 5, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", color: theme.palette.text.secondary, width: "100%", maxWidth: 440, mx: "auto" }}>
            <span>© 2026 BackHaulBid. All rights reserved.</span>
            <Box sx={{ display: "flex", gap: 2 }}>
              <a href="#" style={{ color: "inherit", textDecoration: "none" }}>Điều khoản</a>
              <a href="#" style={{ color: "inherit", textDecoration: "none" }}>Bảo mật</a>
            </Box>
          </Box>

        </Grid>
      </Grid>

      {showEkycModal && <EkycModal onClose={handleSkipEkyc} role={formData.role} />}
    </Box>
  );
}
