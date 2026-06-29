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
import MenuIcon from "@mui/icons-material/MenuOutlined";
import SearchIcon from "@mui/icons-material/SearchOutlined";
import NotificationsIcon from "@mui/icons-material/NotificationsOutlined";
import FullscreenIcon from "@mui/icons-material/FullscreenOutlined";
import { SIDEBAR_WIDTH } from "./Sidebar";

export default function Header({ onMenuToggle }) {
  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        width: { md: `calc(100% - ${SIDEBAR_WIDTH}px)` },
        ml: { md: `${SIDEBAR_WIDTH}px` },
        backgroundColor: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(8px)",
        borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
        color: "#1E293B",
      }}
    >
      <Toolbar className="!px-4 md:!px-6 gap-2">
        {/* Mobile menu toggle */}
        <IconButton
          edge="start"
          onClick={onMenuToggle}
          className="!mr-2 md:!hidden"
          sx={{ color: "#64748B" }}
        >
          <MenuIcon />
        </IconButton>

        {/* Search */}
        <Box className="flex items-center flex-1 max-w-md bg-slate-50 rounded-lg px-3 py-1.5 border border-slate-200/60 transition-all hover:border-slate-300 focus-within:border-[#1B4965] focus-within:ring-2 focus-within:ring-[#1B4965]/10">
          <SearchIcon sx={{ fontSize: 20, color: "#94A3B8", mr: 1 }} />
          <InputBase
            placeholder="Tìm kiếm..."
            className="flex-1 !text-sm"
            inputProps={{ "aria-label": "search" }}
          />
          <Typography
            variant="caption"
            className="hidden sm:block text-slate-400 bg-white border border-slate-200 rounded px-1.5 py-0.5 !text-[0.65rem] !font-mono"
          >
            ⌘K
          </Typography>
        </Box>

        <Box className="flex-1" />

        {/* Actions */}
        <Box className="flex items-center gap-1">
          <Tooltip title="Toàn màn hình">
            <IconButton sx={{ color: "#64748B" }}>
              <FullscreenIcon fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Thông báo">
            <IconButton sx={{ color: "#64748B" }}>
              <Badge
                badgeContent={3}
                color="error"
                sx={{ "& .MuiBadge-badge": { fontSize: "0.65rem", height: 18, minWidth: 18 } }}
              >
                <NotificationsIcon fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* User Avatar */}
          <Box className="flex items-center gap-2 ml-2 pl-3 border-l border-slate-200">
            <Box className="hidden sm:block text-right">
              <Typography className="!text-sm !font-semibold !leading-tight text-slate-700">
                Admin User
              </Typography>
              <Typography className="!text-[0.7rem] text-slate-400 !leading-tight">
                Quản trị viên
              </Typography>
            </Box>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: "#1B4965",
                fontSize: "0.85rem",
                fontWeight: 600,
              }}
            >
              A
            </Avatar>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
