"use client";

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
import AspectRatioIcon from "@mui/icons-material/AspectRatioOutlined";
import ShieldIcon from "@mui/icons-material/ShieldOutlined";
import PersonIcon from "@mui/icons-material/PersonOutlined";
import InboxIcon from "@mui/icons-material/InboxOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import LockIcon from "@mui/icons-material/LockOutlined";
import PublicIcon from "@mui/icons-material/PublicOutlined";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

import { formatCurrency } from "./mockData";

function VehicleInfoRow({ icon, label, value, valueClass = "" }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
      <span className="text-slate-500 font-medium flex items-center gap-2 text-[0.76rem]">
        <span className="text-[#1B4965] flex items-center">{icon}</span>
        {label}
      </span>
      <strong className={`text-[0.78rem] font-bold ${valueClass || "text-slate-800"}`}>{value}</strong>
    </div>
  );
}

export default function LowestBidCard({
  shipment,
  lowestBidDetails,
  lowestBidAmount,
  onOpenOtpDialog,
  onOpenCarrierModal,
}) {
  const isSealed = shipment.auctionType === "SEALED";
  const savings = shipment.maxPrice - lowestBidAmount;
  const savingsPct = shipment.maxPrice > 0 ? ((savings / shipment.maxPrice) * 100).toFixed(1) : 0;

  return (
    <Card
      className="!rounded-3xl border flex-1 relative overflow-hidden transition-all shadow-sm hover:shadow-md"
      sx={{
        borderColor: isSealed ? "#FDE68A" : "#A7F3D0",
        background: isSealed
          ? "linear-gradient(175deg, #FFFBEB 0%, #FFFFF 100%)"
          : "linear-gradient(175deg, #FFFFFF 0%, #F0FDF4 100%)",
      }}
    >
      {/* Ambient glow */}
      <div
        className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl pointer-events-none opacity-40 ${
          isSealed ? "bg-amber-300" : "bg-emerald-300"
        }`}
      />

      <CardContent className="!p-5 flex flex-col gap-4 relative z-10">
        {/* Badge header */}
        <div className="flex items-center justify-between">
          <div
            className={`inline-flex items-center gap-1.5 text-[0.68rem] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border ${
              isSealed
                ? "bg-amber-100 text-amber-800 border-amber-200"
                : "bg-emerald-100 text-emerald-800 border-emerald-200"
            }`}
          >
            {isSealed ? (
              <LockIcon className="!text-[0.85rem]" />
            ) : (
              <GavelIcon className="!text-[0.85rem]" />
            )}
            {isSealed ? "Báo giá thấp nhất (Ẩn danh)" : "Báo giá thấp nhất hiện tại"}
          </div>
          {lowestBidDetails && (
            <span className="text-[0.68rem] text-slate-400 flex items-center gap-1 font-medium">
              <AccessTimeIcon className="!text-[0.8rem]" />
              {lowestBidDetails.time}
            </span>
          )}
        </div>

        {/* Price hero row */}
        <div className="flex items-end justify-between">
          <Typography
            variant="h3"
            className={`!font-black tracking-tight !text-3xl md:!text-4xl ${
              isSealed ? "text-amber-600" : "text-emerald-600"
            }`}
          >
            {lowestBidAmount > 0 ? formatCurrency(lowestBidAmount) : "Chờ báo giá..."}
          </Typography>

          {lowestBidAmount > 0 && (
            <div className="text-right pb-1">
              <span className="text-[0.65rem] text-slate-400 block">Tiết kiệm so với giá trần</span>
              <span
                className={`text-xs font-extrabold px-2.5 py-1 rounded-xl border inline-block mt-0.5 font-mono ${
                  isSealed
                    ? "bg-amber-100 text-amber-700 border-amber-200"
                    : "bg-emerald-100 text-emerald-700 border-emerald-200"
                }`}
              >
                -{formatCurrency(savings)} ({savingsPct}%)
              </span>
            </div>
          )}
        </div>

        {/* Carrier detail card */}
        {lowestBidDetails ? (
          <div className="bg-white/95 rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:border-slate-300 transition-all">
            {/* Carrier header */}
            <div className="flex items-center gap-3 p-3.5 border-b border-slate-100">
              <div
                onClick={() => onOpenCarrierModal(lowestBidDetails)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-xs text-white cursor-pointer hover:scale-105 transition-transform shadow-xs border ${
                  isSealed
                    ? "bg-gradient-to-br from-amber-500 to-orange-600 border-amber-300"
                    : "bg-gradient-to-br from-emerald-500 to-teal-600 border-emerald-300"
                }`}
              >
                <EmojiEventsIcon className="!text-[1.2rem]" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Typography
                    onClick={() => onOpenCarrierModal(lowestBidDetails)}
                    className="!font-bold text-slate-800 text-sm hover:text-[#1B4965] transition-colors cursor-pointer truncate"
                  >
                    {lowestBidDetails.carrierName}
                  </Typography>
                  <Chip
                    icon={<VerifiedIcon className="!text-[0.75rem] !text-sky-500" />}
                    label="B2B"
                    size="small"
                    className="!h-4.5 !text-[0.6rem] !font-bold !bg-sky-50 !text-sky-700 border border-sky-100"
                  />
                </div>
                <div className="flex items-center gap-1.5 mt-0.5 text-[0.68rem] text-slate-500">
                  <StarIcon className="!text-[0.75rem] text-amber-400" />
                  <span className="font-bold text-amber-600">{lowestBidDetails.rating}</span>
                  <span className="text-slate-300">·</span>
                  <span>{lowestBidDetails.completedTrips} chuyến</span>
                  <span className="text-slate-300">·</span>
                  <span className="text-emerald-600 font-bold">{lowestBidDetails.onTimeRate} đúng giờ</span>
                </div>
              </div>

              <IconButton
                size="small"
                onClick={() => onOpenCarrierModal(lowestBidDetails)}
                className="!bg-slate-50 hover:!bg-slate-100 !border !border-slate-200 shrink-0"
                title="Xem hồ sơ nhà xe"
              >
                <InfoIcon className="!text-[1rem] text-slate-400 hover:text-[#1B4965]" />
              </IconButton>
            </div>

            {/* Vehicle specs */}
            <div className="px-4 py-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[0.67rem] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <LocalShippingIcon className="!text-[0.8rem] text-[#1B4965]" /> Phương tiện điều động
                </span>
                <span className="bg-amber-100 text-amber-900 font-mono font-bold text-[0.67rem] px-2 py-0.5 rounded border border-amber-200">
                  {lowestBidDetails.vehiclePlate}
                </span>
              </div>

              <VehicleInfoRow
                icon={<LocalShippingIcon className="!text-[0.85rem]" />}
                label="Loại xe:"
                value={lowestBidDetails.vehicleType}
              />
              <VehicleInfoRow
                icon={<AspectRatioIcon className="!text-[0.85rem]" />}
                label="Kích thước thùng:"
                value={lowestBidDetails.vehicleDims}
                valueClass="text-[#1B4965] font-mono"
              />
              <VehicleInfoRow
                icon={<InboxIcon className="!text-[0.85rem]" />}
                label="Thể tích & Tải trọng:"
                value={`${lowestBidDetails.vehicleVolume} (${lowestBidDetails.vehiclePayload})`}
              />
              <VehicleInfoRow
                icon={<ShieldIcon className="!text-[0.85rem] !text-blue-600" />}
                label="Bảo hiểm hàng hóa:"
                value={lowestBidDetails.insuranceAmount}
                valueClass="text-blue-600"
              />
              <VehicleInfoRow
                icon={<PersonIcon className="!text-[0.85rem]" />}
                label="Tài xế:"
                value={`${lowestBidDetails.driverName} (NS: ${lowestBidDetails.driverBirthYear} · ${lowestBidDetails.driverLicense})`}
              />
            </div>

            {/* Quick phone contact */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50/80 border-t border-slate-100">
              <span className="text-[0.68rem] text-slate-500">Hotline tài xế:</span>
              <a
                href={`tel:${lowestBidDetails.driverPhone}`}
                className={`flex items-center gap-1 font-bold text-[0.72rem] px-2.5 py-1 rounded-lg border font-mono transition-all ${
                  isSealed
                    ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                }`}
              >
                <PhoneIcon className="!text-[0.8rem]" />
                {lowestBidDetails.driverPhone}
              </a>
            </div>
          </div>
        ) : (
          <div className="bg-white/80 rounded-2xl border border-slate-100 p-6 text-center text-slate-400 text-sm">
            <GavelIcon className="!text-3xl mb-2 opacity-20" />
            <p className="text-xs font-medium">Chưa có nhà xe nào báo giá.</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-2">
          {isSealed ? (
            // SEALED: shipper manually selects winner
            <Button
              fullWidth
              variant="contained"
              onClick={() => onOpenOtpDialog(lowestBidDetails)}
              disabled={
                lowestBidAmount === 0 ||
                shipment.status === "completed" ||
                shipment.status === "cancelled" ||
                shipment.status === "shipping"
              }
              className="!rounded-2xl !py-3 !font-bold !capitalize !text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
              sx={{
                background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
                "&:hover": {
                  background: "linear-gradient(135deg, #D97706 0%, #B45309 100%)",
                },
              }}
            >
              {shipment.status === "completed"
                ? "Đã hoàn thành vận chuyển"
                : shipment.status === "shipping"
                ? "Đang vận chuyển..."
                : shipment.status === "cancelled"
                ? "✗ Đã hủy lô hàng"
                : lowestBidAmount > 0
                ? "Chốt Thầu & Ký Hợp Đồng"
                : "Đang chờ báo giá từ nhà xe..."}
            </Button>
          ) : (
            // PUBLIC: auto-select lowest bidder, no manual button
            <div
              className={`w-full rounded-2xl py-3 px-4 text-center text-[0.78rem] font-bold border ${
                lowestBidAmount > 0
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-slate-50 border-slate-200 text-slate-500"
              }`}
            >
              {shipment.status === "completed"
                ? "✓ Đã hoàn thành — Nhà xe thấp nhất đã trúng thầu"
                : shipment.status === "shipping"
                ? "Đang vận chuyển..."
                : shipment.status === "cancelled"
                ? "Đã hủy"
                : lowestBidAmount > 0
                ? "Hệ thống sẽ tự động chọn nhà xe này khi đóng thầu"
                : "Đang chờ báo giá..."
              }
            </div>
          )}

          {lowestBidDetails && (
            <Button
              fullWidth
              variant="outlined"
              size="small"
              onClick={() => onOpenCarrierModal(lowestBidDetails)}
              className="!rounded-xl !py-2 !font-semibold !capitalize !text-[#1B4965] !border-slate-200 hover:!border-[#1B4965] hover:!bg-slate-50 transition-all !text-xs"
              endIcon={<ArrowForwardIcon className="!text-[0.9rem]" />}
            >
              Xem hồ sơ năng lực đầy đủ của nhà xe
            </Button>
          )}
        </div>

        {/* Auction type explanation note */}
        <div
          className={`text-[0.7rem] leading-relaxed font-medium p-3 rounded-xl border ${
            isSealed
              ? "bg-amber-50/80 border-amber-100 text-amber-800"
              : "bg-sky-50/80 border-sky-100 text-sky-800"
          }`}
        >
          {isSealed ? (
            <>
              <span className="flex items-center gap-1 font-extrabold mb-0.5">
                <LockIcon className="!text-[0.8rem]" /> Đấu giá kín: Bid ẩn danh
              </span>
              Nhà xe <strong>không thấy giá của nhau</strong>. Sau khi đóng thầu, chủ hàng xem danh sách xếp hạng theo giá và uy tín để chọn người thắng.
            </>
          ) : (
            <>
              <span className="flex items-center gap-1 font-extrabold mb-0.5">
                <PublicIcon className="!text-[0.8rem]" /> Đấu giá công khai: Cạnh tranh thời gian thực
              </span>
              Nhà xe <strong>thấy giá của nhau</strong> và liên tục điều chỉnh giảm giá để dành thầu.
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
