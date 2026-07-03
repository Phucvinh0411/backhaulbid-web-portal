"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonthOutlined";
import BalanceIcon from "@mui/icons-material/ScaleOutlined";
import { EmojiEvents as EmojiEventsIcon, CancelOutlined as CancelOutlinedIcon } from "@mui/icons-material";

export default function CarrierBiddingItem({ 
  auction, 
  mode = "my-auctions", // "my-auctions" | "marketplace" | "history"
  customActions,
  onCancel, 
  onViewDetail, 
  onEnterRoom 
}) {
  // Helper to format string price if it's already a string, or format number
  const formatCurrency = (val) => {
    if (!val) return "---";
    if (typeof val === 'string') return val;
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" })
      .format(val)
      .replace("₫", "đ");
  };

  // Retrieve design details unique to each status
  const getStatusDesign = (status, isWinner) => {
    switch (status) {
      case "OPEN_REGISTER":
        return {
          label: mode === "marketplace" ? "Sắp diễn ra" : "Chờ mở phiên",
          bgColor: "#EFF6FF",
          textColor: "#2563EB",
          borderColor: "#DBEAFE",
        };
      case "BIDDING":
        return {
          label: "Đang đấu giá",
          bgColor: "#ECFDF5",
          textColor: "#059669",
          borderColor: "#D1FAE5",
          pulse: true,
        };
      case "CLOSED":
        if (mode === "marketplace") {
          return {
            label: "Đã đóng",
            bgColor: "#F1F5F9",
            textColor: "#64748B",
            borderColor: "#E2E8F0",
          };
        }
        if (isWinner) {
          return {
            label: "Trúng thầu",
            icon: <EmojiEventsIcon fontSize="small" />,
            bgColor: "#FEF3C7",
            textColor: "#D97706",
            borderColor: "#FDE68A",
          };
        }
        return {
          label: "Trượt thầu",
          icon: <CancelOutlinedIcon fontSize="small" />,
          bgColor: "#F1F5F9",
          textColor: "#64748B",
          borderColor: "#E2E8F0",
        };
      default:
        return {
          label: status,
          bgColor: "#F8FAFC",
          textColor: "#64748B",
          borderColor: "#E2E8F0",
        };
    }
  };

  const design = getStatusDesign(auction.status, auction.isWinner);

  return (
    <Card 
      className="group hover:-translate-y-1 hover:shadow-xl transition-all duration-300 border border-slate-100/80 !rounded-3xl relative overflow-hidden h-full flex flex-col"
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
      
      <CardContent className="!p-6 space-y-4 flex-1">
        {/* Card Header: Code & Status */}
        <div className="flex items-center justify-between">
          <Typography className="!font-mono !font-bold text-[#1B4965] text-sm">
            {auction.id}
          </Typography>
          <Chip
            icon={design.icon}
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
              "& .MuiChip-icon": { color: "inherit", ml: 0.5 }
            }}
          />
        </div>

        {/* Main Title & Goods Info */}
        <div>
          <Typography variant="h6" className="!font-bold text-slate-800 leading-snug truncate">
            {auction.cargoType}
          </Typography>
          <div className="flex items-center gap-4 mt-1.5 text-slate-500 text-xs font-semibold">
            <span className="flex items-center gap-1">
              <BalanceIcon className="!text-[1rem] text-slate-400" />
              {auction.weight}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
            <span className="flex items-center gap-1">
              <CalendarMonthIcon className="!text-[0.95rem] text-slate-400" />
              {auction.pickupTime}
            </span>
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
                Lấy Hàng
              </Typography>
              <Typography variant="body2" className="text-slate-700 font-bold mt-0.5">
                {auction.origin}
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
                Giao Hàng
              </Typography>
              <Typography variant="body2" className="text-slate-700 font-bold mt-0.5">
                {auction.destination}
              </Typography>
            </div>
          </div>
        </div>

        {/* Vehicle Info */}
        {auction.registeredVehicle && (
          <div className="flex justify-between items-center text-xs pt-1">
            <Typography className="text-slate-500">Xe đã đăng ký:</Typography>
            <Typography className="font-semibold text-[#1B4965] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
              {auction.registeredVehicle}
            </Typography>
          </div>
        )}

        {/* Pricing Info */}
        <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
          {/* Active Bids state */}
          {auction.status === "BIDDING" && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <Typography className="!text-[0.7rem] text-slate-400 font-medium">Giá khởi điểm</Typography>
                <Typography className="!font-bold text-slate-700">{formatCurrency(auction.basePrice)}</Typography>
              </div>
              <div>
                <Typography className="!text-[0.7rem] text-slate-400 font-medium">Đang thấp nhất</Typography>
                <Typography className="!font-bold text-emerald-600">
                  {auction.currentLowestBid ? formatCurrency(auction.currentLowestBid) : "---"}
                </Typography>
              </div>
            </div>
          )}

          {/* Open Register (Pending) state */}
          {auction.status === "OPEN_REGISTER" && (
            <div className="flex items-center justify-between text-xs">
              <div>
                <Typography className="!text-[0.7rem] text-slate-400 font-medium">Giá khởi điểm</Typography>
                <Typography className="!font-bold text-slate-700">{formatCurrency(auction.basePrice)}</Typography>
              </div>
              {mode !== "marketplace" && (
                <div className="text-right">
                  <span className="text-[0.7rem] px-2 py-0.5 bg-slate-100 text-slate-500 rounded font-semibold">Chờ mở thầu</span>
                </div>
              )}
            </div>
          )}

          {/* Closed State */}
          {auction.status === "CLOSED" && (
            <div className="bg-slate-100/50 p-2.5 rounded-xl text-xs space-y-1.5">
              <div className="flex justify-between items-center">
                <Typography className="!text-[0.7rem] text-slate-500 font-bold">
                  {mode === "marketplace" ? "Giá đã chốt thầu" : "Giá thắng thầu chung"}
                </Typography>
                <Typography className="!font-bold text-slate-700">{formatCurrency(auction.winningBid || auction.basePrice)}</Typography>
              </div>
              
              {auction.myFinalBid && (
                <div className="flex justify-between items-center pt-1 border-t border-slate-200/50">
                  <Typography className="!text-[0.7rem] text-slate-500 font-bold">Giá chốt của bạn</Typography>
                  <Typography className={`!font-extrabold ${auction.isWinner ? 'text-emerald-600' : 'text-slate-500'}`}>
                    {formatCurrency(auction.myFinalBid)}
                  </Typography>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>

      {/* Card Actions */}
      <div className="flex items-center justify-between p-4 pt-3 border-t border-slate-100 gap-3">
        {customActions ? customActions : (
          <>
            {auction.status === "BIDDING" ? (
              <Button 
                fullWidth 
                variant="contained"
                color="primary"
                onClick={() => onEnterRoom && onEnterRoom(auction.id)}
                sx={{ backgroundColor: "#1B4965", borderRadius: "12px", textTransform: "none", fontWeight: 700 }}
              >
                Vào phòng đấu giá
              </Button>
            ) : (
              <>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => onViewDetail && onViewDetail(auction)}
                  className="!text-[#1B4965] !font-bold !text-[0.8rem] !capitalize !rounded-xl"
                  sx={{ "&:hover": { backgroundColor: "rgba(27, 73, 101, 0.05)" } }}
                >
                  Chi tiết
                </Button>
                
                {auction.status === "OPEN_REGISTER" && onCancel && (
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => onCancel(auction)}
                    className="!text-rose-500 !border-rose-200 hover:!bg-rose-50 hover:!border-rose-300 !font-bold !text-[0.8rem] !capitalize !rounded-xl"
                  >
                    Hủy đăng ký
                  </Button>
                )}
              </>
            )}
          </>
        )}
      </div>
    </Card>
  );
}
