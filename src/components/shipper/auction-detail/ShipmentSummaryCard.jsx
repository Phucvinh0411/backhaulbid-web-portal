"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import LocationOnIcon from "@mui/icons-material/LocationOnOutlined";
import NavigationIcon from "@mui/icons-material/NavigationOutlined";
import GavelIcon from "@mui/icons-material/GavelOutlined";
import InventoryIcon from "@mui/icons-material/Inventory2Outlined";

import StatusBadge from "./StatusBadge";
import { formatCurrency } from "./mockData";

export default function ShipmentSummaryCard({ shipment }) {
  if (!shipment) return null;

  return (
    <Card 
      className="!rounded-3xl border border-slate-200/80 overflow-hidden transition-all shadow-sm hover:shadow-md"
      sx={{
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(20px)",
      }}
    >
      <CardContent className="!p-6 space-y-6">
        {/* Header Title */}
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
              {shipment.goodsType}
            </Typography>
          </div>
          <div className="text-right">
            <StatusBadge status={shipment.status} />
          </div>
        </div>

        {/* Section 1: Thông tin đấu giá & Yêu cầu vận chuyển */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <GavelIcon className="!text-[1.1rem] text-[#1B4965]" />
            <span className="text-[#1B4965] font-black text-xs uppercase tracking-wider">
              1. Thông tin đấu giá & Yêu cầu vận chuyển
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[0.8rem]">
            <div className="space-y-2.5 bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-400">Chủ hàng đăng tin:</span>
                <span className="font-bold text-slate-800">{shipment.auctionCreator || "Công ty Cổ phần Sữa Việt Nam (Vinamilk)"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Thời gian mở đăng ký:</span>
                <span className="font-bold text-slate-700">{new Date(shipment.regStartTime || "2026-07-02T08:00:00").toLocaleString("vi-VN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Thời gian đóng đăng ký:</span>
                <span className="font-bold text-slate-700">{new Date(shipment.regEndTime || "2026-07-02T12:00:00").toLocaleString("vi-VN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Thời gian bắt đầu đấu giá:</span>
                <span className="font-bold text-slate-700">{new Date(shipment.startTime || "2026-07-02T13:00:00").toLocaleString("vi-VN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Thời gian kết thúc đấu giá:</span>
                <span className="font-bold text-slate-700">{new Date(shipment.endTime || "2026-07-02T18:00:00").toLocaleString("vi-VN")}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200/50">
                <span className="text-slate-400 font-medium">Giá trần tối đa:</span>
                <span className="font-black text-[#1B4965] font-mono text-sm">{formatCurrency(shipment.maxPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Bước giá tối thiểu:</span>
                <span className="font-bold text-slate-700 font-mono">{formatCurrency(shipment.priceStep || 100000)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Số lượt ra giá tối đa:</span>
                <span className="font-bold text-slate-700">{shipment.maxBids || 5} lần / nhà xe</span>
              </div>
            </div>

            <div className="space-y-2.5 bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-400">Phí tham gia đấu giá:</span>
                <span className="font-bold text-slate-700">{formatCurrency(shipment.participationFee || 50000)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tiền đặt cọc trước:</span>
                <span className="font-bold text-amber-600 font-mono" title="Hoàn lại khi hoàn thành chuyến hàng">{formatCurrency(shipment.depositAmount || 1250000)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Loại xe yêu cầu:</span>
                <span className="font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">{shipment.requiredVehicleType || "Xe tải thùng kín"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Kích thước thùng tối thiểu:</span>
                <span className="font-bold text-slate-700 font-mono">
                  {shipment.requiredVehicleDims?.length || "6.2"}m x {shipment.requiredVehicleDims?.width || "2.1"}m x {shipment.requiredVehicleDims?.height || "2.2"}m
                </span>
              </div>
              <div className="flex justify-between pt-1 border-t border-slate-200/50">
                <span className="text-slate-400">Khung giờ nhận hàng:</span>
                <span className="font-bold text-slate-700">10:00 - 14:00 (3/7/2026)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Khung giờ giao hàng:</span>
                <span className="font-bold text-slate-700">10:00 - 16:00 (4/7/2026)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Thông tin chi tiết hàng hóa & Tuyến đường A -> B */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <InventoryIcon className="!text-[1.1rem] text-emerald-600" />
            <span className="text-[#1B4965] font-black text-xs uppercase tracking-wider">
              2. Thông tin chi tiết hàng hóa & Tuyến đường vận chuyển
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[0.8rem]">
            <div className="space-y-2.5 bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-400">Phân loại hàng hóa:</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">{shipment.goodsCategory || "Hàng bách hóa"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Kích thước kiện hàng (D x R x C):</span>
                <span className="font-bold text-[#1B4965] font-mono">
                  {shipment.volume.includes("28") ? "6.0m x 2.0m x 2.2m" : shipment.volume.includes("45") ? "7.2m x 2.2m x 2.3m" : "Chưa xác định"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Trọng lượng hàng hóa:</span>
                <span className="font-bold text-slate-800">{shipment.weight}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Yêu cầu nhiệt độ:</span>
                <span className="font-bold text-slate-700">{shipment.requiredTemp !== null && shipment.requiredTemp !== undefined ? `${shipment.requiredTemp} °C` : "Nhiệt độ thường"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Giá trị khai báo hàng hóa:</span>
                <span className="font-bold text-slate-800 font-mono">{formatCurrency(shipment.goodsValue || 500000000)}</span>
              </div>
              <div className="flex flex-col gap-1 pt-1 border-t border-slate-200/50">
                <span className="text-slate-400">Mô tả đặc tính hàng hóa:</span>
                <span className="text-slate-700 bg-white p-2.5 rounded-xl border border-slate-150 text-xs italic">{shipment.description}</span>
              </div>
            </div>

            {/* Route Pins Card (A -> B) */}
            <div className="space-y-3 bg-[#1B4965]/5 p-4 rounded-2xl border border-[#1B4965]/10 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-sky-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-xs">
                    A
                  </div>
                  <div>
                    <span className="text-[0.68rem] font-extrabold uppercase tracking-wider text-sky-600 block">Địa chỉ nhận hàng (Pickup Point)</span>
                    <strong className="text-slate-800 text-xs block font-bold mt-0.5">{shipment.from.name}</strong>
                    <span className="text-slate-500 text-[0.72rem] block mt-0.5">{shipment.from.address}</span>
                  </div>
                </div>

                <div className="ml-3.5 pl-4 border-l-2 border-dashed border-slate-300 py-1 flex items-center gap-1.5 text-slate-400 text-xs font-mono">
                  <NavigationIcon className="!text-[0.85rem] text-[#1B4965] rotate-90" /> Tuyến vận chuyển lộ trình
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 shadow-xs">
                    B
                  </div>
                  <div>
                    <span className="text-[0.68rem] font-extrabold uppercase tracking-wider text-emerald-600 block">Địa chỉ trả hàng (Delivery Point)</span>
                    <strong className="text-slate-800 text-xs block font-bold mt-0.5">{shipment.to.name}</strong>
                    <span className="text-slate-500 text-[0.72rem] block mt-0.5">{shipment.to.address}</span>
                  </div>
                </div>
              </div>

              {shipment.goodsNotes && (
                <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200/80 text-xs text-amber-900 mt-2">
                  <strong className="font-bold block text-[0.7rem] text-amber-800">⚠️ Ghi chú đặc biệt từ chủ hàng:</strong>
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
