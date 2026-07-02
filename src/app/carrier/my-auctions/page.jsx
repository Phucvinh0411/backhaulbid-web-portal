"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Link from "next/link";
import { 
  LocalShipping as LocalShippingIcon,
  CalendarToday as CalendarTodayIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  CancelOutlined as CancelOutlinedIcon,
  EmojiEvents as EmojiEventsIcon
} from "@mui/icons-material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { PageHeader, ViewModeToggle, DetailDrawer, DetailRow } from "@/components/common";

const myRegisteredAuctions = [
  {
    id: "BID-2454",
    origin: "Đà Nẵng",
    destination: "Quy Nhơn",
    cargoType: "Hàng đông lạnh",
    weight: "5 Tấn",
    pickupTime: "15/08/2026",
    status: "BIDDING",
    basePrice: "8,000,000 ₫",
    currentLowestBid: "7,800,000 ₫",
    registeredVehicle: "29H-123.45 (15 Tấn)"
  },
  {
    id: "BID-2455",
    origin: "Hải Phòng",
    destination: "Ninh Bình",
    cargoType: "Phân bón",
    weight: "10 Tấn",
    pickupTime: "16/08/2026",
    status: "OPEN_REGISTER",
    basePrice: "4,000,000 ₫",
    registeredVehicle: "51C-456.78 (8 Tấn)"
  },
  {
    id: "BID-2420",
    origin: "Hồ Chí Minh",
    destination: "Cần Thơ",
    cargoType: "Hàng điện tử",
    weight: "8 Tấn",
    pickupTime: "01/08/2026",
    status: "CLOSED",
    basePrice: "6,000,000 ₫",
    myFinalBid: "5,500,000 ₫",
    winningBid: "5,500,000 ₫",
    isWinner: true,
    registeredVehicle: "29H-123.45 (15 Tấn)"
  },
  {
    id: "BID-2415",
    origin: "Hà Nội",
    destination: "Thanh Hóa",
    cargoType: "Vật liệu xây dựng",
    weight: "20 Tấn",
    pickupTime: "25/07/2026",
    status: "CLOSED",
    basePrice: "10,000,000 ₫",
    myFinalBid: "9,000,000 ₫",
    winningBid: "8,500,000 ₫",
    isWinner: false,
    registeredVehicle: "30F-987.65 (10 Tấn)"
  }
];

export default function MyAuctionsPage() {
  const [filter, setFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState("CARD");
  const [openDetailDrawer, setOpenDetailDrawer] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState(null);

  const handleOpenDetails = (auction) => {
    setSelectedAuction(auction);
    setOpenDetailDrawer(true);
  };

  const getStatusChip = (status, isWinner) => {
    switch (status) {
      case "OPEN_REGISTER":
        return <Chip label="Đang chờ mở phiên" color="info" size="small" className="font-semibold" />;
      case "BIDDING":
        return <Chip label="Đang đấu giá" color="success" size="small" className="font-semibold animate-pulse-glow" />;
      case "CLOSED":
        if (isWinner) {
          return <Chip icon={<EmojiEventsIcon />} label="Trúng thầu" color="warning" size="small" className="font-bold text-amber-600 bg-amber-100" sx={{ "& .MuiChip-icon": { color: "inherit" } }} />;
        }
        return <Chip icon={<CancelOutlinedIcon />} label="Trượt thầu" color="default" size="small" className="font-semibold text-slate-500 bg-slate-200" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  const filteredAuctions = myRegisteredAuctions.filter(a => {
    if (filter === "ACTIVE") return a.status !== 'CLOSED';
    if (filter === "WON") return a.status === 'CLOSED' && a.isWinner;
    if (filter === "LOST") return a.status === 'CLOSED' && !a.isWinner;
    return true; // ALL
  });

  return (
    <Box className="animate-fade-in-up">
      <PageHeader 
        title="Phiên đấu giá của tôi" 
        subtitle="Quản lý và xem lịch sử các chuyến hàng bạn đã tham gia đấu giá"
        breadcrumbs={[
          { label: "Trang chủ", path: "/carrier" },
          { label: "Vận hành", path: "#" },
          { label: "Phiên đấu giá của tôi", path: "#" }
        ]}
      />

      <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Tabs 
          value={filter} 
          onChange={(e, v) => setFilter(v)}
          textColor="primary"
          indicatorColor="primary"
          sx={{
            "& .MuiTab-root": { textTransform: 'none', fontWeight: 600, fontSize: '0.95rem' }
          }}
        >
          <Tab value="ALL" label="Tất cả" />
          <Tab value="BIDDING" label="Đang diễn ra" />
          <Tab value="OPEN_REGISTER" label="Chờ mở phiên" />
          <Tab value="CLOSED" label="Đã kết thúc" />
        </Tabs>
        
        <ViewModeToggle 
          viewMode={viewMode}
          onChange={setViewMode}
          sx={{ mb: { xs: 2, sm: 0 } }}
        />
      </Box>

      {filteredAuctions.length === 0 && (
        <Box className="text-center p-10 bg-white/50 backdrop-blur-md rounded-2xl border border-slate-200">
          <Typography variant="h6" className="text-slate-400">Không có dữ liệu</Typography>
        </Box>
      )}

      {viewMode === "CARD" ? (
        <Grid container spacing={3}>
          {filteredAuctions.map((a) => (
            <Grid item xs={12} sm={6} md={4} key={a.id}>
              <Card variant="outlined" className="hover:shadow-md transition-shadow rounded-2xl h-full flex flex-col border-slate-200">
                <CardContent className="flex-1">
                  <Box className="flex justify-between items-start mb-3">
                    <Typography variant="h6" className="font-mono font-bold text-[#1B4965] text-lg">{a.id}</Typography>
                    {getStatusChip(a.status, a.isWinner)}
                  </Box>
                  
                  <Box className="flex items-center gap-2 mb-4">
                    <Typography variant="body1" className="font-bold text-slate-800">{a.origin}</Typography>
                    <ArrowForwardIcon fontSize="small" className="text-slate-400" />
                    <Typography variant="body1" className="font-bold text-slate-800">{a.destination}</Typography>
                  </Box>
                  
                  <Divider className="mb-4" />
                  
                  <Box className="space-y-2 mb-4">
                    <Box className="flex justify-between">
                      <Typography variant="body2" className="text-slate-500">Hàng hóa:</Typography>
                      <Typography variant="body2" className="font-semibold text-slate-800">{a.cargoType} ({a.weight})</Typography>
                    </Box>
                    <Box className="flex justify-between items-center">
                      <Typography variant="body2" className="text-slate-500">Thời gian bốc:</Typography>
                      <Box className="flex items-center gap-1">
                        <CalendarTodayIcon sx={{ fontSize: 14, color: "#94A3B8" }} />
                        <Typography variant="body2" className="font-semibold text-slate-800">{a.pickupTime}</Typography>
                      </Box>
                    </Box>
                    <Box className="flex justify-between">
                      <Typography variant="body2" className="text-slate-500">Xe đăng ký:</Typography>
                      <Typography variant="body2" className="font-semibold text-[#1B4965] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{a.registeredVehicle}</Typography>
                    </Box>
                  </Box>
                  
                  <Box className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <Box className="flex justify-between mb-1">
                      <Typography variant="caption" className="text-slate-500">Giá khởi điểm:</Typography>
                      <Typography variant="caption" className="font-medium text-slate-700">{a.basePrice}</Typography>
                    </Box>
                    {a.status === "BIDDING" && (
                      <Box className="flex justify-between">
                        <Typography variant="body2" className="font-bold text-[#1B4965]">Giá thấp nhất hiện tại:</Typography>
                        <Typography variant="body2" className="font-bold text-emerald-600">{a.currentLowestBid}</Typography>
                      </Box>
                    )}
                    {a.status === "CLOSED" && (
                      <>
                        <Box className="flex justify-between mb-1">
                          <Typography variant="caption" className="text-slate-500">Giá thắng thầu:</Typography>
                          <Typography variant="caption" className="font-medium text-slate-700">{a.winningBid}</Typography>
                        </Box>
                        <Box className="flex justify-between">
                          <Typography variant="body2" className="font-bold text-[#1B4965]">Giá chốt của bạn:</Typography>
                          <Typography variant="body2" className={`font-bold ${a.isWinner ? 'text-emerald-600' : 'text-slate-500'}`}>{a.myFinalBid}</Typography>
                        </Box>
                      </>
                    )}
                  </Box>
                </CardContent>
                <CardActions className="p-4 pt-0 border-t border-slate-100">
                  {a.status === "BIDDING" ? (
                    <Button 
                      fullWidth 
                      variant="contained"
                      color="primary"
                      component={Link} 
                      href={`/carrier/auctions/${a.id}`}
                      sx={{ backgroundColor: "#1B4965" }}
                    >
                      Vào phòng đấu giá
                    </Button>
                  ) : (
                    <Button 
                      fullWidth 
                      variant="outlined"
                      color="inherit"
                      onClick={() => handleOpenDetails(a)}
                    >
                      Xem chi tiết
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <TableContainer component={Paper} className="rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
          <Table sx={{ minWidth: 800 }}>
            <TableHead className="bg-slate-50">
              <TableRow>
                <TableCell className="font-bold text-slate-600">Mã phiên</TableCell>
                <TableCell className="font-bold text-slate-600">Tuyến đường</TableCell>
                <TableCell className="font-bold text-slate-600">Hàng hóa</TableCell>
                <TableCell className="font-bold text-slate-600">Xe đăng ký</TableCell>
                <TableCell className="font-bold text-slate-600">Thời gian bốc</TableCell>
                <TableCell className="font-bold text-slate-600">Trạng thái</TableCell>
                <TableCell align="right" className="font-bold text-slate-600">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredAuctions.map((a) => (
                <TableRow key={a.id} hover className="transition-colors">
                  <TableCell>
                    <Typography variant="body2" className="font-mono font-bold text-[#1B4965]">{a.id}</Typography>
                  </TableCell>
                  <TableCell>
                    <Box className="flex items-center gap-1">
                      <Typography variant="body2" className="font-bold text-slate-800">{a.origin}</Typography>
                      <ArrowForwardIcon sx={{ fontSize: 16 }} className="text-slate-400" />
                      <Typography variant="body2" className="font-bold text-slate-800">{a.destination}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" className="text-slate-800">{a.cargoType} ({a.weight})</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" className="font-semibold text-[#1B4965] inline-block bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {a.registeredVehicle}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" className="text-slate-800">{a.pickupTime}</Typography>
                  </TableCell>
                  <TableCell>{getStatusChip(a.status, a.isWinner)}</TableCell>
                  <TableCell align="right">
                    {a.status === "BIDDING" ? (
                      <Button 
                        size="small" 
                        variant="contained"
                        color="primary"
                        component={Link} 
                        href={`/carrier/auctions/${a.id}`}
                        sx={{ borderRadius: "6px" }}
                      >
                        Vào phòng
                      </Button>
                    ) : (
                      <Button 
                        size="small" 
                        variant="outlined"
                        color="inherit"
                        onClick={() => handleOpenDetails(a)}
                        sx={{ borderRadius: "6px" }}
                      >
                        Xem chi tiết
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Drawer Xem Chi tiết Phiên Đấu Giá */}
      <DetailDrawer
        open={openDetailDrawer}
        onClose={() => setOpenDetailDrawer(false)}
        title="Chi tiết Phiên Đấu Giá"
      >
        {selectedAuction && (
          <Box className="space-y-4">
            <Typography variant="body1">
              Thông tin chi tiết phiên <strong>{selectedAuction.id}</strong>
            </Typography>
            <Box className="bg-white border border-slate-100 rounded-xl mt-2 overflow-hidden">
              <Box className="px-4 py-2">
                <DetailRow label="Tuyến đường" value={`${selectedAuction.origin} - ${selectedAuction.destination}`} />
                <DetailRow label="Hàng hóa" value={`${selectedAuction.cargoType} (${selectedAuction.weight})`} />
                <DetailRow label="Ngày bốc hàng" value={selectedAuction.pickupTime} />
                <DetailRow label="Xe đăng ký" value={selectedAuction.registeredVehicle} />
                <DetailRow label="Giá khởi điểm" value={selectedAuction.basePrice} />
                {selectedAuction.status === "CLOSED" && (
                  <>
                    <DetailRow label="Giá thắng thầu" value={selectedAuction.winningBid} />
                    <DetailRow label="Giá chốt của bạn" value={selectedAuction.myFinalBid} />
                    <DetailRow 
                      label="Kết quả" 
                      value={selectedAuction.isWinner ? "Trúng thầu" : "Không trúng thầu"} 
                      valueColor={selectedAuction.isWinner ? "text-emerald-600" : "text-slate-500"} 
                    />
                  </>
                )}
              </Box>
            </Box>
            {selectedAuction.status === "BIDDING" && (
              <Button 
                variant="contained" 
                fullWidth
                component={Link}
                href={`/carrier/auctions/${selectedAuction.id}`}
                sx={{ borderRadius: "8px", bgcolor: "#1B4965", "&:hover": { bgcolor: "#0d2b3e" }, mt: 2 }}
              >
                Vào phòng đấu giá
              </Button>
            )}
          </Box>
        )}
      </DetailDrawer>
    </Box>
  );
}
