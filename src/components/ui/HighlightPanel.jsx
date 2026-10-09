"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

/**
 * DESIGN.md "dải navy đậm": the one inverted panel per screen for its most important fact
 * (bid room, wallet balance, most urgent task). Buttons inside should be white
 * (variant="contained" color="inherit" with `sx={HighlightPanel.buttonSx}`).
 */
export default function HighlightPanel({ eyebrow, title, value, caption, actions, children, component = "section", sx, ...rest }) {
  return (
    <Box
      component={component}
      sx={{ bgcolor: "var(--color-band)", color: "common.white", borderRadius: 2, p: { xs: 2.5, md: 3 }, display: "grid", gap: 1.5, ...sx }}
      {...rest}
    >
      {eyebrow ? (
        <Typography component="p" sx={{ fontSize: "0.75rem", fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--color-on-band-soft)" }}>
          {eyebrow}
        </Typography>
      ) : null}
      {title ? <Typography component="h2" sx={{ fontSize: "1.125rem", fontWeight: 700 }}>{title}</Typography> : null}
      {value !== undefined && value !== null ? (
        <Typography component="p" className="tabular" sx={{ fontSize: { xs: "1.75rem", md: "2rem" }, fontWeight: 700, lineHeight: 1.2 }}>
          {value}
        </Typography>
      ) : null}
      {caption ? <Typography variant="body2" sx={{ color: "var(--color-on-band-soft)" }}>{caption}</Typography> : null}
      {children}
      {actions ? <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 0.5 }}>{actions}</Box> : null}
    </Box>
  );
}

/** White pill on the navy band, navy label (DESIGN.md: primary action inside the band). */
HighlightPanel.buttonSx = {
  bgcolor: "common.white",
  color: "primary.main",
  "&:hover": { bgcolor: "var(--color-brand-soft)" },
};

/** Secondary action inside the band: outlined white. */
HighlightPanel.secondaryButtonSx = {
  color: "common.white",
  borderColor: "rgba(255,255,255,0.4)",
  bgcolor: "transparent",
  "&:hover": { borderColor: "common.white", bgcolor: "var(--color-band-hover)" },
};
