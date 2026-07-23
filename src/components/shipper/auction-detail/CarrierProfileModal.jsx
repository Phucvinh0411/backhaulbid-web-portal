"use client";

import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import Link from "next/link";
import Chip from "@mui/material/Chip";

import CloseIcon from "@mui/icons-material/Close";
import StarIcon from "@mui/icons-material/Star";
import VerifiedIcon from "@mui/icons-material/Verified";
import LocalShippingIcon from "@mui/icons-material/LocalShippingOutlined";
import PhoneIcon from "@mui/icons-material/PhoneInTalkOutlined";
import ShieldIcon from "@mui/icons-material/ShieldOutlined";
import BusinessIcon from "@mui/icons-material/BusinessOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import AspectRatioIcon from "@mui/icons-material/AspectRatioOutlined";
import BadgeIcon from "@mui/icons-material/BadgeOutlined";
import GpsFixedIcon from "@mui/icons-material/GpsFixedOutlined";
import PersonIcon from "@mui/icons-material/PersonOutlined";

export default function CarrierProfileModal({
  open,
  onClose,
  carrier,
  shipmentStatus,
  onSelectCarrierAsWinner,
}) {
  if (!carrier) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      className="backdrop-blur-sm"
      PaperProps={{
        className: "!rounded-3xl !p-2",
      }}
    >
      <DialogTitle className="flex justify-between items-center !font-bold text-slate-800 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <BusinessIcon className="text-[#1B4965]" />
          <span>Hồ Sơ Năng Lực Chi Tiết Nhà Xe & Phương Tiện</span>
        </div>
        <IconButton size="small" onClick={onClose} className="text-slate-400">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent className="!py-4 space-y-5">
        {/* Carrier Banner Card */}
        <div className="bg-gradient-to-br from-slate-900 via-[#1B4965] to-[#0D2B3E] text-white p-5 rounded-2xl space-y-3 relative overflow-hidden shadow-md">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-white/10 text-white flex items-center justify-center font-black text-xl border border-white/20 shadow-inner">
                {carrier.avatar}
              </div>
              <div>
                <Typography variant="h6" className="!font-extrabold !text-white !leading-snug">
                  {carrier.carrierName}
                </Typography>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-[0.7rem] bg-emerald-500/20 text-emerald-300 font-bold px-2.5 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
                    <VerifiedIcon className="!text-[0.75rem]" /> {carrier.badge}
                  </span>
                  <span className="text-[0.7rem] text-slate-300">
                    Mã hệ thống: <strong className="text-white font-mono">{carrier.code}</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-3 border-t border-white/10 text-center text-xs">
            <div className="bg-white/5 p-2 rounded-xl border border-white/5">
              <span className="text-slate-300 block text-[0.65rem]">Tín nhiệm</span>
              <strong className="text-amber-400 text-sm font-bold flex items-center justify-center gap-0.5 mt-0.5">
                <StarIcon className="!text-[0.85rem]" /> {carrier.rating}
              </strong>
            </div>
            <div className="bg-white/5 p-2 rounded-xl border border-white/5">
              <span className="text-slate-300 block text-[0.65rem]">Chuyến hoàn thành</span>
              <strong className="text-emerald-400 text-sm font-bold mt-0.5 block">
                {carrier.completedTrips}+
              </strong>
            </div>
            <div className="bg-white/5 p-2 rounded-xl border border-white/5">
              <span className="text-slate-300 block text-[0.65rem]">Đúng giờ</span>
              <strong className="text-sky-300 text-sm font-bold mt-0.5 block">
                {carrier.onTimeRate}
              </strong>
            </div>
            <div className="bg-white/5 p-2 rounded-xl border border-white/5">
              <span className="text-slate-300 block text-[0.65rem]">Tỷ lệ hủy chuyến</span>
              <strong className="text-emerald-300 text-sm font-bold mt-0.5 block">
                {carrier.cancellationRate || "0.2%"}
              </strong>
            </div>
          </div>
        </div>

        {/* 1. Detailed Vehicle Specifications */}
        <div className="space-y-2">
          <Typography className="!text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <LocalShippingIcon className="!text-[0.95rem] text-[#1B4965]" /> 1. Thông số chi tiết phương tiện điều động
          </Typography>
          
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 block text-[0.68rem] font-medium">Loại xe điều động:</span>
                <strong className="text-slate-800 text-sm font-bold block mt-0.5">{carrier.vehicleType}</strong>
                <span className="text-[0.68rem] text-slate-500 block mt-0.5">Dòng xe: {carrier.vehicleBrand || "Hino 500 Series (2024)"}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[0.68rem] font-medium">Biển số đăng ký (Biển vàng):</span>
                <span className="bg-amber-100 text-amber-900 font-mono font-bold text-xs px-2.5 py-1 rounded border border-amber-200 inline-block mt-0.5">
                  {carrier.vehiclePlate}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 border-t border-slate-200/70 pt-3">
              <div className="bg-white p-2.5 rounded-xl border border-slate-150">
                <span className="text-slate-400 block text-[0.65rem] font-medium flex items-center gap-1">
                  <AspectRatioIcon className="!text-[0.75rem] text-[#1B4965]" /> Kích thước thùng xe:
                </span>
                <strong className="text-[#1B4965] font-bold text-xs font-mono block mt-1">
                  {carrier.vehicleDims || "6.8m x 2.2m x 2.3m"}
                </strong>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-150">
                <span className="text-slate-400 block text-[0.65rem] font-medium">Thể tích chứa hàng:</span>
                <strong className="text-slate-800 font-bold text-xs block mt-1">
                  {carrier.vehicleVolume || "34.4 m³"}
                </strong>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-150">
                <span className="text-slate-400 block text-[0.65rem] font-medium">Tải trọng cho phép:</span>
                <strong className="text-slate-800 font-bold text-xs block mt-1">
                  {carrier.vehiclePayload || "8.5 Tấn"}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Driver Credentials */}
        <div className="space-y-2">
          <Typography className="!text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <PersonIcon className="!text-[0.95rem] text-emerald-600" /> 2. Thông tin tài xế phụ trách
          </Typography>

          <div className="bg-emerald-50/30 p-4 rounded-2xl border border-emerald-100 text-xs">
            <div className="grid grid-cols-2 gap-4 items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-base border border-emerald-200">
                  <BadgeIcon />
                </div>
                <div>
                  <strong className="text-slate-800 text-sm font-bold block">{carrier.driverName}</strong>
                  <span className="text-[0.7rem] text-slate-500 block">
                    Năm sinh: <strong className="text-slate-700">{carrier.driverBirthYear || "1986"}</strong> • Bằng lái: <strong className="text-emerald-700">{carrier.driverLicense || "Bằng FC"}</strong>
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[0.68rem] font-medium">Số điện thoại liên hệ:</span>
                <a href={`tel:${carrier.driverPhone}`} className="text-emerald-700 font-bold font-mono text-sm inline-flex items-center gap-1 mt-0.5 hover:underline bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-xs">
                  <PhoneIcon className="!text-[0.85rem]" /> {carrier.driverPhone}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Legal & Company Enterprise Profile */}
        <div className="space-y-2">
          <Typography className="!text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldIcon className="!text-[0.95rem] text-[#1B4965]" /> 3. Pháp lý doanh nghiệp & Bảo hiểm
          </Typography>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Mã số thuế doanh nghiệp:</span>
              <span className="font-mono font-bold text-slate-700">{carrier.taxCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Giấy phép kinh doanh vận tải:</span>
              <span className="font-mono font-bold text-slate-700">Số GP-VT/2022-881 (Cấp bởi Sở GTVT)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Năm thành lập doanh nghiệp:</span>
              <span className="font-bold text-slate-700">Năm {carrier.foundingYear}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Địa chỉ trụ sở chính:</span>
              <span className="font-bold text-slate-700 max-w-[280px] text-right">{carrier.address}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[0.72rem] pt-1">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150 flex items-center gap-2">
              <CheckCircleIcon className="text-emerald-500 !text-[1.1rem]" />
              <div>
                <span className="font-bold text-slate-700 block">Giấy phép ĐKKD & Vận tải</span>
                <span className="text-emerald-600 font-semibold text-[0.65rem]">🟢 Đã xác minh chính chủ</span>
              </div>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150 flex items-center gap-2">
              <CheckCircleIcon className="text-emerald-500 !text-[1.1rem]" />
              <div>
                <span className="font-bold text-slate-700 block">Bảo hiểm trách nhiệm hàng hóa</span>
                <span className="text-blue-600 font-bold text-[0.68rem]">{carrier.insuranceAmount}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>

      <DialogActions className="!px-6 !pb-4 flex justify-between gap-3 border-t border-slate-100 pt-3">
        <Button
          variant="outlined"
          href={`tel:${carrier.driverPhone}`}
          startIcon={<PhoneIcon />}
          className="!text-emerald-700 !border-emerald-300 hover:!bg-emerald-50 !font-bold !capitalize !rounded-xl !text-xs"
        >
          Gọi hotline nhà xe
        </Button>
        <div className="flex gap-2">
          <Link href={`/shipper/carriers/${carrier.code}`} passHref legacyBehavior>
            <Button
              component="a"
              variant="outlined"
              onClick={onClose}
              className="!text-[#1B4965] !border-slate-300 hover:!bg-slate-50 !font-bold !capitalize !rounded-xl !text-xs"
            >
              Mở trang chi tiết riêng ↗
            </Button>
          </Link>
          <Button
            onClick={onClose}
            variant="text"
            className="!text-slate-500 !font-bold !capitalize !rounded-xl !text-xs"
          >
            Đóng
          </Button>
          {shipmentStatus === "active_bids" && (
            <Button
              onClick={() => {
                onClose();
                onSelectCarrierAsWinner(carrier);
              }}
              variant="contained"
              className="!font-bold !capitalize !rounded-xl !px-4 !text-xs"
              sx={{
                background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
              }}
            >
              Chốt thầu nhà xe này
            </Button>
          )}
        </div>
      </DialogActions>
    </Dialog>
  );
}
