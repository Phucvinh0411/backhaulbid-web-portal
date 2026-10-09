"use client";

import {
  DashboardOutlined as DashboardIcon,
  BarChartOutlined as StatisticsIcon,
  PeopleOutlined as PeopleIcon,
  FactCheckOutlined as FactCheckIcon,
  GavelOutlined as GavelIcon,
  ReportProblemOutlined as ReportProblemIcon,
  AccountBalanceWalletOutlined as WalletIcon,
  SettingsOutlined as SettingsIcon,
  AccessTimeOutlined as AccessTimeIcon,
} from "@mui/icons-material";

const adminNavigation = [
  {
    title: "Tổng quan",
    items: [
      {
        title: "Bảng điều khiển",
        path: "/admin",
        icon: DashboardIcon,
        exact: true,
      },
      { title: "Thống kê", path: "/admin/statistics", icon: StatisticsIcon, exact: true },
    ],
  },
  {
    title: "Vận hành",
    items: [
      {
        title: "Quản lý người dùng",
        path: "/admin/users",
        icon: PeopleIcon,
      },
      {
        title: "Hồ sơ người đại diện",
        path: "/admin/representative-verifications",
        icon: FactCheckIcon,
      },
      {
        title: "Duyệt doanh nghiệp",
        path: "/admin/business-verifications",
        icon: FactCheckIcon,
      },
      {
        title: "Duyệt bảo hiểm hàng hóa",
        path: "/admin/cargo-liability",
        icon: FactCheckIcon,
      },
      {
        title: "Duyệt đội xe",
        path: "/admin/fleet-verifications",
        icon: FactCheckIcon,
      },
      {
        title: "Giám sát đấu giá",
        path: "/admin/operations",
        icon: GavelIcon,
      },
      {
        title: "Xử lý chuyến giao trễ",
        path: "/admin/late-delivery",
        icon: AccessTimeIcon,
      },
      {
        title: "Duyệt rút tiền ví",
        path: "/admin/wallets",
        icon: WalletIcon,
      },
      {
        title: "Khiếu nại",
        path: "/admin/complaints",
        icon: ReportProblemIcon,
      },
    ],
  },
  {
    title: "Hệ thống",
    items: [
      {
        title: "Cài đặt",
        path: "/admin/settings",
        icon: SettingsIcon,
        children: [
          { title: "Chung", path: "/admin/settings", exact: true },
          { title: "Luật đấu giá", path: "/admin/settings/auction" },
          { title: "Thanh toán", path: "/admin/settings/payment" },
          { title: "Thông báo", path: "/admin/settings/notification" },
        ],
      },
    ],
  },
];

/** Bottom navigation on phones for the operations tasks admins check on the go. */
export const adminMobileNavigation = [
  { title: "Tổng quan", path: "/admin", exact: true, icon: DashboardIcon },
  { title: "Đấu giá", path: "/admin/operations", icon: GavelIcon },
  { title: "Khiếu nại", path: "/admin/complaints", icon: ReportProblemIcon },
  { title: "Người dùng", path: "/admin/users", icon: PeopleIcon },
];

export default adminNavigation;
