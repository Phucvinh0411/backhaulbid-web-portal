"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Panel } from "@/components/ui";
import { formatDateTime, formatMoney } from "@/lib/format";

/**
 * Bid history as the bidding-service exposes it to carriers:
 * PUBLIC rooms list every bid (competitors anonymised), SEALED rooms list only the carrier's own bids.
 */
export default function CarrierBidHistoryCard({ bidHistory = [], auctionType, winningBidId = null, loading = false }) {
  const sealed = auctionType === "SEALED";
  const sorted = [...bidHistory].sort((a, b) => new Date(b.time) - new Date(a.time));

  return (
    <Panel
      title={sealed ? "Giá bạn đã gửi" : "Diễn biến giá"}
      subtitle={sealed ? "Đấu giá kín: chỉ bạn thấy các giá này." : "Mọi giá trong phòng, nhà xe khác được ẩn danh."}
      padded={false}
    >
      {loading ? (
        <Typography variant="body2" sx={{ p: 2, color: "text.secondary" }}>
          Đang tải lịch sử giá...
        </Typography>
      ) : sorted.length === 0 ? (
        <Typography variant="body2" sx={{ p: 2, color: "text.secondary" }}>
          {sealed ? "Bạn chưa gửi giá nào." : "Chưa có giá nào. Giá đầu tiên có thể bằng giá trần."}
        </Typography>
      ) : (
        <Box component="ol" sx={{ m: 0, p: 0, maxHeight: 360, overflowY: "auto" }} aria-live="polite">
          {sorted.map((bid) => {
            const won = winningBidId && bid.id === winningBidId;
            return (
              <Box
                component="li"
                key={bid.id}
                sx={{ listStyle: "none", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1, px: 2, py: 1.25, borderTop: "1px solid", borderColor: "divider", bgcolor: bid.isMe ? "var(--color-brand-soft)" : "transparent" }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: bid.isMe ? 700 : 500, fontSize: "0.875rem" }}>
                    {bid.isMe ? "Bạn" : "Nhà xe khác"}
                    {won ? " · Giá thắng" : ""}
                  </Typography>
                  <Typography variant="caption" className="tabular" sx={{ color: "text.secondary" }}>
                    {formatDateTime(bid.time, "Vừa xong")}
                  </Typography>
                </Box>
                <Typography className="tabular" sx={{ fontWeight: 700 }}>
                  {formatMoney(bid.amount)}
                </Typography>
              </Box>
            );
          })}
        </Box>
      )}
    </Panel>
  );
}
