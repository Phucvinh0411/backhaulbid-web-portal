"use client";

import { use } from "react";
import EkycGuard from "@/components/eKYC/EkycGuard";
import CarrierAuctionScreen from "@/components/carrier/auction-detail";

export default function LiveBiddingRoom({ params }) {
  const { id } = use(params);
  return (
    <EkycGuard role="carrier">
      <CarrierAuctionScreen id={id} />
    </EkycGuard>
  );
}
