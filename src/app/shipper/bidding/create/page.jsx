"use client";

import EkycGuard from "@/components/eKYC/EkycGuard";
import CreateAuctionScreen from "@/components/shipper/create-auction";

export default function CreateShipmentPage() {
  return (
    <EkycGuard role="shipper">
      <CreateAuctionScreen />
    </EkycGuard>
  );
}
