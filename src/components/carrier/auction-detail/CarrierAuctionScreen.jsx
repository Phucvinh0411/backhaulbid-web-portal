"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import PageHeader from "@/components/common/PageHeader";

import { getAuction, listBids, placeBid } from "@/services/biddingApi";

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
    volume: auction.volume === null || auction.volume === undefined ? null : `${auction.volume} m³`,
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
  return Number.isNaN(timestamp) ? 0 : Math.max(0, Math.floor((timestamp - Date.now()) / 1000));
};

const formatBidTime = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Vừa xong";
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(date);
};

export default function CarrierAuctionScreen({ id }) {
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
        const message = error?.response?.data?.message;
        setLoadError(Array.isArray(message) ? message.join(", ") : message || "Không thể tải phiên đấu giá.");
      });

    return () => {
      active = false;
    };
  }, [id]);

  const shipment = useMemo(
    () => (realAuction ? mapAuctionToShipment(realAuction) : null),
    [realAuction],
  );
  const isSealed = shipment?.auctionType === "SEALED";
  const [access, setAccess] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [currentLowest, setCurrentLowest] = useState(0);
  const [myBid, setMyBid] = useState(0);
  const remainingBids = null;
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [bidError, setBidError] = useState("");
  const [bidHistory, setBidHistory] = useState([]);
  const currentLowestRef = useRef(currentLowest);

  useEffect(() => {
    if (!shipment) return;
    const maxPrice = toNumber(shipment.maxPrice);
    setCurrentLowest(maxPrice);
    setMyBid(Math.max(maxPrice - 800000, 1));
    setBidHistory([]);
    setAlreadySubmitted(false);
    setBidError("");

    let active = true;
    listBids(id, { page: 1, pageSize: 100, sortOrder: "asc" })
      .then((response) => {
        if (!active) return;
        const bids = response?.data || [];
        const amounts = bids.map((bid) => toNumber(bid.bidAmount)).filter((amount) => amount > 0);
        setCurrentLowest(amounts.length ? Math.min(maxPrice, ...amounts) : maxPrice);
        setBidHistory(bids.map((bid) => ({
          id: bid.id,
          isMe: false,
          bidder: "Nhà xe ẩn danh",
          amount: toNumber(bid.bidAmount),
          time: formatBidTime(bid.bidTime),
        })));
      })
      .catch(() => {
        if (active) setBidError("Không thể tải lịch sử giá thầu.");
      });

    return () => {
      active = false;
    };
  }, [id, shipment]);

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

  const handleAccessChange = useCallback((nextAccess) => {
    setAccess(nextAccess);
  }, []);

  const handleSubmit = async () => {
    setBidError("");

    if (!isSealed && myBid >= currentLowestRef.current) {
      setBidError("Giá thầu phải thấp hơn giá thấp nhất hiện tại.");
      return;
    }
    if (myBid > shipment.maxPrice) {
      setBidError("Giá thầu không được vượt giá trần.");
      return;
    }

    try {
      const createdBid = await placeBid(id, { bidAmount: String(myBid) });
      const bidAmount = toNumber(createdBid.bidAmount || myBid);
      setCurrentLowest((previous) => (isSealed ? previous : Math.min(previous, bidAmount)));
      setBidHistory((history) => [
        { id: createdBid.id || Date.now(), isMe: true, amount: bidAmount, time: "Vừa xong" },
        ...history,
      ]);
      setAlreadySubmitted(true);
    } catch (error) {
      const message = error?.response?.data?.message;
      setBidError(Array.isArray(message) ? message.join(", ") : message || "Không thể đặt giá lúc này.");
    }
    return;
  };

  if (!shipment && !loadError) {
    return <Box className="flex min-h-[50vh] items-center justify-center"><CircularProgress /></Box>;
  }
  if (!shipment) return <Alert severity="error">{loadError || "Không tìm thấy phiên đấu giá."}</Alert>;

  const canEnterRoom = access?.canEnter === true;
  const detailStatus = access?.accessStatus === "PAYMENT_INCOMPLETE"
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
          {bidError && <Alert severity="error" className="!mb-4 !rounded-2xl">{bidError}</Alert>}
          <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-[7fr_5fr]">
            <div className="relative min-h-[420px] lg:min-h-0">
              <div className="flex flex-col lg:absolute lg:inset-0">
                <CarrierBidHistoryCard bidHistory={bidHistory} auctionType={shipment.auctionType} />
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <CarrierCountdownCard countdown={countdown} auctionType={shipment.auctionType} />
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

      <AuctionDetailContent
        auction={{ ...shipment, status: detailStatus }}
      />
    </Box>
  );
}
