// ============================================
// src/shared/components/guard/ProtectedRoute.jsx
// Wrapper component bảo vệ Route theo Role
// ============================================

import { Navigate, Outlet } from "react-router-dom";

/**
 * ProtectedRoute - Kiểm tra quyền truy cập Route dựa trên Role.
 *
 * @param {Object} props
 * @param {string[]} props.allowedRoles - Danh sách các Role được phép truy cập
 * @param {string} props.userRole - Role hiện tại của người dùng (giả lập)
 * @param {string} [props.redirectTo="/403"] - Đường dẫn redirect khi không có quyền
 *
 * Nếu userRole không nằm trong allowedRoles → Navigate về /403.
 * Nếu hợp lệ → Render <Outlet /> để hiển thị children routes.
 */
export default function ProtectedRoute({
  allowedRoles,
  userRole,
  redirectTo = "/403",
}) {
  // Kiểm tra: userRole có nằm trong danh sách allowedRoles không?
  const isAuthorized = allowedRoles.includes(userRole);

  if (!isAuthorized) {
    // Không có quyền → đá về trang 403 (Forbidden)
    return <Navigate to={redirectTo} replace />;
  }

  // Có quyền → render nội dung bên trong (children routes)
  return <Outlet />;
}
