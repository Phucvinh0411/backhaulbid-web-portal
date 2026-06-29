"use client";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import LocalShippingIcon from "@mui/icons-material/LocalShippingOutlined";
import GavelIcon from "@mui/icons-material/GavelOutlined";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import TrendingUpIcon from "@mui/icons-material/TrendingUpOutlined";
import { PageHeader, StatCard } from "@/components/common";

const stats = [
  {
    title: "Tổng phiên đấu giá",
    value: "1,284",
    subtitle: "+12% so với tháng trước",
    icon: GavelIcon,
    color: "#1B4965",
  },
  {
    title: "Phương tiện hoạt động",
    value: "342",
    subtitle: "85% tỷ lệ vận hành",
    icon: LocalShippingIcon,
    color: "#62B6CB",
  },
  {
    title: "Doanh thu tháng",
    value: "2.4 tỷ",
    subtitle: "+8.2% so với tháng trước",
    icon: AccountBalanceWalletIcon,
    color: "#2E7D32",
  },
  {
    title: "Tỷ lệ thành công",
    value: "94.5%",
    subtitle: "+2.1% so với tháng trước",
    icon: TrendingUpIcon,
    color: "#ED6C02",
  },
];

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Tổng quan hoạt động nền tảng BackHaulBid"
        breadcrumbs={[
          { label: "Trang chủ", path: "/" },
          { label: "Dashboard" },
        ]}
      />

      {/* Stats Grid */}
      <Grid container spacing={3} className="!mb-6">
        {stats.map((stat, index) => (
          <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={index}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      {/* Placeholder cards for future charts */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card className="min-h-[360px]">
            <CardContent className="!p-5">
              <Typography variant="h6" className="!font-semibold text-slate-700 !mb-4">
                Biểu đồ doanh thu
              </Typography>
              <Box className="flex items-center justify-center h-[280px] bg-slate-50 rounded-lg border border-dashed border-slate-200">
                <Typography variant="body2" className="text-slate-400">
                  Biểu đồ sẽ được tích hợp tại đây
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, lg: 4 }}>
          <Card className="min-h-[360px]">
            <CardContent className="!p-5">
              <Typography variant="h6" className="!font-semibold text-slate-700 !mb-4">
                Phiên đấu giá gần đây
              </Typography>
              <Box className="flex items-center justify-center h-[280px] bg-slate-50 rounded-lg border border-dashed border-slate-200">
                <Typography variant="body2" className="text-slate-400">
                  Danh sách phiên đấu giá sẽ hiển thị tại đây
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
