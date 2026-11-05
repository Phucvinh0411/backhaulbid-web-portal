"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { StatusBadge } from "@/components/ui";
import { formatDateTime } from "@/lib/format";
import { locationSourceLabel, locationTime } from "./trackingPresentation";

function formatDistance(meters) {
  if (meters == null || !Number.isFinite(meters)) return "—";
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}

function formatEta(seconds, nowMs) {
  if (seconds == null || !Number.isFinite(seconds)) return { main: "—", sub: "" };
  if (seconds <= 60) return { main: "Sắp đến nơi", sub: "Dưới 1 phút" };
  const totalMin = Math.round(seconds / 60);
  const main =
    totalMin < 60
      ? `~${totalMin} phút`
      : `~${Math.floor(totalMin / 60)} giờ ${totalMin % 60 ? `${totalMin % 60} phút` : ""}`.trim();
  const arrivalDate = new Date(nowMs + seconds * 1000);
  const sub = `Dự kiến ${arrivalDate.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`;
  return { main, sub };
}

function formatRelativeAgo(isoTime, nowMs) {
  if (!isoTime) return "";
  const timeMs = new Date(isoTime).getTime();
  if (!Number.isFinite(timeMs)) return "";
  const diffSec = Math.max(0, Math.floor((nowMs - timeMs) / 1000));
  if (diffSec < 3) return "Cập nhật vừa xong";
  if (diffSec < 60) return `Cập nhật ${diffSec} giây trước`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `Cập nhật ${diffMin} phút trước`;
  return `Cập nhật lúc ${formatDateTime(isoTime)}`;
}

export default function LiveTrackingCard({
  freshness,
  latestLocation,
  progress,
  speedKmh,
  historySampled,
  historyTotalPoints,
}) {
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const observedAt = locationTime(latestLocation);
  const relativeText = formatRelativeAgo(observedAt, nowMs);
  const eta = formatEta(progress?.etaSeconds, nowMs);
  const ratioPercent =
    progress?.progressRatio != null
      ? Math.min(100, Math.max(0, Math.round(progress.progressRatio * 100)))
      : null;

  return (
    <Box sx={{ px: 2, pb: 2, pt: 1.5, borderTop: "1px solid", borderColor: "divider", bgcolor: "var(--color-surface-sunken, rgba(248,250,252,0.7))" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
          <StatusBadge size="sm" meta={freshness} />
          {latestLocation && (
            <Typography variant="caption" className="tabular" sx={{ fontWeight: 600, color: "text.primary" }}>
              {relativeText}
            </Typography>
          )}
          {latestLocation && (
            <Typography variant="caption" className="tabular" sx={{ color: "text.secondary" }}>
              · {locationSourceLabel(latestLocation.source)} ({formatDateTime(observedAt)}
              {latestLocation.accuracyMeters != null ? ` · ±${Math.round(latestLocation.accuracyMeters)} m` : ""})
            </Typography>
          )}
        </Box>
        {ratioPercent != null && (
          <Typography variant="caption" className="tabular" sx={{ fontWeight: 700, color: "primary.main" }}>
            Hoàn thành {ratioPercent}% lộ trình
          </Typography>
        )}
      </Box>

      {ratioPercent != null && (
        <Box sx={{ mt: 1.25, height: 7, borderRadius: 999, bgcolor: "divider", overflow: "hidden" }}>
          <Box
            sx={{
              height: "100%",
              width: `${ratioPercent}%`,
              bgcolor: "info.main",
              borderRadius: 999,
              transition: "width 0.6s ease-out",
            }}
          />
        </Box>
      )}

      {(progress?.traveledMeters > 0 || progress?.remainingMeters != null || latestLocation) && (
        <Box
          sx={{
            mt: 1.5,
            display: "grid",
            gap: 1.5,
            gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", sm: "repeat(4, minmax(0, 1fr))" },
          }}
        >
          <Box sx={{ p: 1.25, bgcolor: "background.paper", borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
              Quãng đường đã đi
            </Typography>
            <Typography className="tabular" sx={{ fontWeight: 700, fontSize: "1rem", mt: 0.25 }}>
              {formatDistance(progress?.traveledMeters)}
            </Typography>
          </Box>

          <Box sx={{ p: 1.25, bgcolor: "background.paper", borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
              Quãng đường còn lại
            </Typography>
            <Typography className="tabular" sx={{ fontWeight: 700, fontSize: "1rem", mt: 0.25 }}>
              {formatDistance(progress?.remainingMeters)}
            </Typography>
          </Box>

          <Box sx={{ p: 1.25, bgcolor: "background.paper", borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
              Thời gian dự kiến (ETA)
            </Typography>
            <Typography className="tabular" sx={{ fontWeight: 700, fontSize: "1rem", mt: 0.25, color: "primary.main" }}>
              {eta.main}
            </Typography>
            {eta.sub && (
              <Typography variant="caption" className="tabular" sx={{ color: "text.secondary", display: "block" }}>
                {eta.sub}
              </Typography>
            )}
          </Box>

          <Box sx={{ p: 1.25, bgcolor: "background.paper", borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
            <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
              Tốc độ xe
            </Typography>
            <Typography className="tabular" sx={{ fontWeight: 700, fontSize: "1rem", mt: 0.25 }}>
              {speedKmh != null ? `${speedKmh} km/h` : latestLocation ? "Đang dừng / Chậm" : "—"}
            </Typography>
          </Box>
        </Box>
      )}

      <Box sx={{ mt: 1, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
          {freshness.message}
        </Typography>
        {historySampled && (
          <Typography variant="caption" className="tabular" sx={{ color: "text.secondary" }}>
            Vệt đường đi lấy mẫu từ {historyTotalPoints.toLocaleString("vi-VN")} điểm GPS
          </Typography>
        )}
      </Box>
    </Box>
  );
}

