// ============================================
// src/App.jsx - Root Application with RBAC Routing
// Premium 2026 Design - Demo Pages
// ============================================

import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { ThemeProvider } from "@/theme";
import MainLayout from "@/shared/components/layout/MainLayout";
import ProtectedRoute from "@/shared/components/guard/ProtectedRoute";
import { ROLES } from "@/shared/constants/navigation";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import BlockIcon from "@mui/icons-material/Block";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import SentimentDissatisfiedOutlinedIcon from "@mui/icons-material/SentimentDissatisfiedOutlined";

// ============================================
// GIẢ LẬP: Role hiện tại của người dùng
// Thay đổi giá trị này để test RBAC:
// 'ADMIN' | 'SHIPPER' | 'CARRIER'
// ============================================
const currentUserRole = "CARRIER";

// ---- Premium Page Placeholder ----
const PagePlaceholder = ({ title, description, icon }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 animate-fade-in-up">
    {/* Icon container with gradient background */}
    <div
      className="flex items-center justify-center w-20 h-20 rounded-3xl"
      style={{
        background: "linear-gradient(135deg, rgba(27,73,101,0.08) 0%, rgba(95,168,211,0.08) 100%)",
        border: "1px solid rgba(95, 168, 211, 0.1)",
      }}
    >
      <Typography className="!text-4xl">{icon}</Typography>
    </div>

    <div className="text-center space-y-2">
      <Typography
        variant="h4"
        className="!font-bold !tracking-tight"
        sx={{
          background: "linear-gradient(135deg, #1B4965, #5FA8D3)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {title}
      </Typography>
      <Typography variant="body1" sx={{ color: "#64748B", maxWidth: 400, mx: "auto" }}>
        {description}
      </Typography>
    </div>

    {/* Role badge */}
    <div
      className="flex items-center gap-2 px-4 py-2 rounded-xl"
      style={{
        background: "linear-gradient(135deg, rgba(27,73,101,0.04) 0%, rgba(6,182,212,0.04) 100%)",
        border: "1px solid rgba(27, 73, 101, 0.08)",
      }}
    >
      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-breathe" />
      <Typography className="!text-[0.78rem] !font-medium" sx={{ color: "#1B4965" }}>
        Đang đăng nhập với vai trò:{" "}
        <strong style={{ color: "#5FA8D3" }}>{currentUserRole}</strong>
      </Typography>
    </div>
  </div>
);

// ---- 403 Forbidden Page ----
const ForbiddenPage = () => {
  const nav = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-[65vh] gap-5 animate-fade-in-up">
      <div
        className="flex items-center justify-center w-24 h-24 rounded-full"
        style={{
          background: "linear-gradient(135deg, rgba(244,63,94,0.08) 0%, rgba(225,29,72,0.05) 100%)",
          border: "1px solid rgba(244, 63, 94, 0.12)",
        }}
      >
        <BlockIcon sx={{ fontSize: 44, color: "#F43F5E" }} />
      </div>

      <div className="text-center space-y-2">
        <Typography
          variant="h4"
          className="!font-bold !tracking-tight"
          sx={{ color: "#1E293B" }}
        >
          Truy cập bị từ chối
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748B", maxWidth: 380, mx: "auto" }}>
          Bạn không có quyền truy cập trang này. Liên hệ quản trị viên để được cấp quyền.
        </Typography>
      </div>

      <div
        className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg"
        style={{
          background: "rgba(244, 63, 94, 0.06)",
          border: "1px solid rgba(244, 63, 94, 0.1)",
        }}
      >
        <Typography className="!text-[0.72rem] !font-mono !font-medium" sx={{ color: "#F43F5E" }}>
          HTTP 403 — Forbidden
        </Typography>
      </div>

      <Button
        variant="contained"
        startIcon={<HomeOutlinedIcon />}
        onClick={() => nav("/dashboard")}
        className="!rounded-xl !mt-2"
        sx={{
          background: "linear-gradient(135deg, #1B4965, #0D2B3E)",
          "&:hover": {
            background: "linear-gradient(135deg, #0D2B3E, #1B4965)",
            boxShadow: "0 4px 16px rgba(27, 73, 101, 0.3)",
            transform: "translateY(-1px)",
          },
          px: 3,
          py: 1,
          fontWeight: 600,
          fontSize: "0.82rem",
          transition: "all 0.3s ease",
        }}
      >
        Quay về Tổng quan
      </Button>
    </div>
  );
};

// ---- 404 Not Found Page ----
const NotFoundPage = () => {
  const nav = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-[65vh] gap-5 animate-fade-in-up">
      <div
        className="flex items-center justify-center w-24 h-24 rounded-full"
        style={{
          background: "linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(245,158,11,0.04) 100%)",
          border: "1px solid rgba(245, 158, 11, 0.12)",
        }}
      >
        <SentimentDissatisfiedOutlinedIcon sx={{ fontSize: 44, color: "#F59E0B" }} />
      </div>

      <div className="text-center space-y-2">
        <Typography variant="h4" className="!font-bold" sx={{ color: "#1E293B" }}>
          Trang không tồn tại
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748B" }}>
          Đường dẫn bạn tìm kiếm không tồn tại hoặc đã bị xóa.
        </Typography>
      </div>

      <Button
        variant="outlined"
        startIcon={<HomeOutlinedIcon />}
        onClick={() => nav("/dashboard")}
        className="!rounded-xl !mt-2"
        sx={{
          borderColor: "#1B4965",
          color: "#1B4965",
          "&:hover": {
            backgroundColor: "rgba(27, 73, 101, 0.04)",
            borderColor: "#5FA8D3",
          },
          px: 3,
          fontWeight: 600,
          fontSize: "0.82rem",
        }}
      >
        Về trang chủ
      </Button>
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout userRole={currentUserRole} />}>
            <Route index element={<Navigate to="/dashboard" replace />} />

            {/* ===== PUBLIC ===== */}
            <Route
              path="dashboard"
              element={<PagePlaceholder icon="📊" title="Tổng quan" description="Dashboard tổng quan hệ thống BackHaulBid" />}
            />

            {/* ===== SHIPPER ONLY ===== */}
            <Route element={<ProtectedRoute allowedRoles={[ROLES.SHIPPER]} userRole={currentUserRole} />}>
              <Route path="create-auction" element={<PagePlaceholder icon="🔨" title="Tạo phiên đấu giá" description="Tạo phiên đấu giá vận chuyển mới" />} />
            </Route>

            {/* ===== CARRIER ONLY ===== */}
            <Route element={<ProtectedRoute allowedRoles={[ROLES.CARRIER]} userRole={currentUserRole} />}>
              <Route path="find-shipment" element={<PagePlaceholder icon="🔍" title="Tìm chuyến hàng" description="Tìm kiếm chuyến hàng phù hợp với đội xe" />} />
              <Route path="fleet" element={<PagePlaceholder icon="🚛" title="Quản lý đội xe" description="Quản lý phương tiện, tài xế và tuyến đường" />} />
            </Route>

            {/* ===== SHIPPER & CARRIER ===== */}
            <Route element={<ProtectedRoute allowedRoles={[ROLES.SHIPPER, ROLES.CARRIER]} userRole={currentUserRole} />}>
              <Route path="contracts" element={<PagePlaceholder icon="📄" title="Hợp đồng" description="Quản lý hợp đồng vận chuyển" />} />
              <Route path="wallet" element={<PagePlaceholder icon="💰" title="Ví & Thanh toán" description="Quản lý ví điện tử và giao dịch" />} />
            </Route>

            {/* ===== ADMIN ONLY ===== */}
            <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} userRole={currentUserRole} />}>
              <Route path="users" element={<PagePlaceholder icon="👥" title="Quản lý người dùng" description="Quản lý tài khoản người dùng" />} />
              <Route path="system-config" element={<PagePlaceholder icon="⚙️" title="Cấu hình hệ thống" description="Cấu hình thông số hệ thống" />} />
            </Route>

            {/* ===== ADMIN & SHIPPER ===== */}
            <Route element={<ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.SHIPPER]} userRole={currentUserRole} />}>
              <Route path="reports" element={<PagePlaceholder icon="📈" title="Báo cáo & Thống kê" description="Phân tích dữ liệu vận hành" />} />
            </Route>

            {/* ===== ALL ROLES ===== */}
            <Route path="settings" element={<PagePlaceholder icon="⚙️" title="Cài đặt tài khoản" description="Cài đặt thông tin cá nhân" />} />

            {/* Error pages */}
            <Route path="403" element={<ForbiddenPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
