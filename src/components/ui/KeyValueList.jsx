"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

/** Definition list of label/value pairs; one column on phones. */
export default function KeyValueList({ items = [], columns = 2 }) {
  const visible = items.filter((item) => item && !item.hidden);
  return (
    <Box
      component="dl"
      sx={{ m: 0, display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", sm: `repeat(${columns}, minmax(0, 1fr))` } }}
    >
      {visible.map((item) => (
        <Box key={item.label} sx={{ minWidth: 0 }}>
          <Typography component="dt" variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
            {item.label}
          </Typography>
          <Typography
            component="dd"
            className={item.numeric ? "tabular" : undefined}
            sx={{ m: 0, color: "text.primary", fontWeight: item.strong ? 700 : 500, overflowWrap: "anywhere" }}
          >
            {item.value ?? "Chưa cập nhật"}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
