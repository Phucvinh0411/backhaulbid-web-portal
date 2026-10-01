"use client";

import { useState, useEffect } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import PageHeader from "@/components/common/PageHeader";
import { useGlobalNotification } from "@/components/common/NotificationPopup";
import { getApiErrorMessage } from "@/services/errorMessage";

import { getAuction, listBids, selectWinner } from "@/services/biddingApi";
import { mapBackendToBid, mapBackendToShipment } from "@/services/shipperAuctionMapper";
import { carrierProfileApi } from "@/services/carrierProfileApi";
import { mapCarrierProfile } from "@/services/carrierProfileMapper";
import ShipmentSummaryCard from "./ShipmentSummaryCard";
import LiveCountdownCard from "./LiveCountdownCard";
import LowestBidCard from "./LowestBidCard";
import BidsTable from "./BidsTable";
import FullBidsDetailModal from "./FullBidsDetailModal";
import ContractOtpModal from "./ContractOtpModal";
import CarrierProfileModal from "./CarrierProfileModal";

export default function AuctionDetailScreen({ id }) {
  const { notify } = useGlobalNotification();
  const [shipment, setShipment] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [openOtpDialog, setOpenOtpDialog] = useState(false);
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [isOtpSuccess, setIsOtpSuccess] = useState(false);
  const [selectedWinnerBid, setSelectedWinnerBid] = useState(null);

  const [openCarrierModal, setOpenCarrierModal] = useState(false);
  const [selectedCarrier, setSelectedCarrier] = useState(null);
  const [carrierModalLoading, setCarrierModalLoading] = useState(false);

  const [openFullBidsModal, setOpenFullBidsModal] = useState(false);
  const [selectedBidForPanel, setSelectedBidForPanel] = useState(null);

  useEffect(() => {
    let active = true;
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      setLoadError("");
      try {
        let auctionResponse;
        try {
          auctionResponse = await getAuction(id);
        } catch (err) {
          if (!active) return;
          const message = getApiErrorMessage(err, "Không thể tải chi tiết phiên đấu giá. Vui lòng thử lại.");
          setLoadError(message);
          notify.error(message);
          setLoading(false);
          return;
        }

        let bidsResponse = [];
        try {
          bidsResponse = await listBids(id, { page: 1, pageSize: 100 });
        } catch (err) {
          console.warn("Error fetching bids, defaulting to empty array:", err);
        }

        if (!active) return;
        const auction = auctionResponse?.data || auctionResponse;
        setShipment(mapBackendToShipment(auction));

        const rawBids = bidsResponse?.data?.data || bidsResponse?.data?.items || bidsResponse?.data || bidsResponse?.items || (Array.isArray(bidsResponse) ? bidsResponse : []);
        setBids(rawBids.map((bid, index) => mapBackendToBid(bid, index, rawBids)));
      } catch (error) {
        if (!active) return;
        console.error("Error in fetchData:", error);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchData();
    return () => {
      active = false;
    };
  }, [id, notify]);

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

  const handleOpenCarrierModal = async (bid) => {
    if (!bid) return;
    const carrierId = bid?.carrierId || bid?.carrierCode;

    // Open modal immediately with basic info from the bid
    const baseFallback = mapCarrierProfile({
      company: {
        accountId: carrierId || bid?.carrierName,
        companyName: bid?.carrierName,
        verificationStatus: "VERIFIED",
      },
      vehicles: [],
      drivers: [],
    });
    setSelectedCarrier(baseFallback);
    setOpenCarrierModal(true);

    if (!carrierId) return;

    // Fetch full profile in background
    setCarrierModalLoading(true);
    try {
      const [companyRes, vehiclesRes, driversRes] = await Promise.allSettled([
        carrierProfileApi.getCompany(carrierId),
        carrierProfileApi.getVehicles(carrierId),
        carrierProfileApi.getDrivers(carrierId),
      ]);

      const company = companyRes.status === "fulfilled"
        ? (companyRes.value?.data || companyRes.value)
        : { companyName: bid?.carrierName, accountId: carrierId, verificationStatus: "VERIFIED" };

      const vehiclesRaw = vehiclesRes.status === "fulfilled"
        ? (vehiclesRes.value?.data || vehiclesRes.value || [])
        : [];
      const vehicles = Array.isArray(vehiclesRaw) ? vehiclesRaw : [];

      const driversRaw = driversRes.status === "fulfilled"
        ? (driversRes.value?.data || driversRes.value || [])
        : [];
      const drivers = Array.isArray(driversRaw) ? driversRaw : [];

      const mapped = mapCarrierProfile({ company, vehicles, drivers });
      // Preserve bid-level fields not in company profile
      setSelectedCarrier({
        ...mapped,
        rating: bid.rating ?? mapped.rating,
        vehicleType: bid.vehicleType || (vehicles[0]?.vehicleType) || mapped.vehicleType,
        vehiclePlate: bid.vehiclePlate || (vehicles[0]?.licensePlate) || mapped.vehiclePlate,
        vehiclePayload: bid.vehiclePayload || (vehicles[0] ? `${vehicles[0].payloadCapacity} tấn` : undefined),
        driverName: bid.driverName || (drivers[0]?.fullName) || mapped.driverName,
        driverPhone: bid.driverPhone || (drivers[0]?.phone) || mapped.driverPhone,
      });
    } catch (err) {
      // Keep using the fallback data already set
      console.warn("Could not fully load carrier profile:", err);
    } finally {
      setCarrierModalLoading(false);
    }
  };

  const handleCloseCarrierModal = () => {
    setOpenCarrierModal(false);
    setSelectedCarrier(null);
    setCarrierModalLoading(false);
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
          <LiveCountdownCard shipment={shipment} />
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
        loading={carrierModalLoading}
        shipmentStatus={shipment.status}
        onSelectCarrierAsWinner={handleOpenOtpDialog}
      />
    </Box>
  );
}
