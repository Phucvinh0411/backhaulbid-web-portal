"use client";

import Typography from "@mui/material/Typography";
import StarIcon from "@mui/icons-material/Star";
import RateReviewIcon from "@mui/icons-material/RateReviewOutlined";
import { RoundedBox } from "@/components/common";

export default function CarrierReviewsCard({ reviews = [] }) {
  return (
    <RoundedBox className="mb-6 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <RateReviewIcon className="text-amber-500" />
          <Typography variant="h6" className="!font-bold text-slate-800 !text-base">
            4. Phản Hồi & Đánh Giá Từ Các Chủ Hàng Đã Hợp Tác ({reviews.length} Nhận xét)
          </Typography>
        </div>
        <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
          <StarIcon className="!text-[0.85rem]" />
          {reviews.length ? "Có dữ liệu đánh giá" : "Chưa có dữ liệu đánh giá"}
        </span>
      </div>

      <div className="space-y-3">
        {reviews.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs text-slate-500">
            Hệ thống chưa có đánh giá đã xác thực cho nhà xe này.
          </p>
        ) : reviews.map((rev) => (
          <div key={rev.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
            <div className="flex items-center justify-between">
              <strong className="text-slate-800 text-xs font-bold">{rev.shipperName}</strong>
              <div className="flex items-center gap-1 text-amber-500 font-bold text-xs">
                <StarIcon className="!text-[0.9rem]" /> {rev.rating} / 5.0
                <span className="text-[0.68rem] text-slate-400 font-normal ml-2">{rev.date}</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 italic leading-relaxed">
              "{rev.comment}"
            </p>
          </div>
        ))}
      </div>
    </RoundedBox>
  );
}
