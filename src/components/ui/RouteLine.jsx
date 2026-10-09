"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";


// DESIGN.md journey card: each stop is a soft row; a round pin marks pickup, a square pin delivery.
function Stop({ label, name, detail, time, last }) {
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "20px 1fr", columnGap: 1.25, alignItems: "start", bgcolor: "var(--color-surface-sunken)", borderRadius: 1, px: 1.5, py: 1.25 }}>
      <Box aria-hidden sx={{ display: "grid", placeItems: "center", height: 20, mt: 0.25 }}>
        <Box sx={{ width: 10, height: 10, borderRadius: last ? "2px" : "50%", border: "2px solid", borderColor: "primary.main", bgcolor: last ? "primary.main" : "background.paper" }} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }}>
          {label}
        </Typography>
        <Typography sx={{ fontWeight: 600, color: "text.primary", overflowWrap: "anywhere" }}>{name || "Chưa cập nhật"}</Typography>
        {detail && detail !== name && (
          <Typography variant="body2" sx={{ color: "text.secondary", overflowWrap: "anywhere" }}>
            {detail}
          </Typography>
        )}
        {time && (
          <Typography variant="body2" className="tabular" sx={{ color: "text.secondary", mt: 0.25 }}>
            {time}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

/**
 * Origin → destination, the first thing a freight user scans.
 * `compact` keeps it to one line for list rows; otherwise stacks with optional details.
 */
export default function RouteLine({ from, to, fromDetail, toDetail, fromTime, toTime, compact = false, component = "p" }) {
  if (compact) {
    return (
      <Typography
        component={component}
        sx={{ fontWeight: 700, color: "text.primary", display: "flex", alignItems: "baseline", gap: 0.75, flexWrap: "wrap", minWidth: 0, fontSize: "0.9375rem" }}
      >
        <Box component="span" sx={{ overflowWrap: "anywhere" }}>
          {from || "Chưa rõ điểm đi"}
        </Box>
        <Box component="span" aria-hidden sx={{ color: "text.secondary", fontWeight: 400 }}>
          →
        </Box>
        <Box component="span" className="sr-only">
          đến
        </Box>
        <Box component="span" sx={{ overflowWrap: "anywhere" }}>
          {to || "Chưa rõ điểm đến"}
        </Box>
      </Typography>
    );
  }

  return (
    <Box sx={{ display: "grid", gap: 0.75 }}>
      <Stop label="Điểm lấy hàng" name={from} detail={fromDetail} time={fromTime} />
      <Stop label="Điểm giao hàng" name={to} detail={toDetail} time={toTime} last />
    </Box>
  );
}
