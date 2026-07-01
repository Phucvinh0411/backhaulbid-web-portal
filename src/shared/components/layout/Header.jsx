// ============================================
// src/shared/components/layout/Header.jsx
// Premium 2026 Design - Glassmorphism Header
// Micro-animations + RBAC Conditional Rendering
// ============================================

import { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Badge from "@mui/material/Badge";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import InputBase from "@mui/material/InputBase";
import MenuIcon from "@mui/icons-material/MenuOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { ROLES } from "@/shared/constants/navigation";
import { SIDEBAR_WIDTH } from "./Sidebar";

export default function Header({ userRole, onMenuToggle }) {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: { md: `calc(100% - ${SIDEBAR_WIDTH}px)` },
        ml: { md: `${SIDEBAR_WIDTH}px` },
        backgroundColor: "rgba(255, 255, 255, 0.72)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
        borderBottom: "1px solid rgba(226, 232, 240, 0.6)",
        color: "#1E293B",
      }}
    >
      <Toolbar className="!px-4 md:!px-6 !min-h-[64px]">
        <div className="flex justify-between items-center w-full gap-4">
          {/* ===== Left Section ===== */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <IconButton
              edge="start"
              onClick={onMenuToggle}
              className="md:!hidden"
              sx={{
                color: "#1B4965",
                "&:hover": { backgroundColor: "rgba(27, 73, 101, 0.06)" },
              }}
            >
              <MenuIcon />
            </IconButton>

            {/* Search Bar with animation */}
            <div
              className="hidden md:flex items-center rounded-xl px-3.5 py-2"
              style={{
                width: searchFocused ? 320 : 260,
                backgroundColor: searchFocused ? "rgba(241, 245, 249, 0.9)" : "rgba(241, 245, 249, 0.6)",
                border: searchFocused
                  ? "1.5px solid rgba(95, 168, 211, 0.4)"
                  : "1.5px solid rgba(226, 232, 240, 0.5)",
                boxShadow: searchFocused
                  ? "0 0 0 3px rgba(95, 168, 211, 0.08), 0 2px 8px rgba(0,0,0,0.04)"
                  : "none",
                transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              <SearchOutlinedIcon
                sx={{
                  fontSize: 19,
                  color: searchFocused ? "#5FA8D3" : "#94A3B8",
                  mr: 1,
                  transition: "color 0.3s ease",
                }}
              />
              <InputBase
                placeholder="Tìm kiếm..."
                className="flex-1 !text-[0.82rem]"
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                inputProps={{ "aria-label": "search" }}
                sx={{
                  "& input::placeholder": {
                    color: "#94A3B8",
                    opacity: 1,
                    fontSize: "0.82rem",
                  },
                }}
              />
              <div
                className="flex items-center gap-0.5 rounded-md px-1.5 py-0.5"
                style={{
                  backgroundColor: "rgba(255,255,255,0.8)",
                  border: "1px solid rgba(226, 232, 240, 0.6)",
                }}
              >
                <Typography
                  className="!text-[0.6rem] !font-mono !font-medium"
                  sx={{ color: "#94A3B8" }}
                >
                  ⌘K
                </Typography>
              </div>
            </div>
          </div>

          {/* ===== Right Section ===== */}
          <div className="flex items-center gap-1.5">
            {/* --- RBAC: CARRIER Wallet Balance --- */}
            {userRole === ROLES.CARRIER && (
              <div
                className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl cursor-pointer group"
                style={{
                  background: "linear-gradient(135deg, rgba(27,73,101,0.06) 0%, rgba(6,182,212,0.06) 100%)",
                  border: "1px solid rgba(27, 73, 101, 0.1)",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(95, 168, 211, 0.25)";
                  e.currentTarget.style.boxShadow = "0 2px 12px rgba(95, 168, 211, 0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(27, 73, 101, 0.1)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div
                  className="flex items-center justify-center w-7 h-7 rounded-lg"
                  style={{
                    background: "linear-gradient(135deg, #1B4965, #5FA8D3)",
                  }}
                >
                  <AccountBalanceWalletOutlinedIcon sx={{ fontSize: 15, color: "#fff" }} />
                </div>
                <div>
                  <Typography className="!text-[0.62rem] !leading-none !font-medium" sx={{ color: "#64748B" }}>
                    Số dư ví
                  </Typography>
                  <Typography className="!text-[0.82rem] !leading-tight !font-bold" sx={{ color: "#1B4965" }}>
                    2.450.000 ₫
                  </Typography>
                </div>
                <TrendingUpIcon sx={{ fontSize: 14, color: "#10B981", ml: 0.5 }} />
              </div>
            )}

            {/* --- RBAC: SHIPPER Quick Post Button --- */}
            {userRole === ROLES.SHIPPER && (
              <Button
                variant="contained"
                size="small"
                startIcon={<AddCircleOutlineIcon sx={{ fontSize: 18 }} />}
                className="hidden sm:!flex !rounded-xl"
                sx={{
                  background: "linear-gradient(135deg, #1B4965 0%, #0D2B3E 100%)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #0D2B3E 0%, #1B4965 100%)",
                    boxShadow: "0 4px 16px rgba(27, 73, 101, 0.3)",
                    transform: "translateY(-1px)",
                  },
                  fontSize: "0.78rem",
                  height: 38,
                  px: 2.5,
                  fontWeight: 600,
                  letterSpacing: "-0.01em",
                  boxShadow: "0 2px 8px rgba(27, 73, 101, 0.2)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                Đăng hàng nhanh
              </Button>
            )}

            {/* Dark Mode Toggle */}
            <Tooltip title="Giao diện tối" arrow placement="bottom">
              <IconButton
                sx={{
                  color: "#64748B",
                  width: 38,
                  height: 38,
                  "&:hover": {
                    backgroundColor: "rgba(27, 73, 101, 0.06)",
                    color: "#1B4965",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                <DarkModeOutlinedIcon sx={{ fontSize: 20 }} />
              </IconButton>
            </Tooltip>

            {/* Notifications */}
            <Tooltip title="Thông báo" arrow placement="bottom">
              <IconButton
                sx={{
                  color: "#64748B",
                  width: 38,
                  height: 38,
                  "&:hover": {
                    backgroundColor: "rgba(27, 73, 101, 0.06)",
                    color: "#1B4965",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                <Badge
                  badgeContent={3}
                  sx={{
                    "& .MuiBadge-badge": {
                      fontSize: "0.6rem",
                      height: 17,
                      minWidth: 17,
                      fontWeight: 700,
                      background: "linear-gradient(135deg, #F43F5E, #E11D48)",
                      boxShadow: "0 2px 6px rgba(244, 63, 94, 0.35)",
                    },
                  }}
                >
                  <NotificationsOutlinedIcon sx={{ fontSize: 20 }} />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* ===== User Profile Section ===== */}
            <div
              className="flex items-center gap-2.5 ml-2 pl-3 cursor-pointer rounded-xl py-1.5 px-2 group"
              style={{
                borderLeft: "1px solid rgba(226, 232, 240, 0.6)",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "rgba(241, 245, 249, 0.6)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              {/* Avatar with gradient border */}
              <div
                className="relative flex items-center justify-center rounded-xl p-[2px]"
                style={{
                  background: "linear-gradient(135deg, #5FA8D3, #06B6D4, #62B6CB)",
                }}
              >
                <Avatar
                  sx={{
                    width: 34,
                    height: 34,
                    bgcolor: "#0D2B3E",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    borderRadius: "10px",
                  }}
                  variant="rounded"
                >
                  {userRole?.charAt(0)}
                </Avatar>
              </div>

              <div className="hidden sm:block text-right min-w-0">
                <Typography
                  className="!text-[0.78rem] !font-semibold !leading-tight truncate"
                  sx={{ color: "#1E293B" }}
                >
                  {userRole === ROLES.ADMIN && "Admin User"}
                  {userRole === ROLES.SHIPPER && "Shipper Corp"}
                  {userRole === ROLES.CARRIER && "Carrier Pro"}
                </Typography>
                <Typography
                  className="!text-[0.65rem] !leading-tight"
                  sx={{ color: "#94A3B8" }}
                >
                  {userRole === ROLES.ADMIN && "Quản trị viên"}
                  {userRole === ROLES.SHIPPER && "Chủ hàng"}
                  {userRole === ROLES.CARRIER && "Tài xế / Chủ xe"}
                </Typography>
              </div>

              <KeyboardArrowDownIcon
                sx={{
                  fontSize: 16,
                  color: "#94A3B8",
                  transition: "transform 0.2s ease",
                }}
              />
            </div>
          </div>
        </div>
      </Toolbar>
    </AppBar>
  );
}
