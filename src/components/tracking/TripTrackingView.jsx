"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import CheckIcon from "@mui/icons-material/Check";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import PlaceIcon from "@mui/icons-material/Place";
import dynamic from "next/dynamic";

import { contractApi } from "@/services/contractApi";

const Map = dynamic(() => import("@/components/map/Map"), {
  ssr: false,
  loading: () => (
    <Box className="flex h-full w-full items-center justify-center bg-slate-100">
      <Typography variant="body2" className="animate-pulse text-slate-500">Đang tải bản đồ...</Typography>
    </Box>
  ),
});

const POLL_INTERVAL_MS = 15000;

const STATUS_STEPS = [
  { key: "WAITING_PICKUP", label: "Chờ lấy hàng" },
  { key: "PICKED_UP", label: "Đã lấy hàng" },
  { key: "IN_TRANSIT", label: "Đang vận chuyển" },
  { key: "DELIVERED", label: "Đã giao" },
];

const STATUS_LABELS = {
  WAITING_PICKUP: "Chờ lấy hàng",
  PICKED_UP: "Đã lấy hàng",
  IN_TRANSIT: "Đang vận chuyển",
  DELIVERED: "Đã giao",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

const STATUS_TONES = {
  WAITING_PICKUP: "warning",
  PICKED_UP: "info",
  IN_TRANSIT: "primary",
  DELIVERED: "success",
  COMPLETED: "success",
  CANCELLED: "error",
};

const JOURNEY_EVENT_LABELS = {
  DRIVER_ACCEPTED: "Tài xế nhận chuyến",
  ARRIVED_PICKUP: "Đến điểm lấy hàng",
  PICKUP_CONFIRMED: "Xác nhận lấy hàng",
  DEPARTED_PICKUP: "Rời điểm lấy hàng",
  ARRIVED_DELIVERY: "Đến điểm giao hàng",
  DELIVERY_PROOF_SUBMITTED: "Gửi bằng chứng giao hàng",
  DELIVERY_ACCEPTED: "Xác nhận giao hàng",
  INCIDENT_REPORTED: "Báo cáo sự cố",
  ADMIN_OVERRIDE: "Điều chỉnh từ hệ thống",
};

const statusStepIndex = (status) => {
  switch (status) {
    case "WAITING_PICKUP":
      return 0;
    case "PICKED_UP":
      return 1;
    case "IN_TRANSIT":
      return 2;
    case "DELIVERED":
    case "COMPLETED":
      return 3;
    default:
      return -1;
  }
};

const formatTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "medium" }).format(date);
};

const formatMoney = (value) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(value || 0));

const asList = (response) => (Array.isArray(response) ? response : response?.data || []);

export default function TripTrackingView({ tripId }) {
  const [trip, setTrip] = useState(null);
  const [locations, setLocations] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadTracking = useCallback(async () => {
    if (!tripId) return;
    try {
      const [tripResponse, locationResponse, eventResponse] = await Promise.all([
        contractApi.getTrip(tripId),
        contractApi.listLocations(tripId),
        contractApi.listJourneyEvents(tripId),
      ]);
      setTrip(tripResponse);
      const locationList = asList(locationResponse)
        .slice()
        .sort((left, right) => new Date(left.recordedAt) - new Date(right.recordedAt));
      setLocations(locationList);
      setEvents(
        asList(eventResponse)
          .slice()
          .sort((left, right) => new Date(right.recordedAt) - new Date(left.recordedAt)),
      );
      setLastUpdated(new Date());
      setError("");
    } catch (loadError) {
      setError(loadError?.response?.data?.message || "Không thể tải dữ liệu theo dõi chuyến.");
    } finally {
      setLoading(false);
    }
  }, [tripId]);

  useEffect(() => {
    setTrip(null);
    setLocations([]);
    setEvents([]);
    setLoading(true);
    loadTracking();
    const interval = window.setInterval(loadTracking, POLL_INTERVAL_MS);
    return () => window.clearInterval(interval);
  }, [loadTracking]);

  const routePoints = useMemo(
    () =>
      locations
        .map((location) => [Number(location.latitude), Number(location.longitude)])
        .filter((point) => Number.isFinite(point[0]) && Number.isFinite(point[1])),
    [locations],
  );

  const currentPos = useMemo(() => {
    const latest = locations[locations.length - 1];
    if (!latest || !Number.isFinite(Number(latest.latitude)) || !Number.isFinite(Number(latest.longitude))) {
      return null;
    }
    return {
      latitude: Number(latest.latitude),
      longitude: Number(latest.longitude),
      label: latest.label || "Vị trí hiện tại",
    };
  }, [locations]);

  if (!tripId) {
    return <Alert severity="info">Chọn một chuyến vận chuyển để theo dõi.</Alert>;
  }
  if (loading && !trip) {
    return (
      <Box className="flex min-h-[40vh] items-center justify-center">
        <CircularProgress />
      </Box>
    );
  }
  if (!trip) {
    return <Alert severity="error">{error || "Không tìm thấy chuyến vận chuyển."}</Alert>;
  }

  const stepIndex = statusStepIndex(trip.status);
  const cancelled = trip.status === "CANCELLED";
  const progressPct = stepIndex <= 0 ? 0 : (stepIndex / (STATUS_STEPS.length - 1)) * 100;

  return (
    <Box className="flex flex-col gap-6">
      {error && <Alert severity="warning">{error}</Alert>}

      <Card variant="outlined" className="!rounded-2xl border-slate-200 shadow-sm">
        <CardContent className="!p-5">
          <Box className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <Box className="flex items-center gap-3">
              <Box className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#1B4965]">
                <LocalShippingIcon />
              </Box>
              <Box>
                <Typography className="!font-bold text-slate-800">Chuyến {String(trip.id).slice(0, 8)}</Typography>
                <Typography variant="caption" className="text-slate-500">
                  {lastUpdated ? `Cập nhật lúc ${formatTime(lastUpdated)} · tự làm mới mỗi 15 giây` : "Đang tải dữ liệu..."}
                </Typography>
              </Box>
            </Box>
            <Chip
              label={STATUS_LABELS[trip.status] || trip.status}
              color={STATUS_TONES[trip.status] || "default"}
              size="small"
              className="!rounded-full !font-bold"
            />
          </Box>

          {cancelled ? (
            <Alert severity="error">Chuyến vận chuyển đã bị hủy{trip.cancellationReason ? `: ${trip.cancellationReason}` : "."}</Alert>
          ) : (
            <Box className="relative flex items-center justify-between">
              <Box className="absolute left-0 top-4 h-1 w-full -translate-y-1/2 rounded-full bg-slate-200"></Box>
              <Box
                className="absolute left-0 top-4 h-1 -translate-y-1/2 rounded-full bg-[#1B4965] transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              ></Box>
              {STATUS_STEPS.map((step, index) => {
                const done = index < stepIndex;
                const active = index === stepIndex;
                return (
                  <Box key={step.key} className="z-10 flex flex-col items-center gap-1.5">
                    <Box
                      className={`flex h-8 w-8 items-center justify-center rounded-full shadow-md ${
                        done
                          ? "bg-[#1B4965] text-white"
                          : active
                            ? "border-2 border-[#1B4965] bg-white text-[#1B4965] ring-4 ring-[#1B4965]/20"
                            : "border-2 border-slate-300 bg-slate-100 text-slate-400"
                      }`}
                    >
                      {done ? <CheckIcon fontSize="small" /> : active ? <LocalShippingIcon fontSize="small" /> : <Inventory2Icon fontSize="small" />}
                    </Box>
                    <Typography
                      variant="caption"
                      className={active ? "!font-bold text-[#1B4965]" : done ? "!font-semibold text-[#1B4965]" : "!font-medium text-slate-500"}
                    >
                      {step.label}
                    </Typography>
                  </Box>
                );
              })}
            </Box>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[7fr_5fr]">
        <Card variant="outlined" className="!overflow-hidden !rounded-2xl border-slate-200 shadow-sm">
          <Box className="h-[420px] w-full">
            <Map routePoints={routePoints} currentPos={currentPos} />
          </Box>
        </Card>

        <Card variant="outlined" className="!rounded-2xl border-slate-200 shadow-sm">
          <CardContent className="!p-5">
            <Typography className="!mb-4 !font-bold text-slate-800">Hành trình</Typography>
            {events.length === 0 ? (
              <Typography variant="body2" className="text-slate-500">
                Chưa có sự kiện hành trình. Sự kiện sẽ xuất hiện khi tài xế xác nhận các mốc giao nhận.
              </Typography>
            ) : (
              <Box className="flex flex-col">
                {events.map((event, index) => (
                  <Box key={event.id} className="relative flex gap-3 pb-5">
                    {index < events.length - 1 && (
                      <span className="absolute left-[7px] top-5 h-full w-0.5 bg-slate-200"></span>
                    )}
                    <span
                      className={`z-10 mt-1 h-[15px] w-[15px] shrink-0 rounded-full border-2 ${
                        index === 0 ? "border-[#1B4965] bg-[#1B4965]" : "border-slate-300 bg-white"
                      }`}
                    ></span>
                    <Box>
                      <Typography variant="body2" className="!font-semibold text-slate-800">
                        {JOURNEY_EVENT_LABELS[event.eventType] || event.eventType}
                      </Typography>
                      <Typography variant="caption" className="text-slate-500">
                        {formatTime(event.recordedAt)}
                      </Typography>
                      {event.note && (
                        <Typography variant="body2" className="mt-0.5 text-slate-600">
                          {event.note}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      </div>

      <Card variant="outlined" className="!rounded-2xl border-slate-200 shadow-sm">
        <CardContent className="!p-5">
          <Typography className="!mb-4 !font-bold text-slate-800">Thông tin chuyến</Typography>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <Box className="flex items-start gap-2">
              <PlaceIcon className="!mt-0.5 text-emerald-600" />
              <Box>
                <Typography variant="caption" className="text-slate-500">Điểm lấy</Typography>
                <Typography variant="body2" className="!font-semibold text-slate-800">{trip.pickupLocation || "Chưa xác định"}</Typography>
              </Box>
            </Box>
            <Box className="flex items-start gap-2">
              <PlaceIcon className="!mt-0.5 text-rose-600" />
              <Box>
                <Typography variant="caption" className="text-slate-500">Điểm giao</Typography>
                <Typography variant="body2" className="!font-semibold text-slate-800">{trip.deliveryLocation || "Chưa xác định"}</Typography>
              </Box>
            </Box>
            <Box>
              <Typography variant="caption" className="text-slate-500">Giá hợp đồng</Typography>
              <Typography variant="body2" className="!font-bold text-[#1B4965]">{formatMoney(trip.agreedPrice)}</Typography>
            </Box>
          </div>
        </CardContent>
      </Card>
    </Box>
  );
}
