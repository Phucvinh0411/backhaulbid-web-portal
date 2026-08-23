"use client";

import { DashboardOutlined as DashboardIcon, GavelOutlined as GavelIcon, LocalShippingOutlined as LocalShippingIcon, AccountCircleOutlined as AccountCircleIcon, AssignmentTurnedInOutlined as AssignmentTurnedInIcon, AccountBalanceWalletOutlined as AccountBalanceWalletIcon, DirectionsCarOutlined as DirectionsCarIcon, ReportProblemOutlined as ReportProblemIcon } from "@mui/icons-material";

const carrierNavigation = [
  {
    title: "TỔNG QUAN",
    items: [
      {
        title: "Bảng điều khiển",
        path: "/carrier/dashboard",
        icon: DashboardIcon,
      },
    ],
  },
  {
    title: "VẬN HÀNH",
    items: [
      {
        title: "Đấu giá",
        path: "/carrier/auction-group", // virtual path
        icon: GavelIcon,
        children: [
          {
            title: "Khám phá đấu giá",
            path: "/carrier/auctions",
          },
          {
            title: "Phiên của tôi",
            path: "/carrier/my-auctions",
          }
        ]
      },
      {
        title: "Vận chuyển",
        path: "/carrier/transports",
        icon: LocalShippingIcon,
      },
      {
        title: "Hợp đồng",
        path: "/carrier/contracts",
        icon: AssignmentTurnedInIcon,
      },
      {
        title: "Khiếu nại",
        path: "/carrier/complaints",
        icon: ReportProblemIcon,
      },
      {
        title: "Đội xe",
        path: "/carrier/fleet", // virtual path
        icon: DirectionsCarIcon,
        children: [
          {
            title: "Phương tiện",
            path: "/carrier/vehicles",
          },
          {
            title: "Tài xế",
            path: "/carrier/drivers",
          },
        ]
      },
    ],
  },
  {
    title: "CÁ NHÂN",
    items: [
      {
        title: "Hồ sơ & eKYC",
        path: "/carrier/settings",
        icon: AccountCircleIcon,
      },
      {
        title: "Ví thanh toán",
        path: "/carrier/wallet",
        icon: AccountBalanceWalletIcon,
      },
    ],
  },
];

export default carrierNavigation;
