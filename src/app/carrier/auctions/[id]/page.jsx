"use client";

import { useState, useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import InputAdornment from "@mui/material/InputAdornment";
import Avatar from "@mui/material/Avatar";
import { 
  ArrowBack as ArrowBackIcon,
  Timer as TimerIcon,
  LocalShipping as LocalShippingIcon,
  Gavel as GavelIcon,
  MonetizationOn as MonetizationOnIcon,
  LocationOn as LocationOnIcon,
  TrendingDown as TrendingDownIcon
} from "@mui/icons-material";
import Link from "next/link";
import { PageHeader } from "@/components/common";

const MOCK_VEHICLES = [
  { id: "V1", plate: "29H-123.45", capacity: "15 Tấn" },
  { id: "V2", plate: "30F-987.65", capacity: "10 Tấn" },
];

export default function LiveBiddingRoom({ params }) {
  const { id } = params;
  
  // Simulated state
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [currentLowestBid, setCurrentLowestBid] = useState(5500000);
  const [myBid, setMyBid] = useState(5400000);
  const [bidHistory, setBidHistory] = useState([
    { id: 1, bidder: "Nhà xe H***", amount: 5500000, time: "Vừa xong" },
    { id: 2, bidder: "Vận tải T***", amount: 5800000, time: "1 phút trước" },
    { id: 3, bidder: "Logistics V***", amount: 6000000, time: "3 phút trước" },
    { id: 4, bidder: "Nhà xe Phát Tài", amount: 6100000, time: "5 phút trước" },
    { id: 5, bidder: "Vận tải Tiến Đạt", amount: 6250000, time: "8 phút trước" },
    { id: 7, bidder: "Nhà xe Q***", amount: 6500000, time: "15 phút trước" },
  ]);

  const latestBidRef = useRef(currentLowestBid);
  useEffect(() => {
    latestBidRef.current = currentLowestBid;
  }, [currentLowestBid]);

  // Timer and Bot Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prevTime) => {
        const newTime = prevTime > 0 ? prevTime - 1 : 0;
        
        // 40% chance to have a new bid every second if time > 10
        if (newTime > 10 && Math.random() > 0.6) {
          const prevBid = latestBidRef.current;
          
          if (prevBid >= 4000000) {
            const drop = Math.floor(Math.random() * 2 + 1) * 50000;
            const newBid = prevBid - drop;
            
            setCurrentLowestBid(newBid);
            setBidHistory(history => [
              { id: Date.now() + Math.random(), bidder: `Nhà xe ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}***`, amount: newBid, time: "Vừa xong" },
              ...history
            ]);
          }
        }
        
        return newTime;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleQuickBid = (dropAmount) => {
    setMyBid(currentLowestBid - dropAmount);
  };

  const handleSubmitBid = () => {
    if (myBid >= currentLowestBid) {
      alert("Giá thầu phải thấp hơn giá hiện tại!");
      return;
    }
    setCurrentLowestBid(myBid);
    setBidHistory(history => [
      { id: Date.now(), bidder: "Bạn (Tôi)", amount: myBid, time: "Vừa xong", isMe: true },
      ...history
    ]);
    alert("Đặt giá thầu thành công!");
  };

  return (
    <Box className="animate-fade-in-up pb-10">
      <PageHeader 
        title="Theo dõi phiên đấu giá"
        breadcrumbs={[
          { label: "Trang chủ", path: "/carrier/dashboard" },
          { label: "Vận hành", path: "#" },
          { label: "Đấu giá", path: "/carrier/auctions" },
          { label: id, path: "#" }
        ]}
      />

      <Grid container spacing={3}>
        {/* LEO BOARD - Thông tin & Lịch sử */}
        <Grid item xs={12} lg={7}>
          <Box className="flex flex-col gap-6">
          <Card className="glass border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm">
            <Box className="bg-[#1B4965] text-white p-5 flex justify-between items-center relative overflow-hidden">
              <Box className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4">
                <LocalShippingIcon sx={{ fontSize: 120 }} />
              </Box>
              <Box className="relative z-10">
                <Typography variant="caption" className="uppercase tracking-widest opacity-80 font-semibold block mb-1">
                  Phiên đấu giá
                </Typography>
                <Typography variant="h5" className="font-bold">
                  {id}
                </Typography>
                <Box className="flex items-center gap-2 mt-2 opacity-90">
                  <LocationOnIcon fontSize="small" />
                  <Typography variant="body2">Hồ Chí Minh → Cần Thơ</Typography>
                </Box>
              </Box>
              
              <Box className="relative z-10 text-right">
                <Chip 
                  icon={<TimerIcon className="!text-white" />} 
                  label={formatTime(timeLeft)} 
                  className={`!font-bold !text-lg !px-2 ${timeLeft < 60 ? 'bg-red-500 animate-pulse' : 'bg-white/20'}`}
                  sx={{ color: "white" }}
                />
                <Typography variant="caption" className="block mt-2 opacity-80">
                  Thời gian còn lại
                </Typography>
              </Box>
            </Box>

            <CardContent className="p-6">
              <Typography variant="subtitle2" className="text-slate-500 uppercase tracking-wider mb-3">
                Chi tiết chuyến hàng
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                  <Typography variant="caption" className="text-slate-400">Loại hàng hóa</Typography>
                  <Typography variant="body2" className="font-semibold text-slate-800">Hàng tiêu dùng</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="caption" className="text-slate-400">Yêu cầu tải trọng</Typography>
                  <Typography variant="body2" className="font-semibold text-slate-800">8 Tấn</Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Typography variant="caption" className="text-slate-400">Thời gian bốc hàng</Typography>
                  <Typography variant="body2" className="font-semibold text-slate-800">11/08/2026 08:00 AM</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Bản đồ tuyến đường (Placeholder) */}
          <Card className="glass border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm">
            <Box className="h-[300px] w-full bg-slate-100 relative">
              <iframe 
                width="100%" 
                height="100%" 
                frameBorder="0" 
                scrolling="no" 
                marginHeight="0" 
                marginWidth="0" 
                src="https://www.openstreetmap.org/export/embed.html?bbox=105.6%2C9.9%2C106.8%2C11.0&amp;layer=mapnik&amp;marker=10.82%2C106.63"
                title="Bản đồ tuyến đường"
              ></iframe>
              <Box className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur p-4 rounded-xl shadow-lg border border-slate-100 flex justify-between items-center">
                <Box>
                  <Typography variant="caption" className="text-slate-500 block">Khoảng cách dự kiến</Typography>
                  <Typography variant="body2" className="font-bold text-slate-800">~ 165 km</Typography>
                </Box>
                <Divider orientation="vertical" flexItem className="opacity-50" />
                <Box>
                  <Typography variant="caption" className="text-slate-500 block">Thời gian di chuyển</Typography>
                  <Typography variant="body2" className="font-bold text-slate-800">3 giờ 30 phút</Typography>
                </Box>
                <Divider orientation="vertical" flexItem className="opacity-50" />
                <Box>
                  <Typography variant="caption" className="text-slate-500 block">Tuyến ưu tiên</Typography>
                  <Typography variant="body2" className="font-bold text-slate-800">QL1A - CT01</Typography>
                </Box>
              </Box>
            </Box>
          </Card>
          </Box>
        </Grid>

        {/* BIDDING ARENA - Hành động đặt giá */}
        <Grid item xs={12} lg={5}>
          <Box className="flex flex-col gap-6">
          <Card className="border border-[#10B981]/30 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgba(16,185,129,0.15)] relative">
            {/* Background Glow */}
            <Box className="absolute top-0 left-0 w-full h-full pointer-events-none" sx={{ background: "radial-gradient(circle at top right, rgba(16,185,129,0.1), transparent 70%)" }} />
            
            <CardContent className="p-6 relative z-10 flex flex-col">
              <Box className="text-center mb-6 mt-2">
                <Typography variant="subtitle2" className="text-[#10B981] font-bold uppercase tracking-widest flex items-center justify-center gap-1 mb-2">
                  <TrendingDownIcon fontSize="small" /> Đang dẫn đầu
                </Typography>
                <Typography 
                  variant="h3" 
                  className="font-black text-slate-800 animate-pulse-glow"
                  key={currentLowestBid} // trigger animation on change
                  sx={{ animation: "pulse 0.5s ease-in-out" }}
                >
                  {formatCurrency(currentLowestBid)}
                </Typography>
                <Typography variant="caption" className="text-slate-400 block mt-2">
                  Giá khởi điểm: 6,500,000 ₫
                </Typography>
              </Box>

              <Divider className="opacity-60 mb-6" />

              <Box className="flex-1 flex flex-col gap-4">
                <Box className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                  <Box>
                    <Typography variant="caption" className="text-slate-500 block">Phương tiện đã đăng ký</Typography>
                    <Typography variant="body2" className="font-bold text-[#1B4965]">29H-123.45 (15 Tấn)</Typography>
                  </Box>
                  <Chip label="Hợp lệ" size="small" color="success" className="!font-medium" />
                </Box>

                <Box>
                  <Typography variant="caption" className="text-slate-500 block mb-2 font-medium">Đặt nhanh (so với giá hiện tại):</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Button variant="outlined" color="primary" fullWidth onClick={() => handleQuickBid(100000)} sx={{ borderRadius: "8px" }}>
                        - 100k
                      </Button>
                    </Grid>
                    <Grid item xs={4}>
                      <Button variant="outlined" color="primary" fullWidth onClick={() => handleQuickBid(200000)} sx={{ borderRadius: "8px" }}>
                        - 200k
                      </Button>
                    </Grid>
                    <Grid item xs={4}>
                      <Button variant="outlined" color="primary" fullWidth onClick={() => handleQuickBid(500000)} sx={{ borderRadius: "8px" }}>
                        - 500k
                      </Button>
                    </Grid>
                  </Grid>
                </Box>

                <TextField
                  fullWidth
                  label="Hoặc nhập giá mong muốn"
                  type="number"
                  value={myBid}
                  onChange={(e) => setMyBid(Number(e.target.value))}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">₫</InputAdornment>,
                  }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px", fontSize: "1.2rem", fontWeight: "bold" } }}
                />

                <Button 
                  variant="contained" 
                  fullWidth 
                  size="large"
                  onClick={handleSubmitBid}
                  startIcon={<GavelIcon />}
                  className="!bg-emerald-500 hover:!bg-emerald-600 !text-white"
                  sx={{ 
                    mt: "auto", 
                    py: 1.5, 
                    borderRadius: "12px", 
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    boxShadow: "0 8px 16px rgba(16, 185, 129, 0.25)"
                  }}
                >
                  Chốt Giá Thầu Này
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* LỊCH SỬ ĐẶT GIÁ (Chuyển sang cột phải) */}
          <Card className="border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm">
            <CardContent className="p-6">
              <Typography variant="subtitle2" className="text-slate-500 uppercase tracking-wider mb-4 flex items-center justify-between">
                Lịch sử đặt giá
                <Chip label={`${bidHistory.length} lượt`} size="small" className="!text-[10px] !h-5" />
              </Typography>
              <Box className="space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                {bidHistory.map((bid, idx) => (
                  <Box 
                    key={bid.id} 
                    className={`flex items-center justify-between p-3 rounded-xl transition-all ${idx === 0 ? 'animate-flash-highlight border' : 'bg-slate-50 hover:bg-slate-100'}`}
                  >
                    <Box className="flex items-center gap-3">
                      <Avatar sx={{ width: 32, height: 32, bgcolor: bid.isMe ? "#1B4965" : "#94A3B8", fontSize: "0.85rem" }}>
                        {bid.isMe ? "Tôi" : bid.bidder.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" className={`font-bold ${bid.isMe ? 'text-[#1B4965]' : 'text-slate-700'}`}>
                          {bid.bidder}
                        </Typography>
                        <Typography variant="caption" className="text-slate-400 block -mt-0.5">{bid.time}</Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" className={`font-black ${idx === 0 ? 'text-emerald-600 text-base' : 'text-slate-600'}`}>
                      {formatCurrency(bid.amount)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
