"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import Pagination from "@mui/material/Pagination";
import TableSortLabel from "@mui/material/TableSortLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Tooltip from "@mui/material/Tooltip";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

// Icons
import SearchIcon from "@mui/icons-material/SearchOutlined";
import GavelIcon from "@mui/icons-material/GavelOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTimeOutlined";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOnOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import VisibilityIcon from "@mui/icons-material/VisibilityOutlined";
import FilterListIcon from "@mui/icons-material/FilterListOutlined";
import LocalShippingIcon from "@mui/icons-material/LocalShippingOutlined";
import DescriptionIcon from "@mui/icons-material/DescriptionOutlined";
import ClearIcon from "@mui/icons-material/ClearOutlined";

import PageHeader from "@/components/common/PageHeader";
import { useGlobalNotification } from "@/components/common/NotificationPopup";
import { auctionService } from "@/services/auctionService";
import { mapBackendToShipment } from "@/services/shipperAuctionMapper";

/* Legacy fixture retained for reference only; runtime data comes from the auction API.
const INITIAL_SHIPMENTS = [
  {
    id: "LH-2026-9041",
    goodsType: "Linh kiện điện tử (Màn hình điện thoại)",
    weight: "5.2 tấn",
    volume: "28 m³",
    from: { province: "Thái Nguyên", detail: "Kho Samsung Yên Bình, Phổ Yên" },
    to: { province: "Hải Phòng", detail: "Cảng Đình Vũ, Quận Hải An" },
    maxPrice: 12500000,
    currentLowestBid: 11200000,
    bidCount: 4,
    dateCreated: "2026-07-02",
    status: "active_bids", // đang đấu giá
  },
  {
    id: "LH-2026-9042",
    goodsType: "Thực phẩm đông lạnh (Thủy sản)",
    weight: "8.0 tấn",
    volume: "45 m³",
    from: { province: "Cà Mau", detail: "Cụm CN Sông Đốc, Huyện Trần Văn Thời" },
    to: { province: "TP. Hồ Chí Minh", detail: "Kho lạnh Transimex, Khu Công Nghệ Cao Quận 9" },
    maxPrice: 28000000,
    currentLowestBid: 26500000,
    bidCount: 3,
    dateCreated: "2026-07-02",
    status: "active_bids",
  },
  {
    id: "LH-2026-9043",
    goodsType: "Nông sản khô (Hạt điều)",
    weight: "15.0 tấn",
    volume: "60 m³",
    from: { province: "Bình Phước", detail: "Kho xuất khẩu Đồng Phú" },
    to: { province: "Bà Rịa - Vũng Tàu", detail: "Cảng Cái Mép - Thị Vải, Phú Mỹ" },
    maxPrice: 18500000,
    currentLowestBid: 0,
    bidCount: 0,
    dateCreated: "2026-07-03",
    status: "pending_bids", // chờ đấu giá
  },
  {
    id: "LH-2026-9044",
    goodsType: "Vật liệu xây dựng (Sắt thép)",
    weight: "22.5 tấn",
    volume: "18 m³",
    from: { province: "Quảng Ngãi", detail: "KCN Dung Quất, Bình Sơn" },
    to: { province: "Đà Nẵng", detail: "Tổng kho Hòa Khánh, Liên Chiểu" },
    maxPrice: 16000000,
    currentLowestBid: 14800000,
    bidCount: 6,
    dateCreated: "2026-07-01",
    status: "awarded", // đã chốt thầu
    carrier: "Công ty Vận tải Phước An",
    finalPrice: 14800000,
  },
  {
    id: "LH-2026-9045",
    goodsType: "Hàng tiêu dùng nhanh (FMCG)",
    weight: "3.5 tấn",
    volume: "22 m³",
    from: { province: "Bình Dương", detail: "KCN VSIP I, Thuận An" },
    to: { province: "Cần Thơ", detail: "Trung tâm phân phối Mega Market, Cái Răng" },
    maxPrice: 9500000,
    currentLowestBid: 8900000,
    bidCount: 5,
    dateCreated: "2026-06-30",
    status: "shipping", // đang vận chuyển
    carrier: "Hợp tác xã Vận tải Hữu Nghị",
    finalPrice: 8900000,
  },
  {
    id: "LH-2026-9046",
    goodsType: "Trái cây xuất khẩu (Thanh long)",
    weight: "10.0 tấn",
    volume: "40 m³",
    from: { province: "Bình Thuận", detail: "Vựa thu mua Hàm Thuận Nam" },
    to: { province: "Lạng Sơn", detail: "Bãi kiểm hóa Cửa khẩu Tân Thanh" },
    maxPrice: 42000000,
    currentLowestBid: 39500000,
    bidCount: 9,
    dateCreated: "2026-06-24",
    status: "completed", // hoàn thành
    carrier: "Logistics Bắc Nam T&T",
    finalPrice: 39500000,
  },
  {
    id: "LH-2026-9047",
    goodsType: "Hóa chất (Sơn công nghiệp)",
    weight: "6.0 tấn",
    volume: "24 m³",
    from: { province: "Đồng Nai", detail: "KCN Amata, Biên Hòa" },
    to: { province: "Khánh Hòa", detail: "Kho Sơn Đông Á, KCN Suối Dầu" },
    maxPrice: 15500000,
    currentLowestBid: 14700000,
    bidCount: 2,
    dateCreated: "2026-06-27",
    status: "cancelled", // đã hủy
    cancelReason: "Thay đổi lịch sản xuất tại nhà máy",
  },
  {
    id: "LH-2026-9048",
    goodsType: "Bao bì carton",
    weight: "2.0 tấn",
    volume: "35 m³",
    from: { province: "Hưng Yên", detail: "KCN Phố Nối A" },
    to: { province: "Bắc Giang", detail: "Nhà máy Foxconn Quang Châu" },
    maxPrice: 6500000,
    currentLowestBid: 5800000,
    bidCount: 4,
    dateCreated: "2026-07-02",
    status: "active_bids",
  }
]; */

export default function BiddingHistoryListScreen() {
  const router = useRouter();
  const { notify } = useGlobalNotification();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [statusTab, setStatusTab] = useState("all");
  const [originFilter, setOriginFilter] = useState("all");
  const [destFilter, setDestFilter] = useState("all");
  const [order, setOrder] = useState("desc");
  const [orderBy, setOrderBy] = useState("dateCreated");
  
  // Pagination State
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    let active = true;
    auctionService.getShipperAuctions()
      .then((response) => {
        if (!active) return;
        const data = response?.data?.data || response?.data || [];
        setShipments(data.map(mapBackendToShipment));
      })
      .catch(() => {
        if (active) {
          const message = "Không thể tải lịch sử đấu giá.";
          setLoadError(message);
          notify.error(message);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [notify]);

  const [columnsList, setColumnsList] = useState([
    { id: "id", label: "Mã lô hàng", align: "left" },
    { id: "goodsType", label: "Hàng hóa & Quy cách", align: "left" },
    { id: "route", label: "Lộ trình vận chuyển", align: "left" },
    { id: "maxPrice", label: "Giá trần", align: "right" },
    { id: "finalPrice", label: "Giá chốt / Thấp nhất", align: "right" },
    { id: "bidCount", label: "Lượt thầu", align: "center" },
    { id: "status", label: "Trạng thái", align: "center", sortable: false },
    { id: "actions", label: "Thao tác", align: "center", sortable: false },
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

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusTab, originFilter, destFilter, order, orderBy]);

  // Formatter helpers
  const formatCurrency = (val) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" })
      .format(val)
      .replace("₫", "đ");
  };

  // Extract provinces lists dynamically
  const originProvinces = useMemo(() => {
    return Array.from(new Set(shipments.map((s) => s.from.province))).sort();
  }, [shipments]);

  const destProvinces = useMemo(() => {
    return Array.from(new Set(shipments.map((s) => s.to.province))).sort();
  }, [shipments]);

  // Compute live KPI analytics
  const kpis = useMemo(() => {
    const total = shipments.length;
    const active = shipments.filter((s) => s.status === "active_bids").length;
    const completed = shipments.filter((s) => s.status === "completed").length;
    
    // Total savings computed
    const totalSavings = shipments.reduce((sum, s) => {
      if (s.status === "cancelled") return sum;
      const finalPrice = s.finalPrice || s.currentLowestBid || 0;
      if (finalPrice > 0) {
        return sum + (s.maxPrice - finalPrice);
      }
      return sum;
    }, 0);

    return { total, active, completed, totalSavings };
  }, [shipments]);

  // Status options helper
  const getStatusDetails = (status) => {
    switch (status) {
      case "pending_bids":
        return { label: "Chờ đấu giá", color: "warning" };
      case "active_bids":
        return { label: "Đang đấu giá", color: "primary" };
      case "awarded":
        return { label: "Đã chốt thầu", color: "info" };
      case "shipping":
        return { label: "Đang vận chuyển", color: "secondary" };
      case "completed":
        return { label: "Đã hoàn thành", color: "success" };
      case "cancelled":
        return { label: "Đã hủy", color: "error" };
      default:
        return { label: "Không rõ", color: "default" };
    }
  };

  // Filter & Sort Logic
  const filteredAndSortedShipments = useMemo(() => {
    let result = [...shipments];

    // 1. Text Search Filter (Id, goods type, province name, detail)
    if (searchTerm.trim() !== "") {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (s) =>
          s.id.toLowerCase().includes(q) ||
          s.goodsType.toLowerCase().includes(q) ||
          s.from.province.toLowerCase().includes(q) ||
          s.to.province.toLowerCase().includes(q) ||
          s.from.detail.toLowerCase().includes(q) ||
          s.to.detail.toLowerCase().includes(q)
      );
    }

    // 2. Status Tab Filter
    if (statusTab !== "all") {
      result = result.filter((s) => s.status === statusTab);
    }

    // 3. Origin Province Filter
    if (originFilter !== "all") {
      result = result.filter((s) => s.from.province === originFilter);
    }

    // 4. Destination Province Filter
    if (destFilter !== "all") {
      result = result.filter((s) => s.to.province === destFilter);
    }

    // 5. Sorting Options
    result.sort((a, b) => {
      let comparison = 0;
      if (orderBy === "dateCreated") {
        comparison = new Date(a.dateCreated) - new Date(b.dateCreated);
      } else if (orderBy === "id") {
        comparison = a.id.localeCompare(b.id);
      } else if (orderBy === "maxPrice" || orderBy === "finalPrice" || orderBy === "bidCount") {
        const valA = a[orderBy] || 0;
        const valB = b[orderBy] || 0;
        comparison = valA - valB;
      } else if (orderBy === "goodsType") {
        comparison = a.goodsType.localeCompare(b.goodsType);
      } else if (orderBy === "route") {
        comparison = a.from.province.localeCompare(b.from.province);
      }
      return order === "desc" ? -comparison : comparison;
    });

    return result;
  }, [shipments, searchTerm, statusTab, originFilter, destFilter, order, orderBy]);

  // Paginated Slicing
  const paginatedShipments = useMemo(() => {
    const startIndex = (page - 1) * rowsPerPage;
    return filteredAndSortedShipments.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredAndSortedShipments, page, rowsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedShipments.length / rowsPerPage);

  const handleResetFilters = () => {
    setSearchTerm("");
    setStatusTab("all");
    setOriginFilter("all");
    setDestFilter("all");
    setOrder("desc");
    setOrderBy("dateCreated");
  };

  return (
    <Box className="w-full min-h-screen pb-12 animate-fade-in-up">
      {/* Page Header */}
      <PageHeader
        title="Lịch Sử Phiên Đấu Giá Ngược"
        subtitle="Theo dõi, lọc và quản lý toàn bộ các lô hàng đã hoặc đang tiến hành đấu giá ngược."
        breadcrumbs={[
          { label: "Trang chủ", path: "/shipper/dashboard" },
          { label: "Lịch sử đấu giá" },
        ]}
      />

      {loadError && <Alert severity="error" className="!mb-4">{loadError}</Alert>}
      {loading && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl bg-white p-5 text-slate-600 shadow-sm" role="status">
          <CircularProgress size={22} />
          Đang tải lịch sử đấu giá...
        </div>
      )}

      {/* KPI Cards Overview */}
      <Grid container spacing={3} className="!mb-6">
        <Grid item xs={12} sm={6} md={3}>
          <Card className="!rounded-3xl border border-slate-100/80 bg-white/80 shadow-[0_4px_20px_rgba(27,73,101,0.02)] backdrop-blur-md">
            <CardContent className="!p-5 flex items-center justify-between">
              <div>
                <Typography variant="caption" className="text-slate-400 font-bold block uppercase tracking-wider">
                  Tổng phiên đấu giá
                </Typography>
                <Typography variant="h4" className="!font-extrabold text-slate-800 !mt-1">
                  {kpis.total}
                </Typography>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-[#1B4965] border border-blue-100/50">
                <GavelIcon />
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="!rounded-3xl border border-slate-100/80 bg-white/80 shadow-[0_4px_20px_rgba(27,73,101,0.02)] backdrop-blur-md">
            <CardContent className="!p-5 flex items-center justify-between">
              <div>
                <Typography variant="caption" className="text-slate-400 font-bold block uppercase tracking-wider">
                  Đang hoạt động
                </Typography>
                <Typography variant="h4" className="!font-extrabold text-amber-600 !mt-1">
                  {kpis.active}
                </Typography>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100/50">
                <AccessTimeIcon />
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="!rounded-3xl border border-slate-100/80 bg-white/80 shadow-[0_4px_20px_rgba(27,73,101,0.02)] backdrop-blur-md">
            <CardContent className="!p-5 flex items-center justify-between">
              <div>
                <Typography variant="caption" className="text-slate-400 font-bold block uppercase tracking-wider">
                  Giao thành công
                </Typography>
                <Typography variant="h4" className="!font-extrabold text-emerald-600 !mt-1">
                  {kpis.completed}
                </Typography>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100/50">
                <CheckCircleIcon />
              </div>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card className="!rounded-3xl border border-emerald-100/30 bg-emerald-500/5 shadow-[0_4px_20px_rgba(16,185,129,0.04)]">
            <CardContent className="!p-5 flex items-center justify-between">
              <div>
                <Typography variant="caption" className="text-emerald-700 font-bold block uppercase tracking-wider">
                  Tiết kiệm tích lũy
                </Typography>
                <Typography variant="h4" className="!font-black text-emerald-600 !mt-1">
                  {formatCurrency(kpis.totalSavings)}
                </Typography>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 border border-emerald-500/20">
                <MonetizationOnIcon />
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Container Card containing Filters and Table */}
      <Card 
        className="!rounded-3xl border border-slate-100 !shadow-[0_8px_32px_0_rgba(27,73,101,0.02)] overflow-hidden"
        sx={{
          background: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Status Tabs */}
        <Box className="border-b border-slate-100 bg-slate-50/50 px-6">
          <Tabs
            value={statusTab}
            onChange={(e, val) => setStatusTab(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                fontWeight: "bold",
                fontSize: "0.85rem",
                color: "#64748b",
                py: 2,
                minWidth: "auto",
                mr: 3,
              },
              "& .Mui-selected": {
                color: "#1B4965 !important",
              },
              "& .MuiTabs-indicator": {
                backgroundColor: "#1B4965",
                height: "3px",
                borderRadius: "3px",
              },
            }}
          >
            <Tab label="Tất cả phiên" value="all" />
            <Tab label="Chờ đấu giá" value="pending_bids" />
            <Tab label="Đang đấu giá" value="active_bids" />
            <Tab label="Đã chốt thầu" value="awarded" />
            <Tab label="Đang vận chuyển" value="shipping" />
            <Tab label="Đã hoàn thành" value="completed" />
            <Tab label="Đã hủy" value="cancelled" />
          </Tabs>
        </Box>

        {/* Filter Toolbar */}
        <Box className="p-6 border-b border-slate-100 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Box */}
            <TextField
              placeholder="Tìm kiếm mã, mặt hàng, địa điểm..."
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-80"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon className="text-slate-400" fontSize="small" />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm("")}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
                className: "!rounded-xl bg-slate-50/50 hover:bg-slate-50 focus-within:bg-white transition-all",
              }}
              sx={{
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(27,73,101,0.08)",
                },
                "& :hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(27,73,101,0.15)",
                },
                "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderColor: "#1B4965",
                },
              }}
            />

            {/* Filter Group */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Origin Filter */}
              <FormControl size="small" className="min-w-[130px] flex-1 md:flex-initial">
                <InputLabel id="origin-select-label" className="!font-semibold !text-slate-500 !text-sm">Điểm xuất phát</InputLabel>
                <Select
                  labelId="origin-select-label"
                  value={originFilter}
                  label="Điểm xuất phát"
                  onChange={(e) => setOriginFilter(e.target.value)}
                  className="!rounded-xl"
                  sx={{
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(27,73,101,0.08)",
                    },
                    "& .MuiSelect-select": {
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "#334155",
                    }
                  }}
                >
                  <MenuItem value="all">Tất cả tỉnh</MenuItem>
                  {originProvinces.map((prov) => (
                    <MenuItem key={prov} value={prov}>
                      {prov}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Destination Filter */}
              <FormControl size="small" className="min-w-[130px] flex-1 md:flex-initial">
                <InputLabel id="dest-select-label" className="!font-semibold !text-slate-500 !text-sm">Điểm giao hàng</InputLabel>
                <Select
                  labelId="dest-select-label"
                  value={destFilter}
                  label="Điểm giao hàng"
                  onChange={(e) => setDestFilter(e.target.value)}
                  className="!rounded-xl"
                  sx={{
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "rgba(27,73,101,0.08)",
                    },
                    "& .MuiSelect-select": {
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "#334155",
                    }
                  }}
                >
                  <MenuItem value="all">Tất cả tỉnh</MenuItem>
                  {destProvinces.map((prov) => (
                    <MenuItem key={prov} value={prov}>
                      {prov}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Reset Button */}
              {(searchTerm || originFilter !== "all" || destFilter !== "all" || statusTab !== "all" || orderBy !== "dateCreated" || order !== "desc") && (
                <Button
                  variant="text"
                  color="inherit"
                  size="small"
                  onClick={handleResetFilters}
                  startIcon={<FilterListIcon />}
                  className="!text-slate-500 !font-bold !capitalize"
                >
                  Xóa lọc
                </Button>
              )}
            </div>
          </div>
        </Box>

        {/* Data Table */}
        <TableContainer component={Paper} className="!shadow-none !bg-transparent">
          <Table sx={{ minWidth: 800 }}>
            <TableHead className="bg-slate-50/50">
              <TableRow>
                {columnsList.map((col, idx) => (
                  <TableCell
                    key={col.id}
                    align={col.align}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, idx)}
                    className="!font-bold !text-slate-400 !text-xs uppercase !border-slate-100 select-none hover:bg-slate-100/80 transition-colors cursor-move"
                  >
                    {col.sortable !== false ? (
                      <TableSortLabel
                        active={orderBy === col.id}
                        direction={orderBy === col.id ? order : "asc"}
                        onClick={() => handleRequestSort(col.id)}
                        className="!font-bold hover:!text-slate-700"
                        sx={{ '& .MuiTableSortLabel-icon': { color: '#64748B !important' } }}
                      >
                        {col.label}
                      </TableSortLabel>
                    ) : (
                      <span>{col.label}</span>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedShipments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columnsList.length} align="center" className="!py-16 !border-slate-100">
                    <Typography variant="body2" className="text-slate-400 font-medium">
                      Không tìm thấy phiên đấu giá nào phù hợp với bộ lọc hiện tại.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedShipments.map((shipment) => {
                  const statusInfo = getStatusDetails(shipment.status);
                  const finalPriceToShow = shipment.finalPrice || shipment.currentLowestBid || 0;
                  
                  return (
                    <TableRow key={shipment.id} className="hover:bg-slate-50/30 transition-colors">
                      {columnsList.map((col) => {
                        if (col.id === "id") {
                          return (
                            <TableCell key={col.id} className="!font-mono !font-bold !text-[#1B4965] !border-slate-100">
                              <Link href={`/shipper/bidding/history?id=${shipment.id}`} className="hover:underline">
                                {shipment.id}
                              </Link>
                            </TableCell>
                          );
                        }
                        if (col.id === "goodsType") {
                          return (
                            <TableCell key={col.id} className="!border-slate-100">
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-700 text-xs sm:text-sm">{shipment.goodsType}</span>
                                <span className="text-[0.7rem] text-slate-400 font-bold mt-0.5">
                                  {shipment.weight} • {shipment.volume}
                                </span>
                              </div>
                            </TableCell>
                          );
                        }
                        if (col.id === "route") {
                          return (
                            <TableCell key={col.id} className="!border-slate-100">
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-800 text-xs">
                                  {shipment.from.province} → {shipment.to.province}
                                </span>
                                <Tooltip title={`Từ: ${shipment.from.detail} | Đến: ${shipment.to.detail}`} arrow>
                                  <span className="text-[0.68rem] text-slate-400 truncate max-w-[180px] font-medium block mt-0.5 cursor-help">
                                    {shipment.from.detail}
                                  </span>
                                </Tooltip>
                              </div>
                            </TableCell>
                          );
                        }
                        if (col.id === "maxPrice") {
                          return (
                            <TableCell key={col.id} align="right" className="!font-mono !text-slate-500 !text-xs !border-slate-100">
                              {formatCurrency(shipment.maxPrice)}
                            </TableCell>
                          );
                        }
                        if (col.id === "finalPrice") {
                          return (
                            <TableCell 
                              key={col.id}
                              align="right" 
                              className={`!font-mono !font-bold !border-slate-100 ${
                                shipment.status === "completed" || shipment.status === "shipping" || shipment.status === "awarded"
                                  ? "!text-emerald-600"
                                  : "!text-slate-700"
                              }`}
                            >
                              {finalPriceToShow > 0 ? formatCurrency(finalPriceToShow) : "Chưa có"}
                            </TableCell>
                          );
                        }
                        if (col.id === "bidCount") {
                          return (
                            <TableCell key={col.id} align="center" className="!border-slate-100">
                              <Chip
                                label={`${shipment.bidCount} thầu`}
                                size="small"
                                className={`!font-bold !text-[0.7rem] ${
                                  shipment.bidCount > 0
                                    ? "bg-blue-50 text-blue-600 border border-blue-100"
                                    : "bg-slate-100 text-slate-400"
                                }`}
                              />
                            </TableCell>
                          );
                        }
                        if (col.id === "status") {
                          return (
                            <TableCell key={col.id} align="center" className="!border-slate-100">
                              <Chip
                                label={statusInfo.label}
                                size="small"
                                color={statusInfo.color}
                                className="!font-extrabold !text-[0.68rem] rounded-md px-1.5"
                              />
                            </TableCell>
                          );
                        }
                        if (col.id === "actions") {
                          return (
                            <TableCell key={col.id} align="center" className="!border-slate-100">
                              <div className="flex justify-center items-center gap-1.5">
                                <Tooltip title="Xem thầu & Chi tiết">
                                  <IconButton
                                    component={Link}
                                    href={`/shipper/bidding/history?id=${shipment.id}`}
                                    size="small"
                                    className="text-[#1B4965] hover:bg-[#1B4965]/5 bg-slate-50"
                                  >
                                    <VisibilityIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>

                                {shipment.status === "shipping" && (
                                  <Tooltip title="Định vị hành trình">
                                    <IconButton
                                      size="small"
                                      className="text-cyan-600 hover:bg-cyan-50 bg-slate-50"
                                      onClick={() => router.push(`/shipper/tracking?id=${shipment.id}`)}
                                    >
                                      <LocalShippingIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                )}

                                {(shipment.status === "awarded" || shipment.status === "shipping" || shipment.status === "completed") && (
                                  <Tooltip title="Xem hợp đồng">
                                    <IconButton
                                      size="small"
                                      className="text-blue-600 hover:bg-blue-50 bg-slate-50"
                                      onClick={() => router.push(`/shipper/contracts?id=${shipment.id}`)}
                                    >
                                      <DescriptionIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                              </div>
                            </TableCell>
                          );
                        }
                        return null;
                      })}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <Box className="px-6 py-4.5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50/20">
            <div className="flex items-center gap-2">
              <Typography variant="caption" className="text-slate-400 font-medium">
                Hiển thị
              </Typography>
              <Select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setPage(1);
                }}
                size="small"
                variant="outlined"
                sx={{
                  height: 28,
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "#475569",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "rgba(27,73,101,0.08)",
                  },
                  "& .MuiSelect-select": {
                    py: 0.5,
                    px: 1,
                  }
                }}
              >
                <MenuItem value={5}>5 phiên</MenuItem>
                <MenuItem value={10}>10 phiên</MenuItem>
                <MenuItem value={20}>20 phiên</MenuItem>
              </Select>
              <Typography variant="caption" className="text-slate-400 font-medium">
                mỗi trang / Tổng số {filteredAndSortedShipments.length} phiên
              </Typography>
            </div>

            <Pagination
              count={totalPages}
              page={page}
              onChange={(e, val) => setPage(val)}
              variant="outlined"
              shape="rounded"
              size="small"
              sx={{
                "& .MuiPaginationItem-root": {
                  color: "#475569",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                  borderColor: "rgba(27,73,101,0.08)",
                  borderRadius: "8px",
                  "&:hover": {
                    backgroundColor: "rgba(27,73,101,0.04)",
                  },
                },
                "& .Mui-selected": {
                  backgroundColor: "#1B4965 !important",
                  color: "#fff !important",
                  borderColor: "#1B4965 !important",
                },
              }}
            />
          </Box>
        )}
      </Card>
    </Box>
  );
}
