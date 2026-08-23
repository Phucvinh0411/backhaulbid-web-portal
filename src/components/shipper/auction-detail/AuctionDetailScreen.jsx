"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import PageHeader from "@/components/common/PageHeader";
import { useGlobalNotification } from "@/components/common/NotificationPopup";
import { getApiErrorMessage } from "@/services/errorMessage";

import { getAuction, listBids, selectWinner } from "@/services/biddingApi";
import { mapBackendToBid, mapBackendToShipment } from "@/services/shipperAuctionMapper";
import ShipmentSummaryCard from "./ShipmentSummaryCard";
import LiveCountdownCard from "./LiveCountdownCard";
import LowestBidCard from "./LowestBidCard";
import BidsTable from "./BidsTable";
import FullBidsDetailModal from "./FullBidsDetailModal";
import ContractOtpModal from "./ContractOtpModal";
import CarrierProfileModal from "./CarrierProfileModal";

export default function AuctionDetailScreen({ id }) {
  const router = useRouter();
  const { notify } = useGlobalNotification();
  const [shipment, setShipment] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  
  // Dynamically calculate countdown based on shipment.endTime
  const getInitialCountdown = () => {
    if (!shipment?.endTime) return 0;
    const end = new Date(shipment.endTime).getTime();
    let diff = Math.floor((end - Date.now()) / 1000);
    return diff > 0 ? diff : 0;
  };

  const [countdown, setCountdown] = useState(getInitialCountdown());
  const [openOtpDialog, setOpenOtpDialog] = useState(false);
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [isOtpSuccess, setIsOtpSuccess] = useState(false);
  const [selectedWinnerBid, setSelectedWinnerBid] = useState(null);

  const [openCarrierModal, setOpenCarrierModal] = useState(false);
  const [selectedCarrier, setSelectedCarrier] = useState(null);

  const [openFullBidsModal, setOpenFullBidsModal] = useState(false);
  const [selectedBidForPanel, setSelectedBidForPanel] = useState(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setLoadError("");
    Promise.all([getAuction(id), listBids(id, { page: 1, pageSize: 100 })])
      .then(([auctionResponse, bidsResponse]) => {
        if (!active) return;
        const auction = auctionResponse?.data || auctionResponse;
        const rawBids = bidsResponse?.data || bidsResponse?.items || bidsResponse || [];
        setShipment(mapBackendToShipment(auction));
        setBids(rawBids.map((bid, index) => mapBackendToBid(bid, index, rawBids)));
      })
      .catch((error) => {
        if (!active) return;
        const message = getApiErrorMessage(error, "Không thể tải chi tiết phiên đấu giá. Vui lòng thử lại.");
        setLoadError(message);
        notify.error(message);
      })
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [id, notify]);

  // Live Timer Countdown Effect
  useEffect(() => {
    setCountdown(getInitialCountdown());
    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [shipment?.endTime, shipment?.status]);

  // Determine which bid to show on the right panel
  const isSealed = shipment?.auctionType === "SEALED";
  const defaultBidRaw = bids.find((b) => b.isLowest) || (bids.length > 0 ? bids[0] : null);
  
  // For SEALED: use selected bid if any, otherwise default to lowest.
  // For PUBLIC: always keep default (lowest) or selected if we want to allow it. User said "còn đấu giá công khai vẫn giữ như cũ" so we ignore selection for PUBLIC.
  const displayedBidRaw = (isSealed && selectedBidForPanel) ? selectedBidForPanel : defaultBidRaw;
  
  const displayedBidDetails = displayedBidRaw;
  const displayedBidAmount = displayedBidRaw?.bidAmount || 0;
  const isDisplayedBidLowest = displayedBidRaw?.id === defaultBidRaw?.id;

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

  const handleOtpSubmit = async () => {
    const otpCode = otpValues.join("");
    if (otpCode.length === 6 && selectedWinnerBid) {
      setIsOtpSuccess(true);
      try {
        await selectWinner(id, selectedWinnerBid.id);
        setOpenOtpDialog(false);
        const winner = selectedWinnerBid || bids.find((b) => b.isLowest) || bids[0];
        if (winner) {
          setShipment((current) => ({ ...current, status: "awarded", carrier: winner.carrierName, finalPrice: winner.bidAmount }));
          setBids((prev) =>
            prev.map((b) => ({
              ...b,
              isLowest: b.id === winner.id,
            }))
          );
        }
      } catch (error) {
        setIsOtpSuccess(false);
        const message = getApiErrorMessage(error, "Không thể chọn nhà xe thắng đấu giá. Vui lòng thử lại.");
        setLoadError(message);
        notify.error(message);
      }
    }
  };

  const handleOpenCarrierModal = (bid) => {
    if (!bid) return;
    const carrierId = bid?.carrierId || bid?.carrierCode || bid?.carrierName;
    if (!carrierId) return;
    router.push(`/shipper/carriers/${encodeURIComponent(carrierId)}`);
  };

  const handleCloseCarrierModal = () => {
    setOpenCarrierModal(false);
    setSelectedCarrier(null);
  };

  if (loading) {
    return <Box className="flex items-center justify-center min-h-screen"><CircularProgress /></Box>;
  }

  if (!shipment) {
    return <Box className="p-6"><Alert severity="error">{loadError || "Không tìm thấy phiên đấu giá."}</Alert></Box>;
  }

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

      {/* TOP SECTION: Real-time Bidding & Carrier Bids Overview — pure CSS grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[7fr_5fr] gap-6 mb-6">
        {/* Left Column: Bids Table — relative + absolute inset-0 prevents height expansion */}
        <div className="relative min-h-[420px] lg:min-h-0">
          <div className="lg:absolute lg:inset-0 flex flex-col">
            <BidsTable
              bids={bids}
              shipmentStatus={shipment.status}
              auctionType={shipment.auctionType}
              onOpenOtpDialog={handleOpenOtpDialog}
              onOpenCarrierModal={handleOpenCarrierModal}
              onOpenFullModal={() => setOpenFullBidsModal(true)}
              onSelectBid={(bid) => setSelectedBidForPanel(bid)}
              selectedBidId={selectedBidForPanel?.id}
              isSimplified={true}
            />
          </div>
        </div>

        {/* Right Column: Countdown & Lowest Price Card stacked */}
        <div className="flex flex-col gap-4">
          <LiveCountdownCard countdown={countdown} />
          <LowestBidCard
            shipment={shipment}
            lowestBidDetails={displayedBidDetails}
            lowestBidAmount={displayedBidAmount}
            isDisplayedBidLowest={isDisplayedBidLowest}
            onOpenOtpDialog={handleOpenOtpDialog}
            onOpenCarrierModal={handleOpenCarrierModal}
          />
        </div>
      </div>

      {/* BOTTOM SECTION: Detailed Shipment Parameters & Cargo Info */}
      <Box className="w-full">
        <ShipmentSummaryCard shipment={shipment} />
      </Box>

      {/* Modal 1: Full Detailed Bids Table Modal */}
      <FullBidsDetailModal
        open={openFullBidsModal}
        onClose={() => setOpenFullBidsModal(false)}
        bids={bids}
        shipmentStatus={shipment.status}
        onOpenOtpDialog={handleOpenOtpDialog}
        onOpenCarrierModal={handleOpenCarrierModal}
      />

      {/* Modal 2: Contract OTP Dialog */}
      <ContractOtpModal
        open={openOtpDialog}
        onClose={handleCloseOtpDialog}
        otpValues={otpValues}
        setOtpValues={setOtpValues}
        isOtpSuccess={isOtpSuccess}
        onSubmitOtp={handleOtpSubmit}
        winnerCarrierName={selectedWinnerBid ? selectedWinnerBid.carrierName : (displayedBidDetails ? displayedBidDetails.carrierName : "")}
      />

      {/* Modal 3: Carrier Profile Detail Dialog */}
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
