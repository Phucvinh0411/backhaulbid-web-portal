"use client";

import {
  DashboardOutlined as DashboardIcon,
  PeopleOutlined as PeopleIcon,
  GavelOutlined as GavelIcon,
  ReportProblemOutlined as ReportProblemIcon,
  SettingsOutlined as SettingsIcon,
} from "@mui/icons-material";

const adminNavigation = [
  {
    title: "TỔNG QUAN",
    items: [
      {
        title: "Bảng điều khiển",
        path: "/admin",
        icon: DashboardIcon,
      },
    ],
  },
  {
    title: "VẬN HÀNH",
    items: [
      {
        title: "Quản lý người dùng",
        path: "/admin/users",
        icon: PeopleIcon,
      },
      {
        title: "Giám sát đấu giá",
        path: "/admin/operations",
        icon: GavelIcon,
      },
      {
        title: "Báo cáo khiếu nại",
        path: "/admin/complaints",
        icon: ReportProblemIcon,
      },
    ],
  },
  {
    title: "HỆ THỐNG",
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

export default adminNavigation;
