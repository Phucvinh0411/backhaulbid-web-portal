"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import PageHeader from "@/components/common/PageHeader";
import { useGlobalNotification } from "@/components/common/NotificationPopup";
import { ErrorState, HighlightPanel, ListSkeleton, Panel, StatusBadge } from "@/components/ui";
import { getApiErrorMessage } from "@/services/errorMessage";
import { getAuction, listBids, placeBid } from "@/services/biddingApi";
import useAuctionSocket from "@/hooks/useAuctionSocket";
import useCurrentAccount from "@/hooks/useCurrentAccount";
import { AUCTION_TYPE_META, MY_BID_OUTCOME_META, getAuctionPhase, getAuctionPhaseMeta, getMyBidOutcome } from "@/lib/statusMeta";
import { formatCountdown, formatDateTime, formatMoney, secondsUntil, shortId, toAmount } from "@/lib/format";

import CarrierBidPanel from "./CarrierBidPanel";
import CarrierBidHistoryCard from "./CarrierBidHistoryCard";
import AuctionDetailContent from "./AuctionDetailContent";
import CarrierRegistrationGate from "./CarrierRegistrationGate";

const ENDED_PHASES = new Set(["AWAITING_WINNER", "WINNER_DECIDED", "ENDED_NO_WINNER", "CANCELLED"]);

const routeTitle = (auction) => {
  const from = auction.pickupLocation?.province || auction.originProvince || auction.origin;
  const to = auction.deliveryLocation?.province || auction.destinationProvince || auction.destination;
  return `${from || "?"} → ${to || "?"}`;
};

const newKey = () => globalThis.crypto?.randomUUID?.() || `bid-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export default function CarrierAuctionScreen({ id }) {
  const { notify } = useGlobalNotification();
  const account = useCurrentAccount();
  const [auction, setAuction] = useState(null);
  const [loadError, setLoadError] = useState("");
  const [access, setAccess] = useState(null);
  const [bids, setBids] = useState({ items: [], remainingBids: null, loaded: false });
  const [amount, setAmount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const submittingRef = useRef(false);
  const pendingKeyRef = useRef(null);
  const syncRequestedRef = useRef(false);
  const { disconnect, joinAuction, placeBid: placeBidSocket, on, connected } = useAuctionSocket();

  const loadAuction = useCallback(async () => {
    try {
      setAuction(await getAuction(id));
      setLoadError("");
    } catch (error) {
      const message = getApiErrorMessage(error, "Không thể tải phiên đấu giá. Vui lòng thử lại.");
      setLoadError(message);
      notify.error(message);
    }
  }, [id, notify]);

  const loadBids = useCallback(async () => {
    try {
      const response = await listBids(id, { page: 1, pageSize: 100, sortOrder: "desc" });
      setBids({
        items: (response?.data || []).map((bid) => ({ id: bid.id, carrierId: bid.carrierId, amount: toAmount(bid.bidAmount), time: bid.bidTime })),
        remainingBids: response?.pagination?.remainingBids ?? null,
        loaded: true,
      });
    } catch (error) {
      notify.error(getApiErrorMessage(error, "Không thể tải lịch sử giá."));
      setBids((current) => ({ ...current, loaded: true }));
    }
  }, [id, notify]);

  useEffect(() => {
    void loadAuction();
    void loadBids();
  }, [loadAuction, loadBids]);

  const phase = auction ? getAuctionPhase(auction) : null;
  const sealed = auction?.auctionType === "SEALED";
  const canEnter = access?.canEnter === true;

  // Display-only clock while the room is open.
  useEffect(() => {
    if (phase !== "OPEN") return undefined;
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [phase]);
  const secondsLeft = auction ? secondsUntil(auction.endTime, now) : 0;

  // When the local clock says time is up, ask the server for the real state once.
  useEffect(() => {
    if (phase === "OPEN" && secondsLeft === 0 && !syncRequestedRef.current) {
      syncRequestedRef.current = true;
      void loadAuction().then(loadBids);
    }
    if (phase !== "OPEN") syncRequestedRef.current = false;
  }, [loadAuction, loadBids, phase, secondsLeft]);

  // Realtime room for registered carriers while the room is open.
  useEffect(() => {
    if (!canEnter) return undefined;
    let disposed = false;
    const unsubscribers = [];
    joinAuction(id)
      .then(() => {
        if (disposed) return;
        unsubscribers.push(
          on("bidPlaced", (payload) => {
            if (!payload || payload.auctionId !== id || payload.sealed || !payload.bid) return;
            const bid = payload.bid;
            setBids((current) =>
              current.items.some((item) => item.id === bid.id)
                ? current
                : { ...current, items: [{ id: bid.id, carrierId: bid.carrierId, amount: toAmount(bid.bidAmount), time: bid.bidTime }, ...current.items] },
            );
          }),
          on("auctionStatusChanged", (payload) => {
            if (!payload || payload.auctionId !== id) return;
            void loadAuction().then(loadBids);
          }),
        );
      })
      .catch(() => {});
    return () => {
      disposed = true;
      unsubscribers.forEach((unsubscribe) => unsubscribe());
      disconnect();
    };
  }, [canEnter, disconnect, id, joinAuction, loadAuction, loadBids, on]);

  const myAccountId = account?.accountId || null;
  const history = useMemo(
    () => bids.items.map((bid) => ({ ...bid, isMe: sealed || (Boolean(myAccountId) && bid.carrierId === myAccountId) })),
    [bids.items, sealed, myAccountId],
  );
  const myBids = history.filter((bid) => bid.isMe);
  const lowestBid = !sealed && history.length ? Math.min(...history.map((bid) => bid.amount)) : null;
  const myLastBid = myBids.length ? [...myBids].sort((a, b) => new Date(b.time) - new Date(a.time))[0].amount : null;
  const outcome = auction ? getMyBidOutcome({ auction, myBidIds: myBids.map((bid) => bid.id) }) : null;

  const blockedReason = !canEnter
    ? "Bạn chưa vào được phòng."
    : phase !== "OPEN"
      ? "Phiên không còn nhận giá."
      : secondsLeft === 0
        ? "Đã hết giờ theo đồng hồ của bạn. Đang xác nhận kết quả với máy chủ."
        : bids.remainingBids === 0
          ? "Bạn đã dùng hết số lượt đặt giá."
          : null;

  const handleSubmit = async () => {
    if (submittingRef.current || !amount) return;
    submittingRef.current = true;
    setSubmitting(true);
    setServerError("");
    if (!pendingKeyRef.current || pendingKeyRef.current.amount !== amount) pendingKeyRef.current = { amount, key: newKey() };
    const payload = { bidAmount: String(amount), idempotencyKey: pendingKeyRef.current.key };

    const succeed = async () => {
      pendingKeyRef.current = null;
      setAmount(0);
      notify.success(sealed ? "Đã gửi giá kín." : "Đã đặt giá.");
      await loadBids();
    };
    const fail = (error, hadResponse) => {
      if (hadResponse) pendingKeyRef.current = null; // the server answered; a new attempt needs a new key
      const message = getApiErrorMessage(error, "Không đặt được giá. Kiểm tra điều kiện phiên rồi thử lại.");
      setServerError(message);
      notify.error(message);
      void loadBids();
    };

    try {
      if (connected) {
        try {
          const result = await placeBidSocket(id, payload.bidAmount, payload.idempotencyKey);
          if (result?.ok && result?.bid) return await succeed();
          return fail({ message: result?.message }, true);
        } catch {
          // Socket dropped mid-request; retry once over REST with the same idempotency key.
        }
      }
      await placeBid(id, payload);
      await succeed();
    } catch (error) {
      fail(error, Boolean(error?.response));
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  if (!auction && !loadError) {
    return (
      <Box>
        <PageHeader title="Phòng đấu giá" breadcrumbs={[{ label: "Trang chủ", path: "/carrier/dashboard" }, { label: "Tìm phiên", path: "/carrier/auctions" }, { label: "Phiên" }]} />
        <ListSkeleton rows={3} height={140} label="Đang tải phiên" />
      </Box>
    );
  }
  if (!auction) {
    return (
      <Box>
        <PageHeader title="Phòng đấu giá" breadcrumbs={[{ label: "Trang chủ", path: "/carrier/dashboard" }, { label: "Tìm phiên", path: "/carrier/auctions" }, { label: "Phiên" }]} />
        <ErrorState description={loadError} onRetry={loadAuction} />
      </Box>
    );
  }

  const typeMeta = AUCTION_TYPE_META[auction.auctionType] || AUCTION_TYPE_META.PUBLIC;
  const ended = ENDED_PHASES.has(phase);
  const showRoom = canEnter || (ended && myBids.length > 0);
  const outcomeMeta = outcome && myBids.length ? MY_BID_OUTCOME_META[outcome] : null;

  return (
    <Box>
      <PageHeader
        title={routeTitle(auction)}
        subtitle={`${auction.title || auction.goodsType || "Lô hàng"} · Phiên #${shortId(auction.id)}`}
        breadcrumbs={[
          { label: "Trang chủ", path: "/carrier/dashboard" },
          { label: "Phiên của tôi", path: "/carrier/my-auctions" },
          { label: `#${shortId(auction.id)}` },
        ]}
        meta={
          <>
            <StatusBadge meta={getAuctionPhaseMeta(auction)} />
            <StatusBadge tone="neutral" icon={sealed ? "lock" : "public"} label={typeMeta.label} />
            {outcomeMeta && <StatusBadge meta={outcomeMeta} />}
          </>
        }
      />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <CarrierRegistrationGate auctionId={id} auction={auction} onAccessChange={setAccess} />

        {ended && myBids.length > 0 && (
          <Alert severity={outcome === "WON" ? "success" : outcome === "AWAITING_RESULT" ? "info" : "warning"}>
            {outcome === "WON" && (
              <>
                <Typography sx={{ fontWeight: 700 }}>Giá của bạn là giá thắng.</Typography>
                <Typography variant="body2">
                  Hệ thống tạo hợp đồng và chuyến cho bạn. Ký hợp đồng trước hạn trong mục Hợp đồng; quá hạn, quyền nhận chuyến chuyển cho nhà xe dự phòng.
                </Typography>
                <Button component={Link} href="/carrier/contracts" variant="contained" color="success" sx={{ mt: 1 }}>
                  Mở hợp đồng
                </Button>
              </>
            )}
            {outcome === "AWAITING_RESULT" && <Typography variant="body2">Phiên đã kết thúc. Chủ hàng đang chọn người thắng cho đấu giá kín.</Typography>}
            {outcome === "LOST" && (
              <Typography variant="body2">
                Phiên đã có kết quả và giá của bạn chưa được chọn. Nếu nhà xe thắng không ký đúng hạn, bạn có thể được mời ký với vai trò dự phòng; hệ thống sẽ gửi thông báo.
              </Typography>
            )}
            {outcome === "CANCELLED" && <Typography variant="body2">Phiên đã bị hủy{auction.cancellationReason ? `: ${auction.cancellationReason}` : "."}</Typography>}
          </Alert>
        )}

        {showRoom && (
          <Box
            sx={{
              display: "grid",
              gap: 2,
              alignItems: "start",
              // The bid column exists only while this carrier can bid; otherwise status and history span the row.
              gridTemplateColumns: { xs: "minmax(0, 1fr)", lg: canEnter && phase === "OPEN" ? "minmax(0, 1fr) 380px" : "minmax(0, 1fr)" },
              gridTemplateAreas: { xs: '"status" "bid" "history"', lg: canEnter && phase === "OPEN" ? '"status bid" "history bid"' : '"status" "history"' },
            }}
          >
            {/* DESIGN.md: the bid room's key facts sit on the one navy band of the screen. */}
            <HighlightPanel sx={{ gridArea: "status" }} aria-label="Tình trạng phòng đấu giá">
              <Box sx={{ display: "grid", columnGap: 3, rowGap: 2, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
                <Box>
                  <Typography variant="caption" sx={{ color: "var(--color-on-band-soft)" }}>
                    {sealed ? "Giá trần" : "Giá thấp nhất hiện tại"}
                  </Typography>
                  <Typography className="tabular" sx={{ fontWeight: 700, fontSize: { xs: "1.25rem", md: "1.5rem" }, lineHeight: 1.3 }}>
                    {sealed ? formatMoney(auction.maxPrice) : lowestBid === null ? "Chưa có giá" : formatMoney(lowestBid)}
                  </Typography>
                  {!sealed && <Typography variant="caption" className="tabular" sx={{ color: "var(--color-on-band-soft)" }}>Giá trần {formatMoney(auction.maxPrice)}</Typography>}
                </Box>
                <Box role="timer" aria-live="off">
                  <Typography variant="caption" sx={{ color: "var(--color-on-band-soft)" }}>
                    {phase === "OPEN" ? "Thời gian còn lại" : "Kết thúc lúc"}
                  </Typography>
                  <Typography className="tabular" sx={{ fontWeight: 700, fontSize: { xs: "1.25rem", md: "1.5rem" }, lineHeight: 1.3, color: phase === "OPEN" && secondsLeft < 300 ? "var(--color-warning-soft)" : "common.white" }}>
                    {phase === "OPEN" ? formatCountdown(secondsLeft) : formatDateTime(auction.endTime)}
                  </Typography>
                  {phase === "OPEN" && (
                    <Typography variant="caption" sx={{ color: "var(--color-on-band-soft)" }}>
                      {secondsLeft < 300 ? "Sắp kết thúc · " : ""}Kết quả do máy chủ chốt
                    </Typography>
                  )}
                </Box>
                <Box sx={{ gridColumn: { xs: "1 / -1", sm: "auto" } }}>
                  <Typography variant="caption" sx={{ color: "var(--color-on-band-soft)" }}>Kết nối phòng</Typography>
                  <Box sx={{ mt: 0.5 }}>
                    {canEnter ? (
                      <StatusBadge size="sm" tone={connected ? "success" : "warning"} icon={connected ? "live" : "hourglass"} label={connected ? "Đang cập nhật trực tiếp" : "Đang kết nối lại"} />
                    ) : (
                      <StatusBadge size="sm" tone="neutral" label="Không còn trong phòng" />
                    )}
                  </Box>
                </Box>
              </Box>
            </HighlightPanel>
            {canEnter && phase === "OPEN" && (
              <Box sx={{ gridArea: "bid", position: { lg: "sticky" }, top: { lg: 72 } }}>
                <Panel>
                <CarrierBidPanel
                  auctionType={auction.auctionType}
                  maxPrice={toAmount(auction.maxPrice)}
                  priceStep={toAmount(auction.priceStep)}
                  lowestBid={lowestBid}
                  remainingBids={bids.remainingBids}
                  amount={amount}
                  onAmountChange={(value) => {
                    setAmount(value);
                    setServerError("");
                  }}
                  onSubmit={handleSubmit}
                  submitting={submitting}
                  blockedReason={blockedReason}
                  serverError={serverError}
                  myLastBid={myLastBid}
                />
                </Panel>
              </Box>
            )}
            <Box sx={{ gridArea: "history", minWidth: 0 }}>
              <CarrierBidHistoryCard bidHistory={history} auctionType={auction.auctionType} winningBidId={auction.winningBidId} loading={!bids.loaded} />
            </Box>
          </Box>
        )}

        <Panel title="Thông tin lô hàng và điều kiện">
          <AuctionDetailContent auction={auction} />
        </Panel>
      </Box>
    </Box>
  );
}
