"use client";

import { use } from "react";
import CarrierAuctionScreen from "@/components/carrier/auction-detail";

export default function LiveBiddingRoom({ params }) {
  const { id } = use(params);
  return <CarrierAuctionScreen id={id} />;
}
