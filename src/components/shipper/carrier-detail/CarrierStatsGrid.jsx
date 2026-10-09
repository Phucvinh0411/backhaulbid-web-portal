"use client";

import StarIcon from "@mui/icons-material/Star";
import LocalShippingIcon from "@mui/icons-material/LocalShippingOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTimeOutlined";
import ShieldIcon from "@mui/icons-material/ShieldOutlined";
import { RoundedBox } from "@/components/common";

export default function CarrierStatsGrid({ carrier }) {
  const stats = [
    {
      label: "Đánh giá sao",
      value: `${carrier.rating} / 5.0`,
      icon: <StarIcon className="text-warning !text-xl" />,
      subtext: "Đánh giá sao từ chủ hàng",
      badgeColor: "bg-warning-soft text-warning border-warning-soft",
    },
    {
      label: "Điểm uy tín đấu giá",
      value: carrier.reputationScore == null ? "Chưa có dữ liệu" : `${carrier.reputationScore} / 100`,
      icon: <ShieldIcon className="text-brand !text-xl" />,
      subtext: "Điểm dùng để xét quyền tham gia đấu giá",
      badgeColor: "bg-brand-soft text-brand border-brand-soft",
    },
    {
      label: "Chuyến hoàn thành",
      value: `${carrier.completedTrips}+`,
      icon: <LocalShippingIcon className="text-[var(--color-brand)] !text-xl" />,
      subtext: "Đơn hàng giao thành công",
      badgeColor: "bg-info-soft text-info border-info-soft",
    },
    {
      label: "Tỷ lệ đúng giờ",
      value: carrier.onTimeRate,
      icon: <AccessTimeIcon className="text-success !text-xl" />,
      subtext: "Cam kết đúng thời gian",
      badgeColor: "bg-success-soft text-success border-success-soft",
    },
    {
      label: "Tỷ lệ hủy chuyến",
      value: carrier.cancellationRate,
      icon: <ShieldIcon className="text-brand !text-xl" />,
      subtext: "Chỉ số an toàn vận hành",
      badgeColor: "bg-brand-soft text-brand border-brand-soft",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
      {stats.map((item, index) => (
        <RoundedBox key={index} padding="sm" className="hover:-translate-y-1 transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-ink-muted">{item.label}</span>
            <div className={`p-2 rounded-xl border ${item.badgeColor}`}>
              {item.icon}
            </div>
          </div>
          <div className="text-xl md:text-2xl font-black text-ink tracking-tight">
            {item.value}
          </div>
          <p className="text-[0.7rem] text-ink-subtle font-medium mt-1">
            {item.subtext}
          </p>
        </RoundedBox>
      ))}
    </div>
  );
}
