"use client";

import StarIcon from "@mui/icons-material/Star";
import ShieldIcon from "@mui/icons-material/ShieldOutlined";
import { RoundedBox } from "@/components/common";
import { getReviewHeadline } from "./carrierReviewPresentation";

export default function CarrierStatsGrid({ carrier }) {
  const stats = [
    {
      label: "Đánh giá sao",
      value: getReviewHeadline(carrier.reviewSummary).text,
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
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
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
