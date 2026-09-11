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

import {
  formatAuctionCurrency,
  formatAuctionDateTime,
} from "@/services/shipperAuctionMapper";

function VehicleInfoRow({ icon, label, value, valueClass = "" }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-slate-100 last:border-0">
      <span className="text-slate-500 font-medium flex items-center gap-2 text-[0.76rem]">
        <span className="text-[#1B4965] flex items-center">{icon}</span>
        {label}
      </span>
      <strong className={`text-[0.78rem] font-bold text-right ${valueClass || "text-slate-800"}`}>{value}</strong>
    </div>
  );
}

export default function LowestBidCard({
  shipment,
  lowestBidDetails,
  lowestBidAmount,
  isDisplayedBidLowest = true,
  onOpenOtpDialog,
  onOpenCarrierModal,
}) {
  const isSealed = shipment.auctionType === "SEALED";
  const savings = Math.max(0, Number(shipment.maxPrice || 0) - Number(lowestBidAmount || 0));
  const savingsPct = shipment.maxPrice > 0 ? ((savings / shipment.maxPrice) * 100).toFixed(1) : 0;
  const vehicleCapacity = [lowestBidDetails?.vehicleVolume, lowestBidDetails?.vehiclePayload]
    .filter(Boolean)
    .join(" · ");
  const driverLabel = [
    lowestBidDetails?.driverName,
    lowestBidDetails?.driverBirthYear ? `NS: ${lowestBidDetails.driverBirthYear}` : null,
    lowestBidDetails?.driverLicense,
  ]
    .filter(Boolean)
    .join(" · ");
  const hasOperationalDetails = Boolean(
    lowestBidDetails?.vehiclePlate ||
      lowestBidDetails?.vehicleType ||
      lowestBidDetails?.vehicleDims ||
      vehicleCapacity ||
      lowestBidDetails?.insuranceAmount ||
      driverLabel,
  );

  return (
    <Card
      className="!rounded-3xl border flex-1 relative overflow-hidden transition-all shadow-sm hover:shadow-md"
      sx={{
        borderColor: isSealed ? "#FDE68A" : "#A7F3D0",
        background: isSealed
          ? "linear-gradient(175deg, #FFFBEB 0%, #FFFFFF 100%)"
          : "linear-gradient(175deg, #FFFFFF 0%, #F0FDF4 100%)",
      }}
    >
      <div
        className={`absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl pointer-events-none opacity-40 ${
          isSealed ? "bg-amber-300" : "bg-emerald-300"
        }`}
      />

      <CardContent className="!p-5 flex flex-col gap-4 relative z-10">
        <div className="flex items-center justify-between">
          <div
            className={`inline-flex items-center gap-1.5 text-[0.68rem] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full border ${
              isDisplayedBidLowest
                ? isSealed
                  ? "bg-amber-100 text-amber-800 border-amber-200"
                  : "bg-emerald-100 text-emerald-800 border-emerald-200"
                : "bg-blue-100 text-blue-800 border-blue-200"
            }`}
          >
            {isDisplayedBidLowest ? (
              isSealed ? <LockIcon className="!text-[0.85rem]" /> : <GavelIcon className="!text-[0.85rem]" />
            ) : (
              <PersonIcon className="!text-[0.85rem]" />
            )}
            {isDisplayedBidLowest
              ? isSealed
                ? "Báo giá thấp nhất"
                : "Báo giá thấp nhất hiện tại"
              : "Báo giá nhà xe được chọn"}
          </div>
          {lowestBidDetails?.time && (
            <span className="text-[0.68rem] text-slate-400 flex items-center gap-1 font-medium">
              <AccessTimeIcon className="!text-[0.8rem]" />
              {formatAuctionDateTime(lowestBidDetails.time)}
            </span>
          )}
        </div>

        <div className="flex items-end justify-between gap-3">
          <Typography
            variant="h3"
            className={`!font-black tracking-tight !text-3xl md:!text-4xl ${
              isSealed ? "text-amber-600" : "text-emerald-600"
            }`}
          >
            {lowestBidAmount > 0 ? formatAuctionCurrency(lowestBidAmount) : "Chờ báo giá..."}
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
                -{formatAuctionCurrency(savings)} ({savingsPct}%)
              </span>
            </div>
          )}
        </div>

        {lowestBidDetails ? (
          <div className="bg-white/95 rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:border-slate-300 transition-all">
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
                  <span className="font-bold text-amber-600">{lowestBidDetails.rating || "Chưa cập nhật"}</span>
                  {lowestBidDetails.completedTrips && (
                    <>
                      <span className="text-slate-300">·</span>
                      <span>{lowestBidDetails.completedTrips} chuyến</span>
                    </>
                  )}
                  {lowestBidDetails.onTimeRate && (
                    <>
                      <span className="text-slate-300">·</span>
                      <span className="text-emerald-600 font-bold">{lowestBidDetails.onTimeRate} đúng giờ</span>
                    </>
                  )}
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

            {hasOperationalDetails ? (
              <div className="px-4 py-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[0.67rem] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                    <LocalShippingIcon className="!text-[0.8rem] text-[#1B4965]" /> Phương tiện điều động
                  </span>
                  {lowestBidDetails.vehiclePlate && (
                    <span className="bg-amber-100 text-amber-900 font-mono font-bold text-[0.67rem] px-2 py-0.5 rounded border border-amber-200">
                      {lowestBidDetails.vehiclePlate}
                    </span>
                  )}
                </div>
                <VehicleInfoRow icon={<LocalShippingIcon className="!text-[0.85rem]" />} label="Loại xe:" value={lowestBidDetails.vehicleType} />
                <VehicleInfoRow icon={<AspectRatioIcon className="!text-[0.85rem]" />} label="Kích thước thùng:" value={lowestBidDetails.vehicleDims} valueClass="text-[#1B4965] font-mono" />
                <VehicleInfoRow icon={<InboxIcon className="!text-[0.85rem]" />} label="Thể tích & tải trọng:" value={vehicleCapacity} />
                <VehicleInfoRow icon={<ShieldIcon className="!text-[0.85rem] !text-blue-600" />} label="Bảo hiểm hàng hóa:" value={lowestBidDetails.insuranceAmount} valueClass="text-blue-600" />
                <VehicleInfoRow icon={<PersonIcon className="!text-[0.85rem]" />} label="Tài xế:" value={driverLabel} />
              </div>
            ) : (
              <div className="px-4 py-3 text-[0.72rem] font-medium text-slate-500">
                Thông tin xe, tài xế và bảo hiểm sẽ hiển thị khi nhà xe cập nhật hồ sơ năng lực.
              </div>
            )}

            {lowestBidDetails.driverPhone && (
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
            )}
          </div>
        ) : (
          <div className="bg-white/80 rounded-2xl border border-slate-100 p-6 text-center text-slate-400 text-sm">
            <GavelIcon className="!text-3xl mb-2 opacity-20" />
            <p className="text-xs font-medium">Chưa có nhà xe nào báo giá.</p>
          </div>
        )}

        <div className="space-y-2">
          {isSealed ? (
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
                "&:hover": { background: "linear-gradient(135deg, #D97706 0%, #B45309 100%)" },
              }}
            >
              {shipment.status === "completed"
                ? "Đã hoàn thành vận chuyển"
                : shipment.status === "shipping"
                  ? "Đang vận chuyển..."
                  : shipment.status === "cancelled"
                    ? "Đã hủy lô hàng"
                    : lowestBidAmount > 0
                      ? "Chốt thầu & ký hợp đồng"
                      : "Đang chờ báo giá từ nhà xe..."}
            </Button>
          ) : (
            <div
              className={`w-full rounded-2xl py-3 px-4 text-center text-[0.78rem] font-bold border ${
                lowestBidAmount > 0
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-slate-50 border-slate-200 text-slate-500"
              }`}
            >
              {shipment.status === "completed"
                ? "Đã hoàn thành, nhà xe thấp nhất đã trúng thầu"
                : shipment.status === "shipping"
                  ? "Đang vận chuyển..."
                  : shipment.status === "cancelled"
                    ? "Đã hủy"
                    : lowestBidAmount > 0
                      ? "Hệ thống sẽ tự động chọn nhà xe này khi đóng thầu"
                      : "Đang chờ báo giá..."}
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

        <div
          className={`text-[0.7rem] leading-relaxed font-medium p-3 rounded-xl border ${
            isSealed ? "bg-amber-50/80 border-amber-100 text-amber-800" : "bg-sky-50/80 border-sky-100 text-sky-800"
          }`}
        >
          {isSealed ? (
            <>
              <span className="flex items-center gap-1 font-extrabold mb-0.5">
                <LockIcon className="!text-[0.8rem]" /> Đấu giá kín
              </span>
              Nhà xe không thấy giá của nhau. Sau khi đóng thầu, chủ hàng xem danh sách xếp hạng theo giá và uy tín để chọn người thắng.
            </>
          ) : (
            <>
              <span className="flex items-center gap-1 font-extrabold mb-0.5">
                <PublicIcon className="!text-[0.8rem]" /> Đấu giá công khai
              </span>
              Nhà xe thấy giá của nhau và liên tục điều chỉnh giảm giá để dành thầu.
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
