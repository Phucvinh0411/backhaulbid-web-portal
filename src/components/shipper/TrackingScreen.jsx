"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";

import PageHeader from "@/components/common/PageHeader";
import TripTrackingView from "@/components/tracking/TripTrackingView";
import { contractApi } from "@/services/contractApi";

const STATUS_LABELS = {
  WAITING_PICKUP: "Chờ lấy hàng",
  PICKED_UP: "Đã lấy hàng",
  IN_TRANSIT: "Đang vận chuyển",
  DELIVERED: "Đã giao",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
};

export default function TrackingScreen({ tripId: initialTripId = null }) {
  const searchParams = useSearchParams();
  const idFromUrl = searchParams?.get("id");

  const [trips, setTrips] = useState([]);
  const [tripsLoading, setTripsLoading] = useState(true);
  const [tripsError, setTripsError] = useState("");
  const [selectedTripId, setSelectedTripId] = useState(initialTripId || idFromUrl || "");

  useEffect(() => {
    let active = true;
    setTripsLoading(true);
    setTripsError("");
    contractApi
      .listTrips()
      .then((response) => {
        if (!active) return;
        const items = Array.isArray(response) ? response : response?.data || [];
        setTrips(items);
        setSelectedTripId((previous) => previous || idFromUrl || (items.length > 0 ? items[0].id : ""));
      })
      .catch((error) => {
        if (active) setTripsError(error?.response?.data?.message || "Không thể tải danh sách chuyến.");
      })
      .finally(() => {
        if (active) setTripsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [idFromUrl]);

  return (
    <Box className="w-full min-h-screen">
      <PageHeader
        title="Giám Sát Hành Trình"
        subtitle="Theo dõi vị trí và tiến trình giao nhận của chuyến vận chuyển, dữ liệu cập nhật tự động mỗi 15 giây."
        breadcrumbs={[
          { label: "Trang chủ", path: "/shipper/dashboard" },
          { label: "Hợp đồng vận chuyển", path: "/shipper/contracts" },
          { label: "Giám sát đơn hàng" },
        ]}
      />

      <Box className="mb-6" sx={{ maxWidth: 460 }}>
        <TextField
          select
          fullWidth
          size="small"
          label="Chọn chuyến vận chuyển"
          value={selectedTripId}
          onChange={(event) => setSelectedTripId(event.target.value)}
          disabled={tripsLoading || trips.length === 0}
        >
          {trips.map((trip) => (
            <MenuItem key={trip.id} value={trip.id}>
              {String(trip.id).slice(0, 8)} · {trip.pickupLocation || "Chưa xác định"} → {trip.deliveryLocation || "Chưa xác định"} · {STATUS_LABELS[trip.status] || trip.status}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {tripsError && <Alert severity="error" className="!mb-4">{tripsError}</Alert>}
      {tripsLoading ? (
        <Box className="flex min-h-[40vh] items-center justify-center">
          <CircularProgress />
        </Box>
      ) : trips.length === 0 ? (
        <Alert severity="info">Bạn chưa có chuyến vận chuyển nào để theo dõi.</Alert>
      ) : (
        <TripTrackingView tripId={selectedTripId || null} />
      )}
    </Box>
  );
}
