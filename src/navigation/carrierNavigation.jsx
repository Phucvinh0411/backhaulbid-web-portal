"use client";

import {
  DashboardOutlined as DashboardIcon,
  BarChartOutlined as StatisticsIcon,
  GavelOutlined as GavelIcon,
  LocalShippingOutlined as LocalShippingIcon,
  AccountCircleOutlined as AccountCircleIcon,
  AssignmentTurnedInOutlined as AssignmentTurnedInIcon,
  AccountBalanceWalletOutlined as AccountBalanceWalletIcon,
  DirectionsCarOutlined as DirectionsCarIcon,
  ReportProblemOutlined as ReportProblemIcon,
  TravelExploreOutlined as ExploreIcon,
} from "@mui/icons-material";

const carrierNavigation = [
  {
    title: "Tổng quan",
    items: [
      { title: "Việc cần xử lý", path: "/carrier/dashboard", icon: DashboardIcon, exact: true },
      { title: "Thống kê", path: "/carrier/statistics", icon: StatisticsIcon, exact: true },
    ],
  },
  {
    title: "Vận hành",
    items: [
      {
        title: "Đấu giá",
        path: "/carrier/auction-group",
        icon: GavelIcon,
        children: [
          { title: "Tìm phiên", path: "/carrier/auctions" },
          { title: "Phiên của tôi", path: "/carrier/my-auctions" },
        ],
      },
      { title: "Chuyến vận chuyển", path: "/carrier/transports", icon: LocalShippingIcon },
      { title: "Hợp đồng", path: "/carrier/contracts", icon: AssignmentTurnedInIcon },
      { title: "Khiếu nại", path: "/carrier/complaints", icon: ReportProblemIcon },
      {
        title: "Đội xe",
        path: "/carrier/fleet",
        icon: DirectionsCarIcon,
        children: [
          { title: "Phương tiện", path: "/carrier/vehicles" },
          { title: "Tài xế", path: "/carrier/drivers" },
        ],
      },
    ],
  },
  {
    title: "Cá nhân",
    items: [
      { title: "Xác minh tài khoản", path: "/carrier/settings", icon: AccountCircleIcon },
      { title: "Ví thanh toán", path: "/carrier/wallet", icon: AccountBalanceWalletIcon },
    ],
  },
];

/** Bottom navigation on phones: what needs action now, then the auction funnel and trips. */
export const carrierMobileNavigation = [
  { title: "Việc cần làm", path: "/carrier/dashboard", icon: DashboardIcon },
  { title: "Tìm phiên", path: "/carrier/auctions", icon: ExploreIcon },
  { title: "Phiên của tôi", path: "/carrier/my-auctions", icon: GavelIcon },
  { title: "Chuyến", path: "/carrier/transports", icon: LocalShippingIcon },
];

export default carrierNavigation;
