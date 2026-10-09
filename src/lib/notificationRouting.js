// Maps a stored notification (type + referenceId) to the screen that resolves it.
// Only types produced by the backend are routed:
//   bidding-service: NEW_AUCTION, AUCTION_* (referenceId = auctionId)
//   contract-service: LATE_DELIVERY (referenceId = tripId)
// Unknown types return null so the UI shows the message without a fake link.

const CARRIER_CONTRACT_TYPES = new Set(["AUCTION_AWARD_INVITATION", "AUCTION_CONTRACT_SIGNED"]);
const CARRIER_AUCTION_RESULT_TYPES = new Set(["AUCTION_AWARD_EXPIRED", "AUCTION_AWARD_CLOSED"]);
const SHIPPER_CONTRACT_TYPES = new Set(["AUCTION_SHIPPER_SIGNATURE_REQUIRED", "AUCTION_CONTRACT_SIGNED"]);

export function getNotificationDestination(notification, role) {
  const type = notification?.type;
  const ref = notification?.referenceId ? encodeURIComponent(notification.referenceId) : null;
  if (!type) return null;

  if (role === "carrier") {
    if (type === "NEW_AUCTION" && ref) return { href: `/carrier/auctions/${ref}`, label: "Mở phiên đấu giá" };
    if (CARRIER_CONTRACT_TYPES.has(type)) return { href: "/carrier/contracts", label: "Mở hợp đồng" };
    if (CARRIER_AUCTION_RESULT_TYPES.has(type)) return { href: "/carrier/my-auctions", label: "Xem phiên của tôi" };
    if (type === "LATE_DELIVERY" && ref) return { href: `/carrier/transports/${ref}`, label: "Mở chuyến" };
    return null;
  }

  if (role === "shipper") {
    if (SHIPPER_CONTRACT_TYPES.has(type)) return { href: "/shipper/contracts", label: "Mở hợp đồng" };
    if (type.startsWith("AUCTION_") && ref) return { href: `/shipper/bidding/history?id=${ref}`, label: "Mở phiên đấu giá" };
    if (type === "LATE_DELIVERY" && ref) return { href: `/shipper/tracking?id=${ref}`, label: "Mở chuyến" };
    return null;
  }

  if (role === "admin" && type === "LATE_DELIVERY") return { href: "/admin/late-delivery", label: "Mở xử lý giao trễ" };
  return null;
}
