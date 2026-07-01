// ============================================
// src/shared/constants/navigation.js
// Cấu hình NAVIGATION_MENU - Tách biệt Data khỏi UI
// Roles: ADMIN | SHIPPER | CARRIER
// ============================================

import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import PeopleOutlinedIcon from "@mui/icons-material/PeopleOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";

// ---- Roles Enum ----
export const ROLES = {
  ADMIN: "ADMIN",
  SHIPPER: "SHIPPER",
  CARRIER: "CARRIER",
};

// ---- Tất cả Roles ----
const ALL_ROLES = [ROLES.ADMIN, ROLES.SHIPPER, ROLES.CARRIER];

// ---- Navigation Menu Configuration ----
export const NAVIGATION_MENU = [
  {
    id: "dashboard",
    title: "Tổng quan",
    path: "/dashboard",
    icon: DashboardOutlinedIcon,
    roles: ALL_ROLES, // Ai cũng xem được
  },
  {
    id: "create-auction",
    title: "Tạo phiên đấu giá",
    path: "/create-auction",
    icon: GavelOutlinedIcon,
    roles: [ROLES.SHIPPER], // Chỉ SHIPPER
  },
  {
    id: "find-shipment",
    title: "Tìm chuyến hàng",
    path: "/find-shipment",
    icon: SearchOutlinedIcon,
    roles: [ROLES.CARRIER], // Chỉ CARRIER
  },
  {
    id: "fleet",
    title: "Quản lý đội xe",
    path: "/fleet",
    icon: LocalShippingOutlinedIcon,
    roles: [ROLES.CARRIER], // Chỉ CARRIER
  },
  {
    id: "contracts",
    title: "Hợp đồng",
    path: "/contracts",
    icon: DescriptionOutlinedIcon,
    roles: [ROLES.SHIPPER, ROLES.CARRIER], // SHIPPER & CARRIER
  },
  {
    id: "wallet",
    title: "Ví & Thanh toán",
    path: "/wallet",
    icon: AccountBalanceWalletOutlinedIcon,
    roles: [ROLES.SHIPPER, ROLES.CARRIER], // SHIPPER & CARRIER
  },
  {
    id: "users",
    title: "Quản lý người dùng",
    path: "/users",
    icon: PeopleOutlinedIcon,
    roles: [ROLES.ADMIN], // Chỉ ADMIN
  },
  {
    id: "reports",
    title: "Báo cáo & Thống kê",
    path: "/reports",
    icon: BarChartOutlinedIcon,
    roles: [ROLES.ADMIN, ROLES.SHIPPER], // ADMIN & SHIPPER
  },
  {
    id: "system-config",
    title: "Cấu hình hệ thống",
    path: "/system-config",
    icon: AdminPanelSettingsOutlinedIcon,
    roles: [ROLES.ADMIN], // Chỉ ADMIN
  },
  {
    id: "settings",
    title: "Cài đặt tài khoản",
    path: "/settings",
    icon: SettingsOutlinedIcon,
    roles: ALL_ROLES, // Ai cũng xem được
  },
];

/**
 * Lọc menu theo Role của người dùng hiện tại.
 * @param {string} userRole - Role hiện tại (ADMIN | SHIPPER | CARRIER)
 * @returns {Array} - Mảng menu items mà Role đó được phép thấy
 */
export const getMenuByRole = (userRole) => {
  return NAVIGATION_MENU.filter((item) => item.roles.includes(userRole));
};
