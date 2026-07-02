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
        title: "Bảng điều khiển",
        path: "/shipper/dashboard",
        icon: DashboardIcon,
      },
    ],
  },
  {
    title: "ĐẤU GIÁ VÀ VẬN CHUYỂN",
    items: [
      {
        title: "Đấu giá vận tải",
        path: "/shipper/bidding",
        icon: GavelIcon,
        children: [
          { title: "Danh sách phiên", path: "/shipper/bidding/sessions" },
          { title: "Tạo phiên mới", path: "/shipper/bidding/create" },
          { title: "Lịch sử đấu giá", path: "/shipper/bidding/history" },
        ],
      },
      {
        title: "Hợp đồng vận chuyển",
        path: "/shipper/contracts",
        icon: DescriptionIcon,
        children: [
          { title: "Đang hoạt động", path: "/shipper/contracts/active" },
        ],
      },
    ],
  },
  {
    title: "TÀI CHÍNH & ĐỊA ĐIỂM",
    items: [
      {
        title: "Ví & Thanh toán",
        path: "/shipper/wallet",
        icon: AccountBalanceWalletIcon,
        children: [
          { title: "Tổng quan ví", path: "/shipper/wallet/overview" },
          { title: "Lịch sử giao dịch", path: "/shipper/wallet/transactions" },
        ],
      },
      {
        title: "Sổ địa chỉ kho",
        path: "/shipper/fleet/routes",
        icon: LocalShippingIcon,
      },
    ],
  },
  {
    title: "HỆ THỐNG",
    items: [
      {
        title: "Cài đặt tài khoản",
        path: "/shipper/settings",
        icon: SettingsIcon,
      },
    ],
  },
];

export default shipperNavigation;
