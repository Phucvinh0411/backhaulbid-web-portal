"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import MenuIcon from "@mui/icons-material/MenuRounded";
import { isPathActive } from "@/navigation/navigation";

const itemSx = (active) => ({
  flex: 1,
  minWidth: 0,
  minHeight: 56,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 0.25,
  color: active ? "primary.main" : "text.secondary",
  fontSize: "0.75rem",
  fontWeight: active ? 700 : 600,
  textDecoration: "none",
  position: "relative",
  "&::before": active
    ? { content: '""', position: "absolute", top: 0, left: "25%", right: "25%", height: 3, borderRadius: "0 0 3px 3px", bgcolor: "primary.main" }
    : undefined,
  "&:focus-visible": { outline: "2px solid var(--color-focus)", outlineOffset: -2 },
});

/**
 * Role-specific bottom navigation for phones and small tablets (< md).
 * Four task destinations plus "Thêm", which opens the full navigation drawer.
 */
export default function MobileBottomNav({ items = [], onOpenMore }) {
  const pathname = usePathname();
  if (!items.length) return null;

  return (
    <Box
      component="nav"
      aria-label="Điều hướng chính"
      sx={{
        display: { xs: "flex", md: "none" },
        position: "fixed",
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1100,
        bgcolor: "background.paper",
        borderTop: "1px solid",
        borderColor: "divider",
        height: "calc(var(--app-bottom-nav-height) + var(--safe-bottom))",
        pb: "var(--safe-bottom)",
      }}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const active = isPathActive(pathname, item.path, { exact: item.exact, match: item.match });
        return (
          <Box key={item.path} component={Link} href={item.path} aria-current={active ? "page" : undefined} sx={itemSx(active)}>
            {Icon && <Icon aria-hidden sx={{ fontSize: 24 }} />}
            <Box component="span" sx={{ maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", px: 0.5 }}>
              {item.title}
            </Box>
          </Box>
        );
      })}
      <ButtonBase onClick={onOpenMore} aria-label="Mở toàn bộ menu" sx={itemSx(false)}>
        <MenuIcon aria-hidden sx={{ fontSize: 24 }} />
        <Box component="span">Thêm</Box>
      </ButtonBase>
    </Box>
  );
}
