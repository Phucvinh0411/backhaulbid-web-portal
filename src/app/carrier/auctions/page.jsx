"use client";

import React, { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Collapse from "@mui/material/Collapse";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Link from "next/link";
import { 
  FilterList as FilterListIcon,
  LocalShipping as LocalShippingIcon,
  CalendarToday as CalendarTodayIcon,
  ArrowForward as ArrowForwardIcon
} from "@mui/icons-material";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TableSortLabel from "@mui/material/TableSortLabel";
import { PageHeader, ViewModeToggle, DetailDrawer, DetailRow } from "@/components/common";
import CarrierBiddingItem from "@/components/carrier/CarrierBiddingItem";

const mockAuctions = [
  {
    id: "BID-2451",
    origin: "Hà Nội",
    destination: "Đà Nẵng",
    cargoType: "Hàng điện tử",
    weight: "15 Tấn",
    pickupTime: "10/08/2026",
    status: "OPEN_REGISTER",
    basePrice: "12,000,000 ₫",
  },
  {
    id: "BID-2452",
    origin: "Hồ Chí Minh",
    destination: "Cần Thơ",
    cargoType: "Hàng tiêu dùng",
    weight: "8 Tấn",
    pickupTime: "11/08/2026",
    status: "BIDDING",
    basePrice: "5,500,000 ₫",
    currentLowestBid: "5,200,000 ₫",
  },
  {
    id: "BID-2453",
    origin: "Hải Phòng",
    destination: "Hà Nội",
    cargoType: "Vật liệu xây dựng",
    weight: "20 Tấn",
    pickupTime: "12/08/2026",
    status: "CLOSED",
    basePrice: "4,000,000 ₫",
  },
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
    isRegistered: false,
  },
];

const MOCK_VEHICLES = [
  { id: "V1", plate: "29H-123.45", capacity: "15 Tấn", type: "Xe tải thùng kín" },
  { id: "V2", plate: "30F-987.65", capacity: "10 Tấn", type: "Xe đông lạnh" },
  { id: "V3", plate: "51C-456.78", capacity: "8 Tấn", type: "Xe tải mui bạt" },
];

export default function AuctionsPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [auctions, setAuctions] = useState(mockAuctions);
  const [viewMode, setViewMode] = useState("CARD");
  const [registerDialog, setRegisterDialog] = useState({ open: false, auctionId: null });
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [openDetailDrawer, setOpenDetailDrawer] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState(null);

  const filteredAuctions = React.useMemo(() => {
    return auctions.filter(a => a.status === 'OPEN_REGISTER' || (a.status === 'BIDDING' && a.isRegistered));
  }, [auctions]);

  const [columnsList, setColumnsList] = useState([
    { id: 'id', label: 'Mã phiên' },
    { id: 'origin', label: 'Tuyến đường', sortable: false },
    { id: 'cargoType', label: 'Hàng hóa' },
    { id: 'basePrice', label: 'Khởi điểm' },
    { id: 'pickupTime', label: 'Thời gian bốc' },
    { id: 'status', label: 'Trạng thái' },
    { id: 'actions', label: 'Thao tác', align: 'right', sortable: false }
  ]);

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData("colIndex", index.toString());
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, index) => {
    const dragIndex = Number(e.dataTransfer.getData("colIndex"));
    if (isNaN(dragIndex) || dragIndex === index) return;
    const updated = [...columnsList];
    const [removed] = updated.splice(dragIndex, 1);
    updated.splice(index, 0, removed);
    setColumnsList(updated);
  };

  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("id");

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortedAuctions = React.useMemo(() => {
    let result = [...filteredAuctions];
    result.sort((a, b) => {
      let comparison;
      if (orderBy === "basePrice") {
        const valA = parseInt(a.basePrice.replace(/\D/g, ""), 10) || 0;
        const valB = parseInt(b.basePrice.replace(/\D/g, ""), 10) || 0;
        comparison = valA - valB;
      } else {
        comparison = String(a[orderBy] || "").localeCompare(String(b[orderBy] || ""));
      }
      return order === "desc" ? -comparison : comparison;
    });
    return result;
  }, [filteredAuctions, order, orderBy]);

  const handleOpenDetails = (auction) => {
    setSelectedAuction(auction);
    setOpenDetailDrawer(true);
  };

  const handleOpenRegister = (auctionId) => {
    setRegisterDialog({ open: true, auctionId });
    setSelectedVehicle("");
  };

  const handleCloseRegister = () => {
    setRegisterDialog({ open: false, auctionId: null });
  };

  const handleConfirmRegister = () => {
    if (!selectedVehicle) {
      alert("Vui lòng chọn một phương tiện để tham gia!");
      return;
    }
    
    // Update local state to mark as registered
    setAuctions(prev => prev.map(a => 
      a.id === registerDialog.auctionId ? { ...a, isRegistered: true } : a
    ));
    
    alert(`Đã đăng ký tham gia phiên ${registerDialog.auctionId} thành công! Bạn sẽ nhận được thông báo khi phiên đấu giá bắt đầu.`);
    handleCloseRegister();
  };

  const getStatusChip = (status) => {
    switch (status) {
      case "OPEN_REGISTER":
        return <Chip label="Sắp diễn ra" color="info" size="small" className="font-semibold" />;
      case "BIDDING":
        return <Chip label="Đang đấu giá" color="success" size="small" className="font-semibold animate-pulse-glow" />;
      case "CLOSED":
        return <Chip label="Đã đóng" color="default" size="small" className="font-semibold text-slate-500" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  return (
    <Box className="animate-fade-in-up">
      <PageHeader 
        title="Khám phá Đấu giá" 
        subtitle="Tìm kiếm chuyến hàng phù hợp và tham gia đấu giá thời gian thực"
        breadcrumbs={[
          { label: "Trang chủ", path: "/carrier/dashboard" },
          { label: "Vận hành", path: "#" },
          { label: "Khám phá đấu giá", path: "#" }
        ]}
        action={
          <Box className="flex gap-2">
            <ViewModeToggle 
              viewMode={viewMode}
              onChange={setViewMode}
            />
            <Button 
              variant={showFilters ? "contained" : "outlined"} 
              color="primary"
              startIcon={<FilterListIcon />}
              onClick={() => setShowFilters(!showFilters)}
              sx={{ borderRadius: "10px" }}
            >
              Bộ lọc nâng cao
            </Button>
          </Box>
        }
      />

      <Collapse in={showFilters}>
        <Card className="glass mb-6 border border-slate-200/60 shadow-sm rounded-2xl p-2">
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth label="Điểm đi" placeholder="VD: Hà Nội" size="small" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth label="Điểm đến" placeholder="VD: Đà Nẵng" size="small" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField select fullWidth label="Loại hàng" defaultValue="" size="small">
                  <MenuItem value="">Tất cả</MenuItem>
                  <MenuItem value="dien_tu">Hàng điện tử</MenuItem>
                  <MenuItem value="tieu_dung">Hàng tiêu dùng</MenuItem>
                  <MenuItem value="vlxd">Vật liệu xây dựng</MenuItem>
                  <MenuItem value="dong_lanh">Hàng đông lạnh</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField select fullWidth label="Trạng thái" defaultValue="" size="small">
                  <MenuItem value="">Tất cả</MenuItem>
                  <MenuItem value="OPEN_REGISTER">Sắp diễn ra</MenuItem>
                  <MenuItem value="BIDDING">Đang đấu giá</MenuItem>
                  <MenuItem value="CLOSED">Đã đóng</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField type="date" fullWidth label="Ngày bốc hàng" InputLabelProps={{ shrink: true }} size="small" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField fullWidth label="Giá thấp nhất" placeholder="VNĐ" type="number" size="small" />
              </Grid>
              <Grid item xs={12} sm={12} md={6} className="flex justify-end items-end gap-2">
                <Button variant="text" color="inherit">Xóa lọc</Button>
                <Button variant="contained" color="primary">Áp dụng</Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Collapse>

      {viewMode === "CARD" ? (
        <Grid container spacing={3}>
          {sortedAuctions.map((auction) => (
            <Grid item xs={12} md={6} lg={4} key={auction.id}>
              <CarrierBiddingItem
                auction={auction}
                mode="marketplace"
                onViewDetail={handleOpenDetails}
                customActions={
                  <>
                    <Button 
                      variant="outlined"
                      color="inherit"
                      onClick={() => handleOpenDetails(auction)}
                      sx={{ borderRadius: "10px", py: 1, flex: 1, fontSize: "0.8rem", fontWeight: "bold" }}
                    >
                      Xem chi tiết
                    </Button>
                    
                    {auction.status === 'CLOSED' ? (
                      <Button 
                        variant="outlined"
                        color="inherit"
                        sx={{ borderRadius: "10px", py: 1, flex: 1, fontSize: "0.8rem", fontWeight: "bold" }}
                        disabled
                      >
                        Đã kết thúc
                      </Button>
                    ) : auction.isRegistered ? (
                      auction.status === 'BIDDING' ? (
                        <Button 
                          component={Link}
                          href={`/carrier/auctions/${auction.id}`}
                          variant="contained"
                          color="success"
                          sx={{ borderRadius: "10px", py: 1, flex: 1, fontSize: "0.8rem", fontWeight: "bold" }}
                          className="!bg-[#10B981] hover:!bg-emerald-600 !text-white"
                        >
                          Vào phòng
                        </Button>
                      ) : (
                        <Button 
                          variant="outlined"
                          color="primary"
                          sx={{ borderRadius: "10px", py: 1, flex: 1, fontSize: "0.8rem", fontWeight: "bold" }}
                          disabled
                        >
                          Đã đăng ký
                        </Button>
                      )
                    ) : (
                      <Button 
                        variant={auction.status === 'BIDDING' ? 'outlined' : 'contained'}
                        color={auction.status === 'BIDDING' ? 'inherit' : 'primary'}
                        sx={auction.status === 'BIDDING' ? { borderRadius: "10px", py: 1, flex: 1, fontSize: "0.8rem", fontWeight: "bold" } : { borderRadius: "10px", py: 1, flex: 1, fontSize: "0.8rem", fontWeight: "bold", backgroundColor: "#1B4965", "&:hover": { backgroundColor: "#0d2b3e" } }}
                        onClick={() => auction.status !== 'BIDDING' && handleOpenRegister(auction.id)}
                        disabled={auction.status === 'BIDDING'}
                      >
                        {auction.status === 'BIDDING' ? 'Đã đóng' : 'Đăng ký'}
                      </Button>
                    )}
                  </>
                }
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <TableContainer component={Paper} className="rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
          <Table sx={{ minWidth: 800 }}>
            <TableHead className="bg-slate-50">
              <TableRow>
                {columnsList.map((col, idx) => (
                  <TableCell
                    key={col.id}
                    align={col.align || 'left'}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, idx)}
                    className="font-bold text-slate-600 select-none cursor-move hover:bg-slate-100 transition-colors"
                  >
                    {col.sortable !== false ? (
                      <TableSortLabel
                        active={orderBy === col.id}
                        direction={orderBy === col.id ? order : "asc"}
                        onClick={() => handleRequestSort(col.id)}
                      >
                        {col.label}
                      </TableSortLabel>
                    ) : col.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedAuctions.map((a) => (
                <TableRow key={a.id} hover className="transition-colors">
                  {columnsList.map((col) => {
                    if (col.id === 'id') {
                      return (
                        <TableCell key={col.id}>
                          <Typography variant="body2" className="font-mono font-bold text-[#1B4965]">{a.id}</Typography>
                        </TableCell>
                      );
                    }
                    if (col.id === 'origin') {
                      return (
                        <TableCell key={col.id}>
                          <Box className="flex items-center gap-1">
                            <Typography variant="body2" className="font-bold text-slate-800">{a.origin}</Typography>
                            <ArrowForwardIcon sx={{ fontSize: 16 }} className="text-slate-400" />
                            <Typography variant="body2" className="font-bold text-slate-800">{a.destination}</Typography>
                          </Box>
                        </TableCell>
                      );
                    }
                    if (col.id === 'cargoType') {
                      return (
                        <TableCell key={col.id}>
                          <Typography variant="body2" className="text-slate-800">{a.cargoType} ({a.weight})</Typography>
                        </TableCell>
                      );
                    }
                    if (col.id === 'basePrice') {
                      return (
                        <TableCell key={col.id}>
                          <Typography variant="body2" className="font-semibold text-slate-700">{a.basePrice}</Typography>
                        </TableCell>
                      );
                    }
                    if (col.id === 'pickupTime') {
                      return (
                        <TableCell key={col.id}>
                          <Typography variant="body2" className="text-slate-800">{a.pickupTime}</Typography>
                        </TableCell>
                      );
                    }
                    if (col.id === 'status') {
                      return (
                        <TableCell key={col.id}>
                          {getStatusChip(a.status)}
                        </TableCell>
                      );
                    }
                    if (col.id === 'actions') {
                      return (
                        <TableCell key={col.id} align="right">
                          <Box className="flex gap-2 justify-end">
                            <Button 
                              size="small" 
                              variant="outlined"
                              color="inherit"
                              onClick={() => handleOpenDetails(a)}
                              sx={{ borderRadius: "6px" }}
                            >
                              Chi tiết
                            </Button>
                            
                            {a.status === 'CLOSED' ? (
                              <Button size="small" variant="outlined" disabled sx={{ borderRadius: "6px" }}>Kết thúc</Button>
                            ) : a.isRegistered ? (
                              a.status === 'BIDDING' ? (
                                <Button 
                                  size="small" 
                                  variant="contained"
                                  color="success"
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
                                  color="primary"
                                  sx={{ borderRadius: "6px" }}
                                  disabled
                                >
                                  Đã đăng ký
                                </Button>
                              )
                            ) : (
                              <Button 
                                size="small" 
                                variant="contained" 
                                color="primary"
                                sx={{ borderRadius: "6px", backgroundColor: "#1B4965" }}
                                onClick={() => handleOpenRegister(a.id)}
                                disabled={a.status === 'BIDDING'}
                              >
                                {a.status === 'BIDDING' ? 'Đã đóng' : 'Đăng ký'}
                              </Button>
                            )}
                          </Box>
                        </TableCell>
                      );
                    }
                    return null;
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Modal Đăng ký tham gia đấu giá */}
      <Dialog open={registerDialog.open} onClose={handleCloseRegister} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: "12px" } }}>
        <DialogTitle className="font-bold text-[#1B4965]">Đăng ký tham gia đấu giá</DialogTitle>
        <DialogContent>
          <DialogContentText className="mb-4">
            Để tham gia phiên đấu giá <strong>{registerDialog.auctionId}</strong>, bạn bắt buộc phải chọn trước phương tiện sẽ thực hiện chuyến hàng này.
          </DialogContentText>
          <TextField
            select
            fullWidth
            label="Chọn phương tiện"
            value={selectedVehicle}
            onChange={(e) => setSelectedVehicle(e.target.value)}
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
          >
            {MOCK_VEHICLES.map((v) => (
              <MenuItem key={v.id} value={v.id}>
                {v.plate} - {v.capacity} ({v.type})
              </MenuItem>
            ))}
          </TextField>
        </DialogContent>
        <DialogActions className="px-6 pb-6 pt-2">
          <Button onClick={handleCloseRegister} color="inherit" sx={{ borderRadius: "8px" }}>Hủy bỏ</Button>
          <Button onClick={handleConfirmRegister} variant="contained" color="primary" sx={{ borderRadius: "8px", backgroundColor: "#1B4965" }}>
            Xác nhận đăng ký
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Drawer Xem Chi tiết Phiên Đấu Giá (Marketplace) */}
      <DetailDrawer
        open={openDetailDrawer}
        onClose={() => setOpenDetailDrawer(false)}
        variant="modal"
        title={selectedAuction ? `Chi tiết phiên ${selectedAuction.id}` : "Chi tiết phiên đấu giá"}
        width={560}
      >
        {selectedAuction && (
          <Box className="space-y-5">
            <Box className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <Box className="flex items-center justify-between gap-3 mb-3">
                <Box>
                  <Typography variant="overline" className="!font-bold !tracking-wider text-slate-400">
                    Chủ hàng đăng tin
                  </Typography>
                  <Typography variant="body1" className="!font-extrabold text-[#1B4965]">
                    Công ty Cổ phần Sữa Việt Nam (Vinamilk)
                  </Typography>
                </Box>
                {getStatusChip(selectedAuction.status)}
              </Box>
              <Box className="grid grid-cols-1 sm:grid-cols-2 gap-x-5">
                <DetailRow label="Mã phiên" value={selectedAuction.id} />
                <DetailRow label="Loại yêu cầu" value="Xe tải thùng kín" />
                <DetailRow label="Mở đăng ký" value={`08:00:00 ${selectedAuction.pickupTime}`} />
                <DetailRow label="Đóng đăng ký" value={`12:00:00 ${selectedAuction.pickupTime}`} />
                <DetailRow label="Bắt đầu đấu giá" value={`13:00:00 ${selectedAuction.pickupTime}`} />
                <DetailRow label="Kết thúc đấu giá" value={`18:00:00 ${selectedAuction.pickupTime}`} />
                <DetailRow label="Giá trần tối đa" value={selectedAuction.basePrice} valueColor="text-[#1B4965]" />
                <DetailRow label="Bước giá tối thiểu" value="100.000 ₫" />
                <DetailRow label="Số lượt ra giá tối đa" value="5 lần / nhà xe" />
                <DetailRow label="Phí tham gia" value="50.000 ₫" />
                <DetailRow label="Tiền đặt cọc" value="1.250.000 ₫" valueColor="text-amber-600" />
                <DetailRow label="Kích thước thùng tối thiểu" value="6.2m × 2.1m × 2.2m" />
              </Box>
            </Box>

            <Box className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <Typography variant="subtitle2" component="h3" className="!font-extrabold !text-[#1B4965] !mb-3">
                2. Thông tin chi tiết hàng hóa & tuyến đường vận chuyển
              </Typography>
              <Box className="grid grid-cols-1 sm:grid-cols-2 gap-x-5">
                <DetailRow label="Phân loại hàng hóa" value={selectedAuction.cargoType} valueColor="text-emerald-600" />
                <DetailRow label="Kích thước kiện hàng" value="6.0m × 2.0m × 2.2m" />
                <DetailRow label="Trọng lượng hàng hóa" value={selectedAuction.weight} />
                <DetailRow label="Yêu cầu nhiệt độ" value="Nhiệt độ thường" />
                <DetailRow label="Giá trị khai báo" value="187.500.000 ₫" />
                <DetailRow label="Khung giờ nhận hàng" value={`10:00 - 14:00 (${selectedAuction.pickupTime})`} />
                <DetailRow label="Khung giờ giao hàng" value={`10:00 - 16:00 (${selectedAuction.pickupTime})`} />
              </Box>
              <Box className="mt-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                <Typography variant="caption" className="!font-bold text-slate-500">Mô tả / yêu cầu đặc biệt</Typography>
                <Typography variant="body2" className="!mt-1 !italic text-slate-700">
                  Hàng linh kiện đóng pallet. Yêu cầu xe thùng kín bảo ôn chống ẩm mốc, có đầy đủ hóa đơn chứng từ.
                </Typography>
              </Box>
              <Box className="mt-3 rounded-xl border border-[#1B4965]/10 bg-[#1B4965]/5 p-3 space-y-3">
                <Box className="flex items-start gap-2">
                  <Box className="h-7 w-7 shrink-0 rounded-full bg-sky-500 text-center text-sm font-bold leading-7 text-white">A</Box>
                  <Box>
                    <Typography variant="caption" className="!font-extrabold !text-sky-600">ĐỊA CHỈ NHẬN HÀNG (PICKUP POINT)</Typography>
                    <Typography variant="body2" className="!font-bold text-slate-800">Kho Samsung Yên Bình - Thái Nguyên</Typography>
                    <Typography variant="caption" className="text-slate-500">KCN Yên Bình, Phổ Yên, Thái Nguyên</Typography>
                  </Box>
                </Box>
                <Box className="ml-3 border-l-2 border-dashed border-slate-300 pl-4 text-xs font-mono text-slate-400">➤ Tuyến vận chuyển lộ trình</Box>
                <Box className="flex items-start gap-2">
                  <Box className="h-7 w-7 shrink-0 rounded-full bg-emerald-500 text-center text-sm font-bold leading-7 text-white">B</Box>
                  <Box>
                    <Typography variant="caption" className="!font-extrabold !text-emerald-600">ĐỊA CHỈ TRẢ HÀNG (DELIVERY POINT)</Typography>
                    <Typography variant="body2" className="!font-bold text-slate-800">Kho Cảng Đình Vũ - Hải Phòng</Typography>
                    <Typography variant="caption" className="text-slate-500">Đông Hải 2, Quận Hải An, Hải Phòng</Typography>
                  </Box>
                </Box>
                <Box className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                  <Typography variant="caption" className="!font-bold !text-amber-800">⚠ Ghi chú đặc biệt từ chủ hàng</Typography>
                  <Typography variant="body2" className="!mt-0.5 !text-xs">Yêu cầu bốc xếp cẩn thận. Lái xe tự chuẩn bị dây tăng đai chằng buộc.</Typography>
                </Box>
              </Box>
            </Box>
            
            {selectedAuction.status === 'OPEN_REGISTER' && !selectedAuction.isRegistered && (
              <Button 
                variant="contained" 
                fullWidth
                onClick={() => {
                  setOpenDetailDrawer(false);
                  handleOpenRegister(selectedAuction.id);
                }}
                sx={{ borderRadius: "8px", bgcolor: "#1B4965", "&:hover": { bgcolor: "#0d2b3e" }, mt: 2 }}
              >
                Đăng ký tham gia ngay
              </Button>
            )}
            
            {selectedAuction.status === 'BIDDING' && selectedAuction.isRegistered && (
              <Button 
                variant="contained" 
                fullWidth
                component={Link}
                href={`/carrier/auctions/${selectedAuction.id}`}
                sx={{ borderRadius: "8px", bgcolor: "#10B981", "&:hover": { bgcolor: "#059669" }, mt: 2 }}
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
