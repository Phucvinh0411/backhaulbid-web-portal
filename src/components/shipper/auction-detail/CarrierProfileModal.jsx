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
import { formatDateTime } from "@/lib/format";
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
        className: "!rounded-xl !p-2",
      }}
    >
      <DialogTitle className="flex justify-between items-center !font-bold text-ink border-b border-line pb-3">
        <div className="flex items-center gap-2">
          <BusinessIcon className="text-[var(--color-brand)]" />
          <span>Hồ Sơ Năng Lực Chi Tiết Nhà Xe &amp; Phương Tiện</span>
        </div>
        <div className="flex items-center gap-2">
          {loading && <CircularProgress size={16} className="!text-[var(--color-brand)]" />}
          <IconButton size="small" onClick={onClose} className="text-ink-subtle">
            <CloseIcon />
          </IconButton>
        </div>
      </DialogTitle>

      <DialogContent className="!py-4 space-y-5">
        {/* Carrier Banner Card */}
        <div className="bg-ink text-white p-5 rounded-xl space-y-3 relative overflow-hidden shadow-md">
          <div className="absolute top-0 right-0 w-48 h-48 bg-success/10 rounded-full blur-3xl pointer-events-none" />
          <div className="flex items-start justify-between relative z-10">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-xl bg-white/10 text-white flex items-center justify-center font-black text-xl border border-white/20 shadow-inner">
                {carrier.avatar}
              </div>
              <div>
                <Typography variant="h6" className="!font-extrabold !text-white !leading-snug">
                  {carrier.carrierName}
                </Typography>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className="text-[0.7rem] bg-success/20 text-success font-bold px-2.5 py-0.5 rounded-full border border-success/30 flex items-center gap-1">
                    <VerifiedIcon className="!text-[0.75rem]" /> {carrier.badge}
                  </span>
                  <span className="text-[0.7rem] text-on-band-soft">
                    Mã hệ thống: <strong className="text-white font-mono">{carrier.code}</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-2 pt-3 border-t border-white/10 text-center text-xs">
            <div className="bg-white/5 p-2 rounded-xl border border-white/5">
              <span className="text-on-band-soft block text-[0.65rem]">Đánh giá chủ hàng</span>
              <strong className="text-warning text-xs font-bold flex items-center justify-center gap-0.5 mt-0.5">
                {carrier.reviewSummary == null ? (
                  "Chưa tải được"
                ) : carrier.reviewSummary.reviewCount === 0 ? (
                  "Chưa có đánh giá"
                ) : (
                  <>
                    <StarIcon className="!text-[0.85rem]" /> {(carrier.reviewSummary.averageRating ?? 0).toFixed(1)} ({carrier.reviewSummary.reviewCount})
                  </>
                )}
              </strong>
            </div>
            <div className="bg-white/5 p-2 rounded-xl border border-white/5">
              <span className="text-on-band-soft block text-[0.65rem]">Chuyến hoàn thành</span>
              <strong className="text-success text-xs font-bold mt-0.5 block">
                {carrier.completedTrips}
              </strong>
            </div>
            <div className="bg-white/5 p-2 rounded-xl border border-white/5">
              <span className="text-on-band-soft block text-[0.65rem]">Đúng giờ</span>
              <strong className="text-info text-sm font-bold mt-0.5 block">
                {carrier.onTimeRate}
              </strong>
            </div>
            <div className="bg-white/5 p-2 rounded-xl border border-white/5">
              <span className="text-on-band-soft block text-[0.65rem]">Tỷ lệ hủy chuyến</span>
              <strong className="text-success text-sm font-bold mt-0.5 block">
                {carrier.cancellationRate}
              </strong>
            </div>
          </div>
        </div>

        {/* Đánh giá từ chủ hàng: tách khỏi điểm uy tín đấu giá, lấy từ chuyến đã hoàn tất */}
        <div className="space-y-2">
          <Typography className="!text-xs font-black text-ink-muted uppercase tracking-wider flex items-center gap-1.5">
            <StarIcon className="!text-[0.95rem] text-warning" /> Đánh giá từ chủ hàng
          </Typography>

          {carrier.reviewSummary == null ? (
            <p className="text-xs text-ink-muted bg-surface-sunken p-3 rounded-xl border border-line">
              Chưa tải được đánh giá của nhà xe. Vui lòng thử lại sau.
            </p>
          ) : carrier.reviewSummary.reviewCount === 0 ? (
            <p className="text-xs text-ink-muted bg-surface-sunken p-3 rounded-xl border border-line">
              Chưa có đánh giá từ chuyến đã hoàn tất.
            </p>
          ) : (
            <div className="bg-surface-sunken p-3.5 rounded-xl border border-line space-y-3 text-xs">
              <div className="flex items-baseline gap-2">
                <strong className="text-ink text-2xl font-black tabular-nums">
                  {(carrier.reviewSummary.averageRating ?? 0).toFixed(1)}
                </strong>
                <span className="text-ink-muted">/ 5 · {carrier.reviewSummary.reviewCount} đánh giá</span>
              </div>
              <ul className="space-y-1" aria-label="Phân bố số sao">
                {[5, 4, 3, 2, 1].map((stars) => {
                  const count = Number(carrier.reviewSummary.distribution?.[stars] || 0);
                  const percent = carrier.reviewSummary.reviewCount ? Math.round((count / carrier.reviewSummary.reviewCount) * 100) : 0;
                  return (
                    <li key={stars} className="flex items-center gap-2">
                      <span className="w-10 text-ink-subtle">{stars} sao</span>
                      <span className="flex-1 h-1.5 rounded-full bg-line overflow-hidden">
                        <span className="block h-full bg-warning" style={{ width: `${percent}%` }} />
                      </span>
                      <span className="w-8 text-right tabular-nums text-ink-muted">{count}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          {carrier.reviews?.length > 0 && (
            <ul className="space-y-2">
              {carrier.reviews.map((review) => (
                <li key={review.id} className="bg-surface-sunken p-3 rounded-xl border border-line text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-warning font-bold" aria-label={`${review.rating} sao`}>
                      {"★".repeat(review.rating)}<span className="text-line-strong">{"★".repeat(5 - review.rating)}</span>
                    </span>
                    <span className="text-ink-subtle">{formatDateTime(review.createdAt)}</span>
                  </div>
                  <p className="text-ink mt-1 whitespace-pre-line">{review.comment || "Không có nhận xét."}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* 1. Đội xe đăng ký */}
        <div className="space-y-2">
          <Typography className="!text-xs font-black text-ink-muted uppercase tracking-wider flex items-center gap-1.5">
            <LocalShippingIcon className="!text-[0.95rem] text-[var(--color-brand)]" /> 1. Đội xe đăng ký tham gia
          </Typography>

          {carrier?.fleet?.length > 0 ? (
            <div className="space-y-2">
              {carrier.fleet.map((vehicle, idx) => (
                <div key={vehicle.id || idx} className="bg-surface-sunken p-3.5 rounded-xl border border-line/80 text-xs">
                  <div className="grid grid-cols-2 gap-4 mb-2">
                    <div>
                      <span className="text-ink-subtle block text-[0.68rem] font-medium">Loại xe:</span>
                      <strong className="text-ink text-sm font-bold block mt-0.5">
                        {vehicle.type || "Chưa cập nhật"}
                      </strong>
                      {vehicle.brand && vehicle.brand !== "Chưa cập nhật" && (
                        <span className="text-[0.68rem] text-ink-muted block mt-0.5">Thân xe: {vehicle.brand}</span>
                      )}
                    </div>
                    <div>
                      <span className="text-ink-subtle block text-[0.68rem] font-medium">Biển số đăng ký:</span>
                      <span className="bg-warning-soft text-warning font-mono font-bold text-xs px-2.5 py-1 rounded border border-warning-soft inline-block mt-0.5">
                        {vehicle.plate || "Chưa cập nhật"}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 border-t border-line/70 pt-2.5">
                    <div className="bg-white p-2 rounded-xl border border-line">
                      <span className="text-ink-subtle block text-[0.65rem] font-medium flex items-center gap-1">
                        <AspectRatioIcon className="!text-[0.75rem] text-[var(--color-brand)]" /> Tải trọng:
                      </span>
                      <strong className="text-[var(--color-brand)] font-bold text-xs font-mono block mt-1">
                        {vehicle.payload || "Chưa cập nhật"}
                      </strong>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-line">
                      <span className="text-ink-subtle block text-[0.65rem] font-medium">Kích thước thùng:</span>
                      <strong className="text-ink font-bold text-xs block mt-1">
                        {vehicle.dims || "Chưa cập nhật"}
                      </strong>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-line">
                      <span className="text-ink-subtle block text-[0.65rem] font-medium">Trạng thái:</span>
                      <strong className={`text-xs block mt-1 font-bold ${vehicle.status === "VERIFIED" ? "text-success" : "text-warning"}`}>
                        {vehicle.status === "VERIFIED" ? "✅ Đã duyệt" : vehicle.status === "PENDING" ? "⏳ Chờ duyệt" : (vehicle.status || "Chưa cập nhật")}
                      </strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-surface-sunken p-4 rounded-xl border border-line/80 text-xs text-ink-subtle text-center">
              {loading ? "Đang tải thông tin phương tiện..." : "Chưa có thông tin phương tiện"}
            </div>
          )}
        </div>

        {/* 2. Tài xế phụ trách */}
        <div className="space-y-2">
          <Typography className="!text-xs font-black text-ink-muted uppercase tracking-wider flex items-center gap-1.5">
            <PersonIcon className="!text-[0.95rem] text-success" /> 2. Tài xế đăng ký
          </Typography>

          {carrier?.drivers?.length > 0 ? (
            <div className="space-y-2">
              {carrier.drivers.map((driver, idx) => (
                <div key={driver.id || idx} className="bg-success-soft/30 p-3.5 rounded-xl border border-success-soft text-xs">
                  <div className="grid grid-cols-2 gap-4 items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-success-soft text-success flex items-center justify-center font-bold text-base border border-success-soft">
                        <BadgeIcon />
                      </div>
                      <div>
                        <strong className="text-ink text-sm font-bold block">{driver.name || "Chưa cập nhật"}</strong>
                        <span className="text-[0.7rem] text-ink-muted block">
                          {driver.birthYear && driver.birthYear !== "Chưa cập nhật" && <>Năm sinh: <strong className="text-ink">{driver.birthYear}</strong> • </>}
                          Bằng lái: <strong className="text-success">{driver.license || "Chưa cập nhật"}</strong>
                        </span>
                        <span className={`text-[0.65rem] font-semibold ${driver.safetyRecord === "Đã xác thực" ? "text-success" : "text-warning"}`}>
                          {driver.safetyRecord || "Chưa cập nhật"}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      {driver.phone && driver.phone !== "Chưa cập nhật" ? (
                        <a href={`tel:${driver.phone}`} className="text-success font-bold font-mono text-sm inline-flex items-center gap-1 mt-0.5 hover:underline bg-white px-2.5 py-1 rounded-lg border border-success-soft shadow-xs">
                          <PhoneIcon className="!text-[0.85rem]" /> {driver.phone}
                        </a>
                      ) : (
                        <span className="text-ink-subtle text-[0.7rem]">Chưa có SĐT</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-success-soft/30 p-4 rounded-xl border border-success-soft text-xs text-ink-subtle text-center">
              {loading ? "Đang tải thông tin tài xế..." : "Chưa có thông tin tài xế"}
            </div>
          )}
        </div>

        {/* 3. Pháp lý doanh nghiệp & Bảo hiểm */}
        <div className="space-y-2">
          <Typography className="!text-xs font-black text-ink-muted uppercase tracking-wider flex items-center gap-1.5">
            <ShieldIcon className="!text-[0.95rem] text-[var(--color-brand)]" /> 3. Pháp lý doanh nghiệp &amp; Liên hệ
          </Typography>

          <div className="bg-surface-sunken p-3.5 rounded-xl border border-line text-xs space-y-2">
            {carrier.taxCode && carrier.taxCode !== "Chưa cập nhật" && (
              <div className="flex justify-between">
                <span className="text-ink-subtle">Mã số thuế doanh nghiệp:</span>
                <span className="font-mono font-bold text-ink">{carrier.taxCode}</span>
              </div>
            )}
            {carrier.representative && carrier.representative !== "Chưa cập nhật" && (
              <div className="flex justify-between">
                <span className="text-ink-subtle">Người đại diện pháp lý:</span>
                <span className="font-bold text-ink">{carrier.representative}</span>
              </div>
            )}
            {carrier.address && carrier.address !== "Chưa cập nhật" && (
              <div className="flex justify-between">
                <span className="text-ink-subtle">Địa chỉ trụ sở chính:</span>
                <span className="font-bold text-ink max-w-[280px] text-right">{carrier.address}</span>
              </div>
            )}
            {carrier.email && carrier.email !== "Chưa cập nhật" && (
              <div className="flex justify-between">
                <span className="text-ink-subtle">Email liên hệ:</span>
                <span className="font-bold text-info">{carrier.email}</span>
              </div>
            )}
            {carrier.hotline && carrier.hotline !== "Chưa cập nhật" && (
              <div className="flex justify-between">
                <span className="text-ink-subtle">Hotline:</span>
                <a href={`tel:${carrier.hotline}`} className="font-mono font-bold text-success hover:underline">{carrier.hotline}</a>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-[0.72rem] pt-1">
            <div className="bg-surface-sunken p-2.5 rounded-xl border border-line flex items-center gap-2">
              <CheckCircleIcon className={`!text-[1.1rem] ${carrier.verified ? "text-success" : "text-warning"}`} />
              <div>
                <span className="font-bold text-ink block">Xác minh doanh nghiệp</span>
                <span className={`font-semibold text-[0.65rem] ${carrier.verified ? "text-success" : "text-warning"}`}>
                  {carrier.verified ? "🟢 Đã xác minh chính chủ" : "🟡 Chưa hoàn tất xác minh"}
                </span>
              </div>
            </div>
            <div className="bg-surface-sunken p-2.5 rounded-xl border border-line flex items-center gap-2">
              <CheckCircleIcon className="text-success !text-[1.1rem]" />
              <div>
                <span className="font-bold text-ink block">Đăng ký hệ thống</span>
                <span className="text-info font-bold text-[0.68rem]">Mã: {carrier.code || "Chưa có mã"}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>

      <DialogActions className="!px-6 !pb-4 flex justify-between gap-3 border-t border-line pt-3">
        {(carrier.hotline && carrier.hotline !== "Chưa cập nhật") ? (
          <Button
            variant="outlined"
            href={`tel:${carrier.hotline}`}
            startIcon={<PhoneIcon />}
            className="!text-success !border-success-soft hover:!bg-success-soft !font-bold !capitalize !rounded-xl !text-xs"
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
              className="!text-[var(--color-brand)] !border-line-strong hover:!bg-surface-sunken !font-bold !capitalize !rounded-xl !text-xs"
            >
              Mở trang chi tiết riêng ↗
            </Button>
          )}
          <Button
            onClick={onClose}
            variant="text"
            className="!text-ink-muted !font-bold !capitalize !rounded-xl !text-xs"
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
                background: "var(--color-success)",
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
