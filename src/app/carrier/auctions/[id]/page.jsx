"use client";

import CarrierAuctionScreen from "@/components/carrier/auction-detail";

export default function LiveBiddingRoom({ params }) {
  return <CarrierAuctionScreen id={params.id} />;
}
