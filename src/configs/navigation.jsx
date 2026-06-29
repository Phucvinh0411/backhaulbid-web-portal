// ============================================
// Sidebar Navigation Configuration
// ============================================

import DashboardIcon from "@mui/icons-material/DashboardOutlined";
import LocalShippingIcon from "@mui/icons-material/LocalShippingOutlined";
import GavelIcon from "@mui/icons-material/GavelOutlined";
import PeopleIcon from "@mui/icons-material/PeopleOutlined";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import DescriptionIcon from "@mui/icons-material/DescriptionOutlined";
import SettingsIcon from "@mui/icons-material/SettingsOutlined";
import BarChartIcon from "@mui/icons-material/BarChartOutlined";

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
