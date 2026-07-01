// ============================================
// src/shared/components/layout/Sidebar.jsx
// Premium 2026 Design - Gradient Sidebar with RBAC
// Glassmorphism + Micro-animations + Active glow
// ============================================

import { useLocation, useNavigate } from "react-router-dom";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import IconButton from "@mui/material/IconButton";
import { getMenuByRole } from "@/shared/constants/navigation";

// ---- Constants ----
export const SIDEBAR_WIDTH = 280;

export default function Sidebar({ userRole, open, onClose, variant = "permanent" }) {
  const location = useLocation();
  const navigate = useNavigate();

  const filteredMenu = getMenuByRole(userRole);

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const drawerContent = (
    <div
      className="flex flex-col h-full relative overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #0A1929 0%, #0D2B3E 40%, #132F4C 100%)",
      }}
    >
      {/* ===== Decorative Background Elements ===== */}
      <div
        className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-[0.03]"
        style={{
          background: "radial-gradient(circle, #5FA8D3 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="absolute bottom-20 left-0 w-32 h-32 rounded-full opacity-[0.04]"
        style={{
          background: "radial-gradient(circle, #62B6CB 0%, transparent 70%)",
          filter: "blur(30px)",
        }}
      />

      {/* ===== Logo Section ===== */}
      <div className="flex items-center justify-between px-5 pt-6 pb-5">
        <div className="flex items-center gap-3">
          {/* Logo icon with gradient + subtle shadow */}
          <div
            className="relative flex items-center justify-center w-11 h-11 rounded-2xl"
            style={{
              background: "linear-gradient(135deg, #5FA8D3 0%, #06B6D4 50%, #62B6CB 100%)",
              boxShadow: "0 4px 15px rgba(95, 168, 211, 0.3), 0 0 0 1px rgba(255,255,255,0.1)",
            }}
          >
            <LocalShippingIcon sx={{ color: "#fff", fontSize: 22 }} />
          </div>
          <div>
            <Typography
              className="!text-[1.05rem] !font-bold !leading-tight !tracking-tight"
              sx={{ color: "#FFFFFF" }}
            >
              BackHaulBid
            </Typography>
            <Typography
              className="!text-[0.65rem] !leading-none !tracking-widest !uppercase !mt-0.5"
              sx={{ color: "rgba(255,255,255,0.35)" }}
            >
              Logistics Platform
            </Typography>
          </div>
        </div>
      </div>

      {/* ===== Separator with gradient ===== */}
      <div className="mx-5 mb-2">
        <div
          className="h-px"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
          }}
        />
      </div>

      {/* ===== Menu Label ===== */}
      <div className="px-6 pt-3 pb-2">
        <Typography
          className="!text-[0.6rem] !font-semibold !tracking-[0.15em] !uppercase"
          sx={{ color: "rgba(255,255,255,0.25)" }}
        >
          Menu chính
        </Typography>
      </div>

      {/* ===== Navigation Menu (RBAC Filtered) ===== */}
      <div className="flex-1 overflow-y-auto sidebar-scroll px-3 pb-4">
        <List disablePadding className="stagger-children">
          {filteredMenu.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <ListItemButton
                key={item.id}
                onClick={() => {
                  navigate(item.path);
                  if (variant === "temporary" && onClose) onClose();
                }}
                className="!rounded-xl !mb-1 !relative group"
                sx={{
                  minHeight: 46,
                  px: 2,
                  backgroundColor: active
                    ? "rgba(95, 168, 211, 0.12)"
                    : "transparent",
                  color: active ? "#FFFFFF" : "rgba(255,255,255,0.55)",
                  border: active
                    ? "1px solid rgba(95, 168, 211, 0.15)"
                    : "1px solid transparent",
                  "&:hover": {
                    backgroundColor: active
                      ? "rgba(95, 168, 211, 0.16)"
                      : "rgba(255,255,255,0.04)",
                    color: "#FFFFFF",
                    transform: "translateX(2px)",
                  },
                  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                {/* Active glow effect */}
                {active && (
                  <div
                    className="absolute inset-0 rounded-xl opacity-100 pointer-events-none"
                    style={{
                      background: "linear-gradient(135deg, rgba(95,168,211,0.08) 0%, rgba(6,182,212,0.04) 100%)",
                      boxShadow: "inset 0 0 20px rgba(95, 168, 211, 0.05)",
                    }}
                  />
                )}

                <ListItemIcon
                  sx={{
                    minWidth: 40,
                    color: active ? "#5FA8D3" : "rgba(255,255,255,0.35)",
                    transition: "all 0.25s ease",
                    ".group:hover &": {
                      color: active ? "#5FA8D3" : "rgba(255,255,255,0.7)",
                    },
                  }}
                >
                  <Icon sx={{ fontSize: 21 }} />
                </ListItemIcon>

                <ListItemText
                  primary={item.title}
                  primaryTypographyProps={{
                    fontSize: "0.84rem",
                    fontWeight: active ? 600 : 450,
                    letterSpacing: "-0.01em",
                  }}
                />

                {/* Active indicator pill */}
                {active && (
                  <div
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-7 rounded-l-full"
                    style={{
                      background: "linear-gradient(180deg, #5FA8D3, #06B6D4)",
                      boxShadow: "0 0 8px rgba(95, 168, 211, 0.5)",
                    }}
                  />
                )}
              </ListItemButton>
            );
          })}
        </List>
      </div>

      {/* ===== Bottom Separator ===== */}
      <div className="mx-5">
        <div
          className="h-px"
          style={{
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
          }}
        />
      </div>

      {/* ===== User Profile Section ===== */}
      <div className="px-4 py-4">
        <div
          className="flex items-center gap-3 p-3 rounded-2xl group cursor-pointer"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.05)",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.06)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.03)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)";
          }}
        >
          {/* Avatar with gradient ring */}
          <div className="relative">
            <div
              className="flex items-center justify-center w-9 h-9 rounded-xl text-xs font-bold"
              style={{
                background: "linear-gradient(135deg, #5FA8D3, #06B6D4)",
                color: "#FFFFFF",
                boxShadow: "0 2px 8px rgba(95, 168, 211, 0.25)",
              }}
            >
              {userRole?.charAt(0)}
            </div>
            {/* Online indicator */}
            <div className="absolute -bottom-0.5 -right-0.5">
              <FiberManualRecordIcon
                className="animate-breathe"
                sx={{ fontSize: 10, color: "#10B981", filter: "drop-shadow(0 0 3px #10B981)" }}
              />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <Typography
              className="!text-[0.78rem] !font-semibold !leading-tight truncate"
              sx={{ color: "rgba(255,255,255,0.9)" }}
            >
              {userRole === "ADMIN" && "Admin User"}
              {userRole === "SHIPPER" && "Shipper Corp"}
              {userRole === "CARRIER" && "Carrier Pro"}
            </Typography>
            <Typography
              className="!text-[0.62rem] !leading-tight !mt-0.5"
              sx={{ color: "rgba(255,255,255,0.3)" }}
            >
              {userRole} • Trực tuyến
            </Typography>
          </div>

          {/* Action buttons */}
          <IconButton
            size="small"
            sx={{
              color: "rgba(255,255,255,0.25)",
              "&:hover": { color: "rgba(255,255,255,0.6)", backgroundColor: "rgba(255,255,255,0.05)" },
            }}
          >
            <LogoutOutlinedIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </div>
      </div>
    </div>
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
          borderRight: "none",
          overflow: "hidden",
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
}
