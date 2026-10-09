"use client";

import Typography from "@mui/material/Typography";
import StarIcon from "@mui/icons-material/Star";
import RateReviewIcon from "@mui/icons-material/RateReviewOutlined";
import { RoundedBox } from "@/components/common";
import { formatDateTime } from "@/lib/format";
import { getReviewDistribution, getReviewHeadline } from "./carrierReviewPresentation";

/**
 * Shipper reviews of a carrier, from its completed trips. It shows the same summary as the winner-selection modal:
 * the average, the count and the five-star distribution. Reviewers are anonymous by design, so no name is shown.
 * `summary` is null when the summary did not load; the card then says so instead of showing zero reviews.
 */
export default function CarrierReviewsCard({ summary = null, reviews = [] }) {
  const headline = getReviewHeadline(summary);
  const bars = getReviewDistribution(summary);
  const total = Number(summary?.reviewCount) || 0;

  return (
    <RoundedBox className="mb-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
        <div className="flex items-center gap-2">
          <RateReviewIcon className="text-warning" />
          <Typography variant="h6" className="!font-bold text-ink !text-base">
            Đánh giá từ chủ hàng
          </Typography>
        </div>
        <span className="text-xs font-bold text-warning bg-warning-soft px-2.5 py-0.5 rounded-full border border-warning-soft flex items-center gap-1">
          <StarIcon className="!text-[0.85rem]" />
          {headline.text}
        </span>
      </div>

      {headline.state === "NOT_LOADED" ? (
        <p className="rounded-xl border border-dashed border-line bg-surface-sunken p-4 text-xs text-ink-muted">
          Chưa tải được đánh giá của nhà xe này. Tải lại trang để thử lại.
        </p>
      ) : headline.state === "EMPTY" ? (
        <p className="rounded-xl border border-dashed border-line bg-surface-sunken p-4 text-xs text-ink-muted">
          Chưa có đánh giá đã xác thực cho nhà xe này từ các chuyến đã hoàn tất.
        </p>
      ) : (
        <>
          <ul className="space-y-1.5" aria-label="Phân bố số sao">
            {bars.map((bar) => (
              <li key={bar.stars} className="flex items-center gap-2 text-xs text-ink-muted">
                <span className="w-10 shrink-0">{bar.stars} sao</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface-sunken">
                  <span className="block h-full rounded-full bg-warning" style={{ width: `${bar.percent}%` }} />
                </span>
                <span className="w-16 shrink-0 text-right">{bar.count} ({bar.percent}%)</span>
              </li>
            ))}
          </ul>

          <ul className="space-y-3">
            {reviews.map((review) => (
              <li key={review.id} className="bg-surface-sunken p-4 rounded-xl border border-line space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-warning font-bold text-xs" aria-label={`${review.rating} sao`}>
                    {"★".repeat(review.rating)}<span className="text-line-strong">{"★".repeat(5 - review.rating)}</span>
                  </span>
                  <span className="text-[0.68rem] text-ink-subtle">{formatDateTime(review.createdAt)}</span>
                </div>
                <p className="text-xs text-ink whitespace-pre-line">{review.comment || "Không có nhận xét."}</p>
              </li>
            ))}
          </ul>
          {total > reviews.length && (
            <p className="text-xs text-ink-muted">Hiển thị {reviews.length} đánh giá mới nhất trong tổng số {total}.</p>
          )}
        </>
      )}
    </RoundedBox>
  );
}
