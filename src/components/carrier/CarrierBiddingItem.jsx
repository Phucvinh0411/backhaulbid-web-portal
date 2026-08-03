"use client";

import AuctionSessionCard from "@/components/auctions/AuctionSessionCard";
import { ActionButton } from "@/components/common";

const STATUS_MAP = {
  OPEN_REGISTER: "pending_bids",
  WAITING_START: "pending_bids",
  BIDDING: "active_bids",
  CLOSED: "awarded",
  CANCELLED: "cancelled",
};

function numberValue(value) {
  if (typeof value === "number") return value;
  const parsed = Number(String(value || "").replace(/[^0-9]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function normalizeCarrierAuction(auction) {
  return {
    ...auction,
    status: STATUS_MAP[auction.status] || auction.status,
    goodsType: auction.cargoType || auction.goodsType || "Hàng hóa",
    volume: auction.volume || "Theo yêu cầu",
    maxPrice: numberValue(auction.maxPrice ?? auction.basePrice),
    currentLowestBid: numberValue(auction.currentLowestBid),
    closeTime: auction.closeTime || auction.auctionEndAt || "",
    from: {
      province: auction.originProvince || "Điểm lấy hàng",
      detail: auction.origin || "Chưa cập nhật",
    },
    to: {
      province: auction.destinationProvince || "Điểm giao hàng",
      detail: auction.destination || "Chưa cập nhật",
    },
  };
}

function getStatusLabel(auction, mode) {
  if (auction.status === "OPEN_REGISTER") {
    return mode === "marketplace" ? "Sắp diễn ra" : "Chờ mở phiên";
  }
  if (auction.status === "WAITING_START") return "Chờ giờ mở phiên";
  if (auction.status === "BIDDING") return "Đang đấu giá";
  if (auction.status === "CLOSED") return auction.isWinner ? "Trúng thầu" : "Đã đóng";
  return "Đã hủy";
}

export default function CarrierBiddingItem({
  auction,
  mode = "my-auctions",
  customActions,
  onCancel,
  onViewDetail,
  onEnterRoom,
}) {
  const session = normalizeCarrierAuction(auction);
  const actions = customActions || (
    <>
      <ActionButton variant="text" size="sm" onClick={() => onViewDetail?.(auction)}>
        Xem chi tiết
      </ActionButton>
      {auction.status === "BIDDING" && auction.isRegistered ? (
        <ActionButton variant="primary" size="sm" onClick={() => onEnterRoom?.(auction.id)}>
          Vào phòng đấu giá
        </ActionButton>
      ) : auction.status === "OPEN_REGISTER" && onCancel ? (
        <ActionButton variant="danger-outlined" size="sm" onClick={() => onCancel(auction)}>
          Hủy đăng ký
        </ActionButton>
      ) : null}
    </>
  );

  return (
    <AuctionSessionCard
      shipment={session}
      customActions={actions}
      statusLabelOverride={getStatusLabel(auction, mode)}
      onViewDetail={onViewDetail}
    />
  );
}
