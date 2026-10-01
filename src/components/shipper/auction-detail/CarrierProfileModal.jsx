"use client";

import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Link from "next/link";

import CloseIcon from "@mui/icons-material/Close";
import StarIcon from "@mui/icons-material/Star";
import VerifiedIcon from "@mui/icons-material/Verified";
import LocalShippingIcon from "@mui/icons-material/LocalShippingOutlined";
import PhoneIcon from "@mui/icons-material/PhoneInTalkOutlined";
import ShieldIcon from "@mui/icons-material/ShieldOutlined";
import BusinessIcon from "@mui/icons-material/BusinessOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import AspectRatioIcon from "@mui/icons-material/AspectRatioOutlined";
import BadgeIcon from "@mui/icons-material/BadgeOutlined";
import PersonIcon from "@mui/icons-material/PersonOutlined";

export default function CarrierProfileModal({
  open,
  onClose,
  carrier,
  loading = false,
  shipmentStatus,
  onSelectCarrierAsWinner,
}) {
  if (!carrier && !loading) return null;

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
          <span>Hồ Sơ Năng Lực Chi Tiết Nhà Xe &amp; Phương Tiện</span>
        </div>
        <div className="flex items-center gap-2">
          {loading && <CircularProgress size={16} className="!text-[#1B4965]" />}
          <IconButton size="small" onClick={onClose} className="text-slate-400">
            <CloseIcon />
          </IconButton>
        </div>
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

        {/* 1. Đội xe đăng ký */}
        <div className="space-y-2">
          <Typography className="!text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <LocalShippingIcon className="!text-[0.95rem] text-[#1B4965]" /> 1. Đội xe đăng ký tham gia
          </Typography>

          {carrier?.fleet?.length > 0 ? (
            <div className="space-y-2">
              {carrier.fleet.map((vehicle, idx) => (
                <div key={vehicle.id || idx} className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-xs">
                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <div>
                      <span className="text-slate-400 block text-[0.68rem] font-medium">Loại xe:</span>
                      <strong className="text-slate-800 text-sm font-bold block mt-0.5">
                        {vehicle.type || "Chưa cập nhật"}
                      </strong>
                      {vehicle.brand && vehicle.brand !== "Chưa cập nhật" && (
                        <span className="text-[0.68rem] text-slate-500 block mt-0.5">Thân xe: {vehicle.brand}</span>
                      )}
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[0.68rem] font-medium">Biển số đăng ký:</span>
                      <span className="bg-amber-100 text-amber-900 font-mono font-bold text-xs px-2.5 py-1 rounded border border-amber-200 inline-block mt-0.5">
                        {vehicle.plate || "Chưa cập nhật"}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 border-t border-slate-200/70 pt-2.5">
                    <div className="bg-white p-2 rounded-xl border border-slate-150">
                      <span className="text-slate-400 block text-[0.65rem] font-medium flex items-center gap-1">
                        <AspectRatioIcon className="!text-[0.75rem] text-[#1B4965]" /> Tải trọng:
                      </span>
                      <strong className="text-[#1B4965] font-bold text-xs font-mono block mt-1">
                        {vehicle.payload || "Chưa cập nhật"}
                      </strong>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-150">
                      <span className="text-slate-400 block text-[0.65rem] font-medium">Kích thước thùng:</span>
                      <strong className="text-slate-800 font-bold text-xs block mt-1">
                        {vehicle.dims || "Chưa cập nhật"}
                      </strong>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-150">
                      <span className="text-slate-400 block text-[0.65rem] font-medium">Trạng thái:</span>
                      <strong className={`text-xs block mt-1 font-bold ${vehicle.status === "VERIFIED" ? "text-emerald-600" : "text-amber-600"}`}>
                        {vehicle.status === "VERIFIED" ? "✅ Đã duyệt" : vehicle.status === "PENDING" ? "⏳ Chờ duyệt" : (vehicle.status || "Chưa cập nhật")}
                      </strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs text-slate-400 text-center">
              {loading ? "Đang tải thông tin phương tiện..." : "Chưa có thông tin phương tiện"}
            </div>
          )}
        </div>

        {/* 2. Tài xế phụ trách */}
        <div className="space-y-2">
          <Typography className="!text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <PersonIcon className="!text-[0.95rem] text-emerald-600" /> 2. Tài xế đăng ký
          </Typography>

          {carrier?.drivers?.length > 0 ? (
            <div className="space-y-2">
              {carrier.drivers.map((driver, idx) => (
                <div key={driver.id || idx} className="bg-emerald-50/30 p-3.5 rounded-2xl border border-emerald-100 text-xs">
                  <div className="grid grid-cols-2 gap-4 items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-base border border-emerald-200">
                        <BadgeIcon />
                      </div>
                      <div>
                        <strong className="text-slate-800 text-sm font-bold block">{driver.name || "Chưa cập nhật"}</strong>
                        <span className="text-[0.7rem] text-slate-500 block">
                          {driver.birthYear && driver.birthYear !== "Chưa cập nhật" && <>Năm sinh: <strong className="text-slate-700">{driver.birthYear}</strong> • </>}
                          Bằng lái: <strong className="text-emerald-700">{driver.license || "Chưa cập nhật"}</strong>
                        </span>
                        <span className={`text-[0.65rem] font-semibold ${driver.safetyRecord === "Đã xác thực" ? "text-emerald-600" : "text-amber-600"}`}>
                          {driver.safetyRecord || "Chưa cập nhật"}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      {driver.phone && driver.phone !== "Chưa cập nhật" ? (
                        <a href={`tel:${driver.phone}`} className="text-emerald-700 font-bold font-mono text-sm inline-flex items-center gap-1 mt-0.5 hover:underline bg-white px-2.5 py-1 rounded-lg border border-emerald-200 shadow-xs">
                          <PhoneIcon className="!text-[0.85rem]" /> {driver.phone}
                        </a>
                      ) : (
                        <span className="text-slate-400 text-[0.7rem]">Chưa có SĐT</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-emerald-50/30 p-4 rounded-2xl border border-emerald-100 text-xs text-slate-400 text-center">
              {loading ? "Đang tải thông tin tài xế..." : "Chưa có thông tin tài xế"}
            </div>
          )}
        </div>

        {/* 3. Pháp lý doanh nghiệp & Bảo hiểm */}
        <div className="space-y-2">
          <Typography className="!text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldIcon className="!text-[0.95rem] text-[#1B4965]" /> 3. Pháp lý doanh nghiệp &amp; Liên hệ
          </Typography>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs space-y-2">
            {carrier.taxCode && carrier.taxCode !== "Chưa cập nhật" && (
              <div className="flex justify-between">
                <span className="text-slate-400">Mã số thuế doanh nghiệp:</span>
                <span className="font-mono font-bold text-slate-700">{carrier.taxCode}</span>
              </div>
            )}
            {carrier.representative && carrier.representative !== "Chưa cập nhật" && (
              <div className="flex justify-between">
                <span className="text-slate-400">Người đại diện pháp lý:</span>
                <span className="font-bold text-slate-700">{carrier.representative}</span>
              </div>
            )}
            {carrier.address && carrier.address !== "Chưa cập nhật" && (
              <div className="flex justify-between">
                <span className="text-slate-400">Địa chỉ trụ sở chính:</span>
                <span className="font-bold text-slate-700 max-w-[280px] text-right">{carrier.address}</span>
              </div>
            )}
            {carrier.email && carrier.email !== "Chưa cập nhật" && (
              <div className="flex justify-between">
                <span className="text-slate-400">Email liên hệ:</span>
                <span className="font-bold text-sky-700">{carrier.email}</span>
              </div>
            )}
            {carrier.hotline && carrier.hotline !== "Chưa cập nhật" && (
              <div className="flex justify-between">
                <span className="text-slate-400">Hotline:</span>
                <a href={`tel:${carrier.hotline}`} className="font-mono font-bold text-emerald-700 hover:underline">{carrier.hotline}</a>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-[0.72rem] pt-1">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150 flex items-center gap-2">
              <CheckCircleIcon className={`!text-[1.1rem] ${carrier.verified ? "text-emerald-500" : "text-amber-400"}`} />
              <div>
                <span className="font-bold text-slate-700 block">Xác minh doanh nghiệp</span>
                <span className={`font-semibold text-[0.65rem] ${carrier.verified ? "text-emerald-600" : "text-amber-600"}`}>
                  {carrier.verified ? "🟢 Đã xác minh chính chủ" : "🟡 Chưa hoàn tất xác minh"}
                </span>
              </div>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-150 flex items-center gap-2">
              <CheckCircleIcon className="text-emerald-500 !text-[1.1rem]" />
              <div>
                <span className="font-bold text-slate-700 block">Đăng ký hệ thống</span>
                <span className="text-sky-600 font-bold text-[0.68rem]">Mã: {carrier.code || "Chưa có mã"}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>

      <DialogActions className="!px-6 !pb-4 flex justify-between gap-3 border-t border-slate-100 pt-3">
        {(carrier.hotline && carrier.hotline !== "Chưa cập nhật") ? (
          <Button
            variant="outlined"
            href={`tel:${carrier.hotline}`}
            startIcon={<PhoneIcon />}
            className="!text-emerald-700 !border-emerald-300 hover:!bg-emerald-50 !font-bold !capitalize !rounded-xl !text-xs"
          >
            Gọi hotline nhà xe
          </Button>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          {carrier.code && carrier.code !== "Chưa cập nhật" && (
            <Button
              component={Link}
              href={`/shipper/carriers/${carrier.code}`}
              variant="outlined"
              onClick={onClose}
              className="!text-[#1B4965] !border-slate-300 hover:!bg-slate-50 !font-bold !capitalize !rounded-xl !text-xs"
            >
              Mở trang chi tiết riêng ↗
            </Button>
          )}
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
