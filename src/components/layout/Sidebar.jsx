"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Collapse from "@mui/material/Collapse";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import CloseIcon from "@mui/icons-material/Close";
import { homePathByRole, isPathActive } from "@/navigation/navigation";
import BrandMark from "./BrandMark";

export const SIDEBAR_WIDTH = 264;

function NavContent({ navigation, pathname, onNavigate, role, onClose, showClose }) {
  const [openMenus, setOpenMenus] = useState({});

  useEffect(() => {
    const next = {};
    navigation.forEach((group) =>
      group.items.forEach((item) => {
        if (item.children?.some((child) => isPathActive(pathname, child.path, { exact: child.exact }))) next[item.path] = true;
      }),
    );
    setOpenMenus((prev) => ({ ...prev, ...next }));
  }, [pathname, navigation]);

  const itemActive = (item) =>
    isPathActive(pathname, item.path, { exact: item.exact || item.path.split("/").filter(Boolean).length === 1 }) ||
    item.children?.some((child) => isPathActive(pathname, child.path, { exact: child.exact }));

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", bgcolor: "background.paper" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, minHeight: 64, borderBottom: "1px solid", borderColor: "divider" }}>
        <Box component={Link} href={homePathByRole[role] || "/"} onClick={onNavigate} sx={{ textDecoration: "none" }}>
          <BrandMark />
        </Box>
        {showClose && (
          <IconButton onClick={onClose} aria-label="Đóng menu" sx={{ width: 44, height: 44 }}>
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      <Box component="nav" aria-label="Menu theo vai trò" sx={{ flex: 1, overflowY: "auto", px: 1.5, py: 2 }}>
        {navigation.map((group) => (
          <Box key={group.title} sx={{ mb: 2 }}>
            <Typography component="p" sx={{ px: 1.5, pb: 0.5, fontSize: "0.75rem", fontWeight: 600, color: "var(--color-ink-subtle)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              {group.title}
            </Typography>
            <List disablePadding>
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = Boolean(itemActive(item));
                const hasChildren = Boolean(item.children?.length);
                const isOpen = Boolean(openMenus[item.path]);
                return (
                  <Box component="li" key={item.path} sx={{ listStyle: "none" }}>
                    <ListItemButton
                      component={hasChildren ? "button" : Link}
                      href={hasChildren ? undefined : item.path}
                      onClick={hasChildren ? () => setOpenMenus((prev) => ({ ...prev, [item.path]: !prev[item.path] })) : onNavigate}
                      aria-expanded={hasChildren ? isOpen : undefined}
                      aria-current={!hasChildren && active ? "page" : undefined}
                      selected={!hasChildren && active}
                      sx={{
                        width: "100%",
                        borderRadius: 2,
                        minHeight: 44,
                        px: 1.5,
                        mb: 0.25,
                        color: active ? "primary.main" : "text.primary",
                        // DESIGN.md: active row = soft navy fill + 3 px navy bar on the left.
                        "&.Mui-selected": { bgcolor: "var(--color-brand-soft)", boxShadow: "inset 3px 0 0 var(--color-brand)", "&:hover": { bgcolor: "var(--color-brand-soft)" } },
                      }}
                    >
                      {Icon && (
                        <ListItemIcon sx={{ minWidth: 34, color: active ? "primary.main" : "text.secondary" }}>
                          <Icon fontSize="small" />
                        </ListItemIcon>
                      )}
                      <ListItemText primary={item.title} primaryTypographyProps={{ fontSize: "0.9375rem", fontWeight: active ? 600 : 500 }} />
                      {hasChildren && (isOpen ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />)}
                    </ListItemButton>
                    {hasChildren && (
                      <Collapse in={isOpen} timeout="auto" unmountOnExit>
                        <List disablePadding sx={{ pl: 4.25, mb: 0.5 }}>
                          {item.children.map((child) => {
                            const childActive = isPathActive(pathname, child.path, { exact: child.exact });
                            return (
                              <Box component="li" key={child.path} sx={{ listStyle: "none" }}>
                                <ListItemButton
                                  component={Link}
                                  href={child.path}
                                  onClick={onNavigate}
                                  selected={childActive}
                                  aria-current={childActive ? "page" : undefined}
                                  sx={{ borderRadius: 2, minHeight: 40, px: 1.5, "&.Mui-selected": { bgcolor: "var(--color-brand-soft)", color: "primary.main", boxShadow: "inset 3px 0 0 var(--color-brand)" } }}
                                >
                                  <ListItemText primary={child.title} primaryTypographyProps={{ fontSize: "0.875rem", fontWeight: childActive ? 600 : 500 }} />
                                </ListItemButton>
                              </Box>
                            );
                          })}
                        </List>
                      </Collapse>
                    )}
                  </Box>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

    </Box>
  );
}

/** Permanent sidebar from md up; on phones the same content opens as a drawer from "Thêm". */
export default function Sidebar({ open, onClose, navigation = [], role }) {
  const pathname = usePathname();

  return (
    <>
      <Box
        component="aside"
        sx={{
          display: { xs: "none", md: "block" },
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: SIDEBAR_WIDTH,
          borderRight: "1px solid",
          borderColor: "divider",
          zIndex: 1050,
        }}
      >
        <NavContent navigation={navigation} pathname={pathname} role={role} />
      </Box>
      <Drawer
        anchor="left"
        open={Boolean(open)}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{ display: { xs: "block", md: "none" } }}
        PaperProps={{ sx: { width: "min(320px, 88vw)" } }}
      >
        <NavContent navigation={navigation} pathname={pathname} onNavigate={onClose} onClose={onClose} showClose role={role} />
      </Drawer>
    </>
  );
}
