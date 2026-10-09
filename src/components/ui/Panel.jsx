"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

/** Bordered content section with an optional title row. Never nest one Panel inside another. */
export default function Panel({ title, subtitle, actions, children, padded = true, as = "section", className, sx, headingLevel = 2, id }) {
  const headingId = id ? `${id}-title` : undefined;
  return (
    <Box
      component={as}
      id={id}
      aria-labelledby={title && headingId ? headingId : undefined}
      className={className}
      sx={{ bgcolor: "background.paper", border: "1px solid", borderColor: "divider", borderRadius: 2, overflow: "hidden", ...sx }}
    >
      {(title || actions) && (
        <Box
          sx={{
            display: "flex",
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
            gap: 1.5,
            flexWrap: "wrap",
            px: 2,
            pt: 1.75,
            pb: padded ? 0 : 1.75,
            borderBottom: padded ? 0 : "1px solid",
            borderColor: "divider",
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            {title && (
              <Typography id={headingId} component={`h${headingLevel}`} sx={{ fontSize: "1rem", fontWeight: 700, color: "text.primary" }}>
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {actions && <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>{actions}</Box>}
        </Box>
      )}
      <Box sx={padded ? { p: 2 } : undefined}>{children}</Box>
    </Box>
  );
}
