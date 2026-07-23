"use client";

import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import LocalShippingIcon from "@mui/icons-material/LocalShippingOutlined";
import NavigationIcon from "@mui/icons-material/NavigationOutlined";
import LockIcon from "@mui/icons-material/LockOutlined";
import PublicIcon from "@mui/icons-material/PublicOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircleOutlined";

import { formatCurrency } from "./mockData";

export default function SummarySidebar({ form }) {
  const isSealed = form.auctionType === "SEALED";

  return (
    <div className="bg-white/95 rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-4 sticky top-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div>
          <span className="text-[0.65rem] font-extrabold uppercase tracking-wider text-slate-400 block">
            Xem trước thông tin
          </span>
          <Typography className="!font-black text-slate-800 !text-sm">
            {form.goodsName || "Chưa đặt tên lô hàng"}
          </Typography>
        </div>
        <Chip
          label={isSealed ? "Đấu giá kín" : "Đấu giá công khai"}
          size="small"
          icon={isSealed ? <LockIcon className="!text-[0.75rem]" /> : <PublicIcon className="!text-[0.75rem]" />}
          className={`!h-5 !text-[0.62rem] !font-extrabold ${
            isSealed
              ? "!bg-amber-100 !text-amber-800 border border-amber-200"
              : "!bg-sky-100 !text-sky-800 border border-sky-200"
          }`}
        />
      </div>

      {/* Cargo Specs */}
      <div className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-100 space-y-2 text-[0.73rem]">
        <div className="flex justify-between">
          <span className="text-slate-400">Phân loại hàng:</span>
          <span className="font-bold text-slate-700">{form.goodsCategory}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Quy cách (Tải/Thể tích):</span>
          <span className="font-mono font-bold text-slate-800">
            {form.weight} tấn / {form.volume} m³
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Xe yêu cầu:</span>
          <span className="font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100">
            {form.requiredVehicleType}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Kích thước thùng min:</span>
          <span className="font-mono text-slate-700 font-semibold">
            {form.vehicleLength}m × {form.vehicleWidth}m × {form.vehicleHeight}m
          </span>
        </div>
      </div>

      {/* Route A -> B */}
      <div className="bg-sky-50/50 rounded-2xl p-3.5 border border-sky-100 space-y-2 text-[0.73rem]">
        <div className="flex items-start gap-2">
          <span className="w-5 h-5 rounded-full bg-sky-500 text-white font-bold flex items-center justify-center text-[0.65rem] shrink-0 mt-0.5">
            A
          </span>
          <div className="min-w-0">
            <span className="font-bold text-slate-800 block truncate">{form.fromLocationName || "Điểm nhận"}</span>
            <span className="text-slate-500 text-[0.68rem] block truncate">{form.fromProvince}</span>
          </div>
        </div>

        <div className="pl-2 border-l border-dashed border-sky-300 ml-2.5 py-0.5 flex items-center gap-1 text-[0.65rem] text-sky-600 font-mono">
          <NavigationIcon className="!text-[0.7rem] rotate-90" /> Lộ trình
        </div>

        <div className="flex items-start gap-2">
          <span className="w-5 h-5 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-[0.65rem] shrink-0 mt-0.5">
            B
          </span>
          <div className="min-w-0">
            <span className="font-bold text-slate-800 block truncate">{form.toLocationName || "Điểm giao"}</span>
            <span className="text-slate-500 text-[0.68rem] block truncate">{form.toProvince}</span>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="bg-slate-900 text-white rounded-2xl p-4 space-y-2 relative overflow-hidden">
        <div className="flex justify-between items-end">
          <div>
            <span className="text-[0.65rem] text-slate-400 uppercase tracking-wider block">Giá trần tối đa</span>
            <span className="text-xl font-mono font-black text-emerald-400 block mt-0.5">
              {formatCurrency(form.maxPrice)}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[0.62rem] text-slate-400 block">Bước giá min</span>
            <span className="text-xs font-mono font-bold text-slate-300 block">{formatCurrency(form.priceStep)}</span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800 flex justify-between text-[0.68rem] text-slate-400">
          <span>Tiền đặt cọc nhà xe (10%):</span>
          <span className="font-mono font-bold text-amber-400">{formatCurrency(form.depositAmount)}</span>
        </div>
      </div>

      <div className="text-[0.68rem] text-slate-400 flex items-center gap-1.5 font-medium">
        <CheckCircleIcon className="!text-[0.85rem] text-emerald-500" />
        Dữ liệu được lưu nháp tự động
      </div>
    </div>
  );
}
