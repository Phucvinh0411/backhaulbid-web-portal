"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { toast } from "react-hot-toast";
import { auctionService } from "@/services/auctionService";
import AuctionSessionCard from "@/components/auctions/AuctionSessionCard";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/SearchOutlined";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import FilterListIcon from "@mui/icons-material/FilterListOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import PlaceIcon from "@mui/icons-material/Place";
import AdjustIcon from "@mui/icons-material/Adjust";
import Divider from "@mui/material/Divider";


import {
  ActionButton,
  DetailDrawer,
  DetailRow,
  PageHeader,
} from "@/components/common";

// Backend status to Frontend status mapping
const mapStatusToFrontend = (backendStatus) => {
  switch (backendStatus) {
    case "PENDING":
    case "UPCOMING":
      return "pending_bids";
    case "ACTIVE":
    case "IN_PROGRESS":
      return "active_bids";
    case "COMPLETED":
    case "ENDED":
      return "awarded";
    case "CANCELLED":
      return "cancelled";
    default:
      return "pending_bids";
  }
};

// Helper to safely parse Decimal128 from MongoDB if it comes as object
const parseDecimal = (val) => {
  if (!val) return 0;
  if (typeof val === 'object' && val.$numberDecimal) return parseFloat(val.$numberDecimal);
  return parseFloat(val);
};

const mapBackendToShipment = (auction) => {
  // If the auction has goodsInfo (from our old seed), use it, otherwise use direct properties
  const goodsType = auction.goodsType || auction.goodsInfo?.goodsName || auction.title || "Không xác định";
  const weight = auction.weight || auction.goodsInfo?.weight || 0;
  const volume = auction.volume || auction.goodsInfo?.volume || 0;
  
  const fromProvince = auction.pickupLocation?.province || auction.route?.from?.province || auction.origin || "Không rõ";
  const fromDetail = auction.pickupLocation?.address || auction.route?.from?.detailAddress || "Không rõ";
  
  const toProvince = auction.deliveryLocation?.province || auction.route?.to?.province || auction.destination || "Không rõ";
  const toDetail = auction.deliveryLocation?.address || auction.route?.to?.detailAddress || "Không rõ";
  
  const closeTime = auction.endTime || auction.auctionConfig?.endTime || null;
  const maxPrice = parseDecimal(auction.maxPrice || auction.auctionConfig?.maxPrice);
  const auctionType = auction.auctionType || auction.auctionConfig?.auctionType || "PUBLIC";
  
  const currentLowestBid = parseDecimal(auction.currentLowestBid) || 0;
  const finalPrice = parseDecimal(auction.finalPrice) || 0;

  return {
    id: auction.id || auction._id || auction.auctionCode || "N/A",
    goodsType,
    weight: `${weight} tấn`,
    volume: `${volume} m³`,
    from: {
      province: fromProvince,
      detail: fromDetail,
    },
    to: {
      province: toProvince,
      detail: toDetail,
    },
    maxPrice,
    currentLowestBid,
    finalPrice,
    bidCount: auction.totalBids || auction.bidCount || 0,
    closeTime,
    status: mapStatusToFrontend(auction.status),
    auctionType,
    carrier: auction.winningBidId ? "Đơn vị vận chuyển (Đã chốt)" : null,
    driverName: null,
    driverPlate: null,
    cancelReason: auction.cancelReason,
    originalData: auction
  };
};

export default function BiddingSessionsScreen() {
  const router = useRouter();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0); // 0: Tất cả, 1: Chờ đấu giá, 2: Đang đấu giá, 3: Đã chốt, 4: Đang vận chuyển, 5: Hoàn thành, 6: Đã hủy
  const [searchQuery, setSearchQuery] = useState("");
  const [auctionTypeFilter, setAuctionTypeFilter] = useState("ALL"); // ALL, PUBLIC, SEALED

  // States for Cancel Dialog
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [selectedShipmentId, setSelectedShipmentId] = useState(null);
  const [cancelReasonType, setCancelReasonType] = useState("Thay đổi kế hoạch kinh doanh");
  const [cancelReasonNote, setCancelReasonNote] = useState("");
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [openDetailDrawer, setOpenDetailDrawer] = useState(false);

  const fetchAuctions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await auctionService.getShipperAuctions();
      const auctionsData = res.data?.data || res.data || [];
      const mappedShipments = auctionsData.map(mapBackendToShipment);
      setShipments(mappedShipments);
    } catch (error) {
      console.error("Error fetching auctions:", error);
      toast.error("Không thể tải danh sách phiên đấu giá");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  // Map Tab index to Shipment status
  const tabStatusMap = [
    "all",
    "pending_bids",
    "active_bids",
    "awarded",
    "shipping",
    "completed",
    "cancelled",
  ];

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Filter shipments based on search query, active tab, and auction type
  const filteredShipments = shipments.filter((item) => {
    const matchesSearch =
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.goodsType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.from.province.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.to.province.toLowerCase().includes(searchQuery.toLowerCase());

    const targetStatus = tabStatusMap[activeTab];
    const matchesStatus = targetStatus === "all" ? true : item.status === targetStatus;
    const matchesType = auctionTypeFilter === "ALL" ? true : item.auctionType === auctionTypeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleOpenCancelDialog = (id) => {
    setSelectedShipmentId(id);
    setCancelReasonType("Thay đổi kế hoạch kinh doanh");
    setCancelReasonNote("");
    setOpenCancelDialog(true);
  };

  const handleCloseCancelDialog = () => {
    setOpenCancelDialog(false);
    setSelectedShipmentId(null);
  };

  const handleConfirmCancel = async () => {
    if (!selectedShipmentId) return;

    try {
      const reasonStr = cancelReasonNote ? `${cancelReasonType}: ${cancelReasonNote}` : cancelReasonType;
      await auctionService.cancelAuction(selectedShipmentId, reasonStr);
      toast.success("Hủy phiên đấu giá thành công");
      fetchAuctions();
    } catch (error) {
      console.error("Error cancelling auction:", error);
      toast.error("Hủy phiên đấu giá thất bại");
    } finally {
      handleCloseCancelDialog();
    }
  };

  const formatCurrency = (val) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" })
      .format(val || 0)
      .replace("₫", "đ");

  const formatDateTime = (value) =>
    value
      ? new Intl.DateTimeFormat("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }).format(new Date(value))
      : "Chưa có";

  const handleViewDetail = (shipment) => {
    setSelectedShipment(shipment);
    setOpenDetailDrawer(true);
  };

  return (
    <Box className="w-full min-h-screen">
      {/* Header section with CTA Action */}
      <PageHeader
        title="Quản lý Lô hàng & Đấu giá"
        subtitle="Quản lý tối ưu các lô hàng, tương tác trực tiếp với các đơn đấu giá vận tải."
        breadcrumbs={[
          { label: "Trang chủ", path: "/shipper/dashboard" },
          { label: "Đấu giá vận tải", path: "/shipper/bidding/sessions" },
          { label: "Quản lý lô hàng" },
        ]}
        action={
          <ActionButton
            component={Link}
            href="/shipper/bidding/create"
            variant="primary"
            startIcon={<AddIcon />}
            size="lg"
          >
            Tạo lô hàng mới
          </ActionButton>
        }
      />

      {/* Integrated Search & Filter Bar */}
      <Box className="bg-white/80 backdrop-blur-xl border border-slate-200/80 rounded-3xl p-4 shadow-[0_8px_32px_0_rgba(27,73,101,0.04)] mb-6 space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <TextField
            placeholder="Tìm kiếm mã lô hàng, loại hàng, điểm đi/đến..."
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:flex-1 bg-white rounded-2xl"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon className="text-slate-400 !text-[1.2rem]" />
                </InputAdornment>
              ),
              endAdornment: searchQuery ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchQuery("")}>
                    <CloseIcon className="!text-[1rem] text-slate-400" />
                  </IconButton>
                </InputAdornment>
              ) : null,
              className: "!rounded-2xl !border-slate-200 hover:!border-slate-300 transition-all text-sm",
            }}
            sx={{
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E2E8F0" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#CBD5E1" },
              "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#1B4965" },
            }}
          />

          {/* Status Filter Dropdown */}
          <TextField
            select
            size="small"
            value={activeTab}
            onChange={(e) => setActiveTab(Number(e.target.value))}
            className="w-full md:w-56 bg-white rounded-2xl shrink-0"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FilterListIcon className="text-[#1B4965] !text-[1.1rem]" />
                </InputAdornment>
              ),
              className: "!rounded-2xl !border-slate-200 text-sm font-semibold",
            }}
            sx={{
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E2E8F0" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#CBD5E1" },
              "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#1B4965" },
            }}
          >
            <MenuItem value={0} className="!text-xs !font-medium">Tất cả trạng thái</MenuItem>
            <MenuItem value={1} className="!text-xs !font-medium">Chờ đấu giá</MenuItem>
            <MenuItem value={2} className="!text-xs !font-medium">Đang đấu giá</MenuItem>
            <MenuItem value={3} className="!text-xs !font-medium">Đã chốt thầu</MenuItem>
            <MenuItem value={4} className="!text-xs !font-medium">Đang vận chuyển</MenuItem>
            <MenuItem value={5} className="!text-xs !font-medium">Hoàn thành</MenuItem>
            <MenuItem value={6} className="!text-xs !font-medium">Đã hủy</MenuItem>
          </TextField>

          {/* Auction Type Filter Dropdown */}
          <TextField
            select
            size="small"
            value={auctionTypeFilter}
            onChange={(e) => setAuctionTypeFilter(e.target.value)}
            className="w-full md:w-52 bg-white rounded-2xl shrink-0"
            InputProps={{
              className: "!rounded-2xl !border-slate-200 text-sm font-semibold",
            }}
            sx={{
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#E2E8F0" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#CBD5E1" },
              "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#1B4965" },
            }}
          >
            <MenuItem value="ALL" className="!text-xs !font-medium">Tất cả hình thức</MenuItem>
            <MenuItem value="PUBLIC" className="!text-xs !font-medium">Đấu giá công khai</MenuItem>
            <MenuItem value="SEALED" className="!text-xs !font-medium">Đấu giá kín</MenuItem>
          </TextField>
        </div>

        {/* Filter Summary & Active Badges Row */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100/80 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-slate-500 font-medium">Bộ lọc đang áp dụng:</span>
            
            {activeTab !== 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-800 border border-sky-200 font-bold text-[0.68rem]">
                Trạng thái: {["Tất cả", "Chờ đấu giá", "Đang đấu giá", "Đã chốt thầu", "Đang vận chuyển", "Hoàn thành", "Đã hủy"][activeTab]}
                <CloseIcon className="!text-[0.75rem] cursor-pointer hover:text-sky-900" onClick={() => setActiveTab(0)} />
              </span>
            )}

            {auctionTypeFilter !== "ALL" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-bold text-[0.68rem]">
                Hình thức: {auctionTypeFilter === "PUBLIC" ? "Đấu giá công khai" : "Đấu giá kín"}
                <CloseIcon className="!text-[0.75rem] cursor-pointer hover:text-amber-900" onClick={() => setAuctionTypeFilter("ALL")} />
              </span>
            )}

            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-bold text-[0.68rem]">
                Từ khóa: "{searchQuery}"
                <CloseIcon className="!text-[0.75rem] cursor-pointer hover:text-slate-900" onClick={() => setSearchQuery("")} />
              </span>
            )}

            {activeTab === 0 && auctionTypeFilter === "ALL" && !searchQuery && (
              <span className="text-slate-400 font-medium italic text-[0.7rem]">Tất cả lô hàng</span>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {(activeTab !== 0 || auctionTypeFilter !== "ALL" || searchQuery) && (
              <button
                onClick={() => {
                  setActiveTab(0);
                  setAuctionTypeFilter("ALL");
                  setSearchQuery("");
                }}
                className="text-[0.7rem] font-bold text-rose-600 hover:text-rose-800 transition-colors"
              >
                Xóa bộ lọc
              </button>
            )}

            <span className="text-slate-500 font-medium">
              Hiển thị <strong className="text-[#1B4965] font-black">{filteredShipments.length}</strong> lô hàng
            </span>
          </div>
        </div>
      </Box>

      {/* Grid List of Shipments */}
      {loading ? (
        <Box className="flex items-center justify-center py-20">
          <CircularProgress size={40} sx={{ color: "#1B4965" }} />
        </Box>
      ) : filteredShipments.length === 0 ? (
        <Card className="!rounded-3xl border border-dashed border-slate-200/80 !shadow-none bg-slate-50/20 py-16 text-center">
          <CardContent className="space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto text-2xl text-slate-400">
              📦
            </div>
            <div>
              <Typography variant="h6" className="!font-bold text-slate-700">
                Không tìm thấy lô hàng nào
              </Typography>
              <Typography variant="body2" className="text-slate-400 max-w-sm mx-auto">
                Không có dữ liệu phù hợp với bộ lọc hiện tại. Thử thay đổi từ khóa hoặc bộ lọc của bạn.
              </Typography>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3} alignItems="stretch">
          {filteredShipments.map((shipment) => (
            <Grid item xs={12} md={6} lg={4} key={shipment.id} className="!flex !flex-col">
              <AuctionSessionCard
                shipment={shipment}
                onCancel={handleOpenCancelDialog}
                onViewDetail={handleViewDetail}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Cancellation Dialog confirmation */}
      <Dialog
        open={openCancelDialog}
        onClose={handleCloseCancelDialog}
        maxWidth="xs"
        fullWidth
        className="backdrop-blur-sm"
        PaperProps={{
          className: "!rounded-3xl !p-2",
        }}
      >
        <DialogTitle className="flex justify-between items-center !font-bold text-slate-800">
          Xác nhận hủy lô hàng
          <IconButton size="small" onClick={handleCloseCancelDialog} className="text-slate-400">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className="space-y-4">
          <Typography variant="body2" className="text-slate-500">
            Bạn có chắc chắn muốn hủy lô hàng <span className="font-mono font-bold text-slate-700">{selectedShipmentId}</span>? Hành động này sẽ dừng phiên đấu giá và không thể phục hồi.
          </Typography>

          <Box className="space-y-3 pt-2">
            <Typography variant="body2" className="!font-bold text-slate-700">
              Chọn lý do hủy:
            </Typography>
            <RadioGroup
              value={cancelReasonType}
              onChange={(e) => setCancelReasonType(e.target.value)}
              className="space-y-1"
            >
              <FormControlLabel
                value="Thay đổi kế hoạch kinh doanh"
                control={<Radio size="small" sx={{ color: "#1B4965", "&.Mui-checked": { color: "#1B4965" } }} />}
                label={<span className="text-sm font-medium text-slate-600">Thay đổi kế hoạch sản xuất/kinh doanh</span>}
              />
              <FormControlLabel
                value="Tìm thấy đơn vị vận chuyển ngoài"
                control={<Radio size="small" sx={{ color: "#1B4965", "&.Mui-checked": { color: "#1B4965" } }} />}
                label={<span className="text-sm font-medium text-slate-600">Đã thỏa thuận được với nhà xe ngoài</span>}
              />
              <FormControlLabel
                value="Nhập sai thông tin hàng hóa"
                control={<Radio size="small" sx={{ color: "#1B4965", "&.Mui-checked": { color: "#1B4965" } }} />}
                label={<span className="text-sm font-medium text-slate-600">Nhập sai thông tin kích thước/trọng tải</span>}
              />
              <FormControlLabel
                value="Khác"
                control={<Radio size="small" sx={{ color: "#1B4965", "&.Mui-checked": { color: "#1B4965" } }} />}
                label={<span className="text-sm font-medium text-slate-600">Lý do khác</span>}
              />
            </RadioGroup>

            {cancelReasonType === "Khác" && (
              <TextField
                placeholder="Nhập lý do chi tiết..."
                fullWidth
                multiline
                rows={2}
                value={cancelReasonNote}
                onChange={(e) => setCancelReasonNote(e.target.value)}
                className="mt-2"
                InputProps={{
                  className: "!rounded-2xl",
                }}
                sx={{
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#E2E8F0",
                  },
                }}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions className="!px-6 !pb-4 flex justify-end gap-3">
          <ActionButton
            onClick={handleCloseCancelDialog}
            variant="text"
          >
            Đóng
          </ActionButton>
          <ActionButton
            onClick={handleConfirmCancel}
            variant="danger"
          >
            Đồng ý Hủy
          </ActionButton>
        </DialogActions>
      </Dialog>

      <DetailDrawer
        open={openDetailDrawer}
        onClose={() => setOpenDetailDrawer(false)}
        variant="modal"
        title="Chi tiết phiên vận chuyển"
        width={560}
      >
        {selectedShipment && (
          <Box className="space-y-5 px-1 pb-4">
            {/* Header Section */}
            <Box className="bg-gradient-to-br from-slate-50 to-slate-100/50 p-5 rounded-3xl border border-slate-200/60 shadow-sm relative overflow-hidden">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#1B4965]/5 rounded-full blur-2xl" />
              <div className="flex items-center justify-between mb-4 relative z-10">
                <span className="font-mono font-black text-[#1B4965] text-lg tracking-tight bg-white px-3 py-1 rounded-xl border border-slate-200/80 shadow-sm">
                  {selectedShipment.id}
                </span>
                <span className={`px-3 py-1 rounded-xl text-xs font-bold ${
                  selectedShipment.status === 'awarded' || selectedShipment.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                  selectedShipment.status === 'cancelled' ? 'bg-rose-100 text-rose-800' :
                  selectedShipment.status === 'active_bids' ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800'
                }`}>
                  {
                    {
                      pending_bids: "Chờ đấu giá",
                      active_bids: "Đang đấu giá",
                      awarded: "Đã chốt thầu",
                      shipping: "Đang vận chuyển",
                      completed: "Đã hoàn thành",
                      cancelled: "Đã hủy",
                    }[selectedShipment.status] || "Không rõ"
                  }
                </span>
              </div>
              <Typography variant="h6" className="!font-bold text-slate-800 relative z-10 leading-snug">
                {selectedShipment.goodsType}
              </Typography>
            </Box>

            {/* Auction Info Section */}
            <Box className="bg-white p-5 rounded-3xl border border-slate-100 shadow-[0_4px_20px_0_rgba(0,0,0,0.03)] transition-all hover:shadow-[0_4px_24px_0_rgba(0,0,0,0.06)]">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100/80">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <GavelOutlinedIcon fontSize="small" />
                </div>
                <Typography className="!font-extrabold text-slate-800">Cấu hình đấu giá</Typography>
              </div>
              <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                <DetailRow label="Hình thức" value={selectedShipment.auctionType === "SEALED" ? "Đấu giá kín" : "Đấu giá công khai"} />
                <DetailRow label="Lượt ra giá" value={`${selectedShipment.bidCount || 0} lượt`} />
                <DetailRow label="Đóng thầu" value={formatDateTime(selectedShipment.closeTime)} />
                <DetailRow label="Giá trần tối đa" value={formatCurrency(selectedShipment.maxPrice)} valueColor="text-slate-800 font-bold" />
                {selectedShipment.status !== 'pending_bids' && (
                  <div className="col-span-2 mt-2 bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100/50">
                    <DetailRow 
                      label="Giá thấp nhất / giá chốt" 
                      value={formatCurrency(selectedShipment.finalPrice || selectedShipment.currentLowestBid || 0)} 
                      valueColor="text-emerald-700 !text-[1.1rem] font-black" 
                    />
                  </div>
                )}
              </div>
            </Box>

            {/* Route Section */}
            <Box className="bg-white p-5 rounded-3xl border border-slate-100 shadow-[0_4px_20px_0_rgba(0,0,0,0.03)] transition-all hover:shadow-[0_4px_24px_0_rgba(0,0,0,0.06)]">
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
                  <LocalShippingOutlinedIcon fontSize="small" />
                </div>
                <Typography className="!font-extrabold text-slate-800">Lộ trình vận chuyển</Typography>
              </div>
              
              <div className="relative pl-3 space-y-6 before:absolute before:inset-y-2 before:left-5 before:w-0.5 before:bg-slate-100 before:-z-10">
                {/* Source */}
                <div className="flex items-start gap-4">
                  <div className="w-5 h-5 rounded-full bg-white border-4 border-sky-500 mt-0.5 shadow-sm shrink-0" />
                  <div>
                    <Typography className="!text-[0.75rem] !font-bold text-sky-600 uppercase tracking-wider mb-1">Điểm lấy hàng ({selectedShipment.from.province})</Typography>
                    <Typography variant="body2" className="text-slate-700 font-medium">{selectedShipment.from.detail}</Typography>
                  </div>
                </div>
                {/* Destination */}
                <div className="flex items-start gap-4">
                  <div className="w-5 h-5 rounded-full bg-emerald-500 border-4 border-emerald-100 mt-0.5 shadow-sm shrink-0" />
                  <div>
                    <Typography className="!text-[0.75rem] !font-bold text-emerald-600 uppercase tracking-wider mb-1">Điểm giao hàng ({selectedShipment.to.province})</Typography>
                    <Typography variant="body2" className="text-slate-700 font-medium">{selectedShipment.to.detail}</Typography>
                  </div>
                </div>
              </div>
            </Box>

            {/* Goods Details Section */}
            <Box className="bg-white p-5 rounded-3xl border border-slate-100 shadow-[0_4px_20px_0_rgba(0,0,0,0.03)] transition-all hover:shadow-[0_4px_24px_0_rgba(0,0,0,0.06)]">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100/80">
                <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <Inventory2OutlinedIcon fontSize="small" />
                </div>
                <Typography className="!font-extrabold text-slate-800">Thông tin hàng hóa</Typography>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <DetailRow label="Loại hàng" value={selectedShipment.goodsType} />
                <DetailRow label="Trọng lượng" value={selectedShipment.weight} />
                <DetailRow label="Thể tích" value={selectedShipment.volume} />
                <DetailRow
                  label="Yêu cầu đặc biệt"
                  value={selectedShipment.goodsType.toLowerCase().includes("đông lạnh") ? "Bảo quản lạnh" : "Không có"}
                />
              </div>
            </Box>

            {/* Carrier/Result Section */}
            {(selectedShipment.carrier || selectedShipment.cancelReason) && (
              <Box className="bg-white p-5 rounded-3xl border border-slate-100 shadow-[0_4px_20px_0_rgba(0,0,0,0.03)]">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100/80">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
                    <AssignmentTurnedInOutlinedIcon fontSize="small" />
                  </div>
                  <Typography className="!font-extrabold text-slate-800">Kết quả xử lý</Typography>
                </div>
                
                {selectedShipment.carrier && (
                  <div className="space-y-4">
                    <DetailRow label="Đơn vị vận chuyển" value={selectedShipment.carrier} valueColor="text-[#1B4965] font-bold" />
                    <DetailRow label="Liên hệ nhà xe" value={selectedShipment.carrierPhone || "Chưa cập nhật"} />
                    {selectedShipment.driverName && (
                      <>
                        <Divider className="!my-2 border-dashed" />
                        <div className="flex justify-between items-center">
                          <DetailRow label="Tài xế phụ trách" value={selectedShipment.driverName} />
                          <span className="font-mono bg-slate-100 text-slate-700 px-2 py-1 rounded-lg text-xs font-bold border border-slate-200">
                            {selectedShipment.driverPlate || "N/A"}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                )}
                {selectedShipment.cancelReason && (
                  <Box className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100">
                    <Typography className="!text-[0.75rem] text-rose-500 font-bold uppercase mb-1">Lý do hủy đơn</Typography>
                    <Typography className="text-slate-700 font-medium">{selectedShipment.cancelReason}</Typography>
                  </Box>
                )}
              </Box>
            )}

            <Box className="flex flex-col gap-3 pt-2">
              <ActionButton
                variant="outlined"
                fullWidth
                size="lg"
                onClick={() => router.push(`/shipper/bidding/history?id=${selectedShipment.id}`)}
                className="!rounded-2xl"
              >
                Xem lịch sử thầu
              </ActionButton>
              {selectedShipment.status === "shipping" && (
                <ActionButton
                  variant="primary"
                  fullWidth
                  size="lg"
                  onClick={() => router.push(`/shipper/tracking?id=${selectedShipment.id}`)}
                  className="!rounded-2xl shadow-md"
                >
                  Theo dõi vận chuyển
                </ActionButton>
              )}
            </Box>
          </Box>
        )}
      </DetailDrawer>
    </Box>
  );
}
