"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import PageHeader from "@/components/common/PageHeader";
import { useGlobalNotification } from "@/components/common/NotificationPopup";
import { getApiErrorMessage } from "@/services/errorMessage";

import { getAuction, listBids, placeBid } from "@/services/biddingApi";
import useAuctionSocket from "@/hooks/useAuctionSocket";

import AuctionTypeBanner from "./AuctionTypeBanner";
import CarrierCountdownCard from "./CarrierCountdownCard";
import CarrierBidPanel from "./CarrierBidPanel";
import CarrierBidHistoryCard from "./CarrierBidHistoryCard";
import AuctionDetailContent from "./AuctionDetailContent";
import CarrierRegistrationGate from "./CarrierRegistrationGate";

const toNumber = (value) => Number(value || 0);
const toOptionalNumber = (value) =>
  value === null || value === undefined || value === "" ? null : Number(value);

const mapAuctionToShipment = (auction) => {
  return {
    id: auction.id,
    auctionType: auction.auctionType || "PUBLIC",
    goodsType: auction.title || auction.goodsType,
    goodsCategory: auction.goodsType,
    weight: `${auction.weight || 0} tấn`,
    volume:
      auction.volume === null || auction.volume === undefined
        ? null
        : `${auction.volume} m³`,
    maxPrice: toNumber(auction.maxPrice),
    participationFee: toNumber(auction.participationFeeAmount),
    participationFeeTier: auction.participationFeeTier,
    isDepositRequired: auction.isDepositRequired,
    depositAmount: toNumber(auction.depositAmount),
    priceStep: toOptionalNumber(auction.priceStep),
    maxBids: auction.maxBids ?? null,
    regStartTime: auction.registrationStartTime,
    regEndTime: auction.registrationEndTime,
    startTime: auction.startTime,
    endTime: auction.endTime,
    requiredVehicleType: auction.vehicleTypeRequired,
    requiredVehicleDims: auction.requiredVehicleDims || null,
    requiredTemp: toOptionalNumber(auction.requiredTemp),
    goodsValue: toOptionalNumber(auction.goodsValue),
    auctionCreator: auction.shipperId,
    from: {
      name: auction.originLocationName || auction.origin,
      address: auction.originAddress || auction.origin,
      province: auction.originProvince || auction.origin,
      contactName: auction.originContactName,
      contactPhone: auction.originContactPhone,
    },
    to: {
      name: auction.destinationLocationName || auction.destination,
      address: auction.destinationAddress || auction.destination,
      province: auction.destinationProvince || auction.destination,
      contactName: auction.destinationContactName,
      contactPhone: auction.destinationContactPhone,
    },
    earliestPickup: auction.earliestPickup,
    latestPickup: auction.latestPickup,
    earliestDelivery: auction.earliestDelivery,
    latestDelivery: auction.latestDelivery,
    description: auction.notes || "Không có ghi chú thêm.",
    goodsNotes: auction.notes,
  };
};

const getSecondsUntil = (date) => {
  const timestamp = new Date(date).getTime();
  return Number.isNaN(timestamp)
    ? 0
    : Math.max(0, Math.floor((timestamp - Date.now()) / 1000));
};

const formatBidTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Vừa xong";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
};

const formatMoney = (value) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    toNumber(value),
  );

export default function CarrierAuctionScreen({ id }) {
  const { notify } = useGlobalNotification();
  const [realAuction, setRealAuction] = useState(null);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;
    setRealAuction(null);
    setLoadError("");
    getAuction(id)
      .then((auction) => {
        if (active) setRealAuction(auction);
      })
      .catch((error) => {
        if (!active) return;
        const nextError = getApiErrorMessage(
          error,
          "Không thể tải phiên đấu giá. Vui lòng thử lại.",
        );
        setLoadError(nextError);
        notify.error(nextError);
      });

    return () => {
      active = false;
    };
  }, [id, notify]);

  const shipment = useMemo(
    () => (realAuction ? mapAuctionToShipment(realAuction) : null),
    [realAuction],
  );
  const isSealed = shipment?.auctionType === "SEALED";
  const [access, setAccess] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [currentLowest, setCurrentLowest] = useState(0);
  const [myBid, setMyBid] = useState(0);
  const [remainingBids, setRemainingBids] = useState(null);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [bidError, setBidError] = useState("");
  const [bidHistory, setBidHistory] = useState([]);
  const currentLowestRef = useRef(currentLowest);
  const myCarrierIdRef = useRef("");
  const [sealedBidCount, setSealedBidCount] = useState(0);
  const [auctionResult, setAuctionResult] = useState(null);
  const [socketJoined, setSocketJoined] = useState(false);
  const {
    disconnect,
    joinAuction,
    placeBid: placeBidSocket,
    on,
    connected,
  } = useAuctionSocket();

  useEffect(() => {
    if (!shipment) return;
    const maxPrice = toNumber(shipment.maxPrice);
    setCurrentLowest(maxPrice);
    setMyBid(0);
    setRemainingBids(null);
    setBidHistory([]);
    setAlreadySubmitted(false);
    setBidError("");
    setSealedBidCount(0);
    setAuctionResult(null);

    let active = true;
    listBids(id, { page: 1, pageSize: 100, sortOrder: "asc" })
      .then((response) => {
        if (!active) return;
        const bids = response?.data || [];
        setRemainingBids(response?.pagination?.remainingBids ?? null);
        const amounts = bids
          .map((bid) => toNumber(bid.bidAmount))
          .filter((amount) => amount > 0);
        setCurrentLowest(
          amounts.length ? Math.min(maxPrice, ...amounts) : maxPrice,
        );
        setBidHistory(
          bids.map((bid) => ({
            id: bid.id,
            isMe: Boolean(
              isSealed ||
              (myCarrierIdRef.current &&
                bid.carrierId === myCarrierIdRef.current),
            ),
            bidder: isSealed ? "Bạn" : "Nhà xe ẩn danh",
            amount: toNumber(bid.bidAmount),
            time: formatBidTime(bid.bidTime),
          })),
        );
      })
      .catch(() => {
        if (active) {
          const message = "Không thể tải lịch sử giá thầu.";
          setBidError(message);
          notify.error(message);
        }
      });

    return () => {
      active = false;
    };
  }, [id, notify, shipment]);

  useEffect(() => {
    currentLowestRef.current = currentLowest;
  }, [currentLowest]);

  useEffect(() => {
    if (!shipment || access?.canEnter !== true) return undefined;
    const updateCountdown = () => {
      setCountdown(getSecondsUntil(shipment.endTime));
    };
    updateCountdown();
    const interval = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(interval);
  }, [access?.canEnter, shipment]);

  useEffect(() => {
    if (!shipment || access?.canEnter !== true) return undefined;
    let disposed = false;
    const unsubscribers = [];

    joinAuction(id)
      .then((joinData) => {
        if (disposed) return;
        myCarrierIdRef.current = joinData?.carrierId || "";
        setSocketJoined(true);

        unsubscribers.push(
          on("bidPlaced", (payload) => {
            if (!payload || payload.auctionId !== id) return;
            if (payload.sealed) {
              setSealedBidCount((count) => count + 1);
              return;
            }
            const bid = payload.bid;
            if (!bid) return;
            const amount = toNumber(bid.bidAmount);
            const mine =
              Boolean(myCarrierIdRef.current) &&
              bid.carrierId === myCarrierIdRef.current;
            setCurrentLowest((previous) => Math.min(previous, amount));
            setBidHistory((history) =>
              history.some((entry) => entry.id === bid.id)
                ? history
                : [
                    {
                      id: bid.id,
                      isMe: mine,
                      bidder: mine ? "Bạn" : "Nhà xe ẩn danh",
                      amount,
                      time: formatBidTime(bid.bidTime),
                    },
                    ...history,
                  ],
            );
          }),
        );

        unsubscribers.push(
          on("auctionStatusChanged", (payload) => {
            if (!payload || payload.auctionId !== id) return;
            if (payload.status === "COMPLETED") {
              setAuctionResult({
                status: "COMPLETED",
                winningBidAmount: payload.winningBidAmount || null,
              });
            } else if (payload.status === "CANCELLED") {
              setAuctionResult({ status: "CANCELLED", winningBidAmount: null });
            } else if (payload.status === "OPEN") {
              setAuctionResult(null);
            }
          }),
        );
      })
      .catch(() => {
        if (!disposed) setSocketJoined(false);
      });

    return () => {
      disposed = true;
      unsubscribers.forEach((unsubscribe) => unsubscribe());
      disconnect();
    };
  }, [access?.canEnter, id, shipment, joinAuction, on, disconnect]);

  const handleAccessChange = useCallback((nextAccess) => {
    setAccess(nextAccess);
  }, []);

  const applySuccessfulBid = (createdBid) => {
    const bidAmount = toNumber(createdBid?.bidAmount || myBid);
    setCurrentLowest((previous) =>
      isSealed ? previous : Math.min(previous, bidAmount),
    );
    setBidHistory((history) =>
      history.some((entry) => entry.id === createdBid?.id)
        ? history
        : [
            {
              id: createdBid?.id || Date.now(),
              isMe: true,
              bidder: "Bạn",
              amount: bidAmount,
              time: "Vừa xong",
            },
            ...history,
          ],
    );
    setAlreadySubmitted(true);
  };

  const handleSubmit = async () => {
    setBidError("");

    if (auctionResult) {
      const message = "Phiên đấu giá đã kết thúc, không thể đặt giá thêm.";
      setBidError(message);
      notify.warning(message);
      return;
    }
    if (!isSealed && myBid >= currentLowestRef.current) {
      const message = "Giá thầu phải thấp hơn giá thấp nhất hiện tại.";
      setBidError(message);
      notify.warning(message);
      return;
    }
    if (myBid > shipment.maxPrice) {
      const message = "Giá thầu không được vượt giá trần.";
      setBidError(message);
      notify.warning(message);
      return;
    }

    const bidAmountPayload = String(myBid);
    const idempotencyKey =
      globalThis.crypto?.randomUUID?.() || `bid-${Date.now()}-${Math.random()}`;

    if (connected) {
      try {
        const result = await placeBidSocket(
          id,
          bidAmountPayload,
          idempotencyKey,
        );
        if (result?.ok && result?.bid) {
          applySuccessfulBid(result.bid);
          notify.success("Đã gửi giá thầu thành công.");
          return;
        }
        const message = result?.message || "Không thể đặt giá lúc này.";
        setBidError(message);
        notify.error(message);
        return;
      } catch {
        // Socket dropped mid-request; fall back to REST below.
      }
    }

    try {
      const createdBid = await placeBid(id, {
        bidAmount: bidAmountPayload,
        idempotencyKey,
      });
      applySuccessfulBid(createdBid);
      notify.success("Đã gửi giá thầu thành công.");
    } catch (error) {
      const nextError = getApiErrorMessage(
        error,
        "Không thể đặt giá lúc này. Vui lòng kiểm tra điều kiện phiên rồi thử lại.",
      );
      setBidError(nextError);
      notify.error(nextError);
    }
  };

  if (!shipment && !loadError) {
    return (
      <Box className="flex min-h-[50vh] items-center justify-center">
        <CircularProgress />
      </Box>
    );
  }
  if (!shipment)
    return (
      <Alert severity="error">
        {loadError || "Không tìm thấy phiên đấu giá."}
      </Alert>
    );

  const canEnterRoom = access?.canEnter === true;
  const isLive = socketJoined && connected;
  const detailStatus =
    access?.accessStatus === "PAYMENT_INCOMPLETE"
      ? "PAYMENT_INCOMPLETE"
      : canEnterRoom
        ? "BIDDING"
        : "WAITING_START";

  return (
    <Box className="w-full min-h-screen">
      <PageHeader
        title="Phòng Đấu Giá Trực Tiếp"
        subtitle="Chỉ nhà xe đã đăng ký và hoàn tất thanh toán mới được vào phòng khi đến giờ bắt đầu."
        breadcrumbs={[
          { label: "Trang chủ", path: "/carrier/dashboard" },
          { label: "Đấu giá vận tải", path: "/carrier/auctions" },
          { label: `Lô hàng ${shipment.id}` },
        ]}
      />

      <AuctionTypeBanner auctionType={shipment.auctionType} />
      <CarrierRegistrationGate
        auctionId={id}
        shipment={shipment}
        onAccessChange={handleAccessChange}
      />

      {canEnterRoom && (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${
                isLive
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-amber-200 bg-amber-50 text-amber-700"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${isLive ? "animate-pulse bg-emerald-500" : "bg-amber-500"}`}
              ></span>
              {isLive ? "Trực tiếp" : "Đang kết nối lại…"}
            </span>
            {isSealed && sealedBidCount > 0 && !auctionResult && (
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                Vừa có {sealedBidCount} lượt gửi giá thầu kín
              </span>
            )}
          </div>

          {auctionResult?.status === "COMPLETED" && (
            <Alert severity="success" className="!mb-4 !rounded-2xl">
              Phiên đấu giá đã kết thúc.
              {auctionResult.winningBidAmount
                ? ` Giá trúng thấp nhất: ${formatMoney(auctionResult.winningBidAmount)}.`
                : ""}
            </Alert>
          )}
          {auctionResult?.status === "CANCELLED" && (
            <Alert severity="warning" className="!mb-4 !rounded-2xl">
              Phiên đấu giá đã bị hủy bởi hệ thống.
            </Alert>
          )}
          {bidError && (
            <Alert severity="error" className="!mb-4 !rounded-2xl">
              {bidError}
            </Alert>
          )}
          <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-[7fr_5fr]">
            <div className="relative min-h-[420px] lg:min-h-0">
              <div className="flex flex-col lg:absolute lg:inset-0">
                <CarrierBidHistoryCard
                  bidHistory={bidHistory}
                  auctionType={shipment.auctionType}
                />
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <CarrierCountdownCard
                countdown={countdown}
                auctionType={shipment.auctionType}
              />
              <CarrierBidPanel
                shipment={shipment}
                auctionType={shipment.auctionType}
                currentLowest={currentLowest}
                remainingBids={remainingBids}
                myBid={myBid}
                setMyBid={setMyBid}
                alreadySubmitted={alreadySubmitted}
                onSubmit={handleSubmit}
              />
            </div>
          </div>
        </>
      )}

      <AuctionDetailContent auction={{ ...shipment, status: detailStatus }} />
    </Box>
  );
}
