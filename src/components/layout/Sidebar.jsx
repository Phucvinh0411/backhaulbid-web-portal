"use client";

import { useState } from "react";
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
import Divider from "@mui/material/Divider";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import navigation from "@/configs/navigation";

const SIDEBAR_WIDTH = 272;

export default function Sidebar({ open, onClose, variant = "permanent" }) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState({});

  const handleToggle = (path) => {
    setOpenMenus((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const isActive = (path) => pathname === path || pathname.startsWith(path + "/");

  const drawerContent = (
    <Box className="flex flex-col h-full bg-white">
      {/* Logo */}
      <Box className="flex items-center gap-3 px-5 py-5">
        <Box className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-[#1B4965] to-[#62B6CB]">
          <LocalShippingIcon sx={{ color: "#fff", fontSize: 22 }} />
        </Box>
        <Box>
          <Typography variant="h6" className="!text-[1rem] !font-bold !leading-tight text-slate-800">
            BackHaulBid
          </Typography>
          <Typography variant="caption" className="!text-[0.7rem] text-slate-400 !leading-none">
            Transport Platform
          </Typography>
        </Box>
      </Box>

      <Divider className="!mx-4" />

      {/* Navigation */}
      <Box className="flex-1 overflow-y-auto px-3 py-3">
        {navigation.map((group, groupIdx) => (
          <Box key={groupIdx} className="mb-2">
            <Typography
              variant="overline"
              className="!text-[0.65rem] !font-semibold text-slate-400 !tracking-wider px-3 py-2 block"
            >
              {group.title}
            </Typography>

            <List disablePadding>
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                const hasChildren = item.children && item.children.length > 0;
                const isOpen = openMenus[item.path];

                return (
                  <Box key={item.path}>
                    <ListItemButton
                      component={hasChildren ? "div" : Link}
                      href={hasChildren ? undefined : item.path}
                      onClick={hasChildren ? () => handleToggle(item.path) : undefined}
                      selected={active && !hasChildren}
                      className="!rounded-lg !mb-0.5"
                      sx={{
                        minHeight: 42,
                        px: 2,
                        "&.Mui-selected": {
                          backgroundColor: "rgba(27, 73, 101, 0.08)",
                          color: "#1B4965",
                          "&:hover": { backgroundColor: "rgba(27, 73, 101, 0.12)" },
                        },
                        "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" },
                      }}
                    >
                      <ListItemIcon sx={{ minWidth: 36, color: active ? "#1B4965" : "#94A3B8" }}>
                        <Icon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText
                        primary={item.title}
                        primaryTypographyProps={{
                          fontSize: "0.85rem",
                          fontWeight: active ? 600 : 500,
                        }}
                      />
                      {hasChildren && (isOpen ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />)}
                    </ListItemButton>

                    {hasChildren && (
                      <Collapse in={isOpen} timeout="auto" unmountOnExit>
                        <List disablePadding>
                          {item.children.map((child) => {
                            const childActive = pathname === child.path;
                            return (
                              <ListItemButton
                                key={child.path}
                                component={Link}
                                href={child.path}
                                selected={childActive}
                                className="!rounded-lg"
                                sx={{
                                  pl: 6.5,
                                  minHeight: 36,
                                  "&.Mui-selected": {
                                    backgroundColor: "rgba(27, 73, 101, 0.08)",
                                    color: "#1B4965",
                                  },
                                }}
                              >
                                <ListItemText
                                  primary={child.title}
                                  primaryTypographyProps={{
                                    fontSize: "0.8rem",
                                    fontWeight: childActive ? 600 : 400,
                                  }}
                                />
                              </ListItemButton>
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

      {/* Footer */}
      <Divider className="!mx-4" />
      <Box className="px-5 py-3">
        <Typography variant="caption" className="text-slate-400 !text-[0.7rem]">
          © 2026 BackHaulBid v0.1.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={variant}
      open={variant === "permanent" ? true : open}
      onClose={onClose}
      sx={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: SIDEBAR_WIDTH,
          boxSizing: "border-box",
          borderRight: "1px solid rgba(0,0,0,0.06)",
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}

export { SIDEBAR_WIDTH };
