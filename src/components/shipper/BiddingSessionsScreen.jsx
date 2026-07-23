"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Box from "@mui/material/Box";
import BiddingItem from "./BiddingItem";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
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


import PageHeader from "@/components/common/PageHeader";

// Mock Data representing professional logistics operations
const INITIAL_SHIPMENTS = [
  {
    id: "LH-2026-9041",
    goodsType: "Linh kiện điện tử",
    weight: "5.2 tấn",
    volume: "28 m³",
    from: {
      province: "Thái Nguyên",
      detail: "Kho Samsung Yên Bình, Phổ Yên",
    },
    to: {
      province: "Hải Phòng",
      detail: "Cảng Đình Vũ, Quận Hải An",
    },
    maxPrice: 12500000,
    currentLowestBid: 11200000,
    bidCount: 4,
    closeTime: "2026-07-04T18:00:00",
    status: "active_bids", // đang đấu giá
    auctionType: "PUBLIC",
  },
  {
    id: "LH-2026-9042",
    goodsType: "Thực phẩm đông lạnh (Thủy sản)",
    weight: "8.0 tấn",
    volume: "45 m³",
    from: {
      province: "Cà Mau",
      detail: "Cụm CN Sông Đốc, Huyện Trần Văn Thời",
    },
    to: {
      province: "TP. Hồ Chí Minh",
      detail: "Kho lạnh Transimex, Khu Công Nghệ Cao Quận 9",
    },
    maxPrice: 28000000,
    currentLowestBid: 26500000,
    bidCount: 3,
    closeTime: "2026-07-03T12:00:00",
    status: "active_bids",
    auctionType: "SEALED",
  },
  {
    id: "LH-2026-9043",
    goodsType: "Nông sản khô (Hạt điều)",
    weight: "15.0 tấn",
    volume: "60 m³",
    from: {
      province: "Bình Phước",
      detail: "Kho xuất khẩu Đồng Phú",
    },
    to: {
      province: "Bà Rịa - Vũng Tàu",
      detail: "Cảng Cái Mép - Thị Vải, Phú Mỹ",
    },
    maxPrice: 18500000,
    currentLowestBid: 0,
    bidCount: 0,
    closeTime: "2026-07-05T17:00:00",
    status: "pending_bids", // chờ đấu giá
    auctionType: "PUBLIC",
  },
  {
    id: "LH-2026-9044",
    goodsType: "Vật liệu xây dựng (Sắt thép)",
    weight: "22.5 tấn",
    volume: "18 m³",
    from: {
      province: "Quảng Ngãi",
      detail: "KCN Dung Quất, Bình Sơn",
    },
    to: {
      province: "Đà Nẵng",
      detail: "Tổng kho Hòa Khánh, Liên Chiểu",
    },
    maxPrice: 16000000,
    currentLowestBid: 14800000,
    bidCount: 6,
    closeTime: "2026-07-02T10:00:00",
    status: "awarded", // đã chốt thầu
    carrier: "Công ty Vận tải Phước An",
    carrierPhone: "0905.888.999",
    finalPrice: 14800000,
    auctionType: "PUBLIC",
  },
  {
    id: "LH-2026-9045",
    goodsType: "Hàng tiêu dùng nhanh (FMCG)",
    weight: "3.5 tấn",
    volume: "22 m³",
    from: {
      province: "Bình Dương",
      detail: "KCN VSIP I, Thuận An",
    },
    to: {
      province: "Cần Thơ",
      detail: "Trung tâm phân phối Mega Market, Cái Răng",
    },
    maxPrice: 9500000,
    currentLowestBid: 8900000,
    bidCount: 5,
    closeTime: "2026-06-30T15:00:00",
    status: "shipping", // đang vận chuyển
    carrier: "Hợp tác xã Vận tải Hữu Nghị",
    carrierPhone: "0918.222.333",
    driverName: "Trần Văn Bình",
    driverPlate: "51C-777.45",
    finalPrice: 8900000,
    auctionType: "PUBLIC",
  },
  {
    id: "LH-2026-9046",
    goodsType: "Trái cây xuất khẩu (Thanh long)",
    weight: "10.0 tấn",
    volume: "40 m³",
    from: {
      province: "Bình Thuận",
      detail: "Vựa thu mua Hàm Thuận Nam",
    },
    to: {
      province: "Lạng Sơn",
      detail: "Bãi kiểm hóa Cửa khẩu Tân Thanh",
    },
    maxPrice: 42000000,
    currentLowestBid: 39500000,
    bidCount: 9,
    closeTime: "2026-06-25T20:00:00",
    status: "completed", // hoàn thành
    carrier: "Logistics Bắc Nam T&T",
    carrierPhone: "0977.345.678",
    driverName: "Lê Minh Quốc",
    driverPlate: "29H-123.56",
    finalPrice: 39500000,
    auctionType: "PUBLIC",
  },
  {
    id: "LH-2026-9047",
    goodsType: "Hóa chất (Sơn công nghiệp)",
    weight: "6.0 tấn",
    volume: "24 m³",
    from: {
      province: "Đồng Nai",
      detail: "KCN Amata, Biên Hòa",
    },
    to: {
      province: "Khánh Hòa",
      detail: "Kho Sơn Đông Á, KCN Suối Dầu",
    },
    maxPrice: 15500000,
    currentLowestBid: 14700000,
    bidCount: 2,
    closeTime: "2026-06-28T09:00:00",
    status: "cancelled", // đã hủy
    cancelReason: "Thay đổi lịch sản xuất tại nhà máy",
    auctionType: "PUBLIC",
  },
  {
    id: "LH-2026-9048",
    goodsType: "Bao bì carton",
    weight: "2.0 tấn",
    volume: "35 m³",
    from: {
      province: "Hưng Yên",
      detail: "KCN Phố Nối A",
    },
    to: {
      province: "Bắc Giang",
      detail: "Nhà máy Foxconn Quang Châu",
    },
    maxPrice: 6500000,
    currentLowestBid: 5800000,
    bidCount: 4,
    closeTime: "2026-07-02T16:00:00",
    status: "active_bids",
    auctionType: "SEALED",
  }
];

export default function BiddingSessionsScreen() {
  const router = useRouter();
  const [shipments, setShipments] = useState(INITIAL_SHIPMENTS);
  const [activeTab, setActiveTab] = useState(0); // 0: Tất cả, 1: Chờ đấu giá, 2: Đang đấu giá, 3: Đã chốt, 4: Đang vận chuyển, 5: Hoàn thành, 6: Đã hủy
  const [searchQuery, setSearchQuery] = useState("");
  const [auctionTypeFilter, setAuctionTypeFilter] = useState("ALL"); // ALL, PUBLIC, SEALED

  // States for Cancel Dialog
  const [openCancelDialog, setOpenCancelDialog] = useState(false);
  const [selectedShipmentId, setSelectedShipmentId] = useState(null);
  const [cancelReasonType, setCancelReasonType] = useState("Thay đổi kế hoạch kinh doanh");
  const [cancelReasonNote, setCancelReasonNote] = useState("");

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

  const handleConfirmCancel = () => {
    if (!selectedShipmentId) return;

    setShipments((prev) =>
      prev.map((item) =>
        item.id === selectedShipmentId
          ? {
            ...item,
            status: "cancelled",
            cancelReason: cancelReasonNote ? `${cancelReasonType}: ${cancelReasonNote}` : cancelReasonType,
          }
          : item
      )
    );

    handleCloseCancelDialog();
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
          <Link href="/shipper/bidding/create" passHref legacyBehavior>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              className="!rounded-2xl !py-3 !px-6 !text-sm !font-bold !capitalize shadow-lg hover:shadow-xl transition-all duration-300"
              sx={{
                background: "linear-gradient(135deg, #1B4965 0%, #0D2B3E 100%)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                "&:hover": {
                  background: "linear-gradient(135deg, #0D2B3E 0%, #1B4965 100%)",
                },
              }}
            >
              Tạo lô hàng mới
            </Button>
          </Link>
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
      {filteredShipments.length === 0 ? (
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
              <BiddingItem
                shipment={shipment}
                onCancel={handleOpenCancelDialog}
                onViewDetail={(id) => router.push(`/shipper/bidding/history?id=${id}`)}
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
          <Button
            onClick={handleCloseCancelDialog}
            variant="text"
            className="!text-slate-500 !font-bold !capitalize !rounded-xl"
          >
            Đóng
          </Button>
          <Button
            onClick={handleConfirmCancel}
            variant="contained"
            color="error"
            className="!bg-rose-500 hover:!bg-rose-600 !font-bold !capitalize !rounded-xl !px-5"
          >
            Đồng ý Hủy
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
