"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import PageHeader from "@/components/common/PageHeader";
import { EmptyState, ErrorState, ListSkeleton } from "@/components/ui";
import TripTrackingView from "@/components/tracking/TripTrackingView";
import TripList, { TRIP_GROUPS, getTripNextStep } from "@/components/tracking/TripList";
import { contractApi } from "@/services/contractApi";
import { getApiErrorMessage } from "@/services/errorMessage";
import { shortId } from "@/lib/format";

/**
 * Shipper trips: list by default, detail when `?id=` is present (deep links from
 * notifications, contracts and auctions keep working).
 */
export default function TrackingScreen({ tripId: initialTripId = null }) {
  const searchParams = useSearchParams();
  const tripId = initialTripId || searchParams?.get("id") || null;
  const [trips, setTrips] = useState([]);
  const [state, setState] = useState("loading");
  const [error, setError] = useState("");
  const [group, setGroup] = useState("ACTIVE");

  const load = useCallback(async () => {
    setState("loading");
    setError("");
    try {
      const response = await contractApi.listTrips(undefined, { skipGlobalNotification: true });
      setTrips(Array.isArray(response) ? response : response?.data || []);
      setState("ready");
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, "Không thể tải danh sách chuyến."));
      setState("error");
    }
  }, []);

  useEffect(() => {
    if (!tripId) void load();
  }, [load, tripId]);

  const visible = useMemo(() => {
    const selected = TRIP_GROUPS.find((item) => item.value === group);
    const urgency = (trip) => (getTripNextStep(trip, "shipper") ? 0 : 1);
    return trips.filter(selected.match).sort((a, b) => urgency(a) - urgency(b) || new Date(b.createdAt) - new Date(a.createdAt));
  }, [group, trips]);

  if (tripId) {
    return (
      <Box>
        <PageHeader
          title={`Chuyến #${shortId(tripId)}`}
          breadcrumbs={[
            { label: "Trang chủ", path: "/shipper/dashboard" },
            { label: "Chuyến vận chuyển", path: "/shipper/tracking" },
            { label: `#${shortId(tripId)}` },
          ]}
        />
        <TripTrackingView tripId={tripId} role="shipper" allowLateCancellation />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader
        title="Chuyến vận chuyển"
        subtitle="Theo dõi tiến độ, xem bằng chứng giao hàng và xác nhận khi đã nhận đủ hàng."
        breadcrumbs={[{ label: "Trang chủ", path: "/shipper/dashboard" }, { label: "Chuyến vận chuyển" }]}
      />
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
      {state === "error" && <ErrorState description={error} onRetry={load} />}
      {state === "ready" && visible.length === 0 && (
        <EmptyState title="Không có chuyến trong nhóm này" description="Chuyến được tạo khi phiên đấu giá trao thầu và hợp đồng có đủ chữ ký." />
      )}
      {state === "ready" && visible.length > 0 && <TripList trips={visible} role="shipper" hrefFor={(trip) => `/shipper/tracking?id=${encodeURIComponent(trip.id)}`} />}
    </Box>
  );
}
