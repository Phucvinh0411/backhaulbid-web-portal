"use client";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Badge from "@mui/material/Badge";
import Avatar from "@mui/material/Avatar";
import InputBase from "@mui/material/InputBase";
import Tooltip from "@mui/material/Tooltip";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import SearchTwoToneIcon from "@mui/icons-material/SearchTwoTone";
import NotificationsTwoToneIcon from "@mui/icons-material/NotificationsTwoTone";
import FullscreenRoundedIcon from "@mui/icons-material/FullscreenRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import { SIDEBAR_WIDTH } from "./Sidebar";

const defaultUser = { name: "Admin User", email: "admin@backhaulbid.vn", avatar: "A", role: "Quản trị viên", settingsPath: "/settings" };

export default function Header({ onMenuToggle, userInfo = defaultUser }) {
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error enabling fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        mt: 2.5, // 20px top gap
        left: { md: 0, xs: 16 },
        ml: { md: `calc(${SIDEBAR_WIDTH}px + 20px)` },
        width: {
          xs: "calc(100% - 32px)",
          md: `calc(100% - ${SIDEBAR_WIDTH}px - 40px)`
        },
        backgroundColor: "rgba(255, 255, 255, 0.72)",
        backdropFilter: "blur(20px) saturate(180%)",
        border: "1px solid rgba(255, 255, 255, 0.45)",
        borderRadius: "20px",
        color: "#1E293B",
        boxShadow: "0 8px 32px 0 rgba(27, 73, 101, 0.04)",
      }}
    >
      <Toolbar className="!px-4 md:!px-6 gap-3">
        {/* Mobile menu toggle */}
        <IconButton
          edge="start"
          onClick={onMenuToggle}
          className="!mr-1 md:!hidden"
          sx={{
            color: "#1B4965",
            backgroundColor: "rgba(27, 73, 101, 0.04)",
            "&:hover": { backgroundColor: "rgba(27, 73, 101, 0.08)" }
          }}
        >
          <MenuRoundedIcon />
        </IconButton>

        {/* Dynamic Search Box with subtle animation */}
        <Box
          className="flex items-center flex-1 max-w-sm rounded-xl px-3 py-1.5 border border-slate-100 transition-all duration-300 hover:border-slate-200 focus-within:!border-[#1B4965]/40 focus-within:!ring-4 focus-within:!ring-[#1B4965]/5"
          style={{
            backgroundColor: "rgba(241, 245, 249, 0.6)",
          }}
        >
          <SearchTwoToneIcon sx={{ fontSize: 20, color: "#1B4965", mr: 1 }} />
          <InputBase
            placeholder="Tìm kiếm mọi thứ..."
            className="flex-1 !text-[0.85rem] !font-medium text-slate-700"
            inputProps={{ "aria-label": "search" }}
          />
          <Typography
            variant="caption"
            className="hidden sm:block text-slate-400 bg-white border border-slate-200/80 rounded-md px-1.5 py-0.5 !text-[0.62rem] !font-mono shadow-sm"
          >
            ⌘K
          </Typography>
        </Box>

        <Box className="flex-1" />

        {/* Action button grouping */}
        <Box className="flex items-center gap-1.5">
          <Tooltip title="Trợ giúp">
            <IconButton
              size="small"
              sx={{
                color: "#64748B",
                width: 36,
                height: 36,
                "&:hover": { color: "#1B4965", backgroundColor: "rgba(27, 73, 101, 0.04)" }
              }}
            >
              <HelpOutlineRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Toàn màn hình">
            <IconButton
              size="small"
              onClick={toggleFullscreen}
              sx={{
                color: "#64748B",
                width: 36,
                height: 36,
                "&:hover": { color: "#1B4965", backgroundColor: "rgba(27, 73, 101, 0.04)" }
              }}
            >
              <FullscreenRoundedIcon fontSize="medium" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Thông báo">
            <IconButton
              size="small"
              sx={{
                color: "#64748B",
                width: 36,
                height: 36,
                "&:hover": { color: "#1B4965", backgroundColor: "rgba(27, 73, 101, 0.04)" }
              }}
            >
              <Badge
                badgeContent={4}
                color="error"
                sx={{
                  "& .MuiBadge-badge": {
                    fontSize: "0.62rem",
                    height: 16,
                    minWidth: 16,
                    background: "linear-gradient(135deg, #F43F5E 0%, #E11D48 100%)",
                    boxShadow: "0 2px 4px rgba(244, 63, 94, 0.3)",
                  }
                }}
              >
                <NotificationsTwoToneIcon fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* User profile details header */}
          {(() => {
            const userRole = "admin"; // default to admin for now, or get from context
            const userProfile = {
              shipper: {
                name: "Nguyễn Minh Triết",
                roleName: "Chủ hàng",
                avatarLetter: "T",
              },
              carrier: {
                name: "Trần Văn Bình",
                roleName: "Nhà xe",
                avatarLetter: "B",
              },
              admin: {
                name: userInfo.name || "Admin User",
                roleName: userInfo.role || "Quản trị viên",
                avatarLetter: userInfo.avatar || "A",
              }
            };
            const profile = userProfile[userRole] || userProfile.admin;

            return (
              <Box className="flex items-center gap-2 ml-1 pl-3 border-l border-slate-200/80">
                <Box className="hidden sm:block text-right">
                  <Typography className="!text-[0.82rem] !font-bold !leading-tight text-slate-700">
                    {profile.name}
                  </Typography>
                  <Typography className="!text-[0.68rem] text-cyan-600 !font-semibold !leading-tight uppercase tracking-wider">
                    {profile.roleName}
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: "#1B4965",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    border: "2px solid #fff",
                    boxShadow: "0 4px 10px rgba(27, 73, 101, 0.12)",
                    cursor: "pointer",
                    transition: "transform 0.2s",
                    "&:hover": { transform: "scale(1.05)" }
                  }}
                >
                  {profile.avatarLetter}
                </Avatar>
              </Box>
            );
          })()}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
