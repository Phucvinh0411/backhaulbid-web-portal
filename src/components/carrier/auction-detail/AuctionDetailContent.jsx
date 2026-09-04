"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import { DetailRow } from "@/components/common";

const FALLBACK = "Chưa cung cấp";

const toNumber = (value) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const parsed = Number(value);
  if (Number.isFinite(parsed)) return parsed;
  return Number(String(value || "").replace(/[^\d-]/g, "")) || 0;
};

const formatAmount = (value) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(toNumber(value));

const formatDate = (value) => {
  if (!value) return FALLBACK;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return FALLBACK;
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const formatDateRange = (from, to) => {
  const dates = [from, to].filter(Boolean).map(formatDate);
  return dates.length ? dates.join(" - ") : FALLBACK;
};

const formatDimensions = (dimensions) => {
  if (!dimensions?.length || !dimensions?.width || !dimensions?.height) return FALLBACK;
  return `${dimensions.length}m × ${dimensions.width}m × ${dimensions.height}m`;
};

const formatVolume = (value) => {
  if (!value) return FALLBACK;
  return typeof value === "string" ? value : `${value} m³`;
};

/**
 * Converts the API auction shape, the registration shape, and the live-room
 * shipment shape into one view model so every detail screen renders the same data.
 */
export const normalizeAuctionDetail = (auction = {}) => {
  const from = auction.from || {};
  const to = auction.to || {};
  const depositAmount = toNumber(auction.depositAmount);

  return {
    id: auction.id,
    shipperId: auction.shipperId || auction.auctionCreator || auction.creatorId,
    auctionType: auction.auctionType || "PUBLIC",
    status: auction.status,
    registrationStartTime: auction.registrationStartTime || auction.regStartTime,
    registrationEndTime: auction.registrationEndTime || auction.regEndTime,
    startTime: auction.startTime,
    endTime: auction.endTime,
    maxPrice: auction.maxPrice ?? auction.basePrice,
    priceStep: auction.priceStep,
    maxBids: auction.maxBids,
    requiredVehicleDims: auction.requiredVehicleDims,
    requiredVehicleType: auction.requiredVehicleType || auction.vehicleTypeRequired,
    participationFee: auction.participationFeeAmount ?? auction.participationFee ?? 0,
    isDepositRequired: Boolean(auction.isDepositRequired || depositAmount > 0),
    depositAmount,
    registeredVehicle: auction.registeredVehicle,
    title: auction.title || auction.goodsName,
    goodsCategory: auction.goodsCategory || auction.goodsType || auction.cargoType,
    volume: auction.volume,
    requiredTemp: auction.requiredTemp,
    goodsValue: auction.goodsValue,
    weight: auction.weight,
    notes: auction.notes || auction.description || auction.goodsNotes,
    earliestPickup: auction.earliestPickup,
    latestPickup: auction.latestPickup,
    earliestDelivery: auction.earliestDelivery,
    latestDelivery: auction.latestDelivery,
    origin: auction.origin || auction.originLocationName || from.name,
    originAddress: auction.originAddress || from.address || auction.origin || from.name,
    destination: auction.destination || auction.destinationLocationName || to.name,
    destinationAddress: auction.destinationAddress || to.address || auction.destination || to.name,
    winningBid: auction.winningBid,
    myFinalBid: auction.myFinalBid,
    isWinner: auction.isWinner,
  };
};

const getStatusChip = (status) => {
  const config = {
    OPEN_REGISTER: { label: "Sắp diễn ra", color: "info" },
    PENDING: { label: "Sắp diễn ra", color: "info" },
    WAITING_START: { label: "Chờ giờ mở phòng", color: "warning" },
    BIDDING: { label: "Đang đấu giá", color: "success" },
    OPEN: { label: "Đang đấu giá", color: "success" },
    PAYMENT_INCOMPLETE: { label: "Chưa hoàn tất thanh toán", color: "error" },
    CLOSED: { label: "Đã đóng", color: "default" },
    CANCELLED: { label: "Đã hủy", color: "default" },
  }[status] || { label: status || "Chưa xác định", color: "default" };

  return <Chip label={config.label} color={config.color} size="small" className="!font-semibold" />;
};

/**
 * Canonical auction detail layout used before registration and after payment.
 * The optional footer is reserved for context-specific actions only.
 */
export default function AuctionDetailContent({ auction, footer = null }) {
  const detail = normalizeAuctionDetail(auction);
  const registrationStatus = detail.registrationPaymentStatus;
  const volume = formatVolume(detail.volume);
  const weight = detail.weight
    ? typeof detail.weight === "string" ? detail.weight : `${detail.weight} tấn`
    : FALLBACK;
  const note = detail.notes || "Không có ghi chú thêm.";

  return (
    <Box className="space-y-5">
      <Box className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <Box className="mb-3 flex items-center justify-between gap-3">
          <Box>
            <Typography variant="overline" className="!font-bold !tracking-wider !text-slate-400">
              Chủ hàng đăng tin
            </Typography>
            <Typography variant="body1" className="!font-extrabold !text-[#1B4965]">
              {detail.shipperId || FALLBACK}
            </Typography>
          </Box>
          {getStatusChip(detail.status)}
        </Box>
        <Box className="grid grid-cols-1 gap-x-5 sm:grid-cols-2 auction-params-grid">
          <DetailRow label="Hình thức đấu giá" value={detail.auctionType === "SEALED" ? "Đấu giá kín" : "Đấu giá công khai"} />
          <DetailRow label="Mở đăng ký" value={formatDate(detail.registrationStartTime)} />
          <DetailRow label="Bước giá tối thiểu" value={detail.priceStep ? formatAmount(detail.priceStep) : FALLBACK} />
          <DetailRow label="Số lượt ra giá tối đa" value={detail.maxBids ? `${detail.maxBids} lần / nhà xe` : "Không giới hạn"} />
          <DetailRow label="Kích thước thùng tối thiểu" value={formatDimensions(detail.requiredVehicleDims)} />
          <DetailRow label="Mã phiên" value={detail.id || FALLBACK} />
          <DetailRow label="Loại xe yêu cầu" value={detail.requiredVehicleType || FALLBACK} />
          <DetailRow label="Đóng đăng ký" value={formatDate(detail.registrationEndTime)} />
          <DetailRow label="Bắt đầu đấu giá" value={formatDate(detail.startTime)} />
          <DetailRow label="Kết thúc đấu giá" value={formatDate(detail.endTime)} />
          <DetailRow label="Giá trần tối đa" value={formatAmount(detail.maxPrice)} valueColor="text-[#1B4965]" />
          <DetailRow label="Phí tham gia" value={formatAmount(detail.participationFee)} />
          <DetailRow
            label="Tiền đặt cọc"
            value={detail.isDepositRequired ? formatAmount(detail.depositAmount) : "Không yêu cầu"}
            valueColor={detail.isDepositRequired ? "text-amber-600" : "text-slate-500"}
          />
          {detail.registeredVehicle && <DetailRow label="Xe đã đăng ký" value={detail.registeredVehicle} valueColor="text-[#1B4965]" />}
          {registrationStatus && <DetailRow label="Trạng thái thanh toán" value={registrationStatus} />}
          {detail.registeredAt && <DetailRow label="Đăng ký lúc" value={formatDate(detail.registeredAt)} />}
        </Box>
      </Box>

      <Box className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <Typography variant="subtitle2" component="h3" className="!mb-3 !font-extrabold !text-[#1B4965]">
          2. Thông tin chi tiết hàng hóa & tuyến đường vận chuyển
        </Typography>
        <Box className="grid grid-cols-1 gap-x-5 sm:grid-cols-2">
          <DetailRow label="Tên lô hàng" value={detail.title || detail.goodsCategory || FALLBACK} valueColor="text-[#1B4965]" />
          <DetailRow label="Phân loại hàng hóa" value={detail.goodsCategory || FALLBACK} valueColor="text-emerald-600" />
          <DetailRow label="Thể tích hàng hóa" value={volume} />
          <DetailRow label="Nhiệt độ bảo quản" value={detail.requiredTemp !== null && detail.requiredTemp !== undefined ? `${detail.requiredTemp} °C` : "Không yêu cầu"} />
          <DetailRow label="Giá trị khai báo hàng" value={detail.goodsValue ? formatAmount(detail.goodsValue) : FALLBACK} />
          <DetailRow label="Khung giờ nhận hàng" value={formatDateRange(detail.earliestPickup, detail.latestPickup)} />
          <DetailRow label="Khung giờ giao hàng" value={formatDateRange(detail.earliestDelivery, detail.latestDelivery)} />
          <DetailRow label="Trọng lượng hàng hóa" value={weight} />
          <DetailRow label="Ghi chú hàng hóa" value={detail.notes || FALLBACK} />
        </Box>
        <Box className="mt-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
          <Typography variant="caption" className="!font-bold !text-slate-500">Mô tả / yêu cầu đặc biệt</Typography>
          <Typography variant="body2" className="!mt-1 !italic !text-slate-700">{note}</Typography>
        </Box>
        <Box className="mt-3 space-y-3 rounded-xl border border-[#1B4965]/10 bg-[#1B4965]/5 p-3">
          <Box className="flex items-start gap-2">
            <Box className="h-7 w-7 shrink-0 rounded-full bg-sky-500 text-center text-sm font-bold leading-7 text-white">A</Box>
            <Box>
              <Typography variant="caption" className="!font-extrabold !text-sky-600">ĐỊA CHỈ NHẬN HÀNG (PICKUP POINT)</Typography>
              <Typography variant="body2" className="!font-bold !text-slate-800">{detail.origin || FALLBACK}</Typography>
              <Typography variant="caption" className="!text-slate-500">{detail.originAddress || FALLBACK}</Typography>
            </Box>
          </Box>
          <Box className="ml-3 border-l-2 border-dashed border-slate-300 pl-4 text-xs font-mono text-slate-400">➤ Tuyến vận chuyển lộ trình</Box>
          <Box className="flex items-start gap-2">
            <Box className="h-7 w-7 shrink-0 rounded-full bg-emerald-500 text-center text-sm font-bold leading-7 text-white">B</Box>
            <Box>
              <Typography variant="caption" className="!font-extrabold !text-emerald-600">ĐỊA CHỈ TRẢ HÀNG (DELIVERY POINT)</Typography>
              <Typography variant="body2" className="!font-bold !text-slate-800">{detail.destination || FALLBACK}</Typography>
              <Typography variant="caption" className="!text-slate-500">{detail.destinationAddress || FALLBACK}</Typography>
            </Box>
          </Box>
          <Box className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
            <Typography variant="caption" className="!font-bold !text-amber-800">⚠ Ghi chú đặc biệt từ chủ hàng</Typography>
            <Typography variant="body2" className="!mt-0.5 !text-xs">{note}</Typography>
          </Box>
        </Box>
      </Box>

      {(detail.status === "CLOSED" || detail.winningBid || detail.myFinalBid) && (
        <Box className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <Typography variant="subtitle2" className="!font-extrabold !text-[#1B4965]">3. Kết quả phiên đấu giá</Typography>
          <Box className="mt-2 grid grid-cols-1 gap-x-5 sm:grid-cols-2">
            <DetailRow label="Giá thắng thầu" value={detail.winningBid ? formatAmount(detail.winningBid) : FALLBACK} />
            <DetailRow label="Giá chốt của bạn" value={detail.myFinalBid ? formatAmount(detail.myFinalBid) : FALLBACK} />
            <DetailRow label="Kết quả" value={detail.isWinner ? "Trúng thầu" : "Không trúng thầu"} valueColor={detail.isWinner ? "text-emerald-600" : "text-slate-500"} />
          </Box>
        </Box>
      )}

      {footer && <Box className="pt-1">{footer}</Box>}
    </Box>
  );
}
