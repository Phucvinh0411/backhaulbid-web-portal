"use client";

import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import PageHeader from "@/components/common/PageHeader";

import {
  AUCTION_SHIPMENTS_MAP,
  enrichShipmentDetails,
  getCarrierDetails,
} from "./mockData";
import ShipmentSummaryCard from "./ShipmentSummaryCard";
import LiveCountdownCard from "./LiveCountdownCard";
import LowestBidCard from "./LowestBidCard";
import BidsTable from "./BidsTable";
import ContractOtpModal from "./ContractOtpModal";
import CarrierProfileModal from "./CarrierProfileModal";

export default function AuctionDetailScreen({ id }) {
  const rawShipment = AUCTION_SHIPMENTS_MAP[id] || AUCTION_SHIPMENTS_MAP["LH-2026-9041"];
  const shipment = enrichShipmentDetails(rawShipment);

  const [bids, setBids] = useState([]);
  const [countdown, setCountdown] = useState(930); // 15 mins 30 secs
  const [openOtpDialog, setOpenOtpDialog] = useState(false);
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [isOtpSuccess, setIsOtpSuccess] = useState(false);
  const [selectedWinnerBid, setSelectedWinnerBid] = useState(null);

  const [openCarrierModal, setOpenCarrierModal] = useState(false);
  const [selectedCarrier, setSelectedCarrier] = useState(null);

  useEffect(() => {
    if (shipment) {
      setBids(shipment.bids || []);
    }
  }, [id]);

  // Live Timer Countdown Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const lowestBidRaw = bids.find((b) => b.isLowest) || (bids.length > 0 ? bids[0] : null);
  const lowestBidDetails = lowestBidRaw ? getCarrierDetails(lowestBidRaw) : null;
  const lowestBidAmount = lowestBidRaw?.bidAmount || 0;

  const handleOpenOtpDialog = (bid = null) => {
    setSelectedWinnerBid(bid);
    setOtpValues(["", "", "", "", "", ""]);
    setIsOtpSuccess(false);
    setOpenOtpDialog(true);
  };

  const handleCloseOtpDialog = () => {
    setOpenOtpDialog(false);
    setSelectedWinnerBid(null);
  };

  const handleOtpSubmit = () => {
    const otpCode = otpValues.join("");
    if (otpCode.length === 6) {
      setIsOtpSuccess(true);
      setTimeout(() => {
        setOpenOtpDialog(false);
        const winner = selectedWinnerBid || bids.find((b) => b.isLowest) || bids[0];
        if (winner) {
          shipment.status = "awarded";
          shipment.carrier = winner.carrierName;
          shipment.finalPrice = winner.bidAmount;
          setBids((prev) =>
            prev.map((b) => ({
              ...b,
              isLowest: b.id === winner.id,
            }))
          );
        }
        alert(`Chốt thầu và Ký Hợp đồng điện tử thành công với nhà xe: ${winner ? winner.carrierName : ""}!`);
      }, 1800);
    }
  };

  const handleOpenCarrierModal = (bid) => {
    if (!bid) return;
    setSelectedCarrier(getCarrierDetails(bid));
    setOpenCarrierModal(true);
  };

  const handleCloseCarrierModal = () => {
    setOpenCarrierModal(false);
    setSelectedCarrier(null);
  };

  return (
    <Box className="w-full min-h-screen">
      {/* Page Header */}
      <PageHeader
        title="Theo Dõi Phiên Đấu Giá"
        subtitle="Chi tiết diễn biến lệnh đặt giá của các nhà xe đối với lô hàng của bạn."
        breadcrumbs={[
          { label: "Trang chủ", path: "/shipper/dashboard" },
          { label: "Đấu giá vận tải", path: "/shipper/bidding/sessions" },
          { label: `Lô hàng ${shipment.id}` },
        ]}
      />

      {/* Grid: Left - Shipment Detail Info | Right - Real-time Bidding status */}
      <Grid container spacing={3} className="!mb-6">
        {/* Left Side: Summary Card */}
        <Grid item xs={12} lg={7}>
          <ShipmentSummaryCard shipment={shipment} />
        </Grid>

        {/* Right Side: Live Countdown & Lowest Bid Card */}
        <Grid item xs={12} lg={5}>
          <div className="space-y-6 flex flex-col justify-between h-full">
            <LiveCountdownCard countdown={countdown} />
            <LowestBidCard
              shipment={shipment}
              lowestBidDetails={lowestBidDetails}
              lowestBidAmount={lowestBidAmount}
              onOpenOtpDialog={handleOpenOtpDialog}
              onOpenCarrierModal={handleOpenCarrierModal}
            />
          </div>
        </Grid>
      </Grid>

      {/* Table: List of Carrier bids */}
      <BidsTable
        bids={bids}
        shipmentStatus={shipment.status}
        onOpenOtpDialog={handleOpenOtpDialog}
        onOpenCarrierModal={handleOpenCarrierModal}
      />

      {/* Contract OTP Dialog */}
      <ContractOtpModal
        open={openOtpDialog}
        onClose={handleCloseOtpDialog}
        otpValues={otpValues}
        setOtpValues={setOtpValues}
        isOtpSuccess={isOtpSuccess}
        onSubmitOtp={handleOtpSubmit}
        winnerCarrierName={selectedWinnerBid ? selectedWinnerBid.carrierName : (lowestBidDetails ? lowestBidDetails.carrierName : "")}
      />

      {/* Carrier Profile Detail Dialog */}
      <CarrierProfileModal
        open={openCarrierModal}
        onClose={handleCloseCarrierModal}
        carrier={selectedCarrier}
        shipmentStatus={shipment.status}
        onSelectCarrierAsWinner={handleOpenOtpDialog}
      />
    </Box>
  );
}
