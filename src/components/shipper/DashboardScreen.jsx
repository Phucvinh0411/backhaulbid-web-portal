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
  Alert,
  LinearProgress,
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
import BarChartOutlinedIcon from "@mui/icons-material/BarChartOutlined";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AddIcon from "@mui/icons-material/Add";
import SettingsIcon from "@mui/icons-material/Settings";
import RouteIcon from "@mui/icons-material/Route";

import { PageHeader, StatCard } from "@/components/common";
import ActionInbox from "@/components/dashboard/ActionInbox";
import AppCard from "@/components/common/AppCard";
import { tokens } from "@/theme/theme";
import { useShipperDashboard } from "@/hooks/useShipperDashboard";
import useAccountVerification from "@/hooks/useAccountVerification";

const AUCTION_LOCK_REASON = "Hoàn tất xác thực eKYC và doanh nghiệp để tạo phiên đấu giá";

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

const formatDisplayId = (id) => {
  if (!id) return "";
  const str = String(id);
  if (str.startsWith("seed-auc-")) {
    const parts = str.split("-");
    return `#AUC-${parts[2] || str.slice(9, 15)}`;
  }
  if (str.startsWith("seed-auc2-")) {
    const parts = str.split("-");
    return `#AUC2-${parts[2] || str.slice(10, 16)}`;
  }
  if (str.length > 14 && str.includes("-")) {
    return `#${str.slice(0, 6)}...${str.slice(-4)}`;
  }
  return str;
};

export default function DashboardScreen() {
  const router = useRouter();
  const [timeFilter, setTimeFilter] = useState("month");
  const verification = useAccountVerification(true);
  const verificationLocked = !verification.loading && !verification.fullyVerified;

  const { data, loading, error } = useShipperDashboard(timeFilter);

  const handleTimeChange = (event, newTime) => {
    if (newTime !== null) {
      setTimeFilter(newTime);
    }
  };

  return (
    <Box className="w-full flex flex-col gap-4">
      <PageHeader
        title="Tổng quan"
        subtitle="Việc cần xử lý trước, sau đó là tình hình phiên đấu giá và chuyến vận chuyển."
        action={
          <MuiTooltip title={verificationLocked ? AUCTION_LOCK_REASON : ""}>
            <span>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                disabled={verificationLocked}
                onClick={() => !verificationLocked && router.push("/shipper/bidding/create")}
              >
                Tạo phiên đấu giá
              </Button>
            </span>
          </MuiTooltip>
        }
      />
      <ActionInbox role="shipper" />

      {loading && <LinearProgress aria-label="Đang tải số liệu tổng quan" />}
      {error && <Alert severity="error">{error}</Alert>}

      {/* KPI Cards */}
      <Box>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Đang đấu giá"
              value={`${data.activeAuctionsCount} lô hàng`}
              subtitle="Phiên đấu thầu mở"
              icon={GavelIcon}
              color="var(--color-brand)"
              tooltipInfo="Các lô hàng của bạn đang trong thời gian mở thầu công khai"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Đang vận chuyển"
              value={`${data.inTransitCount} đơn hàng`}
              subtitle="Đang di chuyển thực tế"
              icon={LocalShippingIcon}
              color="var(--color-success)"
              tooltipInfo="Đơn hàng đã chốt thầu và đang được đơn vị vận chuyển giao hàng"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Chi tiêu tháng này"
              value={formatShortCurrency(data.monthlySpend)}
              subtitle="So với tháng trước"
              icon={AccountBalanceWalletIcon}
              color={tokens.info}
              tooltipInfo="Tổng cước phí vận chuyển đã thanh toán & dự kiến chi trong tháng"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Tiết kiệm dự kiến"
              value={formatShortCurrency(data.estimatedSavings)}
              subtitle="Nhờ đấu giá ngược"
              icon={AssignmentTurnedInIcon}
              color="var(--color-warning)"
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
              <AppCard showAccent={false} className="overflow-hidden relative">
                <CardContent className="p-6">
                  <Box className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
                    <Typography variant="h6" className="font-bold text-[var(--color-brand)]">
                      Phân tích chi phí &amp; tiết kiệm (VNĐ)
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
                          color: "var(--color-ink-muted)",
                          borderColor: "var(--color-line)",
                        },
                        "& .Mui-selected": {
                          color: "var(--color-brand) !important",
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
                            <stop offset="5%" stopColor={tokens.brand} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={tokens.brand} stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={tokens.success} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={tokens.success} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={tokens.line} />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: tokens.inkSubtle, fontSize: 12, fontWeight: 600 }}
                          dy={10}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: tokens.inkSubtle, fontSize: 12, fontWeight: 600 }}
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
                            border: "1px solid var(--color-line)",
                            boxShadow: "0 8px 30px rgba(27,73,101,0.1)",
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="spend"
                          name="spend"
                          stroke={tokens.brand}
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#colorSpend)"
                        />
                        <Area
                          type="monotone"
                          dataKey="savings"
                          name="savings"
                          stroke={tokens.success}
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
              <AppCard showAccent={false} className="overflow-hidden relative">
                <CardContent className="p-6">
                  <Box className="flex items-center justify-between mb-4">
                    <Typography variant="h6" className="font-bold text-[var(--color-brand)]">
                      Lô hàng đang vận chuyển
                    </Typography>
                    <Button
                      component={Link}
                      href="/shipper/tracking"
                      variant="text"
                      size="small"
                      endIcon={<ChevronRightIcon />}
                      sx={{ color: "var(--color-brand)", fontWeight: "bold" }}
                    >
                      Xem tất cả
                    </Button>
                  </Box>
                  <Box className="flex flex-col gap-3">
                    {data.activeShipments.length === 0 ? (
                      <Typography variant="body2" className="text-ink-muted italic py-4 text-center">
                        Không có lô hàng nào đang vận chuyển.
                      </Typography>
                    ) : (
                      data.activeShipments.map((shipment) => (
                        <Box
                          key={shipment.id}
                        className="p-4 rounded-xl border border-line bg-surface hover:border-line-strong transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                      >
                        <Box className="flex items-center gap-4">
                          <Box className="w-10 h-10 rounded-full bg-brand-soft flex items-center justify-center text-[var(--color-brand)]">
                            <LocalShippingIcon fontSize="small" />
                          </Box>
                          <Box>
                            <Typography variant="subtitle2" className="font-bold text-ink" title={`Mã chuyến: ${shipment.id}`}>
                              {formatDisplayId(shipment.id)} ({shipment.goodsType})
                            </Typography>
                            <Typography variant="body2" className="text-ink-muted font-medium">
                              {shipment.route}
                            </Typography>
                          </Box>
                        </Box>
                        <Box className="flex items-center gap-4 w-full md:w-[45%]">
                          <Box className="w-full flex flex-col gap-1">
                            <Box className="flex justify-between items-center">
                              <Typography variant="caption" className="text-xs font-medium text-ink-muted">
                                {shipment.driverPlate} • {shipment.driverName}
                              </Typography>
                              <Typography variant="caption" className="text-[var(--color-brand)] font-bold">
                                {shipment.progress}%
                              </Typography>
                            </Box>
                            <Box className="w-full h-2 bg-surface-sunken rounded-full overflow-hidden">
                              <Box
                                className="h-full bg-brand rounded-full"
                                style={{ width: `${shipment.progress}%` }}
                              ></Box>
                            </Box>
                          </Box>
                          <MuiTooltip title="Theo dõi chi tiết">
                            <IconButton
                              component={Link}
                              href={`/shipper/tracking?id=${encodeURIComponent(shipment.id)}`}
                              size="small"
                              className="bg-surface text-[var(--color-brand)] border border-line shadow-sm hover:bg-surface-sunken"
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
              <AppCard showAccent={false} className="overflow-hidden relative">
                <CardContent className="p-6">
                  <Box className="flex items-center justify-between mb-4">
                    <Typography variant="h6" className="font-bold text-[var(--color-brand)]">
                      Phiên đấu giá sắp kết thúc
                    </Typography>
                    <Chip label="Đang đấu" size="small" color="primary" sx={{ fontWeight: "bold" }} />
                  </Box>
                  <Box className="flex flex-col gap-4">
                    {data.endingAuctions.length === 0 ? (
                      <Typography variant="body2" className="text-ink-muted italic py-4 text-center">
                        Không có phiên đấu giá nào đang diễn ra.
                      </Typography>
                    ) : (
                      data.endingAuctions.map((auction) => (
                        <Box
                          key={auction.id}
                        className="p-4 rounded-xl border border-line bg-surface hover:border-line-strong transition-colors group relative overflow-hidden"
                      >

                        <Box className="flex justify-between items-start gap-2 mb-1 relative z-10">
                          <Typography
                            variant="subtitle2"
                            className="font-mono font-bold text-[var(--color-brand)] tracking-tight truncate max-w-[150px]"
                            title={`Mã phiên: ${auction.id}`}
                          >
                            {formatDisplayId(auction.id)}
                          </Typography>
                          <Typography
                            variant="caption"
                            className={`shrink-0 px-2 py-0.5 rounded font-semibold border ${
                              auction.isEnded
                                ? "text-ink-muted bg-surface-sunken border-line"
                                : "text-warning bg-warning-soft border-warning-soft"
                            }`}
                          >
                            {auction.timeLeft}
                          </Typography>
                        </Box>

                        <Typography variant="body2" className="text-ink font-bold mb-1 relative z-10">
                          {auction.goodsType}
                        </Typography>
                        <Typography variant="body2" className="text-ink-muted mb-3 relative z-10 font-medium">
                          {auction.route}
                        </Typography>

                        <Divider className="my-2.5 opacity-60" />

                        <Box className="flex justify-between items-center relative z-10">
                          <Box>
                            <Typography variant="caption" className="text-xs font-medium text-ink-muted block">
                              Giá thấp nhất / Khởi điểm
                            </Typography>
                            <Typography variant="body2" className="font-bold text-success tabular">
                              {formatCurrency(auction.currentLowest)}
                            </Typography>
                          </Box>
                          <Button
                            component={Link}
                            href={`/shipper/bidding/history?id=${auction.id}`}
                            variant="contained"
                            size="small"
                          >
                            Xem thầu
                          </Button>
                        </Box>
                      </Box>
                    )))}
                  </Box>
                </CardContent>
              </AppCard>

              {/* Quick Actions Card */}
              <AppCard showAccent={false} className="overflow-hidden relative">
                <CardContent className="p-6">
                  <Typography variant="h6" className="font-bold text-[var(--color-brand)] mb-4">
                    Thao tác nhanh
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <MuiTooltip title={verificationLocked ? AUCTION_LOCK_REASON : ""}>
                        <span style={{ display: "block" }}>
                          <Button
                            component={verificationLocked ? "button" : Link}
                            href={verificationLocked ? undefined : "/shipper/bidding/create"}
                            disabled={verificationLocked}
                            variant="outlined"
                            fullWidth
                            startIcon={<AddIcon />}
                            sx={{
                              flexDirection: "column",
                              gap: 1,
                              py: 2,
                              borderRadius: 3,
                              borderColor: "divider",
                              color: "var(--color-brand)",
                              "& .MuiButton-startIcon": { m: 0 },
                              fontSize: "0.8rem",
                              fontWeight: 600,
                              "&:hover": {
                                borderColor: "var(--color-brand)",
                                bgcolor: "var(--color-brand-soft)",
                              },
                            }}
                          >
                            Đăng lô hàng
                          </Button>
                        </span>
                      </MuiTooltip>
                    </Grid>
                    {[
                      { href: "/shipper/wallet/overview", icon: <AccountBalanceWalletIcon />, label: "Quản lý ví" },
                      { href: "/shipper/fleet/routes", icon: <RouteIcon />, label: "Kho bãi" },
                      { href: "/shipper/settings", icon: <SettingsIcon />, label: "Cấu hình" },
                      { href: "/shipper/statistics", icon: <BarChartOutlinedIcon />, label: "Thống kê" },
                    ].map((action) => (
                      <Grid item xs={6} key={action.href}>
                        <Button
                          component={Link}
                          href={action.href}
                          variant="outlined"
                          fullWidth
                          startIcon={action.icon}
                          sx={{
                            flexDirection: "column",
                            gap: 1,
                            py: 2,
                            borderRadius: 3,
                            borderColor: "divider",
                            color: "var(--color-brand)",
                            "& .MuiButton-startIcon": { m: 0 },
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            "&:hover": {
                              borderColor: "var(--color-brand)",
                              bgcolor: "var(--color-brand-soft)",
                            },
                          }}
                        >
                          {action.label}
                        </Button>
                      </Grid>
                    ))}
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
