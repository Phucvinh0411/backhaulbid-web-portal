"use client";

import Link from "next/link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import TripProgress from "./TripProgress";
import { RouteLine, StatusBadge } from "@/components/ui";
import { getTripStatusMeta } from "@/lib/statusMeta";
import { formatDateTime, formatMoney, shortId } from "@/lib/format";

/** The next step for a trip from the given role's point of view (null when nothing is pending). */
export function getTripNextStep(trip, role) {
  if (role === "carrier") {
    if (trip.status === "WAITING_PICKUP" && !trip.driverId) return { label: "Cần phân công tài xế", tone: "danger" };
    if (trip.status === "WAITING_PICKUP" && trip.driverId && !trip.driverConnected) return { label: "Chờ tài xế nhập mã nhận chuyến", tone: "warning" };
    if (trip.status === "WAITING_PICKUP") return { label: "Chờ lấy hàng", tone: "warning" };
    if (trip.status === "PICKED_UP") return { label: "Bắt đầu vận chuyển", tone: "info" };
    if (trip.status === "IN_TRANSIT") return { label: "Gửi bằng chứng khi giao xong", tone: "info" };
    if (trip.status === "DELIVERED") return { label: "Chờ chủ hàng xác nhận", tone: "neutral" };
  }
  if (role === "shipper") {
    if (trip.status === "DELIVERED") return { label: "Cần xác nhận nhận hàng", tone: "danger" };
    if (trip.canCancelForLateDelivery) return { label: "Xe trễ hơn 1 giờ", tone: "warning" };
  }
  return null;
}

export const TRIP_GROUPS = [
  { value: "ACTIVE", label: "Đang thực hiện", match: (trip) => !["COMPLETED", "CANCELLED"].includes(trip.status) },
  { value: "COMPLETED", label: "Hoàn thành", match: (trip) => trip.status === "COMPLETED" },
  { value: "CANCELLED", label: "Đã hủy", match: (trip) => trip.status === "CANCELLED" },
  { value: "ALL", label: "Tất cả", match: () => true },
];

export default function TripList({ trips, role, hrefFor, renderExtra }) {
  return (
    <Box component="ul" sx={{ m: 0, p: 0, display: "flex", flexDirection: "column", gap: 1.25 }}>
      {trips.map((trip) => {
        const next = getTripNextStep(trip, role);
        return (
          <Box component="li" key={trip.id} sx={{ listStyle: "none", bgcolor: "background.paper", border: "1px solid", borderColor: "divider", borderRadius: 3, "&:hover": { borderColor: "var(--color-line-strong)" } }}>
            <Box component={Link} href={hrefFor(trip)} sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 2, textDecoration: "none", color: "inherit", borderRadius: 3, "&:focus-visible": { outline: "2px solid var(--color-focus)" } }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", mb: 0.75 }}>
                  <StatusBadge size="sm" meta={getTripStatusMeta(trip.status)} />
                  {next && <StatusBadge size="sm" tone={next.tone} label={next.label} />}
                </Box>
                <RouteLine compact component="h2" from={trip.pickupLocation} to={trip.deliveryLocation} />
                <Typography variant="body2" className="tabular" sx={{ color: "text.secondary", mt: 0.25 }}>
                  #{shortId(trip.id)} · {formatMoney(trip.agreedPrice)}
                  {trip.expectedDeliveryAt ? ` · hạn giao ${formatDateTime(trip.expectedDeliveryAt)}` : ` · tạo ${formatDateTime(trip.createdAt)}`}
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 0.5 }}>Cập nhật {formatDateTime(trip.updatedAt || trip.createdAt)}</Typography>
                <Box sx={{ maxWidth: 480, mt: 2 }}><TripProgress status={trip.status} /></Box>
                {renderExtra?.(trip)}
              </Box>
              <ChevronRightIcon aria-hidden sx={{ color: "text.secondary" }} />
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
