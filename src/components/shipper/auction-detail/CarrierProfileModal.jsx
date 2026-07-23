"use client";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";

import CloseIcon from "@mui/icons-material/Close";
import StarIcon from "@mui/icons-material/Star";
import VerifiedIcon from "@mui/icons-material/Verified";
import InfoIcon from "@mui/icons-material/InfoOutlined";
import LocalShippingIcon from "@mui/icons-material/LocalShippingOutlined";
import PhoneIcon from "@mui/icons-material/PhoneInTalkOutlined";
import ShieldIcon from "@mui/icons-material/ShieldOutlined";
import BusinessIcon from "@mui/icons-material/BusinessOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedInOutlined";

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
      maxWidth="sm"
      fullWidth
      className="backdrop-blur-sm"
      PaperProps={{
        className: "!rounded-3xl !p-2",
      }}
    >
      <DialogTitle className="flex justify-between items-center !font-bold text-slate-800 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <BusinessIcon className="text-[#1B4965]" />
          <span>Hồ Sơ Năng Lực Chi Tiết Nhà Xe</span>
        </div>
        <IconButton size="small" onClick={onClose} className="text-slate-400">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent className="!py-4 space-y-5">
        {/* Carrier Header Card */}
        <div className="bg-gradient-to-br from-slate-900 to-[#1B4965] text-white p-5 rounded-2xl space-y-3 relative overflow-hidden shadow-md">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-2xl bg-white/10 text-white flex items-center justify-center font-black text-xl border border-white/20 shadow-inner">
                {carrier.avatar}
              </div>
              <div>
                <Typography variant="h6" className="!font-extrabold !text-white !leading-snug">
                  {carrier.carrierName}
                </Typography>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[0.7rem] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
                    <VerifiedIcon className="!text-[0.75rem]" /> {carrier.badge}
                  </span>
                  <span className="text-[0.7rem] text-slate-300">
                    Mã: <strong className="text-white font-mono">{carrier.code}</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center text-xs">
            <div className="bg-white/5 p-2 rounded-xl border border-white/5">
              <span className="text-slate-300 block text-[0.68rem]">Đánh giá tín nhiệm</span>
              <strong className="text-amber-400 text-sm font-bold flex items-center justify-center gap-0.5 mt-0.5">
                <StarIcon className="!text-[0.9rem]" /> {carrier.rating}
              </strong>
            </div>
            <div className="bg-white/5 p-2 rounded-xl border border-white/5">
              <span className="text-slate-300 block text-[0.68rem]">Số chuyến đã giao</span>
              <strong className="text-emerald-400 text-sm font-bold mt-0.5 block">
                {carrier.completedTrips}+
              </strong>
            </div>
            <div className="bg-white/5 p-2 rounded-xl border border-white/5">
              <span className="text-slate-300 block text-[0.68rem]">Tỉ lệ giao đúng giờ</span>
              <strong className="text-sky-300 text-sm font-bold mt-0.5 block">
                {carrier.onTimeRate}
              </strong>
            </div>
          </div>
        </div>

        {/* 1. Legal & Company Information */}
        <div className="space-y-2">
          <Typography className="!text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldIcon className="!text-[0.95rem] text-[#1B4965]" /> Thông tin Pháp lý & Doanh nghiệp
          </Typography>
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Mã số thuế doanh nghiệp:</span>
              <span className="font-mono font-bold text-slate-700">{carrier.taxCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Năm thành lập / Kinh nghiệm:</span>
              <span className="font-bold text-slate-700">Năm {carrier.foundingYear} ({carrier.experienceYears || "8 năm kinh nghiệm"})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Địa chỉ trụ sở chính:</span>
              <span className="font-bold text-slate-700 max-w-[260px] text-right">{carrier.address}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Quy mô đội xe:</span>
              <span className="font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">{carrier.fleetSize}</span>
            </div>
          </div>
        </div>

        {/* 2. Assigned Vehicle & Driver Info */}
        <div className="space-y-2">
          <Typography className="!text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <LocalShippingIcon className="!text-[0.95rem] text-emerald-600" /> Phương tiện & Tài xế điều động cho đơn này
          </Typography>
          <div className="bg-emerald-50/40 p-3.5 rounded-2xl border border-emerald-100 text-xs space-y-2.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block text-[0.68rem]">Loại xe điều động:</span>
                <strong className="text-slate-800 text-xs block font-bold mt-0.5">{carrier.vehicleType}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[0.68rem]">Biển số xe:</span>
                <span className="bg-amber-100 text-amber-900 font-mono font-bold text-xs px-2 py-0.5 rounded border border-amber-200 inline-block mt-0.5">
                  {carrier.vehiclePlate}
                </span>
              </div>
            </div>
            <div className="border-t border-emerald-100/60 pt-2 grid grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 block text-[0.68rem]">Tài xế phụ trách:</span>
                <strong className="text-slate-800 text-xs block font-bold mt-0.5">{carrier.driverName} ({carrier.driverLicense})</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[0.68rem]">Số điện thoại liên hệ:</span>
                <a href={`tel:${carrier.driverPhone}`} className="text-emerald-700 font-bold font-mono text-xs block mt-0.5 hover:underline">
                  {carrier.driverPhone}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Verification Certificates */}
        <div className="space-y-2">
          <Typography className="!text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <AssignmentTurnedInIcon className="!text-[0.95rem] text-blue-600" /> Hồ sơ xác thực & Chứng nhận bảo hiểm
          </Typography>
          <div className="grid grid-cols-2 gap-2 text-[0.72rem]">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center gap-2">
              <CheckCircleIcon className="text-emerald-500 !text-[1.1rem]" />
              <div>
                <span className="font-bold text-slate-700 block">Giấy phép kinh doanh</span>
                <span className="text-emerald-600 font-semibold text-[0.65rem]">🟢 Đã đối soát & xác thực</span>
              </div>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center gap-2">
              <CheckCircleIcon className="text-emerald-500 !text-[1.1rem]" />
              <div>
                <span className="font-bold text-slate-700 block">Bảo hiểm hàng hóa</span>
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
