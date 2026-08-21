"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import InputBase from "@mui/material/InputBase";
import Tooltip from "@mui/material/Tooltip";
import Badge from "@mui/material/Badge";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import SearchTwoToneIcon from "@mui/icons-material/SearchTwoTone";
import NotificationsTwoToneIcon from "@mui/icons-material/NotificationsTwoTone";
import FullscreenRoundedIcon from "@mui/icons-material/FullscreenRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";
import { SIDEBAR_WIDTH } from "./Sidebar";

const defaultUser = {
  name: "Quản trị viên",
  email: "admin@backhaulbid.vn",
  avatar: "A",
  role: "Quản trị viên",
  settingsPath: "/settings",
};

const fallbackProfiles = {
  shipper: {
    name: "Tài khoản Chủ hàng",
    roleName: "Chủ hàng",
    avatarLetter: "C",
  },
  carrier: {
    name: "Tài khoản Nhà xe",
    roleName: "Nhà xe",
    avatarLetter: "N",
  },
  admin: {
    name: "Quản trị viên",
    roleName: "Quản trị viên",
    avatarLetter: "A",
  },
};

export default function Header({ onMenuToggle, userInfo = defaultUser, role = "admin" }) {
  const router = useRouter();
  const [hasNewNotification, setHasNewNotification] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [auctionId, setAuctionId] = useState("");
  const [auctionName, setAuctionName] = useState("");
  
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (role !== "carrier") return;

    // Fetch initial history from real backend API
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/v1/notifications/mine", {
          headers: { "X-User-Id": "55555555-5555-5555-5555-555555555555" }
        });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.map(n => ({
            id: n.referenceId,
            notifId: n.id,
            title: n.title,
            time: new Date(n.createdAt),
            read: n.isRead || n.read // Handle both isRead and read
          })));
        }
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      }
    };
    fetchNotifications();

    // Setup WebSocket connection for real-time notifications
    const socket = io({
      path: "/notification-socket",
      transports: ["websocket"]
    });

    socket.on("connect", () => {
      console.log("Connected to notification socket");
      socket.emit("identify", { userId: "55555555-5555-5555-5555-555555555555" });
    });

    socket.on("new_notification", (notif) => {
      console.log("Received real-time notification:", notif);
      setHasNewNotification(true);
      setAuctionId(notif.referenceId);
      setAuctionName(notif.title);
      setToastOpen(true);
      // Re-fetch to ensure we have the latest list (or we could just prepend it)
      fetchNotifications();
    });

    const handleStorage = (e) => {
      if (e.key === "NEW_MATCHING_AUCTION" && e.newValue) {
        try {
          const data = JSON.parse(e.newValue);
          if (data && data.id) {
            setHasNewNotification(true);
            setAuctionId(data.id);
            setAuctionName(data.title || "");
            setToastOpen(true);
            // Re-fetch to get the newest notification saved by backend
            fetchNotifications();
            localStorage.removeItem("NEW_MATCHING_AUCTION");
          }
        } catch (err) {}
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("storage", handleStorage);
      socket.disconnect();
    };
  }, [role]);

  const markAllAsRead = async () => {
    try {
      await fetch("/api/v1/notifications/mark-all-read", {
        method: "POST",
        headers: { "X-User-Id": "55555555-5555-5555-5555-555555555555" }
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch(err) {}
  };

  const handleNotificationClick = (event) => {
    setAnchorEl(event.currentTarget);
    if (hasNewNotification) {
      setHasNewNotification(false);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationItemClick = (id) => {
    handleClose();
    router.push(`/carrier/bidding/${id}`);
  };

  const toggleFullscreen = () => {
    try {
      const doc = document.documentElement;
      const isFullscreen = 
        document.fullscreenElement || 
        document.webkitFullscreenElement || 
        document.mozFullScreenElement || 
        document.msFullscreenElement;
      
      if (!isFullscreen) {
        let promise;
        if (doc.requestFullscreen) {
          promise = doc.requestFullscreen();
        } else if (doc.webkitRequestFullscreen) {
          promise = doc.webkitRequestFullscreen();
        } else if (doc.mozRequestFullScreen) {
          promise = doc.mozRequestFullScreen();
        } else if (doc.msRequestFullscreen) {
          promise = doc.msRequestFullscreen();
        }
        if (promise && promise.catch) {
          promise.catch((err) => console.error("Error entering fullscreen:", err));
        }
      } else {
        let promise;
        if (document.exitFullscreen) {
          promise = document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          promise = document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
          promise = document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
          promise = document.msExitFullscreen();
        }
        if (promise && promise.catch) {
          promise.catch((err) => console.error("Error exiting fullscreen:", err));
        }
      }
    } catch (err) {
      console.error(`Error toggling fullscreen: ${err.message}`);
    }
  };

  const fallback = fallbackProfiles[role] || fallbackProfiles.admin;
  const profile = {
    name: userInfo?.name || fallback.name,
    roleName: userInfo?.role || fallback.roleName,
    avatarLetter: userInfo?.avatar || fallback.avatarLetter,
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        mt: 2.5,
        left: { md: 0, xs: 16 },
        ml: { md: `calc(${SIDEBAR_WIDTH}px + 20px)` },
        width: {
          xs: "calc(100% - 32px)",
          md: `calc(100% - ${SIDEBAR_WIDTH}px - 40px)`,
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
        <IconButton
          edge="start"
          onClick={onMenuToggle}
          aria-label="Mở menu"
          className="!mr-1 md:!hidden"
          sx={{
            color: "#1B4965",
            backgroundColor: "rgba(27, 73, 101, 0.04)",
            "&:hover": { backgroundColor: "rgba(27, 73, 101, 0.08)" },
          }}
        >
          <MenuRoundedIcon />
        </IconButton>

        <Box
          className="flex items-center flex-1 max-w-sm rounded-xl px-3 py-1.5 border border-slate-100 transition-all duration-300 hover:border-slate-200 focus-within:!border-[#1B4965]/40 focus-within:!ring-4 focus-within:!ring-[#1B4965]/5"
          style={{ backgroundColor: "rgba(241, 245, 249, 0.6)" }}
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
            Ctrl K
          </Typography>
        </Box>

        <Box className="flex-1" />

        <Box className="flex items-center gap-1.5">
          <Tooltip title="Trợ giúp">
            <IconButton
              size="small"
              sx={{
                color: "#64748B",
                width: 36,
                height: 36,
                "&:hover": { color: "#1B4965", backgroundColor: "rgba(27, 73, 101, 0.04)" },
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
                "&:hover": { color: "#1B4965", backgroundColor: "rgba(27, 73, 101, 0.04)" },
              }}
            >
              <FullscreenRoundedIcon fontSize="medium" />
            </IconButton>
          </Tooltip>

          <Tooltip title="Thông báo">
            <IconButton
              size="small"
              onClick={handleNotificationClick}
              sx={{
                color: hasNewNotification ? "#1B4965" : "#64748B",
                width: 36,
                height: 36,
                "&:hover": { color: "#1B4965", backgroundColor: "rgba(27, 73, 101, 0.04)" },
              }}
            >
              <Badge color="error" variant="dot" invisible={!hasNewNotification}>
                <NotificationsTwoToneIcon fontSize="small" />
              </Badge>
            </IconButton>
          </Tooltip>

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
                "&:hover": { transform: "scale(1.05)" },
              }}
            >
              {profile.avatarLetter}
            </Avatar>
          </Box>
        </Box>
      </Toolbar>

      {/* Notification History Menu */}
      <Menu
        anchorEl={anchorEl}
        id="notification-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.12))',
            mt: 1.5,
            width: 360,
            borderRadius: '16px',
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" fontWeight="bold">Thông báo</Typography>
          <Typography variant="caption" color="primary" onClick={markAllAsRead} sx={{ cursor: 'pointer', fontWeight: 600 }}>
            Đánh dấu đã đọc tất cả
          </Typography>
        </Box>
        <Divider />
        <List sx={{ p: 0, maxHeight: 360, overflow: 'auto' }}>
          {notifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">Chưa có thông báo nào.</Typography>
            </Box>
          ) : (
            notifications.map((notif, index) => (
              <div key={index}>
                <ListItem 
                  alignItems="flex-start" 
                  button 
                  onClick={() => handleNotificationItemClick(notif.id)}
                  sx={{ 
                    bgcolor: notif.read ? 'transparent' : 'rgba(25, 118, 210, 0.04)',
                    transition: 'background-color 0.2s',
                    '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: notif.read ? 'grey.400' : 'primary.main' }}>
                      <NotificationsTwoToneIcon fontSize="small" sx={{ color: '#fff' }} />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight={notif.read ? "normal" : "bold"} color="text.primary">
                        Hệ thống vừa tìm thấy 1 lộ trình phù hợp với xe rỗng của bạn!
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                          {notif.title}
                        </Typography>
                        <Typography variant="caption" color="primary" sx={{ display: 'block', mt: 0.5, fontWeight: 500 }}>
                          {notif.time.toLocaleTimeString()} - Nhấn để xem chi tiết
                        </Typography>
                      </>
                    }
                  />
                  {!notif.read && (
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main', mt: 2 }} />
                  )}
                </ListItem>
                {index < notifications.length - 1 && <Divider component="li" />}
              </div>
            ))
          )}
        </List>
        <Divider />
        <Box sx={{ p: 1, textAlign: 'center' }}>
          <Button fullWidth size="small">Xem tất cả thông báo</Button>
        </Box>
      </Menu>

      <Snackbar
        open={toastOpen}
        autoHideDuration={6000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{ mt: 7 }}
      >
        <Alert
          onClose={() => setToastOpen(false)}
          severity="info"
          variant="filled"
          sx={{ width: "100%", borderRadius: "12px", cursor: "pointer" }}
          onClick={handleNotificationClick}
        >
          <strong>Hệ thống vừa tìm thấy 1 lộ trình phù hợp với xe rỗng của bạn!</strong><br/>
          {auctionName}<br/>
          <em>Nhấn vào đây để xem chi tiết.</em>
        </Alert>
      </Snackbar>
    </AppBar>
  );
}
