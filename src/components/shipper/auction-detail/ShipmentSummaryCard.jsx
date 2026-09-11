"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import NavigationIcon from "@mui/icons-material/NavigationOutlined";
import GavelIcon from "@mui/icons-material/GavelOutlined";
import InventoryIcon from "@mui/icons-material/Inventory2Outlined";

import StatusBadge from "./StatusBadge";
import {
  formatAuctionCurrency,
  formatAuctionDateTime,
  formatAuctionTimeRange,
} from "@/services/shipperAuctionMapper";

const UNKNOWN = "Chưa cập nhật";

const dimensionsLabel = (dims) => {
  if (!dims?.length || !dims?.width || !dims?.height) return UNKNOWN;
  return `${dims.length}m x ${dims.width}m x ${dims.height}m`;
};

const moneyOrUnknown = (value) => (Number(value) > 0 ? formatAuctionCurrency(value) : UNKNOWN);

function InfoRow({ label, value, valueClass = "font-bold text-slate-700" }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-slate-400">{label}</span>
      <span className={valueClass}>{value || UNKNOWN}</span>
    </div>
  );
}

export default function ShipmentSummaryCard({ shipment }) {
  if (!shipment) return null;

  return (
    <Card
      className="!rounded-3xl border border-slate-200/80 overflow-hidden transition-all shadow-sm hover:shadow-md"
      sx={{ background: "rgba(255, 255, 255, 0.95)", backdropFilter: "blur(20px)" }}
    >
      <CardContent className="!p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[0.7rem] font-mono font-bold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200/60">
                MÃ LÔ HÀNG: {shipment.id}
              </span>
              <Chip
                label={shipment.auctionType === "SEALED" ? "Đấu giá kín" : "Đấu giá công khai"}
                size="small"
                className={`!h-5 !text-[0.65rem] !font-bold ${
                  shipment.auctionType === "SEALED"
                    ? "!bg-amber-50 !text-amber-700 border border-amber-200"
                    : "!bg-sky-50 !text-sky-700 border border-sky-200"
                }`}
              />
            </div>
            <Typography variant="h5" className="!font-black text-slate-800 !mt-1 tracking-tight">
              {shipment.title || shipment.goodsName || shipment.goodsType}
            </Typography>
            {(shipment.title || shipment.goodsName) && (
              <Typography variant="caption" className="!font-bold text-sky-600 block mt-0.5">
                Phân loại: {shipment.goodsType}
              </Typography>
            )}
          </div>
          <div className="text-right">
            <StatusBadge status={shipment.status} />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <GavelIcon className="!text-[1.1rem] text-[#1B4965]" />
            <span className="text-[#1B4965] font-black text-xs uppercase tracking-wider">
              1. Thông tin đấu giá & yêu cầu vận chuyển
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[0.8rem]">
            <div className="space-y-2.5 bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
              <InfoRow label="Chủ hàng đăng tin:" value={shipment.auctionCreator} valueClass="font-bold text-slate-800" />
              <InfoRow label="Thời gian mở đăng ký:" value={formatAuctionDateTime(shipment.regStartTime)} />
              <InfoRow label="Thời gian đóng đăng ký:" value={formatAuctionDateTime(shipment.regEndTime)} />
              <InfoRow label="Thời gian bắt đầu đấu giá:" value={formatAuctionDateTime(shipment.startTime)} />
              <InfoRow label="Thời gian kết thúc đấu giá:" value={formatAuctionDateTime(shipment.endTime)} />
              <InfoRow
                label="Giá trần tối đa:"
                value={moneyOrUnknown(shipment.maxPrice)}
                valueClass="font-black text-[#1B4965] font-mono text-sm"
              />
              <InfoRow label="Bước giá tối thiểu:" value={moneyOrUnknown(shipment.priceStep)} valueClass="font-bold text-slate-700 font-mono" />
              <InfoRow label="Số lượt ra giá tối đa:" value={shipment.maxBids ? `${shipment.maxBids} lần / nhà xe` : UNKNOWN} />
            </div>

            <div className="space-y-2.5 bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
              <InfoRow label="Phí tham gia đấu giá:" value={moneyOrUnknown(shipment.participationFee)} />
              <InfoRow
                label="Tiền đặt cọc trước:"
                value={moneyOrUnknown(shipment.depositAmount)}
                valueClass="font-bold text-amber-600 font-mono"
              />
              <InfoRow
                label="Loại xe yêu cầu:"
                value={shipment.requiredVehicleType || UNKNOWN}
                valueClass="font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100"
              />
              <InfoRow label="Kích thước thùng tối thiểu:" value={dimensionsLabel(shipment.requiredVehicleDims)} valueClass="font-bold text-slate-700 font-mono" />
              <InfoRow label="Khung giờ nhận hàng:" value={formatAuctionTimeRange(shipment.earliestPickup, shipment.latestPickup)} />
              <InfoRow label="Khung giờ giao hàng:" value={formatAuctionTimeRange(shipment.earliestDelivery, shipment.latestDelivery)} />
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <InventoryIcon className="!text-[1.1rem] text-emerald-600" />
            <span className="text-[#1B4965] font-black text-xs uppercase tracking-wider">
              2. Thông tin chi tiết hàng hóa & tuyến đường vận chuyển
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[0.8rem]">
            <div className="space-y-2.5 bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
              <InfoRow
                label="Tên lô hàng:"
                value={shipment.title || shipment.goodsName || shipment.goodsCategory || UNKNOWN}
                valueClass="font-bold text-[#1B4965]"
              />
              <InfoRow
                label="Phân loại hàng hóa:"
                value={shipment.goodsCategory || UNKNOWN}
                valueClass="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100"
              />
              <InfoRow label="Kích thước kiện hàng (D x R x C):" value={dimensionsLabel(shipment.requiredVehicleDims)} valueClass="font-bold text-[#1B4965] font-mono" />
              <InfoRow label="Trọng lượng hàng hóa:" value={shipment.weight} valueClass="font-bold text-slate-800" />
              <InfoRow label="Yêu cầu nhiệt độ:" value={shipment.requiredTemp !== null && shipment.requiredTemp !== undefined ? `${shipment.requiredTemp} °C` : "Nhiệt độ thường"} />
              <InfoRow label="Giá trị khai báo hàng hóa:" value={moneyOrUnknown(shipment.goodsValue)} valueClass="font-bold text-slate-800 font-mono" />
              <div className="flex flex-col gap-1 pt-1 border-t border-slate-200/50">
                <span className="text-slate-400">Mô tả đặc tính hàng hóa:</span>
                <span className="text-slate-700 bg-white p-2.5 rounded-xl border border-slate-150 text-xs italic">
                  {shipment.description || UNKNOWN}
                </span>
              </div>
            </div>

            <div className="space-y-3 bg-[#1B4965]/5 p-4 rounded-2xl border border-[#1B4965]/10 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-sky-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-xs">
                    A
                  </div>
                  <div>
                    <span className="text-[0.68rem] font-extrabold uppercase tracking-wider text-sky-600 block">Địa chỉ nhận hàng</span>
                    <strong className="text-slate-800 text-xs block font-bold mt-0.5">{shipment.from.name || UNKNOWN}</strong>
                    <span className="text-slate-500 text-[0.72rem] block mt-0.5">{shipment.from.address || UNKNOWN}</span>
                  </div>
                </div>

                <div className="ml-3.5 pl-4 border-l-2 border-dashed border-slate-300 py-1 flex items-center gap-1.5 text-slate-400 text-xs font-mono">
                  <NavigationIcon className="!text-[0.85rem] text-[#1B4965] rotate-90" /> Tuyến vận chuyển
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-xs">
                    B
                  </div>
                  <div>
                    <span className="text-[0.68rem] font-extrabold uppercase tracking-wider text-emerald-600 block">Địa chỉ trả hàng</span>
                    <strong className="text-slate-800 text-xs block font-bold mt-0.5">{shipment.to.name || UNKNOWN}</strong>
                    <span className="text-slate-500 text-[0.72rem] block mt-0.5">{shipment.to.address || UNKNOWN}</span>
                  </div>
                </div>
              </div>

              {shipment.goodsNotes && (
                <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200/80 text-xs text-amber-900 mt-2">
                  <strong className="font-bold block text-[0.7rem] text-amber-800">Ghi chú đặc biệt từ chủ hàng:</strong>
                  <span className="text-[0.72rem] block mt-0.5">{shipment.goodsNotes}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
