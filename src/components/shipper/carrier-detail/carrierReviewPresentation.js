// Presentation of the shipper reviews of a carrier on its profile page. Pure: no imports, no network.
// "Chưa có đánh giá" is shown only for a loaded summary with zero reviews. A summary that did not load is never
// shown as zero, because a failed request must not look like a carrier without reviews.

export const REVIEW_STAR_LEVELS = [5, 4, 3, 2, 1];

/** Headline of the summary: an average with its count, an explicit empty state, or a load failure. */
export function getReviewHeadline(summary) {
  if (!summary) return { state: "NOT_LOADED", text: "Chưa tải được đánh giá" };
  if (!summary.reviewCount) return { state: "EMPTY", text: "Chưa có đánh giá" };
  const average = Number(summary.averageRating);
  const averageText = Number.isFinite(average) ? average.toFixed(1) : "—";
  return { state: "LOADED", text: `${averageText} / 5 · ${summary.reviewCount} đánh giá` };
}

/** One bar per star level from 5 down to 1. A missing bucket counts as zero; each share is a whole percent. */
export function getReviewDistribution(summary) {
  const total = Number(summary?.reviewCount) || 0;
  return REVIEW_STAR_LEVELS.map((stars) => {
    const count = Number(summary?.distribution?.[stars]) || 0;
    return { stars, count, percent: total ? Math.round((count / total) * 100) : 0 };
  });
}
