"use client";

import Typography from "@mui/material/Typography";
import BusinessIcon from "@mui/icons-material/BusinessOutlined";
import PersonIcon from "@mui/icons-material/PersonOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircleOutlined";
import LocationOnIcon from "@mui/icons-material/LocationOnOutlined";
import { RoundedBox } from "@/components/common";

export default function LegalRepresentativeCard({ carrier }) {
  return (
    <RoundedBox className="mb-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <BusinessIcon className="text-[#1B4965]" />
          <Typography variant="h6" className="!font-bold text-slate-800 !text-base">
            1. Người Đại Diện & Pháp Lý Doanh Nghiệp
          </Typography>
        </div>
        <span className="text-[0.68rem] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
          <CheckCircleIcon className="!text-[0.8rem]" /> Đã xác minh chính chủ
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-[#1B4965] flex items-center justify-center font-bold text-sm shrink-0">
              <PersonIcon />
            </div>
            <div>
              <span className="text-slate-400 block text-[0.68rem] font-medium">Người đại diện pháp luật:</span>
              <strong className="text-slate-800 text-sm font-bold block mt-0.5">{carrier.representative}</strong>
              <span className="text-[0.68rem] text-slate-500 block mt-0.5">Chịu trách nhiệm pháp lý & ký kết hợp đồng</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">
              <LocationOnIcon />
            </div>
            <div>
              <span className="text-slate-400 block text-[0.68rem] font-medium">Địa chỉ trụ sở đăng ký kinh doanh:</span>
              <strong className="text-slate-800 text-sm font-bold block mt-0.5">{carrier.address}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Legal Details */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs pt-2">
        <div className="bg-white p-3 rounded-xl border border-slate-200/80">
          <span className="text-slate-400 block text-[0.65rem] font-medium">Mã số thuế doanh nghiệp:</span>
          <strong className="text-slate-800 font-mono font-bold text-xs block mt-1">{carrier.taxCode}</strong>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200/80">
          <span className="text-slate-400 block text-[0.65rem] font-medium">Giấy phép kinh doanh vận tải:</span>
          <strong className="text-slate-800 font-bold text-xs block mt-1">{carrier.licenseNo}</strong>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200/80">
          <span className="text-slate-400 block text-[0.65rem] font-medium">Năm thành lập:</span>
          <strong className="text-slate-800 font-bold text-xs block mt-1">Năm {carrier.foundingYear}</strong>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200/80">
          <span className="text-slate-400 block text-[0.65rem] font-medium">Bảo hiểm trách nhiệm hàng hóa:</span>
          <strong className="text-emerald-700 font-bold text-xs block mt-1">{carrier.insuranceAmount}</strong>
        </div>
      </div>
    </RoundedBox>
  );
}
