"use client";

import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const TONE_BY_COLOR = {
  "var(--color-brand)": "var(--color-brand)",
  "var(--color-info)": "var(--color-info)",
  "var(--color-success)": "var(--color-success)",
  "var(--color-warning)": "var(--color-warning)",
};

/** Compact metric: label, value, optional context. Flat, no gradients. */
export default function StatCard({ title, value, subtitle, icon: Icon, color = "var(--color-brand)", tooltipInfo, href }) {
  const accent = TONE_BY_COLOR[color] || color;
  const content = (
    <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1.5 }}>
      <Box sx={{ minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 600 }}>{title}</Typography>
          {tooltipInfo && (
            <Tooltip title={tooltipInfo} placement="top" arrow>
              <InfoOutlinedIcon tabIndex={0} aria-label={tooltipInfo} sx={{ fontSize: 16, color: "text.secondary" }} />
            </Tooltip>
          )}
        </Box>
        <Typography className="tabular" sx={{ fontSize: { xs: "1.25rem", md: "1.5rem" }, fontWeight: 700, color: "text.primary", mt: 0.5 }}>
          {value}
        </Typography>
        {subtitle && <Typography variant="caption" sx={{ color: "text.secondary" }}>{subtitle}</Typography>}
      </Box>
      {Icon && (
        <Box aria-hidden sx={{ width: 40, height: 40, borderRadius: 2, display: "grid", placeItems: "center", bgcolor: "var(--color-surface-sunken)", color: accent, flexShrink: 0 }}>
          <Icon sx={{ fontSize: 22 }} />
        </Box>
      )}
    </Box>
  );
  return (
    <Box
      component={href ? "a" : "div"}
      href={href}
      sx={{ display: "block", height: "100%", p: 2, border: "1px solid", borderColor: "divider", borderRadius: 3, bgcolor: "background.paper", textDecoration: "none", "&:hover": href ? { borderColor: "var(--color-line-strong)" } : undefined }}
    >
      {content}
    </Box>
  );
}
