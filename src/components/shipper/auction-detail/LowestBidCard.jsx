"use client";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";

import GavelIcon from "@mui/icons-material/GavelOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTimeOutlined";
import VerifiedIcon from "@mui/icons-material/Verified";
import StarIcon from "@mui/icons-material/Star";
import InfoIcon from "@mui/icons-material/InfoOutlined";
import LocalShippingIcon from "@mui/icons-material/LocalShippingOutlined";
import PhoneIcon from "@mui/icons-material/PhoneInTalkOutlined";

import { formatCurrency } from "./mockData";

export default function LowestBidCard({
  shipment,
  lowestBidDetails,
  lowestBidAmount,
  onOpenOtpDialog,
  onOpenCarrierModal,
}) {
  return (
    <Card
      className="!rounded-3xl border border-emerald-200/80 flex-1 relative overflow-hidden transition-all shadow-sm hover:shadow-md"
      sx={{
        background: "linear-gradient(145deg, rgba(236,253,245,0.95) 0%, rgba(255,255,255,0.95) 60%, rgba(209,250,229,0.5) 100%)",
        backdropFilter: "blur(12px)",
      }}
    >
      <Box className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
      
      <CardContent className="!p-6 flex flex-col justify-between h-full space-y-4 relative z-10">
        {/* Header & Main Price */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Typography className="!text-emerald-800 !font-extrabold uppercase tracking-wider text-xs flex items-center gap-1.5 bg-emerald-100/90 px-3 py-1 rounded-full border border-emerald-200/80">
              <GavelIcon className="!text-[0.95rem] text-emerald-600" /> Báo Giá Thấp Nhất Hiện Tại
            </Typography>
            {lowestBidDetails && (
              <span className="text-[0.7rem] font-bold text-slate-500 flex items-center gap-1 bg-white/90 px-2.5 py-0.5 rounded-full border border-slate-200/60 shadow-xs">
                <AccessTimeIcon className="!text-[0.8rem]" /> {lowestBidDetails.time}
              </span>
            )}
          </div>

          <div className="flex items-baseline justify-between pt-1">
            <div>
              <Typography variant="h3" className="!font-black text-emerald-600 tracking-tight !text-3xl md:!text-4xl">
                {lowestBidAmount > 0 ? formatCurrency(lowestBidAmount) : "Chưa có báo giá"}
              </Typography>
            </div>
            {lowestBidAmount > 0 && (
              <div className="text-right">
                <span className="text-[0.7rem] font-semibold text-slate-500 block">Tiết kiệm so với giá trần:</span>
                <span className="text-emerald-700 font-extrabold text-xs bg-emerald-100/90 px-2 py-0.5 rounded-lg border border-emerald-200 inline-block mt-0.5">
                  -{formatCurrency(shipment.maxPrice - lowestBidAmount)} ({((shipment.maxPrice - lowestBidAmount) / shipment.maxPrice * 100).toFixed(1)}%)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Carrier Detailed Information Card */}
        {lowestBidDetails ? (
          <div className="bg-white/95 rounded-2xl p-4 border border-emerald-100 shadow-sm space-y-3.5 hover:border-emerald-300 transition-all">
            {/* Carrier Profile Bar */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div 
                  onClick={() => onOpenCarrierModal(lowestBidDetails)}
                  className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1B4965] to-[#0D2B3E] text-white flex items-center justify-center font-black text-base shadow-sm border border-slate-200 cursor-pointer hover:scale-105 transition-transform"
                >
                  {lowestBidDetails.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Typography 
                      onClick={() => onOpenCarrierModal(lowestBidDetails)}
                      className="!font-bold text-slate-800 text-sm hover:text-[#1B4965] transition-colors cursor-pointer"
                    >
                      {lowestBidDetails.carrierName}
                    </Typography>
                    <Chip
                      icon={<VerifiedIcon className="!text-[0.8rem] !text-sky-500" />}
                      label="Xác thực B2B"
                      size="small"
                      className="!h-5 !text-[0.65rem] !font-bold !bg-sky-50 !text-sky-700 border border-sky-100"
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex items-center gap-1 text-amber-500">
                      <StarIcon className="!text-[0.9rem]" />
                      <span className="text-xs font-bold text-slate-700">{lowestBidDetails.rating}</span>
                      <span className="text-[0.7rem] text-slate-400">({lowestBidDetails.ratingCount} đánh giá)</span>
                    </div>
                    <span className="text-slate-300 text-xs">•</span>
                    <span className="text-[0.7rem] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                      {lowestBidDetails.badge}
                    </span>
                  </div>
                </div>
              </div>

              <IconButton 
                size="small" 
                onClick={() => onOpenCarrierModal(lowestBidDetails)} 
                className="text-slate-400 hover:text-[#1B4965] bg-slate-50 hover:bg-slate-100 border border-slate-200/60"
                title="Xem hồ sơ chi tiết nhà xe"
              >
                <InfoIcon className="!text-[1.1rem]" />
              </IconButton>
            </div>

            {/* Operational Metrics & Fleet Grid */}
            <div className="grid grid-cols-2 gap-2 text-[0.75rem]">
              <div className="bg-slate-50/90 p-2.5 rounded-xl border border-slate-100 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-[0.68rem] font-medium">Chuyến hoàn thành:</span>
                  <strong className="text-slate-800 font-bold">{lowestBidDetails.completedTrips} chuyến</strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-[0.68rem] font-medium">Tỷ lệ đúng giờ:</span>
                  <strong className="text-emerald-600 font-bold">{lowestBidDetails.onTimeRate}</strong>
                </div>
              </div>

              <div className="bg-slate-50/90 p-2.5 rounded-xl border border-slate-100 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-[0.68rem] font-medium">Biển số xe:</span>
                  <span className="bg-amber-100 text-amber-900 font-mono font-bold text-[0.68rem] px-1.5 py-0.5 rounded border border-amber-200">
                    {lowestBidDetails.vehiclePlate}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-[0.68rem] font-medium">Bảo hiểm hàng hóa:</span>
                  <strong className="text-blue-600 font-bold">{lowestBidDetails.insuranceAmount}</strong>
                </div>
              </div>
            </div>

            {/* Assigned Driver & Quick Call */}
            <div className="flex items-center justify-between text-xs pt-1 px-1 text-slate-600 border-t border-slate-100/60">
              <div className="flex items-center gap-1.5">
                <LocalShippingIcon className="!text-[1rem] text-[#1B4965]" />
                <span>Tài xế: <strong className="text-slate-800">{lowestBidDetails.driverName}</strong></span>
              </div>
              <a href={`tel:${lowestBidDetails.driverPhone}`} className="flex items-center gap-1 hover:underline text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                <PhoneIcon className="!text-[0.85rem]" />
                <span className="font-mono">{lowestBidDetails.driverPhone}</span>
              </a>
            </div>
          </div>
        ) : (
          <div className="bg-white/80 p-6 rounded-2xl border border-emerald-100/50 text-center space-y-2">
            <Typography variant="body2" className="text-slate-400 font-medium">
              Chưa có nhà xe nào gửi báo giá cho lô hàng này.
            </Typography>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2">
          <Button
            fullWidth
            variant="contained"
            onClick={() => onOpenOtpDialog(lowestBidDetails)}
            disabled={lowestBidAmount === 0 || shipment.status === "completed" || shipment.status === "cancelled" || shipment.status === "shipping"}
            className="!rounded-2xl !py-3.5 !font-bold !capitalize shadow-lg shadow-emerald-500/10 hover:shadow-xl hover:-translate-y-0.5 transition-all"
            sx={{
              background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
              "&:hover": {
                background: "linear-gradient(135deg, #059669 0%, #10B981 100%)",
              },
            }}
          >
            {shipment.status === "completed" 
              ? "Đã Hoàn Thành Vận Chuyển" 
              : shipment.status === "shipping"
              ? "Đang Vận Chuyển"
              : shipment.status === "cancelled"
              ? "Đã Hủy Lô Hàng"
              : lowestBidAmount > 0 
              ? "Chốt thầu & Ký Hợp đồng với Nhà Xe Này" 
              : "Chờ báo giá từ nhà xe..."}
          </Button>

          {lowestBidDetails && (
            <Button
              fullWidth
              variant="outlined"
              size="small"
              onClick={() => onOpenCarrierModal(lowestBidDetails)}
              className="!rounded-xl !py-1.5 !font-bold !capitalize !text-[#1B4965] !border-slate-200 hover:!border-[#1B4965] hover:!bg-slate-50 transition-all !text-xs"
            >
              🔍 Xem Hồ Sơ Chi Tiết & Giấy Tờ Xác Thực Nhà Xe
            </Button>
          )}
        </div>

        {shipment.auctionType === "SEALED" && shipment.status === "active_bids" && (
          <Typography variant="caption" className="text-slate-500 text-center block mt-1 leading-normal font-medium bg-slate-50 p-2.5 rounded-xl border border-slate-150">
            💡 Đây là <strong>Đấu giá kín</strong>. Bạn có thể chốt thầu cho giá thấp nhất bằng nút phía trên, hoặc chủ động chọn nhà xe phù hợp nhất ở danh sách bên dưới.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
