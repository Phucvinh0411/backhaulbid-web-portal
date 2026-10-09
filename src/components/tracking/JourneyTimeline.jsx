"use client";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CheckIcon from "@mui/icons-material/Check";
import { Panel } from "@/components/ui";
import { formatDateTime } from "@/lib/format";
import { toMediaViewUrl } from "@/lib/mediaUrl";
import { GATEWAY_URL } from "@/config/clientConfig";
import { buildJourneyTimeline } from "./trackingPresentation";

export default function JourneyTimeline({ events, milestones }) {
  const rows = buildJourneyTimeline(events, milestones);
  return <Panel title="Hành trình giao hàng" subtitle="Các mốc được xác nhận trong chuyến" id="journey-timeline">
    {!rows.length ? <Typography variant="body2" sx={{ color: "text.secondary", py: 2 }}>Chưa có mốc được ghi nhận. Hành trình sẽ xuất hiện khi tài xế hoặc nhà xe xác nhận giao nhận.</Typography> : <Box component="ol" sx={{ m: 0, p: 0 }}>
      {rows.map((row, index) => {
        const day = new Date(row.time).toLocaleDateString("vi-VN", { day: "2-digit", month: "long", year: "numeric" });
        const previousDay = index > 0 ? new Date(rows[index - 1].time).toLocaleDateString("vi-VN", { day: "2-digit", month: "long", year: "numeric" }) : null;
        return <Box component="li" key={row.key} sx={{ listStyle: "none" }}>
          {day !== previousDay && <Typography component="h3" variant="caption" sx={{ color: "text.secondary", fontWeight: 600, mb: 1.5, mt: index ? 1 : 0 }}>{day}</Typography>}
          <Box sx={{ display: "grid", gridTemplateColumns: "28px minmax(0,1fr)", gap: 1.5 }}>
            <Box sx={{ position: "relative", display: "flex", justifyContent: "center" }}>
              {index < rows.length - 1 && <Box aria-hidden sx={{ position: "absolute", top: 24, bottom: -12, width: 2, bgcolor: "divider" }} />}
              <Box sx={{ position: "relative", width: 26, height: 26, borderRadius: "50%", display: "grid", placeItems: "center", bgcolor: row.incident ? "warning.light" : index === 0 ? "primary.main" : "var(--color-brand-soft)", color: row.incident ? "warning.dark" : index === 0 ? "white" : "primary.main" }}>
                {row.incident ? <WarningAmberIcon sx={{ fontSize: 16 }} /> : <CheckIcon sx={{ fontSize: 16 }} />}
              </Box>
            </Box>
            <Box sx={{ pb: 2.75, minWidth: 0 }}>
              <Typography sx={{ fontWeight: index === 0 ? 700 : 600, color: index === 0 ? "primary.main" : "text.primary", fontSize: "0.9rem" }}>{row.title}</Typography>
              <Typography variant="caption" className="tabular" sx={{ color: "text.secondary", display: "block", mt: 0.25 }}>{formatDateTime(row.time)}{index === 0 ? " · Mới nhất" : ""}</Typography>
              {row.note && <Typography variant="body2" sx={{ mt: 0.75, overflowWrap: "anywhere", color: "text.secondary" }}>{row.note}</Typography>}
              {row.evidenceUrl && <Typography component="a" href={toMediaViewUrl(row.evidenceUrl, GATEWAY_URL)} target="_blank" rel="noreferrer" variant="body2" sx={{ display: "inline-block", pt: 0.75, color: "primary.main", fontWeight: 600 }}>Xem bằng chứng</Typography>}
            </Box>
          </Box>
        </Box>;
      })}
    </Box>}
  </Panel>;
}
