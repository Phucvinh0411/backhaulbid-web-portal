"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonthOutlined";
import BalanceIcon from "@mui/icons-material/ScaleOutlined";
import { AuctionTypeBadge, AuctionStatusBadge, RoundedBox, AsymmetricCornerBox, ActionButton } from "@/components/common";

/**
 * Reusable BiddingItem card component representing a logistics shipment.
 * Provides custom styling, backgrounds, and action menus based on the current auction status.
 */
export default function BiddingItem({
  shipment,
  onCancel,
  onViewDetail,
  customActions,
  statusLabelOverride,
}) {
  // Helper to format currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" })
      .format(val)
      .replace("₫", "đ");
  };

  // Calculate time remaining representation
  const getTimeRemaining = (endTimeStr) => {
    const end = new Date(endTimeStr);
    if (Number.isNaN(end.getTime())) return "Theo lịch phiên";
    const now = new Date();
    const diffMs = end - now;

    if (diffMs <= 0) return "Đã đóng thầu";

    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    const remainingHours = diffHours % 24;

    if (diffDays > 0) {
      return `Còn ${diffDays} ngày ${remainingHours} giờ`;
    }
    return `Còn ${diffHours} giờ`;
  };

  // Retrieve design details (labels, color classes) unique to each status
  const getStatusDesign = (status) => {
    switch (status) {
      case "pending_bids":
        return { label: "Chờ đấu giá" };
      case "active_bids":
        return { label: "Đang đấu giá" };
      case "awarded":
        return { label: "Đã chốt thầu" };
      case "shipping":
        return { label: "Đang vận chuyển" };
      case "completed":
        return { label: "Hoàn thành" };
      case "cancelled":
        return { label: "Đã hủy" };
      default:
        return { label: "Khác" };
    }
  };

  const design = getStatusDesign(shipment.status);

  return (
    <RoundedBox
      className="group h-full flex flex-col justify-between"
      padding="lg"
      hoverEffect={true}
    >
      {/* Visual background gradient glow on hover */}
      <Box className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#1B4965] to-[#62B6CB] opacity-0 group-hover:opacity-100 transition-all duration-300" />
      
      <div className="flex-1 flex flex-col justify-between space-y-4">
        {/* Top Info Group */}
        <div className="space-y-4">
          {/* Card Header: Code, Auction Type Badge & Status */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 shrink-0">
              <span className="font-mono font-black text-slate-700 text-xs tracking-tight shrink-0 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/80 whitespace-nowrap">
                {shipment.id}
              </span>
              <AuctionTypeBadge type={shipment.auctionType} size="md" />
            </div>

            <AuctionStatusBadge
              status={shipment.status}
              labelOverride={statusLabelOverride || design.label}
              size="md"
            />
          </div>

          {/* Main Title & Goods Info */}
          <div>
            <Typography variant="h6" className="!font-bold text-slate-800 leading-snug truncate">
              {shipment.goodsType}
            </Typography>
            <div className="flex items-center gap-4 mt-1.5 text-slate-500 text-xs font-semibold">
              <span className="flex items-center gap-1">
                <BalanceIcon className="!text-[1rem] text-slate-400" />
                {shipment.weight}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              <span>Kích thước: {shipment.volume}</span>
            </div>
          </div>

          {/* Address Route Timeline Visual */}
          <div className="bg-slate-50/60 p-3 rounded-2xl border border-slate-100/50 space-y-3">
            {/* Source point */}
            <div className="flex items-start gap-2.5">
              <div className="flex flex-col items-center mt-1">
                <div className="w-2.5 h-2.5 rounded-full border-2 border-sky-500 bg-white" />
                <div className="w-0.5 h-6 bg-slate-200" />
              </div>
              <div className="min-w-0">
                <Typography className="!text-[0.68rem] !font-bold text-sky-600 uppercase tracking-wider leading-none">
                  Điểm Lấy Hàng ({shipment.from.province})
                </Typography>
                <Typography variant="body2" className="text-slate-600 font-medium truncate mt-0.5">
                  {shipment.from.detail}
                </Typography>
              </div>
            </div>

            {/* Destination point */}
            <div className="flex items-start gap-2.5">
              <div className="flex flex-col items-center mt-1">
                <div className="w-2.5 h-2.5 rounded-full border-2 border-emerald-500 bg-emerald-500" />
              </div>
              <div className="min-w-0">
                <Typography className="!text-[0.68rem] !font-bold text-emerald-600 uppercase tracking-wider leading-none">
                  Điểm Giao Hàng ({shipment.to.province})
                </Typography>
                <Typography variant="body2" className="text-slate-600 font-medium truncate mt-0.5">
                  {shipment.to.detail}
                </Typography>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Info & Actions Group */}
        <div className="pt-2 border-t border-slate-100 flex flex-col gap-2 mt-auto">
          {/* Bidding Information for Active Bids */}
          {shipment.status === "active_bids" && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <Typography className="!text-[0.7rem] text-slate-400 font-medium">Giá trần tối đa</Typography>
                <Typography className="!font-bold text-slate-700">{formatCurrency(shipment.maxPrice)}</Typography>
              </div>
              <div>
                <Typography className="!text-[0.7rem] text-slate-400 font-medium">Báo giá thấp nhất</Typography>
                <Typography className="!font-bold text-emerald-600">
                  {shipment.currentLowestBid > 0 ? formatCurrency(shipment.currentLowestBid) : "Chưa có"}
                </Typography>
              </div>
            </div>
          )}

          {/* Pending Bids State */}
          {shipment.status === "pending_bids" && (
            <div className="flex items-center justify-between text-xs">
              <div>
                <Typography className="!text-[0.7rem] text-slate-400 font-medium">Giá khởi điểm trần</Typography>
                <Typography className="!font-bold text-slate-700">{formatCurrency(shipment.maxPrice)}</Typography>
              </div>
              <div className="text-right">
                <span className="text-[0.7rem] px-2 py-0.5 bg-slate-100 text-slate-500 rounded font-semibold">Chờ giờ mở thầu</span>
              </div>
            </div>
          )}

          {/* Awarded, Shipping, or Completed States */}
          {(shipment.status === "awarded" || shipment.status === "shipping" || shipment.status === "completed") && (
            <div className="bg-slate-100/50 p-2.5 rounded-xl text-xs space-y-1.5">
              <div className="flex justify-between items-center">
                <Typography className="!text-[0.7rem] text-slate-500 font-bold uppercase">Nhà xe vận chuyển</Typography>
                <Typography className="!font-extrabold text-[#1B4965]">{formatCurrency(shipment.finalPrice)}</Typography>
              </div>
              <Typography className="!font-bold text-slate-700 truncate">{shipment.carrier}</Typography>
              
              {shipment.driverName && (
                <div className="flex justify-between items-center text-slate-500 font-medium pt-1 border-t border-slate-200/50">
                  <span>Tài xế: {shipment.driverName}</span>
                  <span className="bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-700 font-mono font-bold text-[0.68rem]">{shipment.driverPlate}</span>
                </div>
              )}
            </div>
          )}

          {/* Cancelled State */}
          {shipment.status === "cancelled" && (
            <div className="bg-rose-50/50 p-2 rounded-xl border border-rose-100/60 text-xs">
              <Typography className="!text-[0.68rem] text-rose-500 font-bold uppercase leading-none mb-1">Lý do hủy đơn</Typography>
              <Typography className="text-slate-600 font-medium line-clamp-2 leading-tight">
                {shipment.cancelReason || "Hủy do thay đổi kế hoạch"}
              </Typography>
            </div>
          )}

          {/* Time closing indicator */}
          {(shipment.status === "active_bids" || shipment.status === "pending_bids") && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 pt-1.5">
              <CalendarMonthIcon className="!text-[0.95rem] text-slate-400" />
              <span>{getTimeRemaining(shipment.closeTime)}</span>
            </div>
          )}
        </div>

        {/* Card Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-3">
          {customActions ? customActions : (
          <>
          <ActionButton
            variant="text"
            size="sm"
            onClick={() => onViewDetail && onViewDetail(shipment)}
          >
            Xem chi tiết
          </ActionButton>

          {(shipment.status === "active_bids" || shipment.status === "pending_bids") && (
            <ActionButton
              variant="danger-outlined"
              size="sm"
              onClick={() => onCancel && onCancel(shipment.id)}
            >
              Hủy thầu
            </ActionButton>
          )}
          </>
          )}
        </div>
      </div>
    </RoundedBox>
  );
}
