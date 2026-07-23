"use client";

import { useState, useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import PageHeader from "@/components/common/PageHeader";

import {
  CARRIER_AUCTION_SHIPMENTS_MAP,
  enrichCarrierShipment,
  buildInitialBidHistory,
} from "./mockData";

import AuctionTypeBanner from "./AuctionTypeBanner";
import CarrierCountdownCard from "./CarrierCountdownCard";
import CarrierBidPanel from "./CarrierBidPanel";
import CarrierBidHistoryCard from "./CarrierBidHistoryCard";
import CarrierShipmentInfoCard from "./CarrierShipmentInfoCard";

const INITIAL_COUNTDOWN = 300; // 5 minutes
const MAX_BIDS = 5;

export default function CarrierAuctionScreen({ id }) {
  const raw = CARRIER_AUCTION_SHIPMENTS_MAP[id] || CARRIER_AUCTION_SHIPMENTS_MAP["LH-2026-9041"];
  const shipment = enrichCarrierShipment(raw);
  const isSealed = shipment?.auctionType === "SEALED";

  // ── Timer state ───────────────────────────────────────────
  const [countdown, setCountdown] = useState(INITIAL_COUNTDOWN);

  // ── Bidding state ─────────────────────────────────────────
  const [currentLowest, setCurrentLowest] = useState(
    shipment ? shipment.maxPrice - 600000 : 5500000
  );
  const [myBid, setMyBid] = useState(
    shipment ? shipment.maxPrice - 800000 : 5400000
  );
  const [remainingBids, setRemainingBids] = useState(MAX_BIDS);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [bidHistory, setBidHistory] = useState(() =>
    buildInitialBidHistory(shipment, isSealed)
  );

  // Keep a ref for the current lowest to use inside the timer callback
  const currentLowestRef = useRef(currentLowest);
  useEffect(() => { currentLowestRef.current = currentLowest; }, [currentLowest]);

  // ── Countdown + Public bot simulation ─────────────────────
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        const next = prev > 0 ? prev - 1 : 0;

        // Only simulate in PUBLIC mode and while time remains
        if (!isSealed && next > 10 && Math.random() > 0.65) {
          const prevBid = currentLowestRef.current;
          if (prevBid >= 4000000) {
            const drop = (Math.floor(Math.random() * 2) + 1) * 50000;
            const newBid = prevBid - drop;
            setCurrentLowest(newBid);
            setBidHistory((hist) => [
              {
                id: Date.now() + Math.random(),
                bidder: `Nhà xe ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}***`,
                amount: newBid,
                time: "Vừa xong",
              },
              ...hist,
            ]);
          }
        }

        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isSealed]);

  // ── Submit handler ────────────────────────────────────────
  const handleSubmit = () => {
    if (remainingBids <= 0) return;

    if (!isSealed && myBid >= currentLowest) {
      alert("Giá thầu phải thấp hơn giá thấp nhất hiện tại!");
      return;
    }
    if (myBid > shipment.maxPrice) {
      alert("Giá thầu không được vượt giá trần!");
      return;
    }

    if (!isSealed) setCurrentLowest(myBid);

    setBidHistory((hist) => [
      { id: Date.now(), isMe: true, amount: myBid, time: "Vừa xong" },
      ...hist,
    ]);
    setRemainingBids((r) => r - 1);
    setAlreadySubmitted(true);
    alert("✅ Đặt giá thầu thành công!");
  };

  if (!shipment) return null;

  return (
    <Box className="w-full min-h-screen">
      <PageHeader
        title="Phòng Đấu Giá Trực Tiếp"
        subtitle="Theo dõi phiên đấu giá và đặt giá thầu cạnh tranh để giành quyền vận chuyển lô hàng."
        breadcrumbs={[
          { label: "Trang chủ", path: "/carrier/dashboard" },
          { label: "Đấu giá vận tải", path: "/carrier/auctions" },
          { label: `Lô hàng ${shipment.id}` },
        ]}
      />

      {/* Auction type banner */}
      <AuctionTypeBanner auctionType={shipment.auctionType} />

      {/*
        TOP ROW — pure CSS grid.
        Right column naturally defines the grid row height (~520px).
        Left column uses lg:relative + lg:absolute lg:inset-0 so it NEVER
        expands the grid row height, matching the right column exactly.
      */}
      <div className="grid grid-cols-1 lg:grid-cols-[7fr_5fr] gap-6 mb-6">
        {/* Left: absolute inset-0 on desktop prevents row height expansion */}
        <div className="relative min-h-[420px] lg:min-h-0">
          <div className="lg:absolute lg:inset-0 flex flex-col">
            <CarrierBidHistoryCard
              bidHistory={bidHistory}
              auctionType={shipment.auctionType}
            />
          </div>
        </div>

        {/* Right: countdown + bid panel stacked */}
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

      {/* BOTTOM: Full shipment & auction info card */}
      <CarrierShipmentInfoCard shipment={shipment} />
    </Box>
  );
}
