"use client";

import { useState } from "react";
import { Box, Typography, Grid, Card, CardContent, Button, Divider, IconButton, Chip, Tooltip as MuiTooltip, ToggleButton, ToggleButtonGroup } from "@mui/material";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import GavelIcon from "@mui/icons-material/Gavel";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Link from "next/link";
import { PageHeader, StatCard } from "@/components/common";

// MOCK DATA
const revenueData = [
  { name: "T1", revenue: 40000000 },
  { name: "T2", revenue: 30000000 },
  { name: "T3", revenue: 45000000 },
  { name: "T4", revenue: 50000000 },
  { name: "T5", revenue: 65000000 },
  { name: "T6", revenue: 55000000 },
  { name: "T7", revenue: 85000000 }, // current
];

const activeTransports = [
  { id: "TRP-9001", route: "Hà Nội - Hải Phòng", status: "Đang Di Chuyển", progress: 65 },
  { id: "TRP-9002", route: "Bắc Ninh - Thái Nguyên", status: "Đã Lấy Hàng", progress: 25 },
];

const hotAuctions = [
  { id: "BID-2451", route: "Hà Nội - Đà Nẵng", price: "12,500,000đ", endIn: "2 giờ" },
  { id: "BID-2458", route: "Hải Phòng - HCM", price: "35,000,000đ", endIn: "5 giờ" },
  { id: "BID-2460", route: "Bắc Giang - Lạng Sơn", price: "5,200,000đ", endIn: "1 ngày" },
  { id: "BID-2461", route: "Hà Nội - Hải Phòng", price: "2,400,000đ", endIn: "2 ngày" },
  { id: "BID-2462", route: "Đà Nẵng - Quảng Nam", price: "3,500,000đ", endIn: "3 ngày" },
  { id: "BID-2463", route: "TP.HCM - Bình Dương", price: "1,250,000đ", endIn: "4 ngày" },
  { id: "BID-2464", route: "Hà Nội - Bắc Ninh", price: "1,800,000đ", endIn: "5 ngày" },
  { id: "BID-2465", route: "Hải Phòng - Quảng Ninh", price: "2,100,000đ", endIn: "6 ngày" },
  { id: "BID-2466", route: "TP.HCM - Đồng Nai", price: "1,500,000đ", endIn: "7 ngày" },
];

const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

import Pagination from "@mui/material/Pagination";

export default function CarrierDashboard() {
  const [timeFilter, setTimeFilter] = useState("month");
  const [auctionPage, setAuctionPage] = useState(1);
  const itemsPerPage = 3;
  const totalPages = Math.ceil(hotAuctions.length / itemsPerPage);
  
  const currentAuctions = hotAuctions.slice((auctionPage - 1) * itemsPerPage, auctionPage * itemsPerPage);

  const handleTimeChange = (event, newTime) => {
    if (newTime !== null) {
      setTimeFilter(newTime);
    }
  };

  return (
    <Box className="animate-fade-in-up pb-12 w-full mt-2 flex flex-col gap-6">
      <PageHeader 
        title="Trung tâm điều hành" 
        subtitle="Tổng quan hoạt động kinh doanh và vận tải"
      />

      <Box>
        {/* KPI Cards */}
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Xe rảnh rỗi" 
            value="12 / 45" 
            subtitle="Sẵn sàng nhận chuyến" 
            icon={LocalShippingIcon}
            color="#1B4965"
            tooltipInfo="Xe ở trạng thái sẵn sàng không vướng lịch trình trong 24h tới"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Đang tham gia" 
            value="8 phiên" 
            subtitle="Chờ kết quả đấu giá" 
            icon={GavelIcon}
            color="#f59e0b"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Đang vận chuyển" 
            value="23 chuyến" 
            subtitle="Hoạt động trong ngày" 
            icon={AssignmentTurnedInIcon}
            color="#10b981"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard 
            title="Doanh thu dự kiến" 
            value="85Tr ₫" 
            subtitle="Tăng 15% so với tháng trước" 
            icon={AccountBalanceWalletIcon}
            color="#3b82f6"
            tooltipInfo="Tổng giá trị các chuyến hàng đã hoàn thành và đang vận chuyển trong tháng"
          />
        </Grid>
      </Grid>
      </Box>

      <Box>
      <Grid container spacing={4}>
        {/* Left Column: Chart & Active Transports */}
        <Grid item xs={12} md={8}>
          <Box className="flex flex-col gap-6">
            
            {/* Revenue Chart */}
            <Card className="glass overflow-hidden rounded-2xl border-white/50 shadow-sm relative">
              <CardContent className="p-6">
                <Box className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-3">
                  <Typography variant="h6" className="font-bold text-[#1B4965]">Biểu đồ doanh thu (VNĐ)</Typography>
                  <ToggleButtonGroup
                    value={timeFilter}
                    exclusive
                    onChange={handleTimeChange}
                    size="small"
                    sx={{
                      '& .MuiToggleButton-root': { py: 0.5, px: 2, textTransform: 'none', fontWeight: 600, fontSize: '0.8rem', color: '#64748b', borderColor: '#e2e8f0' },
                      '& .Mui-selected': { color: '#1B4965 !important', bgcolor: 'rgba(27,73,101,0.08) !important' }
                    }}
                  >
                    <ToggleButton value="week">Tuần</ToggleButton>
                    <ToggleButton value="month">Tháng</ToggleButton>
                    <ToggleButton value="year">Năm</ToggleButton>
                  </ToggleButtonGroup>
                </Box>
                <Box className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1B4965" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#1B4965" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}} tickFormatter={(value) => `${value / 1000000}Tr`} dx={-5} />
                      <RechartsTooltip 
                        formatter={(value) => [formatCurrency(value), "Doanh thu"]}
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 8px 30px rgba(27,73,101,0.1)' }}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#1B4965" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>

            {/* Active Transports */}
            <Card className="glass overflow-hidden rounded-2xl border-white/50 shadow-sm relative">
              <CardContent className="p-6">
                <Box className="flex items-center justify-between mb-4">
                  <Typography variant="h6" className="font-bold text-[#1B4965]">Chuyến xe đang chạy</Typography>
                  <Button component={Link} href="/carrier/transports" variant="text" size="small" endIcon={<ChevronRightIcon />} sx={{ color: '#1B4965', fontWeight: 'bold' }}>
                    Xem tất cả
                  </Button>
                </Box>
                <Box className="flex flex-col gap-3">
                  {activeTransports.map((trp) => (
                    <Box key={trp.id} className="p-4 rounded-xl border border-slate-100 bg-white/60 hover:bg-white transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_20px_rgba(27,73,101,0.06)]">
                      <Box className="flex items-center gap-4">
                        <Box className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                          <LocalShippingIcon fontSize="small" />
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" className="font-bold text-slate-800">{trp.id}</Typography>
                          <Typography variant="body2" className="text-slate-500 font-medium">{trp.route}</Typography>
                        </Box>
                      </Box>
                      <Box className="flex items-center gap-4 w-full md:w-[45%]">
                        <Box className="w-full flex flex-col gap-1">
                          <Box className="flex justify-between items-center">
                            <Typography variant="caption" className="text-slate-500 font-bold uppercase tracking-wider">{trp.status}</Typography>
                            <Typography variant="caption" className="text-emerald-600 font-bold">{trp.progress}%</Typography>
                          </Box>
                          <Box className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                            <Box className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full" style={{ width: `${trp.progress}%` }}></Box>
                          </Box>
                        </Box>
                        <MuiTooltip title="Theo dõi chi tiết">
                          <IconButton component={Link} href={`/carrier/transports/${trp.id}`} size="small" className="bg-white text-[#1B4965] border border-slate-200 shadow-sm hover:bg-slate-50">
                            <ChevronRightIcon />
                          </IconButton>
                        </MuiTooltip>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>

          </Box>
        </Grid>

        {/* Right Column: Hot Auctions */}
        <Grid item xs={12} md={4}>
          <Card className="glass overflow-hidden rounded-2xl border-white/50 shadow-sm h-full relative">
            <CardContent className="p-6 flex flex-col h-full">
              <Box className="flex items-center justify-between mb-6">
                <Typography variant="h6" className="font-bold text-[#1B4965]">Phiên thầu nổi bật</Typography>
                <Chip label="Mới" size="small" color="error" sx={{ fontWeight: 'bold' }} />
              </Box>
              
              <Box className="flex flex-col gap-4 flex-1">
                {currentAuctions.map((auction) => (
                  <Box key={auction.id} className="p-4 rounded-xl border border-slate-200 bg-white/80 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer group relative overflow-hidden">
                    {/* Decorative gradient corner */}
                    <Box className="absolute -right-6 -top-6 w-16 h-16 bg-gradient-to-br from-transparent via-[#62b6cb]/10 to-[#62b6cb]/30 rounded-full group-hover:scale-[2] transition-transform duration-500"></Box>
                    
                    <Box className="flex justify-between items-start mb-2 relative z-10">
                      <Typography variant="subtitle2" className="font-bold text-[#1B4965]">{auction.id}</Typography>
                      <Typography variant="caption" className="text-orange-600 bg-orange-50 px-2 py-0.5 rounded font-semibold border border-orange-100">
                        Còn {auction.endIn}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" className="text-slate-600 mb-3 relative z-10 font-medium">
                      {auction.route}
                    </Typography>
                    
                    <Divider className="my-3 opacity-60" />
                    
                    <Box className="flex justify-between items-center relative z-10">
                      <Box>
                        <Typography variant="caption" className="text-slate-400 block uppercase tracking-widest font-bold text-[0.6rem]">Giá khởi điểm</Typography>
                        <Typography variant="body1" className="font-extrabold text-slate-800">{auction.price}</Typography>
                      </Box>
                      <Button component={Link} href={`/carrier/auctions/${auction.id}`} variant="contained" size="small" sx={{ bgcolor: '#1B4965', borderRadius: '8px', '&:hover': { bgcolor: '#0a1929' }, px: 2, py: 1 }}>
                        Tham gia
                      </Button>
                    </Box>
                  </Box>
                ))}
              </Box>
              
              <Box className="flex justify-center mt-4">
                <Pagination 
                  count={totalPages} 
                  page={auctionPage} 
                  onChange={(event, value) => setAuctionPage(value)} 
                  size="small" 
                  color="primary"
                />
              </Box>
              
              <Button component={Link} href="/carrier/auctions" variant="outlined" fullWidth sx={{ mt: 4, borderRadius: '8px', color: '#1B4965', borderColor: '#1B4965', '&:hover': { borderColor: '#0a1929', bgcolor: 'rgba(27,73,101,0.04)' }, py: 1 }}>
                Khám phá thêm
              </Button>
            </CardContent>
          </Card>
        </Grid>

      </Grid>
      </Box>
    </Box>
  );
}
