"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Tooltip from "@mui/material/Tooltip";

import {
  CancelOutlined as CancelIcon,
  CheckCircleOutline as CheckCircleIcon,
  Close as CloseIcon,
  DeleteOutline as DeleteOutlineIcon,
  DirectionsCar as DirectionsCarIcon,
  LocalShipping as LocalShippingIcon,
  Map as MapIcon,
  Radar as RadarIcon,
  Refresh as RefreshIcon,
  Scale as ScaleIcon,
  Search as SearchIcon,
  Timer as TimerIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";

import { PageHeader, StatCard, ViewModeToggle } from "@/components/common";
import { useGlobalNotification } from "@/components/common/NotificationPopup";
import { ConfirmDialog, EmptyState, ErrorState, ListSkeleton } from "@/components/ui";
import EmptyRouteDialog from "@/components/carrier/EmptyRouteDialog";
import { emptyRouteService } from "@/services/emptyRouteService";
import { getMyVehicles, VEHICLE_TYPE_LABELS } from "@/services/fleetApi";
import { getApiErrorMessage } from "@/services/errorMessage";

const RouteDetailMap = dynamic(() => import("@/components/carrier/RouteDetailMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[320px] w-full flex items-center justify-center bg-surface-sunken text-ink-muted text-sm rounded-xl">
      Đang tải bản đồ lộ trình...
    </div>
  ),
});

const STATUS_FILTERS = [
  { value: "ALL", label: "Tất cả" },
  { value: "PENDING", label: "Đang dò tìm đơn" },
  { value: "MATCHED", label: "Đã ghép đơn" },
  { value: "CANCELLED", label: "Đã hủy" },
];

function formatDateTime(isoString) {
  if (!isoString) return "Chưa cập nhật";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return isoString;
  }
}

function StatusBadge({ status }) {
  if (status === "PENDING") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-warning-soft text-warning border border-warning/30 shadow-xs">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warning opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-warning"></span>
        </span>
        Đang quét tìm đơn
      </span>
    );
  }
  if (status === "MATCHED") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-success-soft text-success border border-success/30 shadow-xs">
        <CheckCircleIcon className="!text-sm text-success" />
        Đã ghép đơn
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-surface-sunken text-ink-muted border border-line">
      <CancelIcon className="!text-sm text-ink-muted" />
      Đã hủy
    </span>
  );
}

export default function EmptyRoutesHistoryPage() {
  const notify = useGlobalNotification();

  const [routes, setRoutes] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("CARD");

  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [confirmCancelRoute, setConfirmCancelRoute] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const [routeList, vehicleList] = await Promise.all([
        emptyRouteService.getEmptyRoutesByCompany().catch(() => []),
        getMyVehicles().catch(() => []),
      ]);
      const sorted = (Array.isArray(routeList) ? routeList : []).slice().reverse();
      setRoutes(sorted);
      setVehicles(Array.isArray(vehicleList) ? vehicleList : []);
    } catch (err) {
      const message = getApiErrorMessage(err, "Không thể tải lịch sử chuyến xe rỗng. Vui lòng thử lại.");
      setLoadError(message);
      notify.error(message);
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const vehicleMap = useMemo(() => {
    const map = new Map();
    vehicles.forEach((v) => {
      const plate = v.licensePlate || v.plate;
      if (plate) map.set(plate.toUpperCase(), v);
    });
    return map;
  }, [vehicles]);

  const counts = useMemo(() => {
    return {
      all: routes.length,
      pending: routes.filter((r) => r.status === "PENDING").length,
      matched: routes.filter((r) => r.status === "MATCHED").length,
      cancelled: routes.filter((r) => r.status === "CANCELLED").length,
    };
  }, [routes]);

  const filteredRoutes = useMemo(() => {
    let result = routes;
    if (statusFilter !== "ALL") {
      result = result.filter((r) => r.status === statusFilter);
    }
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      result = result.filter((r) => {
        const truck = (r.truckId || "").toLowerCase();
        const origin = (r.origin || "").toLowerCase();
        const dest = (r.destination || "").toLowerCase();
        return truck.includes(q) || origin.includes(q) || dest.includes(q);
      });
    }
    return result;
  }, [routes, statusFilter, searchQuery]);

  const handleCancelRoute = async () => {
    if (!confirmCancelRoute) return;
    setCancelling(true);
    try {
      await emptyRouteService.cancelEmptyRoute(confirmCancelRoute.id);
      notify.success(`Đã hủy phát sóng xe rỗng cho biển số ${confirmCancelRoute.truckId}.`);
      setConfirmCancelRoute(null);
      void loadData();
    } catch (err) {
      notify.error(getApiErrorMessage(err, "Không thể hủy chuyến xe rỗng. Vui lòng thử lại."));
    } finally {
      setCancelling(false);
    }
  };

  const getVehicleDisplay = (route) => {
    const v = vehicleMap.get((route.truckId || "").toUpperCase());
    const rawType = route.truckType || v?.vehicleType || v?.type;
    const typeLabel = VEHICLE_TYPE_LABELS[rawType] || rawType || "Xe tải";
    const bodyType = v?.bodyType ? `(${v.bodyType})` : "";
    return { typeLabel, bodyType, capacity: route.availableCapacity ?? v?.payloadCapacity };
  };

  return (
    <Box className="w-full flex flex-col gap-5">
      {/* ── Tiêu đề & Hành động ── */}
      <PageHeader
        title="Lịch sử chuyến xe rỗng chiều"
        subtitle="Quản lý các chuyến xe rỗng đã khai báo, theo dõi radar kết nối hàng hai chiều và điều phối phương tiện."
        breadcrumbs={[
          { label: "Trang chủ", path: "/carrier/dashboard" },
          { label: "Đội xe", path: "/carrier/vehicles" },
          { label: "Xe rỗng chiều" },
        ]}
        action={
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<RefreshIcon />}
              onClick={loadData}
              disabled={loading}
              sx={{ bgcolor: "background.paper", borderRadius: "10px", textTransform: "none", fontWeight: 600 }}
            >
              Làm mới
            </Button>
            <Button
              variant="contained"
              startIcon={<LocalShippingIcon />}
              onClick={() => setOpenCreateDialog(true)}
              sx={{
                borderRadius: "10px",
                textTransform: "none",
                fontWeight: 700,
                px: 2.5,
                bgcolor: "var(--color-brand)",
                "&:hover": { bgcolor: "var(--color-brand)" },
              }}
            >
              + Khai báo xe rỗng
            </Button>
          </Stack>
        }
      />

      {/* ── Khối Thống Kê KPI ── */}
      <Grid container spacing={2.5}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tổng số chuyến"
            value={counts.all}
            subtitle="Đã khai báo trên hệ thống"
            icon={DirectionsCarIcon}
            color="var(--color-brand)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Đang dò tìm đơn"
            value={counts.pending}
            subtitle="Radar tìm kiếm đang phát sóng"
            icon={RadarIcon}
            color="var(--color-warning)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Đã ghép đơn"
            value={counts.matched}
            subtitle="Khớp phiên đấu giá thành công"
            icon={CheckCircleIcon}
            color="var(--color-success)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Đã hủy"
            value={counts.cancelled}
            subtitle="Dừng phát sóng tìm đơn"
            icon={CancelIcon}
            color="var(--color-ink-muted)"
          />
        </Grid>
      </Grid>

      {/* ── Thanh lọc trạng thái & Tìm kiếm ── */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderRadius: "16px",
          border: "1px solid var(--color-line)",
          bgcolor: "background.paper",
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: { xs: "stretch", md: "center" },
          justifyContent: "space-between",
          gap: 2,
        }}
      >
        {/* Bộ lọc Chips */}
        <Stack direction="row" spacing={1} sx={{ overflowX: "auto", pb: { xs: 0.5, md: 0 } }}>
          {STATUS_FILTERS.map((f) => {
            const count =
              f.value === "ALL"
                ? counts.all
                : f.value === "PENDING"
                ? counts.pending
                : f.value === "MATCHED"
                ? counts.matched
                : counts.cancelled;
            const active = statusFilter === f.value;
            return (
              <Chip
                key={f.value}
                label={`${f.label} (${count})`}
                onClick={() => setStatusFilter(f.value)}
                variant={active ? "filled" : "outlined"}
                color={active ? "primary" : "default"}
                sx={{
                  fontWeight: active ? 700 : 500,
                  fontSize: "0.825rem",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              />
            );
          })}
        </Stack>

        {/* Ô tìm kiếm & Toggle View */}
        <Stack direction="row" spacing={1.5} alignItems="center">
          <TextField
            size="small"
            placeholder="Tìm theo biển số, điểm đi, điểm đến..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" className="text-ink-subtle" />
                </InputAdornment>
              ),
              endAdornment: searchQuery ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchQuery("")} edge="end">
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
            sx={{
              minWidth: { xs: "100%", md: 280 },
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
                bgcolor: "var(--color-surface-sunken)",
              },
            }}
          />
          <ViewModeToggle mode={viewMode} onChange={setViewMode} />
        </Stack>
      </Paper>

      {/* ── Trạng thái Tải dữ liệu / Lỗi ── */}
      {loading && <ListSkeleton rows={4} label="Đang tải lịch sử xe rỗng..." />}
      {!loading && loadError && <ErrorState description={loadError} onRetry={loadData} />}

      {/* ── Dữ liệu trống ── */}
      {!loading && !loadError && filteredRoutes.length === 0 && (
        <EmptyState
          title="Chưa có chuyến xe rỗng nào"
          description={
            searchQuery || statusFilter !== "ALL"
              ? "Không tìm thấy chuyến xe rỗng phù hợp với bộ lọc hiện tại."
              : "Bạn chưa khai báo chuyến xe chạy rỗng nào. Hãy khai báo để hệ thống tự động tìm đơn hàng hai chiều giúp tăng thêm doanh thu!"
          }
          action={
            <Button
              variant="contained"
              startIcon={<LocalShippingIcon />}
              onClick={() => setOpenCreateDialog(true)}
              sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 700 }}
            >
              + Khai báo ngay
            </Button>
          }
        />
      )}

      {/* ── DẠNG CARD VIEW ── */}
      {!loading && !loadError && filteredRoutes.length > 0 && viewMode === "CARD" && (
        <Grid container spacing={2.5}>
          {filteredRoutes.map((route) => {
            const { typeLabel, bodyType, capacity } = getVehicleDisplay(route);
            const isPending = route.status === "PENDING";

            return (
              <Grid item xs={12} md={6} lg={4} key={route.id}>
                <Card
                  elevation={0}
                  sx={{
                    borderRadius: "16px",
                    border: "1px solid var(--color-line)",
                    transition: "all 0.2s ease-in-out",
                    "&:hover": {
                      boxShadow: "0 10px 25px -5px rgba(0,0,0,0.08)",
                      borderColor: "var(--color-brand)",
                    },
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    bgcolor: "background.paper",
                  }}
                >
                  <CardContent sx={{ p: 2.5, flex: "1 1 auto", display: "flex", flexDirection: "column", gap: 2 }}>
                    {/* Header Thẻ: Biển số + Loại xe + Trạng thái */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-lg text-ink tracking-tight bg-surface-sunken px-2.5 py-0.5 rounded-lg border border-line">
                            {route.truckId}
                          </span>
                          <span className="text-xs font-bold text-brand bg-brand-soft px-2 py-0.5 rounded-md">
                            {typeLabel}
                          </span>
                        </div>
                        {bodyType && (
                          <div className="text-xs text-ink-muted mt-1 font-medium">{bodyType}</div>
                        )}
                      </div>
                      <StatusBadge status={route.status} />
                    </div>

                    <Divider sx={{ borderColor: "var(--color-line-soft)" }} />

                    {/* Lộ trình Điểm A ➔ B */}
                    <div className="space-y-2 bg-surface-sunken/60 p-3 rounded-xl border border-line/50">
                      <div className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand text-white flex items-center justify-center text-xs font-bold mt-0.5">
                          A
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-ink-muted uppercase">Điểm xe rỗng hàng</p>
                          <p className="text-sm font-semibold text-ink line-clamp-2">{route.origin || "Chưa rõ điểm đi"}</p>
                          <p className="text-xs text-ink-subtle mt-0.5 flex items-center gap-1">
                            <TimerIcon className="!text-xs text-brand" /> {formatDateTime(route.expectedEmptyTime)}
                          </p>
                        </div>
                      </div>

                      <div className="pl-2.5 border-l-2 border-dashed border-line ml-2.5 h-3" />

                      <div className="flex items-start gap-2">
                        <span className="flex-shrink-0 w-5 h-5 rounded-md bg-success text-white flex items-center justify-center text-xs font-bold mt-0.5">
                          B
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-ink-muted uppercase">Điểm đến mong muốn</p>
                          <p className="text-sm font-semibold text-ink line-clamp-2">{route.destination || "Chưa rõ điểm đến"}</p>
                          {route.expectedArrivalTime && (
                            <p className="text-xs text-ink-subtle mt-0.5 flex items-center gap-1">
                              <TimerIcon className="!text-xs text-success" /> {formatDateTime(route.expectedArrivalTime)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Thông số kỹ thuật & Tải trọng */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-surface-sunken p-2 rounded-lg border border-line flex items-center gap-1.5">
                        <ScaleIcon className="!text-base text-info" />
                        <div>
                          <p className="text-ink-subtle text-[11px]">Tải trọng nhận</p>
                          <p className="font-bold text-ink">{capacity ? `${capacity} tấn` : "Toàn bộ"}</p>
                        </div>
                      </div>

                      <div className="bg-surface-sunken p-2 rounded-lg border border-line flex items-center gap-1.5">
                        <RadarIcon className="!text-base text-warning" />
                        <div>
                          <p className="text-ink-subtle text-[11px]">Bán kính quét</p>
                          <p className="font-bold text-ink">{route.searchRadius || 50} km</p>
                        </div>
                      </div>
                    </div>

                    {/* Nút hành động */}
                    <div className="mt-auto pt-2 flex items-center justify-between gap-2">
                      <Button
                        size="small"
                        variant="outlined"
                        color="inherit"
                        startIcon={<VisibilityIcon fontSize="small" />}
                        onClick={() => setSelectedRoute(route)}
                        sx={{
                          textTransform: "none",
                          fontWeight: 600,
                          borderRadius: "8px",
                          fontSize: "0.8rem",
                          flex: 1,
                        }}
                      >
                        Chi tiết & Bản đồ
                      </Button>

                      {isPending && (
                        <Tooltip title="Hủy phát sóng tìm đơn cho chuyến này">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setConfirmCancelRoute(route)}
                            sx={{
                              border: "1px solid var(--color-line)",
                              borderRadius: "8px",
                              "&:hover": { bgcolor: "var(--color-danger-soft)" },
                            }}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* ── DẠNG BẢNG CHI TIẾT (TABLE VIEW) ── */}
      {!loading && !loadError && filteredRoutes.length > 0 && viewMode === "TABLE" && (
        <TableContainer
          component={Paper}
          elevation={0}
          sx={{
            borderRadius: "16px",
            border: "1px solid var(--color-line)",
            overflow: "hidden",
          }}
        >
          <Table>
            <TableHead sx={{ bgcolor: "var(--color-surface-sunken)" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase" }}>
                  Phương tiện
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase" }}>
                  Hành trình (A ➔ B)
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase" }}>
                  Tải trọng nhận
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase" }}>
                  Thời gian rỗng
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase" }}>
                  Bán kính
                </TableCell>
                <TableCell sx={{ fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase" }}>
                  Trạng thái
                </TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, fontSize: "0.8rem", textTransform: "uppercase" }}>
                  Thao tác
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRoutes.map((route) => {
                const { typeLabel, bodyType, capacity } = getVehicleDisplay(route);
                const isPending = route.status === "PENDING";

                return (
                  <TableRow key={route.id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                    <TableCell>
                      <div className="font-mono font-bold text-sm text-ink">{route.truckId}</div>
                      <div className="text-xs text-brand font-semibold">{typeLabel}</div>
                      {bodyType && <div className="text-xs text-ink-muted">{bodyType}</div>}
                    </TableCell>
                    <TableCell sx={{ maxWidth: 320 }}>
                      <div className="text-xs font-semibold text-ink line-clamp-1">
                        <span className="text-brand font-bold mr-1">A:</span> {route.origin}
                      </div>
                      <div className="text-xs font-semibold text-ink line-clamp-1 mt-1">
                        <span className="text-success font-bold mr-1">B:</span> {route.destination}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-bold text-sm text-ink">
                        {capacity ? `${capacity} tấn` : "Toàn bộ"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="text-xs text-ink">{formatDateTime(route.expectedEmptyTime)}</div>
                      {route.expectedArrivalTime && (
                        <div className="text-xs text-ink-muted">➔ {formatDateTime(route.expectedArrivalTime)}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-semibold text-ink">{route.searchRadius || 50} km</span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={route.status} />
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button
                          size="small"
                          variant="outlined"
                          color="inherit"
                          onClick={() => setSelectedRoute(route)}
                          sx={{ textTransform: "none", borderRadius: "8px", fontSize: "0.78rem" }}
                        >
                          Chi tiết
                        </Button>
                        {isPending && (
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setConfirmCancelRoute(route)}
                            title="Hủy chuyến"
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* ── MODAL KHAI BÁO XE RỖNG CHIỀU ── */}
      <EmptyRouteDialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        onSuccess={loadData}
        vehicles={vehicles}
      />

      {/* ── DIALOG XEM CHI TIẾT & BẢN ĐỒ LỘ TRÌNH ── */}
      {selectedRoute && (
        <Dialog
          open={Boolean(selectedRoute)}
          onClose={() => setSelectedRoute(null)}
          maxWidth="md"
          fullWidth
          TransitionProps={{ unmountOnExit: true }}
          PaperProps={{
            sx: { borderRadius: "20px", overflow: "hidden" },
          }}
        >
          <DialogTitle sx={{ bgcolor: "var(--color-brand)", color: "white", p: 2.5 }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LocalShippingIcon />
                <div>
                  <h3 className="font-bold text-base">Chi tiết chuyến xe rỗng chiều</h3>
                  <p className="text-xs text-white/80 font-mono">Biển số: {selectedRoute.truckId}</p>
                </div>
              </div>
              <IconButton size="small" onClick={() => setSelectedRoute(null)} sx={{ color: "white" }}>
                <CloseIcon />
              </IconButton>
            </div>
          </DialogTitle>

          <DialogContent dividers sx={{ p: 3, display: "flex", flexDirection: "column", gap: 3 }}>
            {/* Tóm tắt thông số */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-surface-sunken p-3 rounded-xl border border-line">
                <p className="text-xs text-ink-subtle">Trạng thái</p>
                <div className="mt-1"><StatusBadge status={selectedRoute.status} /></div>
              </div>
              <div className="bg-surface-sunken p-3 rounded-xl border border-line">
                <p className="text-xs text-ink-subtle">Loại phương tiện</p>
                <p className="text-sm font-bold text-ink mt-1">
                  {getVehicleDisplay(selectedRoute).typeLabel}
                </p>
              </div>
              <div className="bg-surface-sunken p-3 rounded-xl border border-line">
                <p className="text-xs text-ink-subtle">Tải trọng còn trống</p>
                <p className="text-sm font-bold text-ink mt-1">
                  {selectedRoute.availableCapacity ? `${selectedRoute.availableCapacity} tấn` : "Toàn tải"}
                </p>
              </div>
              <div className="bg-surface-sunken p-3 rounded-xl border border-line">
                <p className="text-xs text-ink-subtle">Bán kính quét</p>
                <p className="text-sm font-bold text-ink mt-1">{selectedRoute.searchRadius || 50} km</p>
              </div>
            </div>

            {/* Thông tin lộ trình A - B */}
            <div className="space-y-3 bg-surface-sunken p-4 rounded-xl border border-line">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-brand text-white flex items-center justify-center text-xs font-bold mt-0.5">
                  A
                </span>
                <div>
                  <p className="text-xs font-bold text-ink-muted uppercase">Điểm xe rỗng hàng (Khởi hành)</p>
                  <p className="text-sm font-bold text-ink">{selectedRoute.origin}</p>
                  <p className="text-xs text-ink-subtle mt-0.5">
                    Thời gian xe rỗng: <strong>{formatDateTime(selectedRoute.expectedEmptyTime)}</strong>
                  </p>
                  {selectedRoute.latitude && selectedRoute.longitude && (
                    <p className="text-[11px] text-ink-muted font-mono mt-0.5">
                      GPS: {selectedRoute.latitude}, {selectedRoute.longitude}
                    </p>
                  )}
                </div>
              </div>

              <Divider sx={{ borderColor: "var(--color-line-soft)" }} />

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-md bg-success text-white flex items-center justify-center text-xs font-bold mt-0.5">
                  B
                </span>
                <div>
                  <p className="text-xs font-bold text-ink-muted uppercase">Điểm đến mong muốn</p>
                  <p className="text-sm font-bold text-ink">{selectedRoute.destination}</p>
                  {selectedRoute.expectedArrivalTime && (
                    <p className="text-xs text-ink-subtle mt-0.5">
                      Dự kiến đến nơi: <strong>{formatDateTime(selectedRoute.expectedArrivalTime)}</strong>
                    </p>
                  )}
                  {selectedRoute.destLatitude && selectedRoute.destLongitude && (
                    <p className="text-[11px] text-ink-muted font-mono mt-0.5">
                      GPS: {selectedRoute.destLatitude}, {selectedRoute.destLongitude}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Bản đồ định vị lộ trình nếu có GPS */}
            {(selectedRoute.latitude != null || selectedRoute.destLatitude != null) ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase text-ink-muted">
                  <MapIcon className="!text-sm text-brand" />
                  <span>Bản đồ lộ trình & Bán kính quét</span>
                </div>
                <div className="w-full rounded-xl overflow-hidden shadow-xs">
                  <RouteDetailMap
                    origin={
                      selectedRoute.latitude != null && selectedRoute.longitude != null
                        ? {
                            lat: Number(selectedRoute.latitude),
                            lng: Number(selectedRoute.longitude),
                            label: selectedRoute.origin,
                          }
                        : null
                    }
                    dest={
                      selectedRoute.destLatitude != null && selectedRoute.destLongitude != null
                        ? {
                            lat: Number(selectedRoute.destLatitude),
                            lng: Number(selectedRoute.destLongitude),
                            label: selectedRoute.destination,
                          }
                        : null
                    }
                    searchRadius={Number(selectedRoute.searchRadius) || 50}
                  />
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-surface-sunken border border-line text-center text-sm text-ink-muted">
                <MapIcon className="mx-auto mb-1 text-ink-subtle !text-2xl" />
                <p>Chuyến xe này chưa được cập nhật tọa độ GPS để hiển thị trên bản đồ.</p>
              </div>
            )}
          </DialogContent>

          <DialogActions sx={{ p: 2.5, bgcolor: "var(--color-surface-sunken)" }}>
            <Button
              variant="outlined"
              color="inherit"
              onClick={() => setSelectedRoute(null)}
              sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 600 }}
            >
              Đóng
            </Button>
            {selectedRoute.status === "PENDING" && (
              <Button
                variant="contained"
                color="error"
                startIcon={<DeleteOutlineIcon />}
                onClick={() => {
                  const r = selectedRoute;
                  setSelectedRoute(null);
                  setConfirmCancelRoute(r);
                }}
                sx={{ borderRadius: "10px", textTransform: "none", fontWeight: 700 }}
              >
                Hủy chuyến này
              </Button>
            )}
          </DialogActions>
        </Dialog>
      )}

      {/* ── DIALOG XÁC NHẬN HỦY CHUYẾN ── */}
      {confirmCancelRoute && (
        <ConfirmDialog
          open={Boolean(confirmCancelRoute)}
          title="Xác nhận dừng phát sóng chuyến xe rỗng?"
          description={`Bạn có chắc muốn hủy chuyến xe rỗng cho biển số ${confirmCancelRoute.truckId} từ "${confirmCancelRoute.origin}" đi "${confirmCancelRoute.destination}" không? Hệ thống sẽ ngừng quét tìm đơn hàng cho chuyến này.`}
          confirmLabel={cancelling ? "Đang hủy..." : "Hủy phát sóng"}
          confirmColor="error"
          cancelLabel="Giữ lại"
          loading={cancelling}
          onConfirm={handleCancelRoute}
          onClose={() => setConfirmCancelRoute(null)}
        />
      )}
    </Box>
  );
}
