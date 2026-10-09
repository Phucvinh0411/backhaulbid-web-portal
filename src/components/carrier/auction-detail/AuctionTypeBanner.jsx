"use client";

import Alert from "@mui/material/Alert";
import { AUCTION_TYPE_META } from "@/lib/statusMeta";

/** Explains the auction mechanism using the shared, backend-derived description. */
export default function AuctionTypeBanner({ auctionType, maxBids }) {
  const meta = AUCTION_TYPE_META[auctionType] || AUCTION_TYPE_META.PUBLIC;
  return (
    <Alert severity="info" sx={{ mb: 2 }}>
      <strong>{meta.label}.</strong> {meta.description}
      {maxBids ? ` Mỗi nhà xe được đặt tối đa ${maxBids} lượt.` : ""}
    </Alert>
  );
}
