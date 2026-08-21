"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Pagination,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip as MuiTooltip,
  Typography,
} from "@mui/material";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import GavelIcon from "@mui/icons-material/Gavel";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Link from "next/link";
import { PageHeader, StatCard } from "@/components/common";
import EmptyRouteDialog from "@/components/carrier/EmptyRouteDialog";
import AppCard from "@/components/common/AppCard";
import { getMyVehicles } from "@/services/fleetApi";
import { contractApi } from "@/services/contractApi";
import { listAuctions, listMyRegistrations } from "@/services/biddingApi";
import { unwrapListData } from "@/services/responseData";

const ACTIVE_TRIP_STATUSES = new Set(["WAITING_PICKUP", "PICKED_UP", "IN_TRANSIT"]);
const TRIP_PROGRESS = {
  WAITING_PICKUP: 0,
  PICKED_UP: 35,
  IN_TRANSIT: 65,
  DELIVERED: 90,
  COMPLETED: 100,
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatShortCurrency = (value) => {
  const amount = Number(value) || 0;
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)} tỷ`;
  if (amount >= 1_000_000) return `${Math.round(amount / 1_000_000)} tr`;
  if (amount >= 1_000) return `${Math.round(amount / 1_000)} nghìn`;
  return `${Math.round(amount)} đ`;
};

const formatRemaining = (value) => {
  const end = new Date(value).getTime();
  if (!Number.isFinite(end)) return "Chưa xác định";
  const diff = end - Date.now();
  if (diff <= 0) return "Đã hết hạn";
  const hours = Math.floor(diff / (60 * 60 * 1000));
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days} ngày`;
  if (hours > 0) return `${hours} giờ`;
  return `${Math.max(1, Math.floor(diff / (60 * 1000)))} phút`;
};

const mapTrip = (trip) => ({
  backendId: trip.id,
  id: `TRP-${String(trip.id || "").slice(0, 8).toUpperCase()}`,
  route: `${trip.pickupLocation || "Chưa cập nhật"} - ${trip.deliveryLocation || "Chưa cập nhật"}`,
  status: trip.status,
  statusLabel: {
    WAITING_PICKUP: "Chờ lấy hàng",
    PICKED_UP: "Đã lấy hàng",
    IN_TRANSIT: "Đang vận chuyển",
  }[trip.status] || trip.status || "Chưa cập nhật",
  progress: TRIP_PROGRESS[trip.status] ?? 0,
  agreedPrice: Number(trip.agreedPrice) || 0,
  createdAt: trip.createdAt,
});

const mapAuction = (auction) => ({
  id: auction.id,
  route: `${auction.originLocationName || auction.origin || "Chưa cập nhật"} - ${auction.destinationLocationName || auction.destination || "Chưa cập nhật"}`,
  price: Number(auction.maxPrice) || 0,
  endTime: auction.endTime,
  status: auction.status,
});

const startOfDay = (date) => {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
};

const buildChartData = (trips, filter) => {
  const now = new Date();
  const buckets = [];

  if (filter === "week") {
    for (let offset = 6; offset >= 0; offset -= 1) {
      const date = startOfDay(now);
      date.setDate(date.getDate() - offset);
      buckets.push({
        key: date.toISOString().slice(0, 10),
        name: new Intl.DateTimeFormat("vi-VN", { weekday: "short" }).format(date),
        revenue: 0,
      });
    }
  } else if (filter === "month") {
    for (let offset = 5; offset >= 0; offset -= 1) {
      const end = startOfDay(now);
      end.setDate(end.getDate() - offset * 5);
      buckets.push({
        key: `${end.getFullYear()}-${end.getMonth()}-${Math.floor(end.getDate() / 5)}`,
        name: new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit" }).format(end),
        revenue: 0,
        start: new Date(end.getTime() - 5 * 24 * 60 * 60 * 1000),
        end,
      });
    }
  } else {
    for (let offset = 11; offset >= 0; offset -= 1) {
      const date = new Date(now.getFullYear(), now.getMonth() - offset, 1);
      buckets.push({
        key: `${date.getFullYear()}-${date.getMonth()}`,
        name: new Intl.DateTimeFormat("vi-VN", { month: "short" }).format(date),
        revenue: 0,
        year: date.getFullYear(),
        month: date.getMonth(),
      });
    }
  }

  trips.filter((trip) => trip.status !== "CANCELLED").forEach((trip) => {
    const createdAt = new Date(trip.createdAt);
    if (Number.isNaN(createdAt.getTime())) return;
    const bucket = buckets.find((candidate) => {
      if (filter === "week") return candidate.key === createdAt.toISOString().slice(0, 10);
      if (filter === "month") return createdAt >= candidate.start && createdAt < new Date(candidate.end.getTime() + 5 * 24 * 60 * 60 * 1000);
      return candidate.year === createdAt.getFullYear() && candidate.month === createdAt.getMonth();
    });
    if (bucket) bucket.revenue += Number(trip.agreedPrice) || 0;
  });

  return buckets.map(({ key, name, revenue }) => ({ key, name, revenue }));
};

export default function CarrierDashboard() {
  const [timeFilter, setTimeFilter] = useState("month");
  const [auctionPage, setAuctionPage] = useState(1);
  const [dashboard, setDashboard] = useState({ vehicles: [], trips: [], auctions: [], registrations: [], wallet: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const itemsPerPage = 3;

  useEffect(() => {
    let active = true;

    const safeFetch = (promise, fallback = []) => promise.catch((err) => {
      console.warn("API fetch warning:", err);
      return fallback;
    });

    Promise.all([
      safeFetch(getMyVehicles()),
      safeFetch(contractApi.listTrips()),
      safeFetch(listAuctions({ status: "OPEN", page: 1, pageSize: 100 })),
      safeFetch(listAuctions({ status: "PENDING", page: 1, pageSize: 100 })),
      safeFetch(listMyRegistrations({ page: 1, pageSize: 100 })),
    ])
      .then(([vehicles, trips, openAuctions, pendingAuctions, registrations]) => {
        if (!active) return;
        const auctionItems = [
          ...unwrapListData(openAuctions),
          ...unwrapListData(pendingAuctions),
        ].filter((auction, index, items) => items.findIndex((candidate) => candidate.id === auction.id) === index);
        setDashboard({
          vehicles: vehicles || [],
          trips: unwrapListData(trips),
          auctions: auctionItems.map(mapAuction),
          registrations: unwrapListData(registrations),
          wallet: null,
        });
      })
      .catch((requestError) => {
        if (active) setError("Không thể tải dữ liệu trung tâm điều hành.");
        console.error(requestError);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const activeTrips = useMemo(
    () => dashboard.trips.filter((trip) => ACTIVE_TRIP_STATUSES.has(trip.status)).map(mapTrip),
    [dashboard.trips],
  );
  const chartData = useMemo(() => buildChartData(dashboard.trips, timeFilter), [dashboard.trips, timeFilter]);
  const verifiedVehicles = dashboard.vehicles.filter((vehicle) => vehicle.status === "VERIFIED").length;
  const expectedValue = dashboard.trips
    .filter((trip) => trip.status !== "CANCELLED")
    .reduce((total, trip) => total + (Number(trip.agreedPrice) || 0), 0);
  const totalPages = Math.max(1, Math.ceil(dashboard.auctions.length / itemsPerPage));
  const currentAuctions = dashboard.auctions.slice((auctionPage - 1) * itemsPerPage, auctionPage * itemsPerPage);

  const [emptyRouteOpen, setEmptyRouteOpen] = useState(false);

  const handleTimeChange = (event, newTime) => {
    if (newTime !== null) setTimeFilter(newTime);
  };

  if (loading) {
    return (
      <Box className="flex min-h-[320px] items-center justify-center gap-2 text-slate-500">
        <CircularProgress size={24} /> Đang tải trung tâm điều hành...
      </Box>
    );
  }

  return (
    <Box className="animate-fade-in-up pb-12 w-full mt-2 flex flex-col gap-6">
      <PageHeader 
        title="Trung tâm điều hành" 
        subtitle="Tổng quan hoạt động kinh doanh và vận tải" 
        action={
          <Button 
            variant="contained" 
            startIcon={<LocalShippingIcon />}
            onClick={() => setEmptyRouteOpen(true)}
            sx={{ bgcolor: "#1B4965", "&:hover": { bgcolor: "#0a1929" }, borderRadius: "8px" }}
          >
            Khai báo xe rỗng
          </Button>
        }
      />
      <EmptyRouteDialog 
        open={emptyRouteOpen} 
        onClose={() => setEmptyRouteOpen(false)} 
        vehicles={dashboard.vehicles} 
      />
      {error && <Alert severity="error" className="!rounded-xl">{error}</Alert>}

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Xe đã xác minh" value={`${verifiedVehicles} / ${dashboard.vehicles.length}`} subtitle="Hồ sơ đạt duyệt" icon={LocalShippingIcon} color="#1B4965" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Đang tham gia" value={`${dashboard.registrations.length} phiên`} subtitle="Từ dữ liệu đăng ký của bạn" icon={GavelIcon} color="#ED6C02" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Đang vận chuyển" value={`${activeTrips.length} chuyến`} subtitle="Chờ lấy hàng hoặc đang chạy" icon={AssignmentTurnedInIcon} color="#2E7D32" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Giá trị chuyến" value={formatShortCurrency(expectedValue)} subtitle="Các chuyến chưa bị hủy" icon={AccountBalanceWalletIcon} color="#62B6CB" tooltipInfo="Tổng giá trị thỏa thuận của các chuyến trong dữ liệu hiện tại; đây chưa phải số tiền đã quyết toán." />
        </Grid>
      </Grid>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Box className="flex flex-col gap-6">
            <AppCard showAccent={false} className="glass overflow-hidden rounded-2xl border-white/50 shadow-sm relative">
              <CardContent className="p-6">
                <Box className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
                  <Box>
                    <Typography variant="h6" className="font-bold text-[#1B4965]">Giá trị chuyến (VNĐ)</Typography>
                    <Typography variant="body2" className="text-slate-500">Tổng theo thời điểm tạo chuyến từ dữ liệu thật</Typography>
                  </Box>
                  <ToggleButtonGroup value={timeFilter} exclusive onChange={handleTimeChange} size="small" sx={{ "& .MuiToggleButton-root": { py: 0.5, px: 2, textTransform: "none", fontWeight: 600, fontSize: "0.8rem", color: "#64748b", borderColor: "#e2e8f0" }, "& .Mui-selected": { color: "#1B4965 !important", bgcolor: "rgba(27,73,101,0.08) !important" } }}>
                    <ToggleButton value="week">Tuần</ToggleButton>
                    <ToggleButton value="month">Tháng</ToggleButton>
                    <ToggleButton value="year">Năm</ToggleButton>
                  </ToggleButtonGroup>
                </Box>
                <Box className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1B4965" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#1B4965" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }} tickFormatter={formatShortCurrency} dx={-5} />
                      <RechartsTooltip formatter={(value) => [formatCurrency(value), "Giá trị chuyến"]} contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", boxShadow: "0 8px 30px rgba(27,73,101,0.1)" }} />
                      <Area type="monotone" dataKey="revenue" stroke="#1B4965" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </AppCard>

            <AppCard showAccent={false} className="glass overflow-hidden rounded-2xl border-white/50 shadow-sm relative">
              <CardContent className="p-6">
                <Box className="flex items-center justify-between mb-4">
                  <Typography variant="h6" className="font-bold text-[#1B4965]">Chuyến xe đang chạy</Typography>
                  <Button component={Link} href="/carrier/transports" variant="text" size="small" endIcon={<ChevronRightIcon />} sx={{ color: "#1B4965", fontWeight: "bold" }}>Xem tất cả</Button>
                </Box>
                {activeTrips.length === 0 ? (
                  <Box className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">Chưa có chuyến đang vận chuyển.</Box>
                ) : (
                  <Box className="flex flex-col gap-3">
                    {activeTrips.slice(0, 4).map((trip) => (
                      <Box key={trip.backendId} className="p-4 rounded-xl border border-slate-100 bg-white/60 hover:bg-white transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                        <Box className="flex items-center gap-4">
                          <Box className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600"><LocalShippingIcon fontSize="small" /></Box>
                          <Box>
                            <Typography variant="subtitle2" className="font-bold text-slate-800">{trip.id}</Typography>
                            <Typography variant="body2" className="text-slate-500 font-medium">{trip.route}</Typography>
                          </Box>
                        </Box>
                        <Box className="flex items-center gap-4 w-full md:w-[45%]">
                          <Box className="w-full flex flex-col gap-1">
                            <Box className="flex justify-between items-center">
                              <Typography variant="caption" className="text-slate-500 font-bold uppercase tracking-wider">{trip.statusLabel}</Typography>
                              <Typography variant="caption" className="text-emerald-600 font-bold">{trip.progress}%</Typography>
                            </Box>
                            <Box className="w-full h-2 bg-slate-100 rounded-full overflow-hidden"><Box className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full" style={{ width: `${trip.progress}%` }} /></Box>
                          </Box>
                          <MuiTooltip title="Theo dõi chi tiết"><IconButton component={Link} href={`/carrier/transports/${trip.backendId}`} size="small" className="bg-white text-[#1B4965] border border-slate-200 shadow-sm hover:bg-slate-50"><ChevronRightIcon /></IconButton></MuiTooltip>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </AppCard>
          </Box>
        </Grid>

        <Grid item xs={12} md={4}>
          <AppCard showAccent={false} className="glass overflow-hidden rounded-2xl border-white/50 shadow-sm h-full relative">
            <CardContent className="p-6 flex flex-col h-full">
              <Box className="flex items-center justify-between mb-6">
                <Typography variant="h6" className="font-bold text-[#1B4965]">Phiên đang mở</Typography>
                <Chip label={`${dashboard.auctions.length} phiên`} size="small" color="info" sx={{ fontWeight: "bold" }} />
              </Box>
              <Box className="flex flex-col gap-4 flex-1">
                {currentAuctions.length === 0 ? (
                  <Box className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-slate-500">Hiện chưa có phiên đấu giá phù hợp.</Box>
                ) : currentAuctions.map((auction) => (
                  <Box key={auction.id} className="p-4 rounded-xl border border-slate-200 bg-white/80 shadow-sm hover:shadow-md transition-all duration-300 group relative overflow-hidden">
                    <Box className="absolute -right-6 -top-6 w-16 h-16 bg-gradient-to-br from-transparent via-[#62b6cb]/10 to-[#62b6cb]/30 rounded-full group-hover:scale-[2] transition-transform duration-500" />
                    <Box className="flex justify-between items-start mb-2 relative z-10">
                      <Typography variant="subtitle2" className="font-bold text-[#1B4965]">{String(auction.id).slice(0, 12)}</Typography>
                      <Typography variant="caption" className="text-orange-600 bg-orange-50 px-2 py-0.5 rounded font-semibold border border-orange-100">Còn {formatRemaining(auction.endTime)}</Typography>
                    </Box>
                    <Typography variant="body2" className="text-slate-600 mb-3 relative z-10 font-medium">{auction.route}</Typography>
                    <Divider className="my-3 opacity-60" />
                    <Box className="flex justify-between items-center relative z-10">
                      <Box><Typography variant="caption" className="text-slate-400 block uppercase tracking-widest font-bold text-[0.6rem]">Giá tối đa</Typography><Typography variant="body1" className="font-extrabold text-slate-800">{formatCurrency(auction.price)}</Typography></Box>
                      <Button component={Link} href={`/carrier/auctions/${auction.id}`} variant="contained" size="small" sx={{ bgcolor: "#1B4965", borderRadius: "8px", "&:hover": { bgcolor: "#0a1929" }, px: 2, py: 1 }}>Xem phiên</Button>
                    </Box>
                  </Box>
                ))}
              </Box>
              {dashboard.auctions.length > 0 && <Box className="flex justify-center mt-4"><Pagination count={totalPages} page={auctionPage} onChange={(event, value) => setAuctionPage(value)} size="small" color="primary" /></Box>}
              <Button component={Link} href="/carrier/auctions" variant="outlined" fullWidth sx={{ mt: 4, borderRadius: "8px", color: "#1B4965", borderColor: "#1B4965", "&:hover": { borderColor: "#0a1929", bgcolor: "rgba(27,73,101,0.04)" }, py: 1 }}>Khám phá thêm</Button>
            </CardContent>
          </AppCard>
        </Grid>
      </Grid>
    </Box>
  );
}
