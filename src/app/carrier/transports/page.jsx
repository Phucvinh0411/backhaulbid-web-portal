"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import { PageHeader } from "@/components/common";
import { useGlobalNotification } from "@/components/common/NotificationPopup";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/ui";
import TripList, { TRIP_GROUPS, getTripNextStep } from "@/components/tracking/TripList";
import { contractApi } from "@/services/contractApi";
import { getMyDrivers, getMyVehicles } from "@/services/fleetApi";
import { getApiErrorMessage } from "@/services/errorMessage";

export default function CarrierTransportsPage() {
  const notify = useGlobalNotification();
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [state, setState] = useState("loading");
  const [loadError, setLoadError] = useState("");
  const [group, setGroup] = useState("ACTIVE");

  const load = useCallback(async () => {
    setState("loading");
    setLoadError("");
    try {
      const [tripResponse, vehicleList, driverList] = await Promise.all([
        contractApi.listTrips(undefined, { skipGlobalNotification: true }),
        getMyVehicles().catch(() => []),
        getMyDrivers().catch(() => []),
      ]);
      setTrips(Array.isArray(tripResponse) ? tripResponse : tripResponse?.data || []);
      setVehicles(Array.isArray(vehicleList) ? vehicleList : []);
      setDrivers(Array.isArray(driverList) ? driverList : []);
      setState("ready");
    } catch (error) {
      const message = getApiErrorMessage(error, "Không thể tải danh sách chuyến vận chuyển. Vui lòng thử lại.");
      setLoadError(message);
      setState("error");
      notify.error(message);
    }
  }, [notify]);

  useEffect(() => {
    void load();
  }, [load]);

  const visible = useMemo(() => {
    const selected = TRIP_GROUPS.find((item) => item.value === group);
    const urgency = (trip) => (getTripNextStep(trip, "carrier")?.tone === "danger" ? 0 : 1);
    return trips.filter(selected.match).sort((a, b) => urgency(a) - urgency(b) || new Date(b.createdAt) - new Date(a.createdAt));
  }, [group, trips]);

  const needsDriver = trips.filter((trip) => trip.status === "WAITING_PICKUP" && !trip.driverId).length;

  return (
    <Box>
      <PageHeader
        title="Chuyến vận chuyển"
        subtitle="Chuyến được tạo sau khi hợp đồng trao thầu có đủ chữ ký. Phân công tài xế và cập nhật hành trình đến khi giao hàng."
        breadcrumbs={[{ label: "Trang chủ", path: "/carrier/dashboard" }, { label: "Chuyến vận chuyển" }]}
      />

      {state === "ready" && needsDriver > 0 && (
        <Typography role="status" variant="body2" sx={{ mb: 1.5, fontWeight: 600, color: "error.main" }}>
          {needsDriver} chuyến đang chờ phân công tài xế.
        </Typography>
      )}

      <Box role="tablist" aria-label="Nhóm chuyến" sx={{ display: "flex", gap: 1, mb: 2, overflowX: "auto", pb: 0.5 }}>
        {TRIP_GROUPS.map((item) => (
          <Chip
            key={item.value}
            role="tab"
            aria-selected={group === item.value}
            label={`${item.label} (${trips.filter(item.match).length})`}
            onClick={() => setGroup(item.value)}
            color={group === item.value ? "primary" : "default"}
            variant={group === item.value ? "filled" : "outlined"}
            sx={{ minHeight: 40, fontSize: "0.875rem" }}
          />
        ))}
      </Box>

      {state === "loading" && <ListSkeleton rows={4} label="Đang tải chuyến" />}
      {state === "error" && <ErrorState description={loadError} onRetry={load} />}
      {state === "ready" && visible.length === 0 && (
        <EmptyState title="Không có chuyến trong nhóm này" description="Chuyến xuất hiện sau khi bạn thắng phiên và hợp đồng được ký đủ." />
      )}
      {state === "ready" && visible.length > 0 && (
        <TripList
          trips={visible}
          role="carrier"
          hrefFor={(trip) => `/carrier/transports/${encodeURIComponent(trip.id)}`}
          renderExtra={(trip) => {
            const vehicle = vehicles.find((item) => item.id === trip.vehicleId);
            const driver = drivers.find((item) => item.id === trip.driverId);
            return (
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Xe {vehicle?.licensePlate || vehicle?.plate || "đã đăng ký"} · {driver ? `Tài xế ${driver.fullName}` : trip.driverId ? "Đã phân công tài xế" : "Chưa có tài xế"}
              </Typography>
            );
          }}
        />
      )}
    </Box>
  );
}
