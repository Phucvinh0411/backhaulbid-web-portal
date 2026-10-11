"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import RefreshIcon from "@mui/icons-material/Refresh";
import PageHeader from "@/components/common/PageHeader";
import { useGlobalNotification } from "@/components/common/NotificationPopup";
import { ErrorState, ListSkeleton, Panel, ResponsiveDialog, StatusBadge } from "@/components/ui";
import AuctionDetailContent from "@/components/carrier/auction-detail/AuctionDetailContent";
import { getApiErrorMessage } from "@/services/errorMessage";
import { getAuction, listBids, selectWinner } from "@/services/biddingApi";
import { carrierProfileApi } from "@/services/carrierProfileApi";
import { mapCarrierProfile } from "@/services/carrierProfileMapper";
import { AUCTION_TYPE_META, getAuctionPhase, getAuctionPhaseMeta, getAwardStatusMeta } from "@/lib/statusMeta";
import { formatCountdown, formatDateTime, formatMoney, secondsUntil, shortId, toAmount } from "@/lib/format";
import CarrierProfileModal from "./CarrierProfileModal";
import AuctionValueDocumentsPanel from "./AuctionValueDocumentsPanel";

// The shipper cannot join the realtime room, so an open auction is refreshed gently.
const OPEN_REFRESH_MS = 30000;

const AWARD_TEXT = {
  PENDING: "Đang chuẩn bị hợp đồng cho nhà xe thắng.",
  CREATING_CONTRACT: "Đang tạo hợp đồng cho nhà xe được xét.",
  AWAITING_CARRIER_SIGNATURE: "Đang chờ nhà xe được xét ký hợp đồng. Quá hạn, hệ thống mời nhà xe dự phòng kế tiếp theo thứ tự giá.",
  AWAITING_SHIPPER_SIGNATURE: "Nhà xe đã ký. Đến lượt bạn ký hợp đồng trước hạn.",
  SIGNED: "Hợp đồng đã có đủ chữ ký. Chuyến vận chuyển đã được tạo.",
  NO_CARRIER_SIGNED: "Đã xét người thắng và tối đa 3 nhà xe dự phòng nhưng không ai ký hợp đồng.",
  SHIPPER_SIGNATURE_EXPIRED: "Bạn đã quá hạn ký; hệ thống dừng xét nhà xe dự phòng.",
  CREATION_FAILED: "Tạo hợp đồng gặp lỗi; hệ thống sẽ thử lại.",
  NO_WINNER: "Phiên kết thúc mà không có giá nào.",
};

function AwardProgress({ auction }) {
  const meta = getAwardStatusMeta(auction.awardStatus);
  if (!meta) return null;
  const progress = auction.awardProgress;
  return (
    <Panel title="Trao thầu và hợp đồng" actions={<StatusBadge meta={meta} />}>
      <Typography variant="body2" sx={{ maxWidth: "70ch" }} role="status">
        {AWARD_TEXT[auction.awardStatus] || meta.label}
      </Typography>
      {progress?.currentAttempt > 0 && (
        <Typography variant="body2" className="tabular" sx={{ color: "text.secondary", mt: 0.5 }}>
          Lượt xét {progress.currentAttempt}/{progress.maximumAttempts}
          {progress.signingDeadlineAt ? ` · Hạn ký ${formatDateTime(progress.signingDeadlineAt)}` : ""}
        </Typography>
      )}
      {auction.awardStatus === "NO_CARRIER_SIGNED" && auction.creationFeeStatus === "REFUNDED" && (
        <Typography variant="body2" sx={{ color: "success.main", fontWeight: 600, mt: 0.5 }}>
          Phí tạo phiên đã được hoàn vào ví.
        </Typography>
      )}
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1.5 }}>
        {auction.awardStatus === "AWAITING_SHIPPER_SIGNATURE" && (
          <Button variant="contained" component={Link} href="/shipper/contracts">
            Ký hợp đồng
          </Button>
        )}
        {auction.awardTripId && (
          <Button variant={auction.awardStatus === "SIGNED" ? "contained" : "outlined"} component={Link} href={`/shipper/tracking?id=${encodeURIComponent(auction.awardTripId)}`}>
            Xem chuyến
          </Button>
        )}
      </Box>
    </Panel>
  );
}

export default function AuctionDetailScreen({ id }) {
  const { notify } = useGlobalNotification();
  const [shipment, setShipment] = useState(null);
  const [bids, setBids] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [confirmBid, setConfirmBid] = useState(null);
  const [selecting, setSelecting] = useState(false);
  const [selectError, setSelectError] = useState("");
  const [profile, setProfile] = useState({ open: false, carrier: null, loading: false });
  const selectingRef = useRef(false);

  const isSealed = shipment?.auctionType === "SEALED";

  const load = useCallback(
    async ({ quiet = false } = {}) => {
      if (!id) return;
      if (quiet) setRefreshing(true);
      try {
        const [auction, bidResponse] = await Promise.all([getAuction(id), listBids(id, { page: 1, pageSize: 100, sortOrder: "asc" })]);
        setShipment(auction);
        setBids((bidResponse?.data || []).map((bid) => ({ ...bid, amount: toAmount(bid.bidAmount) })));
        setLoadError("");
      } catch (error) {
        const message = getApiErrorMessage(error, "Không thể tải chi tiết phiên đấu giá. Vui lòng thử lại.");
        setLoadError(message);
        if (!quiet) notify.error(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [id, notify],
  );

  useEffect(() => {
    void load();
  }, [load]);

  const phase = shipment ? getAuctionPhase(shipment) : null;

  useEffect(() => {
    if (phase !== "OPEN" && phase !== "CLOSING") return undefined;
    const tick = window.setInterval(() => setNow(Date.now()), 1000);
    const refresh = window.setInterval(() => void load({ quiet: true }), OPEN_REFRESH_MS);
    return () => {
      window.clearInterval(tick);
      window.clearInterval(refresh);
    };
  }, [load, phase]);

  const ranked = useMemo(() => [...bids].sort((a, b) => a.amount - b.amount || new Date(a.bidTime) - new Date(b.bidTime)), [bids]);
  const lowest = ranked[0] || null;
  const canSelectWinner = phase === "AWAITING_WINNER";

  const openProfile = async (carrierId) => {
    setProfile({ open: true, loading: true, carrier: mapCarrierProfile({ company: { accountId: carrierId }, vehicles: [], drivers: [] }) });
    const [company, vehicles, drivers, reviewSummary, reviews] = await Promise.allSettled([
      carrierProfileApi.getCompany(carrierId),
      carrierProfileApi.getVehicles(carrierId),
      carrierProfileApi.getDrivers(carrierId),
      carrierProfileApi.getReviewSummary(carrierId),
      carrierProfileApi.getReviews(carrierId),
    ]);
    const value = (result, fallback) => (result.status === "fulfilled" ? result.value?.data || result.value || fallback : fallback);
    setProfile({
      open: true,
      loading: false,
      carrier: mapCarrierProfile({
        company: value(company, { accountId: carrierId }),
        vehicles: [].concat(value(vehicles, [])),
        drivers: [].concat(value(drivers, [])),
        // A failed request stays null/[]; the modal then says the reviews did not load.
        reviewSummary: value(reviewSummary, null),
        reviews: [].concat(value(reviews, { items: [] })?.items || []),
      }),
    });
  };

  const handleSelectWinner = async () => {
    if (!confirmBid || selectingRef.current) return;
    selectingRef.current = true;
    setSelecting(true);
    setSelectError("");
    try {
      await selectWinner(id, confirmBid.id);
      notify.success("Đã chọn người thắng. Hệ thống đang tạo hợp đồng và mời nhà xe ký.");
      setConfirmBid(null);
      await load({ quiet: true });
    } catch (error) {
      const message = getApiErrorMessage(error, "Chưa chọn được người thắng. Vui lòng thử lại.");
      setSelectError(message);
      notify.error(message);
    } finally {
      selectingRef.current = false;
      setSelecting(false);
    }
  };

  const breadcrumbs = [
    { label: "Trang chủ", path: "/shipper/dashboard" },
    { label: "Phiên đấu giá", path: "/shipper/bidding/sessions" },
    { label: shipment ? `#${shortId(shipment.id)}` : "Chi tiết" },
  ];

  if (loading) {
    return (
      <Box>
        <PageHeader title="Phiên đấu giá" breadcrumbs={breadcrumbs} />
        <ListSkeleton rows={3} height={140} label="Đang tải phiên" />
      </Box>
    );
  }
  if (!shipment) {
    return (
      <Box>
        <PageHeader title="Phiên đấu giá" breadcrumbs={breadcrumbs} />
        <ErrorState description={loadError || "Không tìm thấy phiên đấu giá."} onRetry={() => load()} />
      </Box>
    );
  }

  const typeMeta = AUCTION_TYPE_META[shipment.auctionType] || AUCTION_TYPE_META.PUBLIC;
  const from = shipment.pickupLocation?.province || shipment.origin;
  const to = shipment.deliveryLocation?.province || shipment.destination;

  return (
    <Box>
      <PageHeader
        title={`${from || "?"} → ${to || "?"}`}
        subtitle={`${shipment.title || shipment.goodsType || "Lô hàng"} · Phiên #${shortId(shipment.id)}`}
        breadcrumbs={breadcrumbs}
        meta={
          <>
            <StatusBadge meta={getAuctionPhaseMeta(shipment)} />
            <StatusBadge tone="neutral" icon={isSealed ? "lock" : "public"} label={typeMeta.label} />
          </>
        }
        action={
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => load({ quiet: true })} disabled={refreshing}>
            {refreshing ? "Đang làm mới..." : "Làm mới"}
          </Button>
        }
      />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {loadError && <Alert severity="warning">{loadError}</Alert>}

        {canSelectWinner && (
          <Alert severity="warning">
            <Typography sx={{ fontWeight: 700 }}>Phiên kín đã kết thúc. Bạn cần chọn người thắng.</Typography>
            <Typography variant="body2">
              Chọn một giá trong danh sách bên dưới. Giá thấp nhất được đánh dấu để tham khảo; bạn có thể chọn nhà xe khác nếu phù hợp hơn.
            </Typography>
          </Alert>
        )}
        {phase === "CANCELLED" && <Alert severity="error">Phiên đã hủy{shipment.cancellationReason ? `: ${shipment.cancellationReason}` : "."}</Alert>}

        <Panel>
          <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, minmax(0, 1fr))" } }}>
            <Box>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>Giá thấp nhất</Typography>
              <Typography className="tabular" sx={{ fontWeight: 700, fontSize: "1.25rem", color: lowest ? "success.main" : "text.primary" }}>
                {lowest ? formatMoney(lowest.amount) : "Chưa có giá"}
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>Giá trần</Typography>
              <Typography className="tabular" sx={{ fontWeight: 700, fontSize: "1.25rem" }}>{formatMoney(shipment.maxPrice)}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>Số lượt giá</Typography>
              <Typography className="tabular" sx={{ fontWeight: 700, fontSize: "1.25rem" }}>{bids.length}</Typography>
            </Box>
            <Box role="timer">
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {phase === "OPEN" ? "Còn lại" : phase === "REGISTRATION" || phase === "WAITING_START" ? "Mở phiên lúc" : "Kết thúc lúc"}
              </Typography>
              <Typography className="tabular" sx={{ fontWeight: 700, fontSize: "1.25rem" }}>
                {phase === "OPEN" ? formatCountdown(secondsUntil(shipment.endTime, now)) : formatDateTime(phase === "REGISTRATION" || phase === "WAITING_START" ? shipment.startTime : shipment.endTime)}
              </Typography>
            </Box>
          </Box>
          {phase === "OPEN" && (
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 1 }}>
              Danh sách tự làm mới mỗi 30 giây. Kết quả do hệ thống chốt khi hết giờ.
            </Typography>
          )}
        </Panel>

        <AwardProgress auction={shipment} />

        <Panel title="Giá các nhà xe đưa ra" subtitle={isSealed ? "Đấu giá kín: chỉ bạn thấy toàn bộ giá." : "Xếp theo giá từ thấp đến cao; cùng giá thì giá đặt sớm hơn đứng trước."} padded={false}>
          {ranked.length === 0 ? (
            <Typography variant="body2" sx={{ p: 2, color: "text.secondary" }}>
              Chưa có nhà xe nào đặt giá.
            </Typography>
          ) : (
            <Box component="ol" sx={{ m: 0, p: 0 }}>
              {ranked.map((bid, index) => {
                const isWinner = shipment.winningBidId === bid.id;
                return (
                  <Box
                    component="li"
                    key={bid.id}
                    sx={{
                      listStyle: "none",
                      display: "grid",
                      gridTemplateColumns: { xs: "32px 1fr auto", sm: "40px 1fr 160px 180px auto" },
                      alignItems: "center",
                      gap: 1.5,
                      px: 2,
                      py: 1.25,
                      borderTop: "1px solid",
                      borderColor: "divider",
                      bgcolor: isWinner ? "var(--color-success-soft)" : "transparent",
                    }}
                  >
                    <Typography className="tabular" sx={{ fontWeight: 700, color: "text.secondary" }}>
                      {index + 1}
                    </Typography>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
                        Nhà xe #{shortId(bid.carrierId)}
                        {isWinner && <StatusBadge size="sm" tone="success" icon="emoji_events" label="Người thắng" sx={{ ml: 1 }} />}
                        {!isWinner && index === 0 && <StatusBadge size="sm" tone="info" label="Thấp nhất" sx={{ ml: 1 }} />}
                      </Typography>
                      <Typography variant="caption" className="tabular" sx={{ color: "text.secondary", display: { sm: "none" } }}>
                        {formatMoney(bid.amount)} · {formatDateTime(bid.bidTime)}
                      </Typography>
                    </Box>
                    <Typography className="tabular" sx={{ fontWeight: 700, display: { xs: "none", sm: "block" } }}>
                      {formatMoney(bid.amount)}
                    </Typography>
                    <Typography variant="body2" className="tabular" sx={{ color: "text.secondary", display: { xs: "none", sm: "block" } }}>
                      {formatDateTime(bid.bidTime)}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, justifyContent: "flex-end", gridColumn: { xs: "1 / -1", sm: "auto" } }}>
                      <Button size="small" variant="outlined" color="inherit" onClick={() => openProfile(bid.carrierId)}>
                        Hồ sơ
                      </Button>
                      {canSelectWinner && (
                        <Button size="small" variant="contained" onClick={() => setConfirmBid(bid)}>
                          Chọn
                        </Button>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Panel>

        <Panel title="Thông tin lô hàng và điều kiện">
          <AuctionDetailContent auction={shipment} />
        </Panel>

        <AuctionValueDocumentsPanel auctionId={shipment.id} requireCarrierCoverage={shipment.requireCarrierCoverage === true} />
      </Box>

      <ResponsiveDialog
        open={Boolean(confirmBid)}
        onClose={() => setConfirmBid(null)}
        busy={selecting}
        maxWidth="xs"
        title="Chọn nhà xe thắng?"
        titleId="select-winner-title"
        actions={
          <>
            <Button color="inherit" onClick={() => setConfirmBid(null)} disabled={selecting}>
              Xem lại
            </Button>
            <Button variant="contained" onClick={handleSelectWinner} disabled={selecting}>
              {selecting ? "Đang xác nhận..." : "Xác nhận chọn"}
            </Button>
          </>
        }
      >
        {selectError && <Alert severity="error" sx={{ mb: 1.5 }}>{selectError}</Alert>}
        {confirmBid && (
          <Typography variant="body2" component="div">
            Nhà xe <strong>#{shortId(confirmBid.carrierId)}</strong> với giá <strong className="tabular">{formatMoney(confirmBid.amount)}</strong>.
            <Box component="ul" sx={{ pl: 2.5, mt: 1, mb: 0 }}>
              <li>Hệ thống tạo hợp đồng và mời nhà xe này ký trước.</li>
              <li>Nếu nhà xe không ký đúng hạn, tối đa 3 nhà xe dự phòng được mời theo thứ tự giá.</li>
              <li>Sau khi xác nhận, hệ thống bắt đầu trao thầu ngay.</li>
            </Box>
          </Typography>
        )}
      </ResponsiveDialog>

      <CarrierProfileModal
        open={profile.open}
        onClose={() => setProfile({ open: false, carrier: null, loading: false })}
        carrier={profile.carrier}
        loading={profile.loading}
        shipmentStatus="readonly"
        onSelectCarrierAsWinner={() => {}}
      />
    </Box>
  );
}
