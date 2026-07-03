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
      let comparison = 0;
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
                {[{id: 'id', label: 'Mã phiên'}, {id: 'origin', label: 'Tuyến đường', sortable: false}, {id: 'cargoType', label: 'Hàng hóa'}, {id: 'basePrice', label: 'Khởi điểm'}, {id: 'pickupTime', label: 'Thời gian bốc'}, {id: 'status', label: 'Trạng thái'}, {id: 'actions', label: 'Thao tác', align: 'right', sortable: false}].map(col => (
                  <TableCell key={col.id} align={col.align || 'left'} className="font-bold text-slate-600">
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
                    <Typography variant="body2" className="font-semibold text-slate-700">{a.basePrice}</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" className="text-slate-800">{a.pickupTime}</Typography>
                  </TableCell>
                  <TableCell>{getStatusChip(a.status)}</TableCell>
                  <TableCell align="right">
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
                <DetailRow label="Giá khởi điểm" value={selectedAuction.basePrice} />
                {selectedAuction.currentLowestBid && (
                  <DetailRow label="Giá tốt nhất hiện tại" value={selectedAuction.currentLowestBid} valueColor="text-emerald-600" />
                )}
                <DetailRow label="Trạng thái" value={getStatusChip(selectedAuction.status)} />
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
