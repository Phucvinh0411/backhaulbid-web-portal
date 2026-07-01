"use client";

import { useState, useEffect } from "react";
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
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import LocalShippingTwoToneIcon from "@mui/icons-material/LocalShippingTwoTone";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import SettingsTwoToneIcon from "@mui/icons-material/SettingsTwoTone";
import navigation from "@/configs/navigation";

const SIDEBAR_WIDTH = 280;

export default function Sidebar({ open, onClose, variant = "permanent" }) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState({});

  // Auto-expand menu groups when pathname matches any sub-item
  useEffect(() => {
    navigation.forEach((group) => {
      group.items.forEach((item) => {
        if (item.children && item.children.some((child) => pathname === child.path)) {
          setOpenMenus((prev) => ({ ...prev, [item.path]: true }));
        }
      });
    });
  }, [pathname]);

  const handleToggle = (path) => {
    setOpenMenus((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const isActive = (path) => pathname === path || pathname.startsWith(path + "/");

  const drawerContent = (
    <Box className="flex flex-col h-full bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_0_rgba(27,73,101,0.05)] rounded-3xl p-4">
      {/* Brand Header */}
      <Box className="flex items-center gap-3.5 px-3 py-4 mb-4">
        <Box 
          className="flex items-center justify-center w-11 h-11 rounded-2xl shadow-lg transition-all duration-300 hover:rotate-6 hover:scale-105"
          style={{
            background: "linear-gradient(135deg, #1B4965 0%, #62B6CB 100%)",
            boxShadow: "0 8px 20px rgba(27, 73, 101, 0.25)",
          }}
        >
          <LocalShippingTwoToneIcon sx={{ color: "#fff", fontSize: 24 }} />
        </Box>
        <Box>
          <Typography variant="h6" className="!text-[1.05rem] !font-black !leading-tight text-slate-800 tracking-tight">
            BackHaulBid
          </Typography>
          <Typography variant="caption" className="!text-[0.7rem] text-cyan-600 !font-bold tracking-widest uppercase">
            B2B Logistics
          </Typography>
        </Box>
      </Box>

      {/* Navigation List */}
      <Box className="flex-1 overflow-y-auto pr-1 -mr-2 sidebar-scroll">
        {navigation.map((group, groupIdx) => (
          <Box key={groupIdx} className="mb-6">
            <Typography
              variant="overline"
              className="!text-[0.65rem] !font-extrabold text-slate-400 !tracking-widest px-4.5 py-1.5 block"
            >
              {group.title}
            </Typography>

            <List disablePadding className="space-y-1">
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
                      className="!rounded-xl !mb-0.5 group/btn relative overflow-hidden"
                      sx={{
                        minHeight: 46,
                        px: 2.5,
                        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                        "&.Mui-selected": {
                          background: "linear-gradient(135deg, rgba(27, 73, 101, 0.08) 0%, rgba(98, 182, 203, 0.04) 100%)",
                          color: "#1B4965",
                          fontWeight: 700,
                          "&:hover": { 
                            background: "linear-gradient(135deg, rgba(27, 73, 101, 0.12) 0%, rgba(98, 182, 203, 0.06) 100%)" 
                          },
                        },
                        "&:hover": { 
                          backgroundColor: "rgba(27, 73, 101, 0.03)",
                          transform: "translateX(4px)",
                        },
                      }}
                    >
                      {/* Active indicator bar */}
                      {active && !hasChildren && (
                        <Box 
                          className="absolute left-0 w-1.5 h-6 rounded-r-full"
                          style={{
                            background: "linear-gradient(180deg, #1B4965 0%, #62B6CB 100%)"
                          }}
                        />
                      )}

                      <ListItemIcon 
                        sx={{ 
                          minWidth: 36, 
                          color: active ? "#1B4965" : "#94A3B8",
                          transition: "color 0.25s",
                          ".group-hover\\/btn:hover &": { color: "#1B4965" }
                        }}
                      >
                        <Icon fontSize="medium" />
                      </ListItemIcon>
                      
                      <ListItemText
                        primary={item.title}
                        primaryTypographyProps={{
                          fontSize: "0.88rem",
                          fontWeight: active ? 700 : 500,
                          className: active ? "text-[#1B4965]" : "text-slate-600 hover:text-slate-800"
                        }}
                      />
                      
                      {hasChildren && (
                        isOpen ? (
                          <ExpandLess fontSize="small" sx={{ color: "#1B4965" }} />
                        ) : (
                          <ExpandMore fontSize="small" sx={{ color: "#94A3B8" }} />
                        )
                      )}
                    </ListItemButton>

                    {hasChildren && (
                      <Collapse in={isOpen} timeout="auto" unmountOnExit>
                        <List disablePadding className="mt-1 pl-4 border-l-2 border-slate-100 ml-6 space-y-1">
                          {item.children.map((child) => {
                            const childActive = pathname === child.path;
                            return (
                              <ListItemButton
                                key={child.path}
                                component={Link}
                                href={child.path}
                                selected={childActive}
                                className="!rounded-lg relative"
                                sx={{
                                  minHeight: 36,
                                  px: 2,
                                  transition: "all 0.2s",
                                  "&.Mui-selected": {
                                    backgroundColor: "rgba(27, 73, 101, 0.05)",
                                    color: "#1B4965",
                                    "&:hover": { backgroundColor: "rgba(27, 73, 101, 0.08)" }
                                  },
                                  "&:hover": {
                                    backgroundColor: "rgba(0, 0, 0, 0.02)",
                                    transform: "translateX(2px)",
                                  }
                                }}
                              >
                                {childActive && (
                                  <Box 
                                    className="absolute left-0 w-1 h-4 rounded-r-full"
                                    style={{
                                      background: "#1B4965",
                                      marginLeft: "-2px"
                                    }}
                                  />
                                )}
                                <ListItemText
                                  primary={child.title}
                                  primaryTypographyProps={{
                                    fontSize: "0.82rem",
                                    fontWeight: childActive ? 700 : 500,
                                    className: childActive ? "text-[#1B4965]" : "text-slate-500 hover:text-slate-800"
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

      {/* User Session profile widget at bottom */}
      <Box 
        className="mt-auto p-3.5 rounded-2xl flex items-center gap-3 border border-slate-100/60"
        style={{
          background: "linear-gradient(135deg, rgba(27,73,101,0.02) 0%, rgba(98,182,203,0.02) 100%)",
        }}
      >
        <Avatar
          sx={{
            width: 38,
            height: 38,
            bgcolor: "#1B4965",
            fontSize: "0.95rem",
            fontWeight: 700,
            border: "2px solid #fff",
            boxShadow: "0 4px 10px rgba(27, 73, 101, 0.15)",
          }}
        >
          A
        </Avatar>
        <Box className="flex-1 min-w-0">
          <Typography variant="body2" className="!text-[0.82rem] !font-bold text-slate-700 truncate leading-none mb-1">
            Admin User
          </Typography>
          <Typography variant="caption" className="!text-[0.68rem] text-slate-400 font-medium truncate block leading-none">
            admin@backhaulbid.vn
          </Typography>
        </Box>
        <Box className="flex gap-0.5">
          <Tooltip title="Cài đặt">
            <IconButton size="small" component={Link} href="/settings" sx={{ color: "#94A3B8", "&:hover": { color: "#1B4965" } }}>
              <SettingsTwoToneIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Đăng xuất">
            <IconButton size="small" sx={{ color: "#94A3B8", "&:hover": { color: "#F43F5E" } }}>
              <LogoutRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
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
          border: "none",
          background: "transparent",
          p: variant === "permanent" ? 2.5 : 2, // Floating padding
          pr: variant === "permanent" ? 1.25 : 2,
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}

export { SIDEBAR_WIDTH };
