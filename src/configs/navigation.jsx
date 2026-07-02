// ============================================
// Sidebar Role-Based Navigation Configuration
// ============================================

import DashboardIcon from "@mui/icons-material/DashboardOutlined";
import LocalShippingIcon from "@mui/icons-material/LocalShippingOutlined";
import GavelIcon from "@mui/icons-material/GavelOutlined";
import PeopleIcon from "@mui/icons-material/PeopleOutlined";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import DescriptionIcon from "@mui/icons-material/DescriptionOutlined";
import SettingsIcon from "@mui/icons-material/SettingsOutlined";
import BarChartIcon from "@mui/icons-material/BarChartOutlined";

export const navigationByRole = {
  shipper: [
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
      title: "ĐẤU GIÁ VÀ VẬN CHUYỂN",
      items: [
        {
          title: "Đấu giá vận tải",
          path: "/bidding",
          icon: GavelIcon,
          children: [
            { title: "Danh sách phiên", path: "/bidding/sessions" },
            { title: "Tạo phiên mới", path: "/bidding/create" },
            { title: "Lịch sử đấu giá", path: "/bidding/history" },
          ],
        },
        {
          title: "Hợp đồng vận chuyển",
          path: "/contracts",
          icon: DescriptionIcon,
          children: [
            { title: "Đang hoạt động", path: "/contracts/active" },
          ],
        },
      ],
    },
    {
      title: "TÀI CHÍNH & ĐỊA ĐIỂM",
      items: [
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
          title: "Sổ địa chỉ kho",
          path: "/fleet/routes",
          icon: LocalShippingIcon,
        },
      ],
    },
    {
      title: "HỆ THỐNG",
      items: [
        {
          title: "Cài đặt tài khoản",
          path: "/settings",
          icon: SettingsIcon,
        },
      ],
    },
  ],
  carrier: [
    {
      title: "TỔNG QUAN",
      items: [
        {
          title: "Dashboard Nhà xe",
          path: "/dashboard/carrier",
          icon: DashboardIcon,
        },
      ],
    },
    {
      title: "ĐIỀU HÀNH ĐỘI XE",
      items: [
        {
          title: "Quản lý đội xe",
          path: "/fleet",
          icon: LocalShippingIcon,
          children: [
            { title: "Danh sách xe", path: "/fleet/vehicles" },
            { title: "Danh sách tài xế", path: "/fleet/drivers" },
          ],
        },
        {
          title: "Chợ hàng tìm chuyến",
          path: "/bidding/find",
          icon: GavelIcon,
        },
      ],
    }
  ],
  admin: [
    {
      title: "QUẢN TRỊ VIÊN",
      items: [
        {
          title: "Bảng tổng quan",
          path: "/dashboard/admin",
          icon: DashboardIcon,
        },
        {
          title: "Duyệt eKYC chủ hàng",
          path: "/admin/ekyc",
          icon: PeopleIcon,
        },
        {
          title: "Báo cáo doanh thu",
          path: "/reports",
          icon: BarChartIcon,
        },
      ],
    }
  ]
};

// By default export the shipper navigation to prevent breaking current sidebar imports
const defaultNavigation = navigationByRole.shipper;
export default defaultNavigation;
