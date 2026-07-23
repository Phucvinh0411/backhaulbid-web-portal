"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonthOutlined";
import BalanceIcon from "@mui/icons-material/ScaleOutlined";

/**
 * Reusable BiddingItem card component representing a logistics shipment.
 * Provides custom styling, backgrounds, and action menus based on the current auction status.
 */
export default function BiddingItem({ shipment, onCancel, onViewDetail }) {
  // Helper to format currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" })
      .format(val)
      .replace("₫", "đ");
  };

  // Calculate time remaining representation
  const getTimeRemaining = (endTimeStr) => {
    const end = new Date(endTimeStr);
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
        return {
          label: "Chờ đấu giá",
          bgColor: "#EFF6FF",
          textColor: "#2563EB",
          borderColor: "#DBEAFE",
        };
      case "active_bids":
        return {
          label: "Đang đấu giá",
          bgColor: "#ECFDF5",
          textColor: "#059669",
          borderColor: "#D1FAE5",
          pulse: true,
        };
      case "awarded":
        return {
          label: "Đã chốt thầu",
          bgColor: "#F5F3FF",
          textColor: "#7C3AED",
          borderColor: "#DDD6FE",
        };
      case "shipping":
        return {
          label: "Đang vận chuyển",
          bgColor: "#FEF3C7",
          textColor: "#D97706",
          borderColor: "#FDE68A",
        };
      case "completed":
        return {
          label: "Hoàn thành",
          bgColor: "#F1F5F9",
          textColor: "#475569",
          borderColor: "#E2E8F0",
        };
      case "cancelled":
        return {
          label: "Đã hủy",
          bgColor: "#FEF2F2",
          textColor: "#E11D48",
          borderColor: "#FEE2E2",
        };
      default:
        return {
          label: "Không xác định",
          bgColor: "#F8FAFC",
          textColor: "#64748B",
          borderColor: "#E2E8F0",
        };
    }
  };

  const design = getStatusDesign(shipment.status);

  return (
    <Card 
      className="group hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border border-slate-100/80 !rounded-3xl relative overflow-hidden"
      sx={{
        background: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.02)",
        "&:hover": {
          borderColor: "rgba(27, 73, 101, 0.15)",
          boxShadow: "0 12px 30px rgba(27, 73, 101, 0.05)",
        }
      }}
    >
      {/* Visual background gradient glow on hover */}
      <Box className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#1B4965] to-[#62B6CB] opacity-0 group-hover:opacity-100 transition-all duration-300" />
      
      <CardContent className="!p-6 space-y-4">
        {/* Card Header: Code & Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Typography className="!font-mono !font-bold text-slate-400 text-xs">
              {shipment.id}
            </Typography>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
              shipment.auctionType === "SEALED"
                ? "bg-amber-50 text-amber-600 border-amber-200"
                : "bg-sky-50 text-sky-600 border-sky-200"
            }`}>
              {shipment.auctionType === "SEALED" ? "Đấu giá kín" : "Công khai"}
            </span>
          </div>
          <Chip
            label={design.label}
            size="small"
            className={design.pulse ? "animate-pulse-subtle" : ""}
            sx={{
              fontWeight: "bold",
              fontSize: "0.72rem",
              px: 1,
              py: 0.5,
              borderRadius: "9999px",
              border: "1px solid",
              backgroundColor: `${design.bgColor} !important`,
              color: `${design.textColor} !important`,
              borderColor: `${design.borderColor} !important`,
            }}
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

        {/* Auction and Carrier info based on status */}
        <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
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
          <Button
            variant="text"
            size="small"
            onClick={() => onViewDetail && onViewDetail(shipment.id)}
            className="!text-[#1B4965] !font-bold !text-[0.8rem] !capitalize !rounded-xl"
            sx={{ "&:hover": { backgroundColor: "rgba(27, 73, 101, 0.05)" } }}
          >
            Xem chi tiết
          </Button>

          {(shipment.status === "active_bids" || shipment.status === "pending_bids") && (
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={() => onCancel && onCancel(shipment.id)}
              className="!text-rose-500 !border-rose-200 hover:!bg-rose-50 hover:!border-rose-300 !font-bold !text-[0.8rem] !capitalize !rounded-xl"
            >
              Hủy thầu
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
