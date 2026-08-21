"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auctionService } from "@/services/auctionService";
import CircularProgress from "@mui/material/CircularProgress";
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
import FullBidsDetailModal from "./FullBidsDetailModal";
import ContractOtpModal from "./ContractOtpModal";
import CarrierProfileModal from "./CarrierProfileModal";

export default function AuctionDetailScreen({ id }) {
  const router = useRouter();

  const [shipment, setShipment] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [auctionRes, bidsRes] = await Promise.all([
          auctionService.getAuctionById(id),
          auctionService.listBids(id, { page: 1, limit: 100 })
        ]);
        
        // Next.js API routes configured with appApiService return the data directly
        // However, if it's wrapped in { data: ... }, we handle it, else use auctionRes itself
        const data = auctionRes?.data || auctionRes || {};
        
        // Map backend data to frontend expected format
        const mappedShipment = {
          id: data.id || data._id || id,
          status: data.status,
          auctionType: data.auctionType || "PUBLIC",
          goodsType: data.goodsType || data.title || "Hàng hóa",
          weight: data.weight ? `${data.weight} tấn` : "N/A",
          volume: data.volume ? `${data.volume} m³` : "N/A",
          maxPrice: data.maxPrice?.$numberDecimal || data.maxPrice || 0,
          endTime: data.endTime,
          startTime: data.startTime,
          regStartTime: data.registrationStartTime,
          regEndTime: data.registrationEndTime,
          from: {
            name: data.pickupLocation?.locationName || "Không rõ",
            address: data.pickupLocation?.address || "Không rõ",
          },
          to: {
            name: data.deliveryLocation?.locationName || "Không rõ",
            address: data.deliveryLocation?.address || "Không rõ",
          },
          description: data.notes || "Không có ghi chú",
          auctionCreator: "Chủ hàng",
          priceStep: data.priceStep?.$numberDecimal || data.priceStep || 100000,
          maxBids: data.maxBids || 5,
          participationFee: data.participationFeeAmount?.$numberDecimal || 0,
          depositAmount: data.depositAmount?.$numberDecimal || 0,
          requiredVehicleType: data.vehicleTypeRequired || "N/A",
          requiredVehicleDims: data.vehicleSpecs || {},
          earliestPickup: data.pickupLocation?.earliestTime,
          latestPickup: data.pickupLocation?.latestTime,
          earliestDelivery: data.deliveryLocation?.earliestTime,
          latestDelivery: data.deliveryLocation?.latestTime,
          goodsCategory: data.goodsType,
          requiredTemp: data.requiredTemp,
          goodsValue: data.goodsValue?.$numberDecimal || 0,
          goodsNotes: data.notes,
        };
        
        setShipment(mappedShipment);
        
        const bidsData = bidsRes.data?.data || bidsRes.data || [];
        setBids(bidsData.map(b => ({
          id: b.id || b._id,
          carrierName: b.carrierName || "Nhà xe",
          carrierCode: b.carrierId,
          bidAmount: b.bidAmount?.$numberDecimal || b.bidAmount,
          time: new Date(b.createdAt).toLocaleString(),
          isLowest: false, // We'll compute this if needed
          originalBid: b
        })));
        
      } catch (error) {
        console.error("Error fetching auction details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <Box className="w-full min-h-screen flex justify-center items-center">
        <CircularProgress />
      </Box>
    );
  }

  if (!shipment) {
    return <Box className="w-full p-8 text-center">Không tìm thấy thông tin phiên đấu giá.</Box>;
  }

  
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



  // Live Timer Countdown Effect
  useEffect(() => {
    setCountdown(getInitialCountdown());
    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [shipment?.endTime, shipment?.status]);

  // Determine which bid to show on the right panel
  const isSealed = shipment.auctionType === "SEALED";
  const defaultBidRaw = bids.find((b) => b.isLowest) || (bids.length > 0 ? bids[0] : null);
  
  // For SEALED: use selected bid if any, otherwise default to lowest.
  // For PUBLIC: always keep default (lowest) or selected if we want to allow it. User said "còn đấu giá công khai vẫn giữ như cũ" so we ignore selection for PUBLIC.
  const displayedBidRaw = (isSealed && selectedBidForPanel) ? selectedBidForPanel : defaultBidRaw;
  
  const displayedBidDetails = displayedBidRaw ? getCarrierDetails(displayedBidRaw) : null;
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
    const details = getCarrierDetails(bid);
    const carrierId = details?.code || bid?.carrierCode || bid?.carrierName || "CARRIER-PA-8839";
    router.push(`/shipper/carriers/${encodeURIComponent(carrierId)}`);
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
