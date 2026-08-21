"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Box,
  Typography,
  Grid,
  CardContent,
  Button,
  Divider,
  IconButton,
  Chip,
  Tooltip as MuiTooltip,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";

import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import GavelIcon from "@mui/icons-material/Gavel";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AddIcon from "@mui/icons-material/Add";
import SettingsIcon from "@mui/icons-material/Settings";
import RouteIcon from "@mui/icons-material/Route";

import { PageHeader, StatCard } from "@/components/common";
import AppCard from "@/components/common/AppCard";
import { useShipperDashboard } from "@/hooks/useShipperDashboard";

const formatCurrency = (value) => {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
};

const formatShortCurrency = (value) => {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}T ₫`;
  } else if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}Tr ₫`;
  } else if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K ₫`;
  }
  return formatCurrency(value);
};

export default function DashboardScreen() {
  const router = useRouter();
  const [timeFilter, setTimeFilter] = useState("month");
  
  const { data, loading, error } = useShipperDashboard(timeFilter);

  const handleTimeChange = (event, newTime) => {
    if (newTime !== null) {
      setTimeFilter(newTime);
    }
  };

  if (loading) {
    return (
      <Box className="flex h-96 w-full items-center justify-center">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="p-4">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box className="animate-fade-in-up pb-12 w-full mt-2 flex flex-col gap-6">
      <PageHeader
        title="Trung tâm điều phối Logistics"
        subtitle="Tổng quan hoạt động đấu giá và quản lý vận tải của doanh nghiệp"
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push("/shipper/bidding/create")}
            className="!rounded-2xl !py-3 !px-6 !text-sm !font-bold !capitalize shadow-lg hover:shadow-xl transition-all duration-300"
            sx={{
              background: "linear-gradient(135deg, #1B4965 0%, #0D2B3E 100%)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              "&:hover": {
                background: "linear-gradient(135deg, #0D2B3E 0%, #1B4965 100%)",
              },
            }}
          >
            Tạo lô hàng mới
          </Button>
        }
      />

      {/* KPI Cards */}
      <Box>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Đang đấu giá"
              value={`${data.activeAuctionsCount} lô hàng`}
              subtitle="Phiên đấu thầu mở"
              icon={GavelIcon}
              color="#1B4965"
              tooltipInfo="Các lô hàng của bạn đang trong thời gian mở thầu công khai"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Đang vận chuyển"
              value={`${data.inTransitCount} đơn hàng`}
              subtitle="Đang di chuyển thực tế"
              icon={LocalShippingIcon}
              color="#10b981"
              tooltipInfo="Đơn hàng đã chốt thầu và đang được đơn vị vận chuyển giao hàng"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Chi tiêu tháng này"
              value={formatShortCurrency(data.monthlySpend)}
              subtitle="So với tháng trước"
              icon={AccountBalanceWalletIcon}
              color="#3b82f6"
              tooltipInfo="Tổng cước phí vận chuyển đã thanh toán & dự kiến chi trong tháng"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Tiết kiệm dự kiến"
              value={formatShortCurrency(data.estimatedSavings)}
              subtitle="Nhờ đấu giá ngược"
              icon={AssignmentTurnedInIcon}
              color="#f59e0b"
              tooltipInfo="Số tiền tiết kiệm được so với mức giá tối đa ban đầu"
            />
          </Grid>
        </Grid>
      </Box>

      {/* Main Content Grid */}
      <Box>
        <Grid container spacing={4}>
          {/* Left Column: Spending Chart & Active Shipments */}
          <Grid item xs={12} md={8}>
            <Box className="flex flex-col gap-6">
              
              {/* Spending & Savings Chart */}
              <AppCard showAccent={false} className="glass overflow-hidden rounded-2xl border-white/50 shadow-sm relative">
                <CardContent className="p-6">
                  <Box className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
                    <Typography variant="h6" className="font-bold text-[#1B4965]">
                      Phân tích chi phí & Tiết kiệm (VNĐ)
                    </Typography>
                    <ToggleButtonGroup
                      value={timeFilter}
                      exclusive
                      onChange={handleTimeChange}
                      size="small"
                      sx={{
                        "& .MuiToggleButton-root": {
                          py: 0.5,
                          px: 2,
                          textTransform: "none",
                          fontWeight: 600,
                          fontSize: "0.8rem",
                          color: "#64748b",
                          borderColor: "#e2e8f0",
                        },
                        "& .Mui-selected": {
                          color: "#1B4965 !important",
                          bgcolor: "rgba(27,73,101,0.08) !important",
                        },
                      }}
                    >
                      <ToggleButton value="week">Tuần</ToggleButton>
                      <ToggleButton value="month">Tháng</ToggleButton>
                      <ToggleButton value="year">Năm</ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                  <Box className="h-[280px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.spendData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#1B4965" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#1B4965" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }}
                          dy={10}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }}
                          tickFormatter={(value) => `${value / 1000000}Tr`}
                          dx={-5}
                        />
                        <RechartsTooltip
                          formatter={(value, name) => [
                            formatCurrency(value),
                            name === "spend" ? "Chi phí thực tế" : "Tiết kiệm được",
                          ]}
                          contentStyle={{
                            borderRadius: "12px",
                            border: "1px solid #e2e8f0",
                            boxShadow: "0 8px 30px rgba(27,73,101,0.1)",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="spend"
                          name="spend"
                          stroke="#1B4965"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorSpend)"
                        />
                        <Area
                          type="monotone"
                          dataKey="savings"
                          name="savings"
                          stroke="#10b981"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorSavings)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </Box>
                </CardContent>
              </AppCard>

              {/* Active Shipments in transit */}
              <AppCard showAccent={false} className="glass overflow-hidden rounded-2xl border-white/50 shadow-sm relative">
                <CardContent className="p-6">
                  <Box className="flex items-center justify-between mb-4">
                    <Typography variant="h6" className="font-bold text-[#1B4965]">
                      Lô hàng đang vận chuyển
                    </Typography>
                    <Button
                      component={Link}
                      href="/shipper/bidding/sessions"
                      variant="text"
                      size="small"
                      endIcon={<ChevronRightIcon />}
                      sx={{ color: "#1B4965", fontWeight: "bold" }}
                    >
                      Xem tất cả
                    </Button>
                  </Box>
                  <Box className="flex flex-col gap-3">
                    {data.activeShipments.length === 0 ? (
                      <Typography variant="body2" className="text-slate-500 italic py-4 text-center">
                        Không có lô hàng nào đang vận chuyển.
                      </Typography>
                    ) : (
                      data.activeShipments.map((shipment) => (
                        <Box
                          key={shipment.id}
                        className="p-4 rounded-xl border border-slate-100 bg-white/60 hover:bg-white transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_20px_rgba(27,73,101,0.06)]"
                      >
                        <Box className="flex items-center gap-4">
                          <Box className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#1B4965]">
                            <LocalShippingIcon fontSize="small" />
                          </Box>
                          <Box>
                            <Typography variant="subtitle2" className="font-bold text-slate-800">
                              {shipment.id} ({shipment.goodsType})
                            </Typography>
                            <Typography variant="body2" className="text-slate-500 font-medium">
                              {shipment.route}
                            </Typography>
                          </Box>
                        </Box>
                        <Box className="flex items-center gap-4 w-full md:w-[45%]">
                          <Box className="w-full flex flex-col gap-1">
                            <Box className="flex justify-between items-center">
                              <Typography variant="caption" className="text-slate-500 font-bold uppercase tracking-wider">
                                {shipment.driverPlate} • {shipment.driverName}
                              </Typography>
                              <Typography variant="caption" className="text-[#1B4965] font-bold">
                                {shipment.progress}%
                              </Typography>
                            </Box>
                            <Box className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                              <Box
                                className="h-full bg-gradient-to-r from-blue-400 to-[#1B4965] rounded-full"
                                style={{ width: `${shipment.progress}%` }}
                              ></Box>
                            </Box>
                          </Box>
                          <MuiTooltip title="Theo dõi chi tiết">
                            <IconButton
                              component={Link}
                              href={`/shipper/fleet/routes?tripId=${shipment.id}`}
                              size="small"
                              className="bg-white text-[#1B4965] border border-slate-200 shadow-sm hover:bg-slate-50"
                            >
                              <ChevronRightIcon />
                            </IconButton>
                          </MuiTooltip>
                        </Box>
                      </Box>
                    )))}
                  </Box>
                </CardContent>
              </AppCard>
            </Box>
          </Grid>

          {/* Right Column: Active Auctions & Quick Actions */}
          <Grid item xs={12} md={4}>
            <Box className="flex flex-col gap-6 h-full">
              
              {/* Ending Auctions */}
              <AppCard showAccent={false} className="glass overflow-hidden rounded-2xl border-white/50 shadow-sm relative">
                <CardContent className="p-6">
                  <Box className="flex items-center justify-between mb-4">
                    <Typography variant="h6" className="font-bold text-[#1B4965]">
                      Phiên đấu giá sắp kết thúc
                    </Typography>
                    <Chip label="Đang Đấu" size="small" color="primary" sx={{ fontWeight: "bold" }} />
                  </Box>
                  <Box className="flex flex-col gap-4">
                    {data.endingAuctions.length === 0 ? (
                      <Typography variant="body2" className="text-slate-500 italic py-4 text-center">
                        Không có phiên đấu giá nào đang diễn ra.
                      </Typography>
                    ) : (
                      data.endingAuctions.map((auction) => (
                        <Box
                          key={auction.id}
                        className="p-4 rounded-xl border border-slate-200 bg-white/80 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden"
                      >
                        <Box className="absolute -right-6 -top-6 w-16 h-16 bg-gradient-to-br from-transparent via-[#62b6cb]/10 to-[#62b6cb]/30 rounded-full group-hover:scale-[2] transition-transform duration-500"></Box>

                        <Box className="flex justify-between items-start mb-1 relative z-10">
                          <Typography variant="subtitle2" className="font-bold text-[#1B4965]">
                            {auction.id}
                          </Typography>
                          <Typography
                            variant="caption"
                            className="text-orange-600 bg-orange-50 px-2 py-0.5 rounded font-semibold border border-orange-100"
                          >
                            Còn {auction.timeLeft}
                          </Typography>
                        </Box>

                        <Typography variant="body2" className="text-slate-700 font-bold mb-1 relative z-10">
                          {auction.goodsType}
                        </Typography>
                        <Typography variant="body2" className="text-slate-500 mb-3 relative z-10 font-medium">
                          {auction.route}
                        </Typography>

                        <Divider className="my-2.5 opacity-60" />

                        <Box className="flex justify-between items-center relative z-10">
                          <Box>
                            <Typography variant="caption" className="text-slate-400 block uppercase tracking-widest font-bold text-[0.6rem]">
                              Giá thấp nhất / Khởi điểm
                            </Typography>
                            <Typography variant="body2" className="font-extrabold text-emerald-600">
                              {formatCurrency(auction.currentLowest)}
                            </Typography>
                          </Box>
                          <Button
                            component={Link}
                            href={`/shipper/bidding/history?id=${auction.id}`}
                            variant="contained"
                            size="small"
                            sx={{
                              bgcolor: "#1B4965",
                              borderRadius: "8px",
                              "&:hover": { bgcolor: "#0d2b3e" },
                              px: 2,
                              py: 0.75,
                              fontSize: "0.75rem",
                              fontWeight: "bold",
                            }}
                          >
                            Xem Thầu
                          </Button>
                        </Box>
                      </Box>
                    )))}
                  </Box>
                </CardContent>
              </AppCard>

              {/* Quick Actions Card */}
              <AppCard showAccent={false} className="glass overflow-hidden rounded-2xl border-white/50 shadow-sm relative">
                <CardContent className="p-6">
                  <Typography variant="h6" className="font-bold text-[#1B4965] mb-4">
                    Thao tác nhanh
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Button
                        component={Link}
                        href="/shipper/bidding/create"
                        variant="outlined"
                        fullWidth
                        startIcon={<AddIcon />}
                        sx={{
                          flexDirection: "column",
                          gap: 1,
                          py: 2,
                          borderRadius: "16px",
                          borderColor: "rgba(27,73,101,0.15)",
                          color: "#1B4965",
                          "& .MuiButton-startIcon": { m: 0 },
                          fontSize: "0.8rem",
                          fontWeight: "bold",
                          "&:hover": {
                            borderColor: "#1B4965",
                            bgcolor: "rgba(27,73,101,0.02)",
                          },
                        }}
                      >
                        Đăng Lô Hàng
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button
                        component={Link}
                        href="/shipper/wallet/overview"
                        variant="outlined"
                        fullWidth
                        startIcon={<AccountBalanceWalletIcon />}
                        sx={{
                          flexDirection: "column",
                          gap: 1,
                          py: 2,
                          borderRadius: "16px",
                          borderColor: "rgba(27,73,101,0.15)",
                          color: "#1B4965",
                          "& .MuiButton-startIcon": { m: 0 },
                          fontSize: "0.8rem",
                          fontWeight: "bold",
                          "&:hover": {
                            borderColor: "#1B4965",
                            bgcolor: "rgba(27,73,101,0.02)",
                          },
                        }}
                      >
                        Quản Lý Ví
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button
                        component={Link}
                        href="/shipper/fleet/routes"
                        variant="outlined"
                        fullWidth
                        startIcon={<RouteIcon />}
                        sx={{
                          flexDirection: "column",
                          gap: 1,
                          py: 2,
                          borderRadius: "16px",
                          borderColor: "rgba(27,73,101,0.15)",
                          color: "#1B4965",
                          "& .MuiButton-startIcon": { m: 0 },
                          fontSize: "0.8rem",
                          fontWeight: "bold",
                          "&:hover": {
                            borderColor: "#1B4965",
                            bgcolor: "rgba(27,73,101,0.02)",
                          },
                        }}
                      >
                        Kho Bãi
                      </Button>
                    </Grid>
                    <Grid item xs={6}>
                      <Button
                        component={Link}
                        href="/shipper/settings"
                        variant="outlined"
                        fullWidth
                        startIcon={<SettingsIcon />}
                        sx={{
                          flexDirection: "column",
                          gap: 1,
                          py: 2,
                          borderRadius: "16px",
                          borderColor: "rgba(27,73,101,0.15)",
                          color: "#1B4965",
                          "& .MuiButton-startIcon": { m: 0 },
                          fontSize: "0.8rem",
                          fontWeight: "bold",
                          "&:hover": {
                            borderColor: "#1B4965",
                            bgcolor: "rgba(27,73,101,0.02)",
                          },
                        }}
                      >
                        Cấu Hình
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </AppCard>

            </Box>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
