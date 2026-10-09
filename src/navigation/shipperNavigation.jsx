import {
  DashboardOutlined as DashboardIcon,
  BarChartOutlined as StatisticsIcon,
  LocalShippingOutlined as LocalShippingIcon,
  GavelOutlined as GavelIcon,
  AccountBalanceWalletOutlined as AccountBalanceWalletIcon,
  DescriptionOutlined as DescriptionIcon,
  SettingsOutlined as SettingsIcon,
  ReportProblemOutlined as ReportProblemIcon,
  WarehouseOutlined as WarehouseIcon,
  AddCircleOutline as AddIcon,
} from "@mui/icons-material";

const shipperNavigation = [
  {
    title: "Tổng quan",
    items: [
      { title: "Việc cần xử lý", path: "/shipper/dashboard", icon: DashboardIcon, exact: true },
      { title: "Thống kê", path: "/shipper/statistics", icon: StatisticsIcon, exact: true },
    ],
  },
  {
    title: "Đấu giá và vận chuyển",
    items: [
      {
        title: "Đấu giá vận tải",
        path: "/shipper/bidding",
        icon: GavelIcon,
        children: [
          { title: "Phiên của tôi", path: "/shipper/bidding/sessions" },
          { title: "Tạo phiên mới", path: "/shipper/bidding/create" },
        ],
      },
      { title: "Chuyến vận chuyển", path: "/shipper/tracking", icon: LocalShippingIcon },
      {
        title: "Hợp đồng",
        path: "/shipper/contracts",
        icon: DescriptionIcon,
        children: [
          { title: "Tất cả hợp đồng", path: "/shipper/contracts", exact: true },
          { title: "Đang hoạt động", path: "/shipper/contracts/active" },
        ],
      },
      { title: "Khiếu nại", path: "/shipper/complaints", icon: ReportProblemIcon },
    ],
  },
  {
    title: "Tài chính và địa điểm",
    items: [
      {
        title: "Ví và thanh toán",
        path: "/shipper/wallet",
        icon: AccountBalanceWalletIcon,
        children: [
          { title: "Tổng quan ví", path: "/shipper/wallet/overview" },
          { title: "Lịch sử giao dịch", path: "/shipper/wallet/transactions" },
        ],
      },
      { title: "Sổ địa chỉ kho", path: "/shipper/fleet/routes", icon: WarehouseIcon },
    ],
  },
  {
    title: "Tài khoản",
    items: [{ title: "Xác minh tài khoản", path: "/shipper/settings", icon: SettingsIcon }],
  },
];

/** Bottom navigation on phones: the shipper's recurring questions first. */
export const shipperMobileNavigation = [
  { title: "Việc cần làm", path: "/shipper/dashboard", icon: DashboardIcon },
  { title: "Phiên", path: "/shipper/bidding/sessions", match: ["/shipper/bidding"], icon: GavelIcon },
  { title: "Chuyến", path: "/shipper/tracking", icon: LocalShippingIcon },
  { title: "Khiếu nại", path: "/shipper/complaints", icon: ReportProblemIcon },
];

export const shipperQuickAction = { title: "Tạo phiên", path: "/shipper/bidding/create", icon: AddIcon };

export default shipperNavigation;
