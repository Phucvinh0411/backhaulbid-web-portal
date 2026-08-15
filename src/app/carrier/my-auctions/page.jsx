"use client";

import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import { 
  ArrowForward as ArrowForwardIcon,
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
import TableSortLabel from "@mui/material/TableSortLabel";
import { PageHeader, ViewModeToggle, DetailDrawer } from "@/components/common";
import CarrierBiddingItem from "@/components/carrier/CarrierBiddingItem";
import AuctionDetailContent from "@/components/carrier/auction-detail/AuctionDetailContent";
import { useRouter } from "next/navigation";
import { cancelRegistration, listMyRegistrations } from "@/services/biddingApi";
import { getMyVehicles } from "@/services/fleetApi";
import { unwrapListData } from "@/services/responseData";

const formatAmount = (value) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(value) || 0);

const formatDate = (value) => {
  if (!value) return "Chưa cập nhật";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa cập nhật";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const getRegistrationStatus = (accessStatus, registrationStatus) => {
  if (registrationStatus === "CANCELLED" || accessStatus === "REGISTRATION_CANCELLED") return "CANCELLED";
  if (accessStatus === "PAYMENT_INCOMPLETE") return "PAYMENT_INCOMPLETE";
  if (accessStatus === "WAITING_FOR_START") return "WAITING_START";
  if (accessStatus === "AUCTION_OPEN") return "BIDDING";
  if (accessStatus === "AUCTION_CANCELLED") return "CANCELLED";
  if (accessStatus === "AUCTION_COMPLETED") return "CLOSED";
  return "OPEN_REGISTER";
};

const mapRegistrationToAuction = (item, vehicles = []) => {
  const registration = item?.registration || {};
  const auction = item?.auction || {};
  const access = item?.access || {};
  const vehicle = vehicles.find((candidate) => candidate.id === registration.vehicleId);
  const status = getRegistrationStatus(access.accessStatus, registration.status);

  return {
    ...auction,
    id: auction.id,
    registrationId: registration.id,
    origin: auction.originLocationName || auction.origin || "Chưa cập nhật",
    destination: auction.destinationLocationName || auction.destination || "Chưa cập nhật",
    cargoType: auction.goodsType || auction.title || "Hàng hóa",
    weight: `${auction.weight || 0} Tấn`,
    pickupTime: formatDate(auction.startTime),
    status,
    basePrice: formatAmount(auction.maxPrice),
    currentLowestBid: auction.currentLowestBid ? formatAmount(auction.currentLowestBid) : undefined,
    registeredVehicle: vehicle
      ? `${vehicle.plate} (${vehicle.capacity})`
      : registration.vehicleId || "Chưa cập nhật",
    isRegistered: true,
    canEnter: Boolean(access.canEnter),
    participationFee: Number(registration.participationFeeAmount || 0),
    depositAmount: Number(registration.depositAmount || 0),
    registrationPaymentStatus: registration.paymentStatus,
    participationFeeStatus: registration.participationFeeStatus,
    depositStatus: registration.depositStatus,
    registrationStatus: registration.status,
    registeredAt: registration.registeredAt,
  };
};

export default function MyAuctionsPage() {
  const router = useRouter();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [filter, setFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState("CARD");
  
  const [openDetailDrawer, setOpenDetailDrawer] = useState(false);
  const [selectedAuction, setSelectedAuction] = useState(null);

  // Modal Cancel State
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [auctionToCancel, setAuctionToCancel] = useState(null);

  const loadMyAuctions = React.useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [registrationsResponse, vehiclesResponse] = await Promise.all([
        listMyRegistrations({ page: 1, pageSize: 100 }),
        getMyVehicles().catch(() => []),
      ]);
      const registrations = unwrapListData(registrationsResponse);
      setAuctions(registrations.map((item) => mapRegistrationToAuction(item, vehiclesResponse)));
    } catch (requestError) {
      const message = requestError?.response?.data?.message;
      setError(Array.isArray(message) ? message.join(", ") : message || "Không thể tải các phiên đã đăng ký.");
      setAuctions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMyAuctions();
  }, [loadMyAuctions]);

  const handleOpenDetails = (auction) => {
    setSelectedAuction(auction);
    setOpenDetailDrawer(true);
  };

  const handleCancelRequest = (auction) => {
    setAuctionToCancel(auction);
    setCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!auctionToCancel?.registrationId) return;

    setCancelling(true);
    try {
      await cancelRegistration(auctionToCancel.id, auctionToCancel.registrationId);
      await loadMyAuctions();
      setCancelModalOpen(false);
      setAuctionToCancel(null);
    } catch (requestError) {
      const message = requestError?.response?.data?.message;
      setError(Array.isArray(message) ? message.join(", ") : message || "Không thể hủy đăng ký phiên đấu giá.");
    } finally {
      setCancelling(false);
    }
  };

  const handleEnterRoom = (id) => {
    router.push(`/carrier/auctions/${id}`);
  };

  const getStatusChip = (status, isWinner) => {
    switch (status) {
      case "OPEN_REGISTER":
        return <Chip label="Đang chờ mở phiên" color="info" size="small" className="font-semibold" />;
      case "BIDDING":
        return <Chip label="Đang đấu giá" color="success" size="small" className="font-semibold animate-pulse-glow" />;
      case "WAITING_START":
        return <Chip label="Chờ giờ mở phiên" color="info" size="small" className="font-semibold" />;
      case "PAYMENT_INCOMPLETE":
        return <Chip label="Chưa hoàn tất thanh toán" color="warning" size="small" className="font-semibold" />;
      case "CLOSED":
        if (isWinner) {
          return <Chip icon={<EmojiEventsIcon />} label="Trúng thầu" color="warning" size="small" className="font-bold text-amber-600 bg-amber-100" sx={{ "& .MuiChip-icon": { color: "inherit" } }} />;
        }
        return <Chip icon={<CancelOutlinedIcon />} label={isWinner === false ? "Trượt thầu" : "Đã kết thúc"} color="default" size="small" className="font-semibold text-slate-500 bg-slate-200" />;
      case "CANCELLED":
        return <Chip icon={<CancelOutlinedIcon />} label="Đã hủy đăng ký" color="default" size="small" className="font-semibold text-slate-500 bg-slate-200" />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  const filteredAuctions = React.useMemo(() => {
    return auctions.filter(a => {
      if (filter === "BIDDING") return a.status === 'BIDDING';
      if (filter === "OPEN_REGISTER") return ["OPEN_REGISTER", "WAITING_START", "PAYMENT_INCOMPLETE"].includes(a.status);
      if (filter === "CLOSED") return ["CLOSED", "CANCELLED"].includes(a.status);
      return true; // ALL
    });
  }, [auctions, filter]);

  const [order, setOrder] = useState("desc");
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

  return (
    <Box className="animate-fade-in-up">
      <PageHeader 
        title="Phiên đấu giá của tôi" 
        subtitle="Quản lý và xem lịch sử các chuyến hàng bạn đã tham gia đấu giá"
        breadcrumbs={[
          { label: "Trang chủ", path: "/carrier/dashboard" },
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

      {error && <Alert severity="error" className="!mb-4 !rounded-xl">{error}</Alert>}

      {loading && (
        <Box className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/70 p-10 text-slate-500">
          <CircularProgress size={22} /> Đang tải các phiên đã đăng ký...
        </Box>
      )}

      {!loading && filteredAuctions.length === 0 && (
        <Box className="text-center p-10 bg-white/50 backdrop-blur-md rounded-2xl border border-slate-200">
          <Typography variant="h6" className="text-slate-400">Không có dữ liệu</Typography>
        </Box>
      )}

      {!loading && viewMode === "CARD" ? (
        <Grid container spacing={3}>
          {sortedAuctions.map((a) => (
            <Grid item xs={12} sm={6} md={4} key={a.id}>
              <CarrierBiddingItem 
                auction={a} 
                onCancel={handleCancelRequest}
                onViewDetail={handleOpenDetails}
                onEnterRoom={handleEnterRoom}
              />
            </Grid>
          ))}
        </Grid>
      ) : !loading ? (
        <TableContainer component={Paper} className="rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
          <Table sx={{ minWidth: 800 }}>
            <TableHead className="bg-slate-50">
              <TableRow>
                {[{id: 'id', label: 'Mã phiên'}, {id: 'origin', label: 'Tuyến đường', sortable: false}, {id: 'cargoType', label: 'Hàng hóa'}, {id: 'registeredVehicle', label: 'Xe đăng ký'}, {id: 'pickupTime', label: 'Thời gian bốc'}, {id: 'status', label: 'Trạng thái'}, {id: 'actions', label: 'Thao tác', align: 'right', sortable: false}].map(col => (
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
                        onClick={() => handleEnterRoom(a.id)}
                        sx={{ borderRadius: "6px", ml: 1 }}
                      >
                        Vào phòng
                      </Button>
                    ) : (
                      <>
                        <Button 
                          size="small" 
                          variant="outlined"
                          color="inherit"
                          onClick={() => handleOpenDetails(a)}
                          sx={{ borderRadius: "6px" }}
                        >
                          Xem chi tiết
                        </Button>
                        {a.status === "OPEN_REGISTER" && (
                          <Button 
                            size="small" 
                            variant="outlined"
                            color="error"
                            onClick={() => handleCancelRequest(a)}
                            sx={{ borderRadius: "6px", ml: 1 }}
                          >
                            Hủy
                          </Button>
                        )}
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : null}
      
      {/* Drawer Xem Chi tiết Phiên Đấu Giá */}
      <DetailDrawer
        open={openDetailDrawer}
        onClose={() => setOpenDetailDrawer(false)}
        variant="modal"
        title={selectedAuction ? `Chi tiết phiên ${selectedAuction.id}` : "Chi tiết phiên đấu giá"}
      >
        {selectedAuction && (
          <AuctionDetailContent
            auction={selectedAuction}
            footer={selectedAuction.status === "BIDDING" ? (
              <Button
                variant="contained"
                fullWidth
                onClick={() => handleEnterRoom(selectedAuction.id)}
                sx={{ borderRadius: "8px", bgcolor: "#1B4965", "&:hover": { bgcolor: "#0d2b3e" } }}
              >
                Vào phòng đấu giá
              </Button>
            ) : null}
          />
        )}
      </DetailDrawer>

      {/* Confirmation Modal for Cancellation */}
      <Dialog
        open={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        aria-labelledby="cancel-dialog-title"
        aria-describedby="cancel-dialog-description"
        PaperProps={{
          sx: { borderRadius: "16px", padding: 1 }
        }}
      >
        <DialogTitle id="cancel-dialog-title" className="text-slate-800 font-bold">
          Xác nhận hủy đăng ký
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="cancel-dialog-description" className="text-slate-600">
            Bạn có chắc chắn muốn hủy đăng ký tham gia phiên đấu giá <strong>{auctionToCancel?.id}</strong> không? Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelModalOpen(false)} sx={{ color: "#64748B", fontWeight: 600 }}>
            Quay lại
          </Button>
          <Button onClick={handleConfirmCancel} disabled={cancelling} variant="contained" color="error" sx={{ fontWeight: 600, borderRadius: "8px" }} autoFocus>
            {cancelling ? "Đang hủy..." : "Đồng ý hủy"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
