"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
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
import { useState } from "react";
import { PageHeader, ViewModeToggle, DetailDrawer, DetailRow } from "@/components/common";

const myRegisteredAuctions = [
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

export default function AuctionHistoryPage() {
  const [viewMode, setViewMode] = useState("CARD");
  const [openDetailDrawer, setOpenDetailDrawer] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState(null);

  const handleOpenDetails = (auction) => {
    setSelectedAuction(auction);
    setOpenDetailDrawer(true);
  };

  const getStatusChip = (status, isWinner) => {
    if (isWinner) {
      return <Chip icon={<EmojiEventsIcon />} label="Trúng thầu" color="warning" size="small" className="font-bold text-amber-600 bg-amber-100" sx={{ "& .MuiChip-icon": { color: "inherit" } }} />;
    }
    return <Chip icon={<CancelOutlinedIcon />} label="Trượt thầu" color="default" size="small" className="font-semibold text-slate-500 bg-slate-200" />;
  };

  const historyAuctions = myRegisteredAuctions.filter(a => a.status === 'CLOSED');

  return (
    <Box className="animate-fade-in-up">
      <PageHeader 
        title="Lịch sử đấu giá" 
        subtitle="Xem lại toàn bộ kết quả các chuyến hàng bạn đã tham gia đấu giá trong quá khứ"
      />

      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h6" className="text-[#1B4965] font-bold">
          Các phiên đã kết thúc ({historyAuctions.length})
        </Typography>

        <ViewModeToggle 
          viewMode={viewMode}
          onChange={setViewMode}
        />
      </Box>

      {historyAuctions.length === 0 && (
        <Box className="text-center p-10 bg-white/50 backdrop-blur-md rounded-2xl border border-slate-200">
          <Typography variant="h6" className="text-slate-400">Không có dữ liệu</Typography>
        </Box>
      )}

      {viewMode === "CARD" ? (
        <Grid container spacing={3}>
          {historyAuctions.map((auction) => (
            <Grid item xs={12} md={6} lg={4} key={auction.id}>
              <Card 
                className="h-full flex flex-col rounded-2xl border border-[#1B4965]/20 shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                sx={{ background: "rgba(255,255,255,0.8)", backdropFilter: "blur(12px)" }}
              >
                <Box className="p-5 pb-3">
                  <Box className="flex justify-between items-start mb-3">
                    <Chip label={auction.id} size="small" sx={{ bgcolor: "rgba(27,73,101,0.1)", color: "#1B4965", fontWeight: 700 }} />
                    {getStatusChip(auction.status, auction.isWinner)}
                  </Box>
                  
                  <Box className="flex items-center gap-3 mb-4">
                    <Box className="flex flex-col flex-1">
                      <Typography variant="body2" className="text-slate-500 font-medium">Từ</Typography>
                      <Typography variant="subtitle1" className="font-bold text-slate-800 line-clamp-1">{auction.origin}</Typography>
                    </Box>
                    <ArrowForwardIcon className="text-slate-300" />
                    <Box className="flex flex-col flex-1 text-right">
                      <Typography variant="body2" className="text-slate-500 font-medium">Đến</Typography>
                      <Typography variant="subtitle1" className="font-bold text-slate-800 line-clamp-1">{auction.destination}</Typography>
                    </Box>
                  </Box>
                </Box>
  
                <Divider className="opacity-60" />
  
                <CardContent className="flex-1 pb-2">
                  <Grid container spacing={2} className="mb-3">
                    <Grid item xs={6}>
                      <Box className="flex items-start gap-2">
                        <LocalShippingIcon className="text-slate-400 text-[1.1rem] mt-0.5" />
                        <Box>
                          <Typography variant="caption" className="text-slate-500 block">Tải trọng & Hàng</Typography>
                          <Typography variant="body2" className="font-semibold text-slate-700">{auction.weight} - {auction.cargoType}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                    <Grid item xs={6}>
                      <Box className="flex items-start gap-2">
                        <CalendarTodayIcon className="text-slate-400 text-[1.1rem] mt-0.5" />
                        <Box>
                          <Typography variant="caption" className="text-slate-500 block">Ngày bốc dự kiến</Typography>
                          <Typography variant="body2" className="font-semibold text-slate-700">{auction.pickupTime}</Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
  
                  <Box className={`rounded-xl p-3 space-y-2 ${auction.isWinner ? 'bg-amber-50/50' : 'bg-slate-50'}`}>
                    <Box className="flex items-center gap-2">
                      <CheckCircleOutlineIcon className="text-[#10B981] text-[1.2rem]" />
                      <Typography variant="body2" className="text-slate-600 flex-1">
                        Xe tham gia: <strong className="text-slate-800">{auction.registeredVehicle}</strong>
                      </Typography>
                    </Box>
                    <Divider className="opacity-50" />
                    
                    <Box className="flex justify-between items-center">
                      <Typography variant="body2" className="text-slate-500">Giá bạn đặt (cuối):</Typography>
                      <Typography variant="body2" className={`font-semibold ${auction.isWinner ? 'text-amber-600' : 'text-slate-700'}`}>{auction.myFinalBid}</Typography>
                    </Box>
                    <Box className="flex justify-between items-center">
                      <Typography variant="body2" className="text-[#10B981] font-medium">Giá chốt thầu:</Typography>
                      <Typography variant="body2" className="font-bold text-[#10B981]">{auction.winningBid}</Typography>
                    </Box>
                  </Box>
                </CardContent>
  
                <CardActions className="p-4 pt-0">
                  <Button 
                    variant="outlined"
                    color="inherit"
                    fullWidth
                    onClick={() => handleOpenDetails(auction)}
                    sx={{ borderRadius: "10px", py: 1 }}
                  >
                    Xem chi tiết
                  </Button>
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
                <TableCell className="font-bold text-slate-600">Xe tham gia</TableCell>
                <TableCell className="font-bold text-slate-600">Giá bạn đặt</TableCell>
                <TableCell className="font-bold text-slate-600">Giá chốt thầu</TableCell>
                <TableCell className="font-bold text-slate-600">Kết quả</TableCell>
                <TableCell align="right" className="font-bold text-slate-600">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {historyAuctions.map((a) => (
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
                    <Typography variant="body2" className={`font-semibold ${a.isWinner ? 'text-amber-600' : 'text-slate-700'}`}>
                      {a.myFinalBid}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" className="font-bold text-[#10B981]">{a.winningBid}</Typography>
                  </TableCell>
                  <TableCell>{getStatusChip(a.status, a.isWinner)}</TableCell>
                  <TableCell align="right">
                    <Button 
                      size="small" 
                      variant="outlined"
                      color="inherit"
                      onClick={() => handleOpenDetails(a)}
                      sx={{ borderRadius: "6px" }}
                    >
                      Chi tiết
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Drawer Xem Chi tiết Phiên Đấu Giá (Lịch sử) */}
      <DetailDrawer
        open={openDetailDrawer}
        onClose={() => setOpenDetailDrawer(false)}
        title="Chi tiết Lịch sử Đấu Giá"
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
                <DetailRow label="Giá thắng thầu" value={selectedAuction.winningBid} />
                <DetailRow label="Giá chốt của bạn" value={selectedAuction.myFinalBid} />
                <DetailRow 
                  label="Kết quả" 
                  value={selectedAuction.isWinner ? "Trúng thầu" : "Không trúng thầu"} 
                  valueColor={selectedAuction.isWinner ? "text-emerald-600" : "text-slate-500"} 
                />
              </Box>
            </Box>
            <Button 
              onClick={() => setOpenDetailDrawer(false)}
              variant="contained" 
              fullWidth
              sx={{ borderRadius: "8px", bgcolor: "#1B4965", "&:hover": { bgcolor: "#0d2b3e" }, mt: 2 }}
            >
              Đóng
            </Button>
          </Box>
        )}
      </DetailDrawer>
    </Box>
  );
}
