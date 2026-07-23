"use client";

import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import GavelIcon from "@mui/icons-material/GavelOutlined";
import InventoryIcon from "@mui/icons-material/Inventory2Outlined";
import NavigationIcon from "@mui/icons-material/NavigationOutlined";
import LocalShippingIcon from "@mui/icons-material/LocalShippingOutlined";

import { formatCurrency } from "./mockData";

// ─── Reusable info row ────────────────────────────────────────────
function InfoRow({ label, value, valueClass = "" }) {
  return (
    <div className="flex justify-between items-start gap-2 py-1.5 border-b border-slate-100 last:border-0">
      <span className="text-slate-400 text-[0.76rem] shrink-0">{label}</span>
      <span className={`font-bold text-[0.78rem] text-right ${valueClass || "text-slate-800"}`}>{value}</span>
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────
function Section({ icon, title, children }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
        <span className="text-[#1B4965] flex items-center">{icon}</span>
        <span className="text-[#1B4965] font-black text-xs uppercase tracking-wider">{title}</span>
      </div>
      {children}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────
export default function CarrierShipmentInfoCard({ shipment }) {
  if (!shipment) return null;

  return (
    <div className="bg-white/95 rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Card Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[0.68rem] font-mono font-bold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200/60">
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
            {shipment.goodsType}
          </Typography>
        </div>
        <LocalShippingIcon className="!text-4xl text-slate-200" />
      </div>

      <div className="p-6 space-y-6">
        {/* Section 1: Auction parameters */}
        <Section icon={<GavelIcon className="!text-[1rem]" />} title="1. Thông tin đấu giá & Điều kiện vận chuyển">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left sub-panel */}
            <div className="bg-slate-50/70 rounded-2xl border border-slate-100 px-4 py-3 space-y-0">
              <InfoRow label="Chủ hàng tổ chức:" value={shipment.auctionCreator} />
              <InfoRow
                label="Hình thức đấu giá:"
                value={shipment.auctionType === "SEALED" ? "Đấu giá kín (Bid ẩn)" : "Đấu giá công khai"}
                valueClass={shipment.auctionType === "SEALED" ? "text-amber-700" : "text-sky-700"}
              />
              <InfoRow label="Mở đăng ký:" value={new Date(shipment.regStartTime).toLocaleString("vi-VN")} />
              <InfoRow label="Đóng đăng ký:" value={new Date(shipment.regEndTime).toLocaleString("vi-VN")} />
              <InfoRow label="Bắt đầu đấu giá:" value={new Date(shipment.startTime).toLocaleString("vi-VN")} />
              <InfoRow label="Kết thúc đấu giá:" value={new Date(shipment.endTime).toLocaleString("vi-VN")} />
            </div>

            {/* Right sub-panel */}
            <div className="bg-slate-50/70 rounded-2xl border border-slate-100 px-4 py-3 space-y-0">
              <InfoRow label="Giá trần tối đa:" value={formatCurrency(shipment.maxPrice)} valueClass="text-[#1B4965] font-mono" />
              <InfoRow label="Bước giá tối thiểu:" value={formatCurrency(shipment.priceStep)} valueClass="font-mono" />
              <InfoRow label="Số lượt ra giá tối đa:" value={`${shipment.maxBids} lần / nhà xe`} />
              <InfoRow label="Phí tham gia đấu giá:" value={formatCurrency(shipment.participationFee)} />
              <InfoRow label="Tiền đặt cọc trước:" value={formatCurrency(shipment.depositAmount)} valueClass="text-amber-700 font-mono" />
              <InfoRow
                label="Loại xe yêu cầu:"
                value={shipment.requiredVehicleType}
                valueClass="text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100 inline-block"
              />
              <InfoRow
                label="Kích thước thùng tối thiểu:"
                value={`${shipment.requiredVehicleDims?.length}m × ${shipment.requiredVehicleDims?.width}m × ${shipment.requiredVehicleDims?.height}m`}
                valueClass="font-mono"
              />
            </div>
          </div>
        </Section>

        {/* Section 2: Cargo + Route */}
        <Section icon={<InventoryIcon className="!text-[1rem] text-emerald-600" />} title="2. Thông tin chi tiết hàng hóa & Tuyến đường vận chuyển">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cargo specs */}
            <div className="bg-slate-50/70 rounded-2xl border border-slate-100 px-4 py-3 space-y-0">
              <InfoRow
                label="Phân loại hàng hóa:"
                value={shipment.goodsCategory}
                valueClass="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 inline-block"
              />
              <InfoRow label="Trọng lượng hàng:" value={shipment.weight} />
              <InfoRow label="Thể tích hàng:" value={shipment.volume} />
              <InfoRow
                label="Nhiệt độ bảo quản:"
                value={shipment.requiredTemp !== null && shipment.requiredTemp !== undefined ? `${shipment.requiredTemp} °C` : "Nhiệt độ thường"}
                valueClass={shipment.requiredTemp !== null ? "text-blue-600 font-mono" : ""}
              />
              <InfoRow label="Giá trị khai báo hàng:" value={formatCurrency(shipment.goodsValue)} valueClass="font-mono" />
              <InfoRow label="Khung giờ nhận hàng:" value={`10:00 – 14:00 (${new Date(shipment.earliestPickup).toLocaleDateString("vi-VN")})`} />
              <InfoRow label="Khung giờ giao hàng:" value={`10:00 – 16:00 (${new Date(shipment.earliestDelivery).toLocaleDateString("vi-VN")})`} />
              <div className="pt-2">
                <p className="text-[0.68rem] text-slate-400 mb-1">Mô tả / Yêu cầu đặc biệt:</p>
                <p className="text-[0.75rem] text-slate-700 italic bg-white px-3 py-2 rounded-xl border border-slate-100">
                  {shipment.description}
                </p>
              </div>
            </div>

            {/* Route A → B */}
            <div className="bg-[#1B4965]/5 rounded-2xl border border-[#1B4965]/10 px-4 py-4 flex flex-col gap-3">
              {/* Point A */}
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-sky-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-sm">A</div>
                <div>
                  <span className="text-[0.65rem] font-extrabold uppercase tracking-wider text-sky-600 block">Điểm nhận hàng (Pickup)</span>
                  <strong className="text-slate-800 text-xs block font-bold mt-0.5">{shipment.from.name}</strong>
                  <span className="text-slate-500 text-[0.7rem] block mt-0.5">{shipment.from.address}</span>
                </div>
              </div>

              {/* Route connector */}
              <div className="ml-3.5 pl-4 border-l-2 border-dashed border-slate-300 py-1 flex items-center gap-1.5 text-slate-400 text-xs font-mono">
                <NavigationIcon className="!text-[0.85rem] text-[#1B4965] rotate-90" /> Lộ trình vận chuyển
              </div>

              {/* Point B */}
              <div className="flex items-start gap-2.5">
                <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-sm">B</div>
                <div>
                  <span className="text-[0.65rem] font-extrabold uppercase tracking-wider text-emerald-600 block">Điểm giao hàng (Delivery)</span>
                  <strong className="text-slate-800 text-xs block font-bold mt-0.5">{shipment.to.name}</strong>
                  <span className="text-slate-500 text-[0.7rem] block mt-0.5">{shipment.to.address}</span>
                </div>
              </div>

              {/* Notes */}
              {shipment.goodsNotes && (
                <div className="bg-amber-50 rounded-xl border border-amber-200/80 p-3 text-xs text-amber-900 mt-1">
                  <strong className="font-bold text-[0.7rem] text-amber-800 block">⚠️ Ghi chú từ chủ hàng:</strong>
                  <span className="text-[0.72rem] block mt-0.5">{shipment.goodsNotes}</span>
                </div>
              )}
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
