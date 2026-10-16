"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import CheckIcon from "@mui/icons-material/Check";
import RefreshIcon from "@mui/icons-material/Refresh";
import { ErrorState, ForbiddenState, KeyValueList, ListSkeleton, Panel, ResponsiveDialog, StatusBadge } from "@/components/ui";
import { contractApi } from "@/services/contractApi";
import { getApiErrorMessage } from "@/services/errorMessage";
import { getTripCompletionSummary, getTripStatusMeta, isTripClosed } from "@/lib/statusMeta";
import { formatDateTime, formatMoney, shortId } from "@/lib/format";
import { toMediaViewUrl } from "@/lib/mediaUrl";
import { GATEWAY_URL } from "@/config/clientConfig";
import TripActions from "./TripActions";
import TripMilestonesPanel from "./TripMilestonesPanel";
import TripReviewPanel from "./TripReviewPanel";
import TripHandoverPanel from "./TripHandoverPanel";
import TripClaimPanel from "./TripClaimPanel";
import CarrierSharedClaimsPanel from "./CarrierSharedClaimsPanel";
import TripProgress from "./TripProgress";
import JourneyTimeline from "./JourneyTimeline";
import TripRouteEditor from "./TripRouteEditor";
import useTripTracking from "./useTripTracking";
import { buildGpsSegments, buildJourneyTimeline, coordinate, getFreshnessMeta, plannedRoute, routeStatusText, selectRouteAnchors, locationTime, latestTrackingLocation, locationSourceLabel } from "./trackingPresentation";

const mediaUrl = (url) => toMediaViewUrl(url, GATEWAY_URL);

const Map = dynamic(() => import("@/components/map/Map"), {
  ssr: false,
  loading: () => (
    <Box sx={{ height: "100%", display: "grid", placeItems: "center", bgcolor: "var(--color-surface-sunken)" }}>
      <Typography variant="body2" sx={{ color: "text.secondary" }}>Đang tải bản đồ...</Typography>
    </Box>
  ),
});

/** Trip detail for shipper and carrier; available actions depend on `role`. */
export default function TripTrackingView({ tripId, role = "shipper", allowLateCancellation = false }) {
  const { trip, tracking, locations, historySampled, historyTotalPoints, events, proofs, milestones, delaySettlements, state, error, loadTracking } = useTripTracking(tripId);
  const [confirmLateCancel, setConfirmLateCancel] = useState(false);
  const [cancellingLateTrip, setCancellingLateTrip] = useState(false);
  const [lateCancelError, setLateCancelError] = useState("");
  const closed = trip ? isTripClosed(trip.status) : false;
  const traceSegments = useMemo(() => buildGpsSegments(locations), [locations]);
  const latestLocation = latestTrackingLocation(tracking, locations);
  const currentPos = coordinate(latestLocation) ? { ...latestLocation, timeLabel: formatDateTime(locationTime(latestLocation)) } : null;
  const freshness = getFreshnessMeta(tracking?.freshness);
  const latestEvent = buildJourneyTimeline(events, milestones)[0];
  const anchors = selectRouteAnchors({ trip, tracking });
  const pickupPoint = anchors.pickup;
  const deliveryPoint = anchors.delivery;
  // A poll may come back while the route is still being fetched. Reuse the last road geometry only
  // for the same trip, route version and anchor pair; a definite "no route"/"rejected" drops it.
  const routeKey = `${trip?.id}:${anchors.routeVersion}:${JSON.stringify([coordinate(pickupPoint), coordinate(deliveryPoint)])}`;
  const [roadRoute, setRoadRoute] = useState(null);
  useEffect(() => {
    if (anchors.geometry) setRoadRoute({ key: routeKey, geometry: anchors.geometry });
    else if (anchors.routingStatus === "NO_ROUTE" || anchors.routingStatus === "REJECTED") setRoadRoute(null);
  }, [routeKey, anchors.geometry, anchors.routingStatus]);
  const routeGeometry = anchors.geometry || (roadRoute?.key === routeKey ? roadRoute.geometry : null);
  const routeKind = plannedRoute(pickupPoint, deliveryPoint, routeGeometry).kind;
  const routeNote = routeStatusText(routeKind, anchors.routingStatus || (routeKind === "PENDING" ? "PENDING" : null));

  const handleCancelLateTrip = async () => {
    if (cancellingLateTrip) return;
    setCancellingLateTrip(true);
    setLateCancelError("");
    try {
      await contractApi.cancelLateTrip(tripId, { reason: "Chủ hàng hủy do giao trễ hơn 1 giờ" });
      setConfirmLateCancel(false);
      await loadTracking();
    } catch (cancelError) {
      setLateCancelError(getApiErrorMessage(cancelError, "Không thể hủy chuyến do giao trễ."));
    } finally {
      setCancellingLateTrip(false);
    }
  };

  if (!tripId) return <Alert severity="info">Chọn một chuyến để xem chi tiết.</Alert>;
  if (state === "loading") return <ListSkeleton rows={3} height={140} label="Đang tải chuyến" />;
  if (state === "forbidden") return <ForbiddenState description="Chuyến này không thuộc tài khoản của bạn." />;
  if (!trip) return <ErrorState description={error} onRetry={loadTracking} />;

  const statusMeta = getTripStatusMeta(trip.status);
  const completion = getTripCompletionSummary(trip, events);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {error && <Alert severity="warning">Không làm mới được dữ liệu: {error}</Alert>}

      <Panel sx={{ borderTop: "3px solid", borderTopColor: trip.status === "CANCELLED" ? "error.main" : "primary.main" }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, flexWrap: "wrap", mb: 2.5 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>THEO DÕI CHUYẾN · #{shortId(trip.id)}</Typography>
            <Typography component="h2" sx={{ mt: 0.5, fontSize: { xs: "1.35rem", md: "1.75rem" }, fontWeight: 750, color: trip.status === "CANCELLED" ? "error.main" : "primary.main" }}>{statusMeta.label}</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
              {latestEvent ? `${latestEvent.title} · ${formatDateTime(latestEvent.time)}` : "Chờ mốc giao nhận đầu tiên"}
            </Typography>
          </Box>
          <Button size="small" variant="outlined" startIcon={<RefreshIcon />} onClick={loadTracking} sx={{ minHeight: 44 }}>Làm mới</Button>
        </Box>
        {trip.status === "CANCELLED" ? <Alert severity="error">Chuyến đã hủy{trip.cancellationReason ? `: ${trip.cancellationReason}` : "."}</Alert> : <TripProgress status={trip.status} />}
        {trip.expectedDeliveryAt && <Box sx={{ mt: 2.5, pt: 1.5, borderTop: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
          <Typography variant="body2" className="tabular" sx={{ fontWeight: 600 }}>Hạn giao: {formatDateTime(trip.expectedDeliveryAt)}</Typography>
          {trip.lateMinutes > 0 && !completion && <StatusBadge size="sm" tone="warning" label={`Trễ ${trip.lateMinutes} phút`} />}
        </Box>}
      </Panel>

      {completion && (
        <Alert severity="success" icon={<CheckIcon fontSize="inherit" />}>
          <Typography sx={{ fontWeight: 700 }}>Đơn hàng đã hoàn tất</Typography>
          <Typography variant="body2" className="tabular">
            {completion.deliveredAt ? `Giao lúc ${formatDateTime(completion.deliveredAt)}` : "Đã giao"}
            {completion.completedAt ? ` · Chủ hàng xác nhận lúc ${formatDateTime(completion.completedAt)}` : ""}
            {completion.onTime === true ? " · Đúng hạn" : ""}
            {completion.onTime === false ? ` · Trễ ${completion.lateMinutes} phút` : ""}
            {completion.depositReleased ? " · Đã giải phóng tiền đặt trước" : ""}
            {completion.incidentCount ? ` · ${completion.incidentCount} sự cố đã ghi nhận` : ""}
          </Typography>
        </Alert>
      )}

      {((role === "shipper" && trip.status === "DELIVERED") || (role === "carrier" && trip.status === "WAITING_PICKUP")) && <TripActions trip={trip} role={role} proofs={proofs} onChanged={loadTracking} />}

      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 7fr) minmax(0, 5fr)" }, alignItems: "start" }}>
        <Box sx={{ minWidth: 0, display: "grid", gap: 2 }}>
          <Panel title="Đường đi của chuyến" subtitle={locations.length ? `${locations.length} vị trí đã ghi nhận` : "Kho lấy, kho giao và vị trí xe"} padded={false} actions={role === "shipper" && trip.status === "WAITING_PICKUP" ? <TripRouteEditor trip={trip} onChanged={loadTracking} /> : null}>
            <Box sx={{ height: { xs: 320, md: 420 } }}><Map tripId={trip.id} pickupPoint={pickupPoint} deliveryPoint={deliveryPoint} milestones={milestones} traceSegments={traceSegments} currentPos={currentPos} routeGeometry={routeGeometry} emptyHint={role === "shipper" && trip.status === "WAITING_PICKUP" ? "Bấm “Xác nhận vị trí kho” để ghim" : role === "shipper" ? "Vị trí kho chỉ ghim được trước khi lấy hàng" : "Chủ hàng cần ghim vị trí kho trước khi lấy hàng"} /></Box>
            <Box sx={{ px: 2, py: 1.5, borderTop: "1px solid", borderColor: "divider", display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
              {routeKind === "ROAD" && <Box sx={{ display: "flex", gap: 0.75, alignItems: "center" }}><Box aria-hidden sx={{ width: 22, height: 5, bgcolor: "primary.main", borderRadius: 1 }} /><Typography variant="caption">Tuyến đường bộ dự kiến A → B</Typography></Box>}
              {routeNote && <Typography variant="caption" role="status" sx={{ color: "text.secondary" }}>{routeNote}</Typography>}
              {traceSegments.length > 0 && <Box sx={{ display: "flex", gap: 0.75, alignItems: "center" }}><Box aria-hidden sx={{ width: 22, height: 4, bgcolor: "info.main", borderRadius: 1 }} /><Typography variant="caption">Vệt GPS xe đã chạy</Typography></Box>}
              {traceSegments.length > 0 && <Typography variant="caption" sx={{ color: "text.secondary" }}>Khoảng mất GPS được ngắt trên vệt.</Typography>}
              {historySampled && <Typography variant="caption" sx={{ color: "text.secondary" }}>Đường đi được lấy mẫu từ {historyTotalPoints.toLocaleString("vi-VN")} điểm</Typography>}
            </Box>
            <Box sx={{ px: 2, pb: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1 }}><StatusBadge size="sm" meta={freshness} />{latestLocation && <Typography variant="caption" className="tabular" sx={{ color: "text.secondary" }}>{locationSourceLabel(latestLocation.source)} · {formatDateTime(locationTime(latestLocation))}{latestLocation.accuracyMeters != null ? ` · sai số ${Math.round(latestLocation.accuracyMeters)} m` : ""}</Typography>}</Box>
              <Typography variant="caption" sx={{ display: "block", mt: 0.75, color: "text.secondary" }}>{freshness.message}</Typography>
            </Box>
          </Panel>
          <Panel title="Lấy và giao hàng">
            <Box sx={{ display: "grid", gap: 2 }}>
              {[["A", "Lấy hàng", pickupPoint || trip.pickupPoint || tracking?.pickupPoint, trip.pickupLocation], ["B", "Giao hàng", deliveryPoint || trip.deliveryPoint || tracking?.deliveryPoint, trip.deliveryLocation]].map(([letter, title, point, address]) => <Box key={letter} sx={{ display: "grid", gridTemplateColumns: "32px minmax(0,1fr)", gap: 1.5 }}>
                <Box sx={{ width: 32, height: 32, display: "grid", placeItems: "center", borderRadius: "50%", bgcolor: letter === "A" ? "var(--color-brand-soft)" : "success.light", color: letter === "A" ? "primary.main" : "success.dark", fontWeight: 700 }}>{letter}</Box>
                <Box sx={{ minWidth: 0 }}><Typography variant="caption" sx={{ color: "text.secondary" }}>{title}</Typography><Typography variant="body2" sx={{ fontWeight: 600, overflowWrap: "anywhere" }}>{point?.label || address || "Chưa có địa chỉ"}</Typography>{point?.address && point.address !== point.label && <Typography variant="body2" sx={{ color: "text.secondary", overflowWrap: "anywhere" }}>{point.address}</Typography>}</Box>
              </Box>)}
            </Box>
          </Panel>
        </Box>
        <JourneyTimeline events={events} milestones={milestones} />
      </Box>

      {!((role === "shipper" && trip.status === "DELIVERED") || (role === "carrier" && trip.status === "WAITING_PICKUP")) && <TripActions trip={trip} role={role} proofs={proofs} onChanged={loadTracking} />}

      {trip.expectedDeliveryAt && trip.lateMinutes > 0 && !completion && <Alert severity="warning" action={allowLateCancellation && trip.canCancelForLateDelivery ? <Button color="error" variant="contained" size="small" onClick={() => setConfirmLateCancel(true)}>Hủy chuyến do trễ</Button> : null}>
        <Typography variant="body2">{trip.latePolicyEnabled ? "Bồi thường giao trễ được trừ từ tiền đặt trước của chủ xe; điểm uy tín giảm theo bậc." : "Chuyến chưa có tiền đặt trước được giữ nên không áp dụng bồi thường tự động."}</Typography>
      </Alert>}

      {delaySettlements.length > 0 && <Panel title="Xử lý giao trễ"><Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", md: "repeat(3,minmax(0,1fr))" } }}>{delaySettlements.map((settlement) => <Box key={settlement.id} sx={{ p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
        <Typography variant="body2" sx={{ fontWeight: 700 }}>Bậc {settlement.tier} · {settlement.cumulativePenaltyPercent}% cọc</Typography><StatusBadge size="sm" tone={settlement.overallStatus === "COMPLETED" ? "success" : "warning"} label={settlement.overallStatus === "COMPLETED" ? "Đã xử lý" : "Đang thử lại"} /><Typography variant="body2" className="tabular" sx={{ mt: 0.5 }}>Bồi thường {formatMoney(settlement.totalCompensationAmount)} · trừ {settlement.pointsDeducted} điểm</Typography>{settlement.lastError && <Typography variant="caption" sx={{ color: "error.main" }}>{settlement.lastError}</Typography>}
      </Box>)}</Box></Panel>}

      <TripMilestonesPanel trip={trip} milestones={milestones} canCreate={role === "carrier" && !closed} onChanged={loadTracking} />

      <TripHandoverPanel trip={trip} role={role} />

      {role === "carrier" && <CarrierSharedClaimsPanel trip={trip} />}

      {role === "shipper" && <TripReviewPanel trip={trip} />}

      {role === "shipper" && <TripClaimPanel trip={trip} />}

      {proofs.length > 0 && (
        <Panel title="Bằng chứng giao hàng">
          <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(4, minmax(0, 1fr))" } }}>
            {proofs.map((proof) => (
              <Box key={proof.id} component="a" href={mediaUrl(proof.imageUrl)} target="_blank" rel="noreferrer" sx={{ display: "block", border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden", textDecoration: "none", color: "inherit" }}>
                <Box component="img" src={mediaUrl(proof.imageUrl)} alt={proof.note || "Ảnh bằng chứng giao hàng"} loading="lazy" sx={{ width: "100%", aspectRatio: "4 / 3", objectFit: "cover", display: "block", bgcolor: "var(--color-surface-sunken)" }} />
                <Typography variant="caption" className="tabular" sx={{ display: "block", p: 1, color: "text.secondary" }}>
                  {formatDateTime(proof.uploadedAt)}
                  {proof.note ? ` · ${proof.note}` : ""}
                </Typography>
              </Box>
            ))}
          </Box>
        </Panel>
      )}

      <Panel title="Thông tin chuyến">
        <KeyValueList
          columns={3}
          items={[
            { label: "Điểm lấy hàng", value: trip.pickupLocation || "Chưa xác định" },
            { label: "Điểm giao hàng", value: trip.deliveryLocation || "Chưa xác định" },
            { label: "Giá hợp đồng", value: formatMoney(trip.agreedPrice), numeric: true, strong: true },
            { label: "Tài xế", value: trip.driverConnected ? "Đã nhận chuyến bằng mã" : trip.driverId ? "Đã phân công, chờ nhập mã nhận chuyến" : "Chưa phân công" },
            { label: "Tạo lúc", value: formatDateTime(trip.createdAt), numeric: true },
            { label: "Đã giao lúc", value: formatDateTime(trip.deliveredAt), numeric: true, hidden: !trip.deliveredAt },
          ]}
        />
      </Panel>

      <ResponsiveDialog
        open={confirmLateCancel}
        onClose={() => setConfirmLateCancel(false)}
        busy={cancellingLateTrip}
        maxWidth="xs"
        title="Hủy chuyến do giao trễ?"
        titleId="late-cancel-title"
        actions={
          <>
            <Button color="inherit" onClick={() => setConfirmLateCancel(false)} disabled={cancellingLateTrip}>
              Giữ chuyến
            </Button>
            <Button variant="contained" color="error" onClick={handleCancelLateTrip} disabled={cancellingLateTrip}>
              {cancellingLateTrip ? "Đang hủy..." : "Hủy chuyến"}
            </Button>
          </>
        }
      >
        {lateCancelError && <Alert severity="error" sx={{ mb: 1.5 }}>{lateCancelError}</Alert>}
        <Typography variant="body2">Xe đã trễ hơn 1 giờ so với hạn giao. Bồi thường được xử lý theo mức trễ hiện tại; thao tác không hoàn tác được.</Typography>
      </ResponsiveDialog>
    </Box>
  );
}
