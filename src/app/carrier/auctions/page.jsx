"use client";

import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Collapse from "@mui/material/Collapse";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  FilterList as FilterListIcon,
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
import { PageHeader, ViewModeToggle, DetailDrawer } from "@/components/common";
import CarrierBiddingItem from "@/components/carrier/CarrierBiddingItem";
import AuctionRegistrationDialog from "@/components/carrier/auction-detail/AuctionRegistrationDialog";
import AuctionDetailContent from "@/components/carrier/auction-detail/AuctionDetailContent";
import { getAuctionAccess, listAuctions } from "@/services/biddingApi";
import { getMyVehicles } from "@/services/fleetApi";
import { unwrapListData } from "@/services/responseData";

const formatAuctionAmount = (value) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(value) || 0);

const formatAuctionDate = (value) => {
  if (!value) return "Chưa cập nhật";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa cập nhật";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const getRequestError = (error, fallback) => {
  const message = error?.response?.data?.message;
  return Array.isArray(message) ? message.join(", ") : message || fallback;
};

const REGISTERED_ACCESS_STATUSES = new Set([
  "PAYMENT_INCOMPLETE",
  "WAITING_FOR_START",
  "AUCTION_OPEN",
  "REGISTRATION_CANCELLED",
]);

const mapAuction = (auction, access) => {
  const isRegistered = REGISTERED_ACCESS_STATUSES.has(access?.accessStatus);
  const status = access?.accessStatus === "PAYMENT_INCOMPLETE"
    ? "PAYMENT_INCOMPLETE"
    : access?.accessStatus === "WAITING_FOR_START"
      ? "WAITING_START"
      : auction.roomOpen && isRegistered
        ? "BIDDING"
        : auction.registrationOpen
          ? "OPEN_REGISTER"
          : "CLOSED";

  return {
    ...auction,
    goodsCategory: auction.goodsType,
    volume: auction.volume,
    goodsValue: Number(auction.goodsValue || 0),
    requiredTemp: auction.requiredTemp,
    requiredVehicleDims: auction.requiredVehicleDims,
    description: auction.notes,
    goodsNotes: auction.notes,
    originAddress: auction.originAddress || auction.origin,
    destinationAddress: auction.destinationAddress || auction.destination,
    priceStep: Number(auction.priceStep || 0),
    maxBids: auction.maxBids,
    registrationStartTime: auction.registrationStartTime,
    earliestPickup: auction.earliestPickup,
    latestPickup: auction.latestPickup,
    earliestDelivery: auction.earliestDelivery,
    latestDelivery: auction.latestDelivery,
    origin: auction.originLocationName || auction.origin || "Chưa cập nhật",
    destination: auction.destinationLocationName || auction.destination || "Chưa cập nhật",
    cargoType: auction.goodsType || auction.title || "Hàng hóa",
    weight: `${auction.weight || 0} tấn`,
    pickupTime: formatAuctionDate(auction.startTime),
    basePrice: formatAuctionAmount(auction.maxPrice),
    currentLowestBid: auction.currentLowestBid ? formatAuctionAmount(auction.currentLowestBid) : undefined,
    participationFee: Number(auction.participationFeeAmount || 0),
    isDepositRequired: Boolean(auction.isDepositRequired),
    depositAmount: Number(auction.depositAmount || 0),
    requiredVehicleType: auction.vehicleTypeRequired,
    isRegistered,
    accessStatus: access?.accessStatus,
    status,
  };
};

export default function AuctionsPage() {
  const router = useRouter();
  const [showFilters, setShowFilters] = useState(false);
  const [auctions, setAuctions] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [vehiclesLoading, setVehiclesLoading] = useState(true);
  const [error, setError] = useState("");
  const [vehiclesError, setVehiclesError] = useState("");
  const [viewMode, setViewMode] = useState("CARD");
  const [registerDialog, setRegisterDialog] = useState({ open: false, auctionId: null });
  const [registrationAuction, setRegistrationAuction] = useState(null);
  const [openDetailDrawer, setOpenDetailDrawer] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState(null);

  useEffect(() => {
    let active = true;

    const loadAuctions = async () => {
      setLoading(true);
      setError("");
      try {
        const responses = await Promise.all([
          listAuctions({ status: "PENDING", page: 1, pageSize: 100 }),
          listAuctions({ status: "OPEN", page: 1, pageSize: 100 }),
        ]);
        const rawAuctions = Array.from(
          new Map(responses.flatMap((response) => unwrapListData(response)).map((auction) => [auction.id, auction])).values(),
        );
        const accessResults = await Promise.all(
          rawAuctions.map(async (auction) => {
            try {
              return await getAuctionAccess(auction.id);
            } catch {
              return null;
            }
          }),
        );
        const mappedAuctions = rawAuctions
          .map((auction, index) => mapAuction(auction, accessResults[index]))
          .filter((auction) => auction.status !== "CLOSED");

        if (active) setAuctions(mappedAuctions);
      } catch (requestError) {
        if (active) setError(getRequestError(requestError, "Không thể tải danh sách phiên đấu giá."));
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadAuctions();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadVehicles = async () => {
      setVehiclesLoading(true);
      setVehiclesError("");
      try {
        const response = await getMyVehicles();
        if (active) setVehicles(Array.isArray(response) ? response : []);
      } catch (requestError) {
        if (active) setVehiclesError(getRequestError(requestError, "Không thể tải danh sách phương tiện."));
      } finally {
        if (active) setVehiclesLoading(false);
      }
    };

    void loadVehicles();
    return () => {
      active = false;
    };
  }, []);

  const filteredAuctions = React.useMemo(() => {
    return auctions.filter((auction) => !auction.isRegistered && auction.status === "OPEN_REGISTER");
  }, [auctions]);

  const [columnsList, setColumnsList] = useState([
    { id: 'id', label: 'Mã phiên' },
    { id: 'origin', label: 'Tuyến đường', sortable: false },
    { id: 'cargoType', label: 'Hàng hóa' },
    { id: 'basePrice', label: 'Khởi điểm' },
    { id: 'pickupTime', label: 'Bắt đầu phiên' },
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

  const handleOpenRegister = (auction) => {
    setRegistrationAuction(auction);
    setRegisterDialog({ open: true, auctionId: auction.id });
  };

  const handleCloseRegister = () => {
    setRegisterDialog({ open: false, auctionId: null });
    setRegistrationAuction(null);
  };

  const getStatusChip = (status) => {
    switch (status) {
      case "OPEN_REGISTER":
        return <Chip label="Sắp diễn ra" color="info" size="small" className="font-semibold" />;
      case "BIDDING":
        return <Chip label="Đang đấu giá" color="success" size="small" className="font-semibold animate-pulse-glow" />;
      case "WAITING_START":
        return <Chip label="Chờ giờ mở phòng" color="warning" size="small" className="font-semibold" />;
      case "PAYMENT_INCOMPLETE":
        return <Chip label="Chưa hoàn tất thanh toán" color="error" size="small" className="font-semibold" />;
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

      {error && <Alert severity="error" className="!mb-5 !rounded-xl">{error}</Alert>}
      {loading && (
        <Box className="flex min-h-48 items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white text-slate-500">
          <CircularProgress size={22} /> Đang tải các phiên đấu giá thật...
        </Box>
      )}
      {!loading && !error && filteredAuctions.length === 0 && (
        <Card className="border border-slate-200 shadow-sm">
          <CardContent className="py-12 text-center">
            <Typography variant="h6" className="!font-extrabold !text-slate-800">Chưa có phiên đấu giá phù hợp</Typography>
            <Typography className="!mt-2 !text-slate-500">Các phiên đang mở đăng ký hoặc phiên bạn đã đăng ký sẽ hiển thị ở đây.</Typography>
          </CardContent>
        </Card>
      )}
      {!loading && !error && filteredAuctions.length > 0 && (viewMode === "CARD" ? (
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
                      ) : auction.status === 'PAYMENT_INCOMPLETE' ? (
                        <Button
                          component={Link}
                          href={`/carrier/auctions/${auction.id}`}
                          variant="contained"
                          color="warning"
                          sx={{ borderRadius: "10px", py: 1, flex: 1, fontSize: "0.8rem", fontWeight: "bold" }}
                        >
                          Hoàn tất thanh toán
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
                        onClick={() => auction.status !== 'BIDDING' && handleOpenRegister(auction)}
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
                              ) : a.status === 'PAYMENT_INCOMPLETE' ? (
                                <Button
                                  size="small"
                                  variant="contained"
                                  color="warning"
                                  component={Link}
                                  href={`/carrier/auctions/${a.id}`}
                                  sx={{ borderRadius: "6px" }}
                                >
                                  Thanh toán
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
                                onClick={() => handleOpenRegister(a)}
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
      ))}

      <AuctionRegistrationDialog
        open={registerDialog.open}
        auction={registrationAuction}
        vehicles={vehicles}
        vehiclesLoading={vehiclesLoading}
        vehiclesError={vehiclesError}
        onClose={handleCloseRegister}
        onCompleted={() => {
          setRegisterDialog({ open: false, auctionId: null });
          router.push("/carrier/my-auctions");
        }}
      />
      
      {/* Drawer Xem Chi tiết Phiên Đấu Giá (Marketplace) */}
      <DetailDrawer
        open={openDetailDrawer}
        onClose={() => setOpenDetailDrawer(false)}
        variant="modal"
        title={selectedAuction ? `Chi tiết phiên ${selectedAuction.id}` : "Chi tiết phiên đấu giá"}
        width={560}
      >
        {selectedAuction && (
          <AuctionDetailContent
            auction={selectedAuction}
            footer={selectedAuction.status === "OPEN_REGISTER" && !selectedAuction.isRegistered ? (
              <Button
                variant="contained"
                fullWidth
                onClick={() => {
                  setOpenDetailDrawer(false);
                  handleOpenRegister(selectedAuction);
                }}
                sx={{ borderRadius: "8px", bgcolor: "#1B4965", "&:hover": { bgcolor: "#0d2b3e" } }}
              >
                Đăng ký tham gia ngay
              </Button>
            ) : selectedAuction.status === "BIDDING" && selectedAuction.isRegistered ? (
              <Button
                variant="contained"
                fullWidth
                component={Link}
                href={`/carrier/auctions/${selectedAuction.id}`}
                sx={{ borderRadius: "8px", bgcolor: "#10B981", "&:hover": { bgcolor: "#059669" } }}
              >
                Vào phòng đấu giá
              </Button>
            ) : null}
          />
        )}
      </DetailDrawer>
    </Box>
  );
}
