import { 
  DashboardOutlined as DashboardIcon, 
  LocalShippingOutlined as LocalShippingIcon, 
  GavelOutlined as GavelIcon, 
  AccountBalanceWalletOutlined as AccountBalanceWalletIcon, 
  DescriptionOutlined as DescriptionIcon, 
  SettingsOutlined as SettingsIcon
} from "@mui/icons-material";

const shipperNavigation = [
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
];

export default shipperNavigation;
