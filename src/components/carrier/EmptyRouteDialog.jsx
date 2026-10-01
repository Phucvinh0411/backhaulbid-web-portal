"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Typography,
  Alert,
  CircularProgress,
  Box,
  Tooltip,
  Slider,
  InputAdornment,
  IconButton,
} from "@mui/material";
import MyLocationIcon    from "@mui/icons-material/MyLocation";
import MapIcon           from "@mui/icons-material/MapOutlined";
import ScheduleIcon      from "@mui/icons-material/Schedule";
import PlaceIcon         from "@mui/icons-material/Place";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import ArrowForwardIcon  from "@mui/icons-material/ArrowForward";
import ScaleIcon         from "@mui/icons-material/Scale";
import RadarIcon         from "@mui/icons-material/Radar";
import SearchIcon        from "@mui/icons-material/Search";
import CheckCircleIcon   from "@mui/icons-material/CheckCircle";
import CloseIcon         from "@mui/icons-material/Close";
import SwapVertIcon      from "@mui/icons-material/SwapVert";
import ClearIcon         from "@mui/icons-material/Clear";
import NavigationIcon    from "@mui/icons-material/Navigation";

import { declareEmptyRoute }        from "@/services/fleetApi";
import { getApiErrorMessage }       from "@/services/errorMessage";
import { reverseGeocode }           from "@/utils/geocoding";
import { searchPlacesLikeGrab }     from "@/utils/vietnamPlaces";
import { useGlobalNotification }    from "@/components/common/NotificationPopup";

// ─── Dynamic import Leaflet map để tránh SSR ───
const RoutePickerMap = dynamic(() => import("./RoutePickerMap"), {
  ssr: false,
  loading: () => (
    <Box
      sx={{
        height: "320px",
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "16px",
        border: "1px solid #E2E8F0",
        bgcolor: "#F8FAFC",
      }}
    >
      <CircularProgress size={26} sx={{ color: "#1B4965", mr: 1.5 }} />
      <Typography variant="body2" sx={{ color: "#64748B", fontWeight: 600 }}>
        Đang tải bản đồ tương tác...
      </Typography>
    </Box>
  ),
});

// ─── Hằng số bán kính tìm kiếm GIS ───
const RADIUS_MARKS = [
  { value: 5,   label: "5 km"   },
  { value: 50,  label: "50 km"  },
  { value: 100, label: "100 km" },
  { value: 200, label: "200 km" },
  { value: 500, label: "500 km" },
];

export default function EmptyRouteDialog({ open, onClose, vehicles = [] }) {
  const notify = useGlobalNotification();
  const [loading, setLoading]                   = useState(false);
  const [showMap, setShowMap]                   = useState(true);
  const [activeMapTarget, setActiveMapTarget]   = useState("ORIGIN"); // "ORIGIN" | "DESTINATION"

  // ── Phương tiện & Tải trọng ──
  const [selectedVehicle, setSelectedVehicle]     = useState(null);
  const [availableCapacity, setAvailableCapacity] = useState("");

  // ── Điểm xuất phát (A) ──
  const [originAddress, setOriginAddress]         = useState("");
  const [latitude, setLatitude]                   = useState(null);
  const [longitude, setLongitude]                 = useState(null);
  const [geocodingOrigin, setGeocodingOrigin]     = useState(false);
  const [gettingGps, setGettingGps]               = useState(false);

  // ── Điểm đến (B) ──
  const [destAddress, setDestAddress]             = useState("");
  const [destLatitude, setDestLatitude]           = useState(null);
  const [destLongitude, setDestLongitude]         = useState(null);
  const [geocodingDest, setGeocodingDest]         = useState(false);

  // ── Thời gian ──
  const [expectedTime, setExpectedTime]           = useState("");
  const [expectedArrivalTime, setExpectedArrivalTime] = useState("");

  // ── Bán kính tìm kiếm (km) ──
  const [searchRadius, setSearchRadius]           = useState(50);

  // ── Tính thời gian di chuyển ước tính ──
  const tripDurationText = useMemo(() => {
    if (!expectedTime || !expectedArrivalTime) return null;
    const diffMs = new Date(expectedArrivalTime) - new Date(expectedTime);
    if (diffMs <= 0) return "⚠️ Thời gian đến phải sau thời gian xuất phát";
    const totalMinutes = Math.floor(diffMs / 60000);
    const days    = Math.floor(totalMinutes / 1440);
    const hours   = Math.floor((totalMinutes % 1440) / 60);
    const minutes = totalMinutes % 60;
    const parts   = [];
    if (days)    parts.push(`${days} ngày`);
    if (hours)   parts.push(`${hours} giờ`);
    if (minutes) parts.push(`${minutes} phút`);
    return `🕐 Dự kiến di chuyển: ${parts.join(" ")}`;
  }, [expectedTime, expectedArrivalTime]);

  // ── Gợi ý tải trọng từ xe đã chọn ──
  const vehicleCapacityHint = useMemo(() => {
    if (!selectedVehicle) return null;
    const cap = selectedVehicle.capacity || selectedVehicle.payloadCapacity;
    if (!cap) return null;
    return `Tải trọng tối đa của xe: ${cap}`;
  }, [selectedVehicle]);

  // ── Lấy GPS hiện tại cho Điểm đi (A) ──
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      notify.warning("Trình duyệt không hỗ trợ định vị GPS.");
      return;
    }
    setGettingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        setLatitude(lat);
        setLongitude(lng);
        setActiveMapTarget("ORIGIN");

        try {
          const resolved = await reverseGeocode(lat, lng);
          if (resolved) {
            setOriginAddress(resolved);
          }
        } catch {
          // ignore
        }

        notify.success("Đã lấy vị trí hiện tại của bạn qua GPS!");
        setGettingGps(false);
      },
      () => {
        notify.warning("Không thể lấy tọa độ GPS. Vui lòng cho phép quyền vị trí trên trình duyệt.");
        setGettingGps(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // ── Đổi chiều chuyến đi (Hoán đổi Điểm đi A và Điểm đến B) ──
  const handleSwapRoute = () => {
    const tempAddr = originAddress;
    const tempLat  = latitude;
    const tempLng  = longitude;

    setOriginAddress(destAddress);
    setLatitude(destLatitude);
    setLongitude(destLongitude);

    setDestAddress(tempAddr);
    setDestLatitude(tempLat);
    setDestLongitude(tempLng);

    notify.info("Đã hoán đổi chiều lộ trình (Điểm đi ⇄ Điểm đến)");
  };

  // ── Khi người dùng click hoặc kéo ghim trên bản đồ ──
  const handleMapClick = async (target, coords) => {
    if (target === "DESTINATION") {
      setDestLatitude(coords.lat);
      setDestLongitude(coords.lng);
      setGeocodingDest(true);
      try {
        const resolved = await reverseGeocode(coords.lat, coords.lng);
        if (resolved) {
          setDestAddress(resolved);
        }
      } finally {
        setGeocodingDest(false);
      }
      notify.info("Đã ghim Điểm đến (B) từ bản đồ");
    } else {
      setLatitude(coords.lat);
      setLongitude(coords.lng);
      setGeocodingOrigin(true);
      try {
        const resolved = await reverseGeocode(coords.lat, coords.lng);
        if (resolved) {
          setOriginAddress(resolved);
        }
      } finally {
        setGeocodingOrigin(false);
      }
      notify.info("Đã ghim Điểm xuất phát (A) từ bản đồ");
    }
  };

  // ── Xử lý khi chọn một địa điểm từ danh sách gợi ý Grab ──
  const handleSelectOriginPlace = (place) => {
    setOriginAddress(place.fullAddress || place.subtitle || place.title);
    setLatitude(place.lat);
    setLongitude(place.lng);
    setActiveMapTarget("ORIGIN");
    notify.success(`Đã định vị Điểm đi: ${place.title}`);
  };

  const handleSelectDestPlace = (place) => {
    setDestAddress(place.fullAddress || place.subtitle || place.title);
    setDestLatitude(place.lat);
    setDestLongitude(place.lng);
    setActiveMapTarget("DESTINATION");
    notify.success(`Đã định vị Điểm đến: ${place.title}`);
  };

  // ── Xử lý Submit Form ──
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedVehicle) {
      notify.warning("Vui lòng chọn xe tải thực hiện chuyến rỗng.");
      return;
    }

    const finalOrigin = originAddress?.trim();
    const finalDest   = destAddress?.trim();

    if (!finalOrigin) {
      notify.warning("Vui lòng nhập địa chỉ điểm xuất phát (A).");
      return;
    }
    if (!finalDest) {
      notify.warning("Vui lòng nhập địa chỉ điểm đến mong muốn (B).");
      return;
    }
    if (latitude === null || longitude === null) {
      notify.warning("Vui lòng xác định vị trí Điểm đi trên bản đồ hoặc chọn từ gợi ý.");
      return;
    }
    if (destLatitude === null || destLongitude === null) {
      notify.warning("Vui lòng xác định vị trí Điểm đến trên bản đồ hoặc chọn từ gợi ý.");
      return;
    }
    if (!expectedTime) {
      notify.warning("Vui lòng chọn ngày giờ xe bắt đầu rỗng chiều.");
      return;
    }
    if (!expectedArrivalTime) {
      notify.warning("Vui lòng chọn ngày giờ dự kiến đến nơi.");
      return;
    }
    if (new Date(expectedArrivalTime) <= new Date(expectedTime)) {
      notify.warning("Ngày giờ đến nơi phải sau ngày giờ xuất phát.");
      return;
    }

    const capValue = availableCapacity !== "" ? Number(availableCapacity) : null;
    if (capValue !== null && capValue <= 0) {
      notify.warning("Tải trọng còn trống phải lớn hơn 0.");
      return;
    }

    setLoading(true);
    try {
      await declareEmptyRoute({
        truckId:             selectedVehicle.licensePlate || selectedVehicle.plate || selectedVehicle.id,
        availableCapacity:   capValue,
        origin:              finalOrigin,
        latitude:            Number(latitude),
        longitude:           Number(longitude),
        destination:         finalDest,
        destLatitude:        Number(destLatitude),
        destLongitude:       Number(destLongitude),
        expectedEmptyTime:   toISO(expectedTime),
        expectedArrivalTime: toISO(expectedArrivalTime),
        searchRadius:        searchRadius,
      });

      notify.success(
        `Khai báo chuyến xe rỗng thành công! Hệ thống đang quét tìm lô hàng phù hợp trong bán kính ${searchRadius} km.`
      );
      handleClose();
    } catch (err) {
      notify.error(getApiErrorMessage(err, "Khai báo xe rỗng thất bại. Vui lòng kiểm tra lại."));
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setSelectedVehicle(null);
    setAvailableCapacity("");
    setOriginAddress("");
    setLatitude(null);
    setLongitude(null);
    setDestAddress("");
    setDestLatitude(null);
    setDestLongitude(null);
    setExpectedTime("");
    setExpectedArrivalTime("");
    setSearchRadius(50);
    setActiveMapTarget("ORIGIN");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
      TransitionProps={{
        onEntered: () => {
          if (typeof window !== "undefined") {
            window.dispatchEvent(new Event("resize"));
          }
        },
      }}
      PaperProps={{
        component: "form",
        onSubmit: handleSubmit,
        sx: {
          borderRadius: "20px",
          boxShadow: "0 20px 45px rgba(0,0,0,0.15)",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        },
      }}
    >
      {/* ─── HEADER ─── */}
      <DialogTitle
        sx={{
          bgcolor: "#1B4965",
          color: "#FFFFFF",
          px: 3,
          py: 2.2,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 10,
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 text-white flex items-center justify-center border border-white/20">
            <LocalShippingIcon />
          </div>
          <div>
            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: "1.1rem", lineHeight: 1.2 }}>
              Khai báo chuyến xe rỗng chiều
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>
              Tìm kiếm địa chỉ thông minh · Định vị tọa độ chính xác như Grab
            </Typography>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="small"
            variant="text"
            onClick={() => setShowMap((prev) => !prev)}
            startIcon={<MapIcon />}
            sx={{
              color: "#FFFFFF",
              bgcolor: "rgba(255,255,255,0.12)",
              borderRadius: "10px",
              textTransform: "none",
              fontWeight: 700,
              fontSize: "0.78rem",
              px: 1.5,
              "&:hover": { bgcolor: "rgba(255,255,255,0.22)" },
            }}
          >
            {showMap ? "Ẩn bản đồ" : "Hiện bản đồ"}
          </Button>

          <IconButton
            onClick={handleClose}
            disabled={loading}
            size="small"
            sx={{ color: "rgba(255,255,255,0.8)", "&:hover": { color: "#FFFFFF" } }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>
      </DialogTitle>

      <DialogContent
        dividers
        sx={{
          flex: "1 1 auto",
          overflowY: "auto !important",
          p: { xs: 2, sm: 3 },
          bgcolor: "#F8FAFC",
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
          overscrollBehavior: "contain",
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            bgcolor: "#F1F5F9",
          },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: "#CBD5E1",
            borderRadius: "4px",
            "&:hover": { bgcolor: "#94A3B8" },
          },
        }}
      >
        {/* ══════════ KHỐI 1: PHƯƠNG TIỆN & TẢI TRỌNG ══════════ */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <LocalShippingIcon className="!text-base text-sky-600" />
            <span>1. Phương tiện thực hiện & Tải trọng nhận hàng</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Chọn xe */}
            <TextField
              select
              label="Xe rỗng thực hiện chuyến"
              fullWidth
              required
              value={selectedVehicle?.licensePlate || ""}
              onChange={(e) => {
                const v = vehicles.find(
                  (x) => (x.licensePlate || x.plate) === e.target.value
                );
                setSelectedVehicle(v || null);
                if (v) {
                  const cap = v.capacity || v.payloadCapacity;
                  if (cap) setAvailableCapacity(String(cap).replace(/[^\d.]/g, ""));
                }
              }}
              disabled={loading}
              helperText="Chỉ phương tiện ĐÃ DUYỆT (VERIFIED) mới được khai báo"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "14px",
                  bgcolor: "#FFFFFF",
                },
              }}
            >
              {vehicles.length === 0 && (
                <MenuItem value="" disabled>Chưa có xe nào trong hệ thống</MenuItem>
              )}
              {vehicles.map((v) => {
                const isVerified = (v.verification || v.status) === "VERIFIED";
                const plate = v.licensePlate || v.plate || "";
                return (
                  <MenuItem key={v.id || plate} value={v.licensePlate || v.plate || ""} disabled={!isVerified}>
                    <span className="font-bold font-mono text-slate-800 mr-2">{plate}</span>
                    <span className="text-slate-600 text-sm mr-2">
                      – {v.type || v.vehicleType}
                      {(v.capacity || v.payloadCapacity) && ` · ${v.capacity || v.payloadCapacity}`}
                    </span>
                    {!isVerified ? (
                      <span className="text-amber-600 text-xs font-semibold">[Chờ duyệt]</span>
                    ) : (
                      <span className="text-emerald-600 text-xs font-bold">✓ Đã duyệt</span>
                    )}
                  </MenuItem>
                );
              })}
            </TextField>

            {/* Tải trọng còn trống */}
            <TextField
              label="Tải trọng còn trống có thể nhận (tấn)"
              type="number"
              fullWidth
              inputProps={{ step: "0.1", min: "0.1" }}
              placeholder="VD: 8.5"
              value={availableCapacity}
              onChange={(e) => setAvailableCapacity(e.target.value)}
              disabled={loading}
              helperText={vehicleCapacityHint || "Khối lượng hàng tối đa xe có thể nhận thêm"}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <ScaleIcon fontSize="small" className="text-slate-400" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <span className="text-slate-500 text-sm font-bold">tấn</span>
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "14px",
                  bgcolor: "#FFFFFF",
                },
              }}
            />
          </div>
        </div>

        {/* ══════════ KHỐI 2: LỘ TRÌNH ĐỊA CHỈ & BẢN ĐỒ KIỂU GRAB ══════════ */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              <PlaceIcon className="!text-base text-emerald-600" />
              <span>2. Lộ trình di chuyển (Tìm kiếm địa chỉ kiểu Grab)</span>
            </div>
            <span className="text-[11px] text-slate-400">
              💡 Gõ tên kho bãi, KCN, cảng biển hoặc nhấp trực tiếp trên bản đồ
            </span>
          </div>

          {/* HỘP NHẬP LIỆU LỘ TRÌNH KIỂU GRAB */}
          <div className="relative bg-slate-50/70 p-4 rounded-2xl border border-slate-200/90">
            <div className="flex items-stretch gap-3">
              {/* Cột icon lộ trình Grab (Chấm xanh A - Dây nối - Vuông cam B) */}
              <div className="flex flex-col items-center justify-between py-3">
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                  A
                </div>
                <div className="w-0.5 flex-1 my-1 border-l-2 border-dashed border-slate-300"></div>
                <div className="w-5 h-5 rounded-md bg-amber-500 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                  B
                </div>
              </div>

              {/* Hai ô nhập địa chỉ tìm kiếm */}
              <div className="flex-1 space-y-3">
                {/* ── Ô NHẬP ĐIỂM ĐI (A) ── */}
                <GrabSearchBox
                  value={originAddress}
                  placeholder="Nhập điểm xuất phát (Cảng Cát Lái, KCN Sóng Thần, địa chỉ...)"
                  onChange={(val) => setOriginAddress(val)}
                  onSelectPlace={handleSelectOriginPlace}
                  onFocus={() => setActiveMapTarget("ORIGIN")}
                  isActive={activeMapTarget === "ORIGIN"}
                  isPinned={latitude !== null && longitude !== null}
                  badgeText="Điểm đi (A)"
                  badgeColor="emerald"
                  rightAction={
                    <Tooltip title="Lấy vị trí GPS hiện tại của bạn">
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleGetCurrentLocation();
                        }}
                        disabled={gettingGps || loading}
                        sx={{ color: "#10B981" }}
                      >
                        {gettingGps ? <CircularProgress size={16} /> : <MyLocationIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                  }
                  onClear={() => {
                    setOriginAddress("");
                    setLatitude(null);
                    setLongitude(null);
                  }}
                  loading={geocodingOrigin}
                />

                {/* ── Ô NHẬP ĐIỂM ĐẾN (B) ── */}
                <GrabSearchBox
                  value={destAddress}
                  placeholder="Nhập điểm đến mong muốn (KCN Quang Minh, Cảng Hải Phòng, địa chỉ...)"
                  onChange={(val) => setDestAddress(val)}
                  onSelectPlace={handleSelectDestPlace}
                  onFocus={() => setActiveMapTarget("DESTINATION")}
                  isActive={activeMapTarget === "DESTINATION"}
                  isPinned={destLatitude !== null && destLongitude !== null}
                  badgeText="Điểm đến (B)"
                  badgeColor="amber"
                  onClear={() => {
                    setDestAddress("");
                    setDestLatitude(null);
                    setDestLongitude(null);
                  }}
                  loading={geocodingDest}
                />
              </div>

              {/* Nút hoán đổi chiều lộ trình (Swap Origin & Destination) */}
              <div className="flex items-center">
                <Tooltip title="Đổi chiều chuyến đi (Điểm đi ⇄ Điểm đến)">
                  <IconButton
                    onClick={handleSwapRoute}
                    size="small"
                    sx={{
                      bgcolor: "#FFFFFF",
                      border: "1px solid #CBD5E1",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                      "&:hover": { bgcolor: "#F1F5F9" },
                    }}
                  >
                    <SwapVertIcon fontSize="small" className="text-slate-600" />
                  </IconButton>
                </Tooltip>
              </div>
            </div>
          </div>

          {/* BẢN ĐỒ TƯƠNG TÁC LEAFLET */}
          {showMap && (
            <div className="space-y-2">
              <RoutePickerMap
                origin={
                  latitude !== null && longitude !== null
                    ? { lat: latitude, lng: longitude, label: originAddress }
                    : null
                }
                dest={
                  destLatitude !== null && destLongitude !== null
                    ? { lat: destLatitude, lng: destLongitude, label: destAddress }
                    : null
                }
                onMapClick={handleMapClick}
                onTargetChange={setActiveMapTarget}
                activeTarget={activeMapTarget}
              />
            </div>
          )}
        </div>

        {/* ══════════ KHỐI 3: THỜI GIAN ĐI & ĐẾN ══════════ */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <ScheduleIcon className="!text-base text-sky-600" />
            <span>3. Thời gian đi và đến chính xác (Ngày & Giờ)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextField
              label="Thời gian xe bắt đầu rỗng (Khởi hành)"
              type="datetime-local"
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: new Date().toISOString().slice(0, 16) }}
              value={expectedTime}
              onChange={(e) => setExpectedTime(e.target.value)}
              disabled={loading}
              helperText="Mốc thời gian xe sẵn sàng nhận hàng trên đường về"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "14px",
                  bgcolor: "#FFFFFF",
                },
              }}
            />
            <TextField
              label="Thời gian dự kiến đến nơi (Hạn chót)"
              type="datetime-local"
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              inputProps={{ min: expectedTime || new Date().toISOString().slice(0, 16) }}
              value={expectedArrivalTime}
              onChange={(e) => setExpectedArrivalTime(e.target.value)}
              disabled={loading}
              helperText="Hạn chót xe phải có mặt tại điểm đến mong muốn"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "14px",
                  bgcolor: "#FFFFFF",
                },
              }}
            />
          </div>

          {tripDurationText && (
            <div className="bg-sky-50 border border-sky-100 rounded-xl px-4 py-2.5 flex items-center gap-2 text-xs font-bold text-sky-800">
              <ScheduleIcon className="!text-sm text-sky-600" />
              <span>{tripDurationText}</span>
            </div>
          )}
        </div>

        {/* ══════════ KHỐI 4: BÁN KÍNH TÌM KIẾM GIS ══════════ */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
            <RadarIcon className="!text-base text-violet-600" />
            <span>4. Bán kính quét tìm lô hàng phù hợp (GIS)</span>
          </div>

          <div className="bg-violet-50/60 border border-violet-100 rounded-2xl px-5 pt-4 pb-4 space-y-3">
            <div className="flex items-center justify-between">
              <Typography variant="body2" className="text-violet-900 font-semibold text-sm">
                Quét lô hàng trong phạm vi bán kính quanh điểm xuất phát:
              </Typography>
              <span className="text-2xl font-black text-violet-700">{searchRadius} km</span>
            </div>

            <Slider
              value={searchRadius}
              onChange={(_, v) => setSearchRadius(v)}
              min={5}
              max={500}
              step={5}
              marks={RADIUS_MARKS}
              valueLabelDisplay="auto"
              valueLabelFormat={(v) => `${v} km`}
              disabled={loading}
              sx={{
                color: "#7c3aed",
                "& .MuiSlider-thumb": { bgcolor: "#7c3aed" },
                "& .MuiSlider-markLabel": { fontSize: "0.72rem", color: "#6d28d9", fontWeight: 600 },
              }}
            />

            <Typography variant="caption" className="text-violet-600 block">
              Bán kính đi vòng cho phép hệ thống tự động ghép các chuyến hàng tiện đường trên tuyến hành trình của bạn.
            </Typography>
          </div>
        </div>

        <Alert severity="info" sx={{ borderRadius: "14px", fontSize: "0.8rem", bgcolor: "#EFF6FF" }}>
          Hệ thống <strong>BackHaulBid</strong> sử dụng công thức định vị GIS <strong>Haversine</strong> để tự động ghép xe với các đơn hàng đấu giá có lộ trình tương thích, giúp xe không bị chạy rỗng chiều về.
        </Alert>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          py: 2,
          bgcolor: "#FFFFFF",
          borderTop: "1px solid #E2E8F0",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          zIndex: 10,
        }}
      >
        <Button
          onClick={handleClose}
          disabled={loading}
          color="inherit"
          sx={{
            borderRadius: "12px",
            textTransform: "none",
            fontWeight: 700,
            color: "#64748B",
          }}
        >
          Hủy bỏ
        </Button>

        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <ArrowForwardIcon />}
          sx={{
            bgcolor: "#1B4965",
            "&:hover": { bgcolor: "#0D2B3E" },
            borderRadius: "14px",
            px: 3.5,
            py: 1,
            fontWeight: 800,
            textTransform: "none",
            boxShadow: "0 4px 14px rgba(27,73,101,0.25)",
          }}
        >
          {loading ? "Đang xử lý..." : "Xác nhận khai báo chuyến"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// ─── Component Input Tìm Kiếm Địa Điểm Kiểu Grab ────────────────────────────────

function GrabSearchBox({
  value,
  placeholder,
  onChange,
  onSelectPlace,
  onFocus,
  isActive,
  isPinned,
  badgeText,
  badgeColor,
  rightAction,
  onClear,
  loading,
}) {
  const [suggestions, setSuggestions] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(false);
  const [searching, setSearching] = useState(false);
  const containerRef = useRef(null);
  const debounceRef  = useRef(null);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpenDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const handleTextChange = (e) => {
    const text = e.target.value;
    onChange(text);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!text || text.trim().length < 2) {
      setSuggestions([]);
      setOpenDropdown(false);
      return;
    }

    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const results = await searchPlacesLikeGrab(text);
        setSuggestions(results || []);
        setOpenDropdown(Boolean(results && results.length > 0));
      } catch {
        setSuggestions([]);
      } finally {
        setSearching(false);
      }
    }, 200);
  };

  const handleSelect = (place) => {
    onSelectPlace(place);
    setOpenDropdown(false);
    setSuggestions([]);
  };

  const activeBorder =
    badgeColor === "emerald"
      ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-white"
      : "border-amber-500 ring-2 ring-amber-500/20 bg-white";

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all bg-white shadow-2xs ${
          isActive ? activeBorder : "border-slate-200 hover:border-slate-300"
        }`}
      >
        <SearchIcon fontSize="small" className="text-slate-400 shrink-0" />

        <input
          type="text"
          value={value || ""}
          onChange={handleTextChange}
          onFocus={() => {
            if (onFocus) onFocus();
            if (suggestions.length > 0) setOpenDropdown(true);
          }}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-slate-800 placeholder-slate-400 font-medium focus:outline-hidden"
        />

        {/* Loading spinner hoặc trạng thái ghim */}
        <div className="flex items-center gap-1 shrink-0">
          {(searching || loading) && (
            <CircularProgress size={16} className="text-sky-600" />
          )}

          {isPinned && !(searching || loading) && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
              <CheckCircleIcon sx={{ fontSize: 13 }} /> Đã ghim
            </span>
          )}

          {value && (
            <IconButton
              size="small"
              onClick={onClear}
              sx={{ p: 0.5, color: "#94A3B8", "&:hover": { color: "#475569" } }}
            >
              <ClearIcon sx={{ fontSize: 16 }} />
            </IconButton>
          )}

          {rightAction}
        </div>
      </div>

      {/* Dropdown danh sách gợi ý địa điểm kiểu Grab */}
      {openDropdown && suggestions.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            zIndex: 9999,
            backgroundColor: "#FFFFFF",
            borderRadius: "14px",
            border: "1px solid #E2E8F0",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
            maxHeight: "260px",
            overflowY: "auto",
          }}
        >
          <div className="p-2 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
            <span>Địa điểm gợi ý ({suggestions.length})</span>
            <span className="text-[10px] text-slate-400 font-normal">Nhấp để chọn & ghim map</span>
          </div>

          {suggestions.map((item, idx) => (
            <div
              key={`${item.title}-${idx}`}
              onClick={() => handleSelect(item)}
              className="px-3 py-2.5 hover:bg-slate-50 cursor-pointer flex items-start gap-2.5 transition-colors border-b border-slate-50 last:border-b-0"
            >
              <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center shrink-0 mt-0.5 border border-sky-100">
                <PlaceIcon sx={{ fontSize: 16 }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-slate-800 truncate block">
                    {item.title}
                  </span>
                  {item.category && (
                    <span className="text-[9px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded-md shrink-0">
                      {item.category}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 truncate mt-0.5">
                  {item.subtitle}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Utilities ─────────────────────────────────────────────────────────────────

function buildAddress(detail, province) {
  return detail?.trim() || province || "";
}

function toISO(datetimeLocal) {
  if (!datetimeLocal) return datetimeLocal;
  return datetimeLocal.length === 16 ? `${datetimeLocal}:00` : datetimeLocal;
}
