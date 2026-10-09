"use client";

import Box from "@mui/material/Box";

/**
 * Primary actions pinned above the bottom navigation on phones (thumb zone),
 * rendered inline from md up. A spacer reserves the bar's height so the end of
 * the page, including form errors, is never hidden behind it.
 */
export default function StickyActionBar({ children, hint, withBottomNav = true }) {
  return (
    <>
      <Box
        sx={{
          display: { xs: "block", md: "none" },
          position: "fixed",
          left: 0,
          right: 0,
          bottom: withBottomNav ? "calc(var(--app-bottom-nav-height) + var(--safe-bottom))" : "0px",
          pb: withBottomNav ? 1.25 : "calc(10px + var(--safe-bottom))",
          zIndex: 1090,
          bgcolor: "background.paper",
          borderTop: "1px solid",
          borderColor: "divider",
          px: 2,
          pt: 1.25,
        }}
      >
        {hint && <Box sx={{ fontSize: "0.8125rem", color: "text.secondary", mb: 1 }}>{hint}</Box>}
        <Box sx={{ display: "flex", gap: 1, "& > *": { flex: 1 } }}>{children}</Box>
      </Box>
      <Box sx={{ display: { xs: "none", md: "flex" }, gap: 1, flexWrap: "wrap", alignItems: "center" }}>
        {hint && <Box sx={{ fontSize: "0.8125rem", color: "text.secondary", width: "100%" }}>{hint}</Box>}
        {children}
      </Box>
      <Box aria-hidden sx={{ display: { xs: "block", md: "none" }, height: hint ? 112 : 76 }} />
    </>
  );
}
