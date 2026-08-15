"use client";

import AuctionDetailContent from "./AuctionDetailContent";

/**
 * Backward-compatible wrapper for callers that still use the old card name.
 * Keeping this adapter prevents a second detail layout from returning later.
 */
export default function CarrierShipmentInfoCard({ shipment }) {
  return <AuctionDetailContent auction={shipment} />;
}
