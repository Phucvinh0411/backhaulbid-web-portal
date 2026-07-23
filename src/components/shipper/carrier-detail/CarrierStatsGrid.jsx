"use client";

import StarIcon from "@mui/icons-material/Star";
import LocalShippingIcon from "@mui/icons-material/LocalShippingOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTimeOutlined";
import ShieldIcon from "@mui/icons-material/ShieldOutlined";
import { RoundedBox } from "@/components/common";

export default function CarrierStatsGrid({ carrier }) {
  const stats = [
    {
      label: "Điểm tín nhiệm",
      value: `${carrier.rating} / 5.0`,
      icon: <StarIcon className="text-amber-500 !text-xl" />,
      subtext: "Đánh giá bởi Shipper",
      badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
    },
    {
      label: "Chuyến hoàn thành",
      value: `${carrier.completedTrips}+`,
      icon: <LocalShippingIcon className="text-[#1B4965] !text-xl" />,
      subtext: "Đơn hàng giao thành công",
      badgeColor: "bg-sky-50 text-sky-800 border-sky-200",
    },
    {
      label: "Tỷ lệ đúng giờ",
      value: carrier.onTimeRate,
      icon: <AccessTimeIcon className="text-emerald-600 !text-xl" />,
      subtext: "Cam kết đúng thời gian",
      badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
    },
    {
      label: "Tỷ lệ hủy chuyến",
      value: carrier.cancellationRate,
      icon: <ShieldIcon className="text-purple-600 !text-xl" />,
      subtext: "Chỉ số an toàn vận hành",
      badgeColor: "bg-purple-50 text-purple-800 border-purple-200",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((item, index) => (
        <RoundedBox key={index} padding="sm" className="hover:-translate-y-1 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">{item.label}</span>
            <div className={`p-2 rounded-2xl border ${item.badgeColor}`}>
              {item.icon}
            </div>
          </div>
          <div className="text-xl md:text-2xl font-black text-slate-800 tracking-tight">
            {item.value}
          </div>
          <p className="text-[0.7rem] text-slate-400 font-medium mt-1">
            {item.subtext}
          </p>
        </RoundedBox>
      ))}
    </div>
  );
}
