"use client";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CheckIcon from "@mui/icons-material/Check";
import LocalShippingIcon from "@mui/icons-material/LocalShippingOutlined";
import { TRIP_STEPS, getTripStatusMeta } from "@/lib/statusMeta";

const LABELS = ["Chờ lấy", "Đã lấy", "Vận chuyển", "Đã giao", "Hoàn tất"];
export default function TripProgress({ status }) {
  const current = getTripStatusMeta(status).step;
  if (current < 0) return null;
  return <Box component="ol" aria-label="Tiến trình giao hàng" sx={{ p: 0, m: 0, display: "grid", gridTemplateColumns: "repeat(5,minmax(0,1fr))" }}>
    {TRIP_STEPS.map((step, index) => {
      const done = index < current || status === "COMPLETED", active = index === current;
      return <Box component="li" key={step} aria-current={active ? "step" : undefined} sx={{ listStyle: "none", position: "relative", textAlign: "center", minWidth: 0 }}>
        {index < 4 && <Box aria-hidden sx={{ position: "absolute", height: 2, top: 16, left: "50%", width: "100%", bgcolor: index < current ? "primary.main" : "divider" }} />}
        <Box sx={{ mx: "auto", position: "relative", display: "grid", placeItems: "center", width: 34, height: 34, borderRadius: "50%", bgcolor: done || active ? "primary.main" : "background.paper", color: done || active ? "white" : "text.secondary", border: "2px solid", borderColor: done || active ? "primary.main" : "divider", boxShadow: active && !done ? "0 0 0 4px var(--color-brand-soft)" : "none" }}>
          {done ? <CheckIcon sx={{ fontSize: 18 }} /> : active ? <LocalShippingIcon sx={{ fontSize: 18 }} /> : <Typography variant="caption">{index + 1}</Typography>}
        </Box>
        <Typography variant="caption" sx={{ display: "block", mt: 1, px: 0.25, fontWeight: active ? 700 : 500, color: done || active ? "text.primary" : "text.secondary", fontSize: { xs: "0.68rem", sm: "0.78rem" } }}>{LABELS[index]}<Box component="span" className="sr-only">{done ? " · đã qua" : active ? " · hiện tại" : " · chưa tới"}</Box></Typography>
      </Box>;
    })}
  </Box>;
}
