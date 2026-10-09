"use client";

import Link from "next/link";
import Button from "@mui/material/Button";
import AuctionSessionCard from "@/components/auctions/AuctionSessionCard";
import { getAccessStatusMeta, getAuctionPhaseMeta } from "@/lib/statusMeta";

/**
 * Carrier view model: what the carrier should see and do for an auction, derived
 * only from the auction and the carrier's own access status.
 */
export function normalizeCarrierAuction(auction, access) {
  const accessStatus = access?.accessStatus;
  const base = { status: getAuctionPhaseMeta(auction), note: null, noteTone: "neutral", primary: null };
  if (access === undefined) return { ...base, note: "Đang kiểm tra trạng thái đăng ký của bạn...", primary: "view" };

  switch (accessStatus) {
    case "REGISTRATION_REQUIRED":
      return { ...base, note: "Đăng ký và thanh toán để được vào phòng", noteTone: "info", primary: "register" };
    case "PAYMENT_INCOMPLETE":
      return { ...base, status: getAccessStatusMeta(accessStatus), note: "Thanh toán chưa xong, cần thử lại trước giờ mở phiên", noteTone: "danger", primary: "pay" };
    case "WAITING_FOR_START":
      return { ...base, status: getAccessStatusMeta(accessStatus), note: "Đã đăng ký. Phòng mở khi đến giờ bắt đầu", noteTone: "success", primary: "view" };
    case "AUCTION_OPEN":
      return { ...base, status: getAccessStatusMeta(accessStatus), note: "Phòng đang mở, có thể đặt giá", noteTone: "success", primary: "enter" };
    case "REPUTATION_TOO_LOW":
      return { ...base, note: "Điểm uy tín chưa đạt mức tối thiểu của phiên", noteTone: "warning", primary: "view" };
    case "REGISTRATION_CLOSED":
    case "REGISTRATION_CANCELLED":
    case "AUCTION_COMPLETED":
    case "AUCTION_CANCELLED":
      return { ...base, status: getAccessStatusMeta(accessStatus), primary: "view" };
    default:
      return { ...base, primary: "view" };
  }
}

export default function CarrierBiddingItem({ auction, access, onViewDetail, onRegister, extraFacts }) {
  const view = normalizeCarrierAuction(auction, access);
  const roomHref = `/carrier/auctions/${encodeURIComponent(auction.id)}`;

  let primary = null;
  if (view.primary === "register") {
    primary = (
      <Button variant="contained" onClick={() => onRegister?.(auction)}>
        Đăng ký tham gia
      </Button>
    );
  } else if (view.primary === "enter") {
    primary = (
      <Button variant="contained" color="success" component={Link} href={roomHref}>
        Vào phòng đấu giá
      </Button>
    );
  } else if (view.primary === "pay") {
    primary = (
      <Button variant="contained" color="error" component={Link} href={roomHref}>
        Hoàn tất thanh toán
      </Button>
    );
  }

  return (
    <AuctionSessionCard
      auction={auction}
      status={view.status}
      note={view.note}
      noteTone={view.noteTone}
      extraFacts={extraFacts}
      onOpen={() => onViewDetail?.(auction)}
      actions={
        <>
          <Button variant="outlined" color="inherit" onClick={() => onViewDetail?.(auction)}>
            Chi tiết
          </Button>
          {primary || (
            <Button variant="outlined" component={Link} href={roomHref}>
              Mở phiên
            </Button>
          )}
        </>
      }
    />
  );
}
