"use client";

// ============================================
// Sidebar Navigation Configuration
// ============================================

import { 
  DashboardOutlined as DashboardIcon, 
  LocalShippingOutlined as LocalShippingIcon, 
  GavelOutlined as GavelIcon, 
  PeopleOutlined as PeopleIcon, 
  AccountBalanceWalletOutlined as AccountBalanceWalletIcon, 
  DescriptionOutlined as DescriptionIcon, 
  SettingsOutlined as SettingsIcon, 
  BarChartOutlined as BarChartIcon 
} from "@mui/icons-material";

const navigation = [
  {
    title: "TỔNG QUAN",
    items: [
      {
        title: "Dashboard",
        path: "/dashboard",
        icon: DashboardIcon,
      },
    ],
  },
  {
    title: "VẬN HÀNH",
    items: [
      {
        title: "Đấu giá",
        path: "/bidding",
        icon: GavelIcon,
        children: [
          { title: "Danh sách phiên", path: "/bidding/sessions" },
          { title: "Tạo phiên mới", path: "/bidding/create" },
          { title: "Lịch sử đấu giá", path: "/bidding/history" },
        ],
      },
      {
        title: "Đội xe",
        path: "/fleet",
        icon: LocalShippingIcon,
        children: [
          { title: "Phương tiện", path: "/fleet/vehicles" },
          { title: "Tài xế", path: "/fleet/drivers" },
          { title: "Tuyến đường", path: "/fleet/routes" },
        ],
      },
      {
        title: "Hợp đồng",
        path: "/contracts",
        icon: DescriptionIcon,
        children: [
          { title: "Đang hoạt động", path: "/contracts/active" },
          { title: "Chờ duyệt", path: "/contracts/pending" },
          { title: "Đã hoàn thành", path: "/contracts/completed" },
        ],
      },
    ],
  },
  {
    title: "QUẢN LÝ",
    items: [
      {
        title: "Người dùng",
        path: "/users",
        icon: PeopleIcon,
      },
      {
        title: "Ví & Thanh toán",
        path: "/wallet",
        icon: AccountBalanceWalletIcon,
        children: [
          { title: "Tổng quan ví", path: "/wallet/overview" },
          { title: "Lịch sử giao dịch", path: "/wallet/transactions" },
        ],
      },
      {
        title: "Báo cáo",
        path: "/reports",
        icon: BarChartIcon,
      },
    ],
  },
  {
    title: "HỆ THỐNG",
    items: [
      {
        title: "Cài đặt",
        path: "/settings",
        icon: SettingsIcon,
      },
    ],
  },
];

export default navigation;
