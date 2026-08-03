"use client";

import BiddingItem from "@/components/shipper/BiddingItem";

/**
 * Canonical auction card for both roles.
 * The shipper card is the visual baseline; role-specific screens provide
 * normalized data and actions through this composition boundary.
 */
export default function AuctionSessionCard(props) {
  return <BiddingItem {...props} />;
}
