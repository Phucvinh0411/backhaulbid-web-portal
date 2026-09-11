"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { io } from "socket.io-client";
import { GATEWAY_URL } from "@/config/clientConfig";
import { apiService } from "@/services/apiService";
import { getApiErrorMessage } from "@/services/errorMessage";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import InputBase from "@mui/material/InputBase";
import Tooltip from "@mui/material/Tooltip";
import Badge from "@mui/material/Badge";
import Menu from "@mui/material/Menu";
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
import { useGlobalNotification } from "@/components/common/NotificationPopup";

const defaultUser = {
  name: "Tài khoản",
  email: "",
  avatar: "T",
  role: "Đang tải thông tin",
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
    name: "Tài khoản",
    roleName: "Quản trị viên",
    avatarLetter: "A",
  },
};

export default function Header({
  onMenuToggle,
  userInfo = defaultUser,
  role = "admin",
}) {
  const router = useRouter();
  const notify = useGlobalNotification();
  const [hasNewNotification, setHasNewNotification] = useState(false);

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [notifications, setNotifications] = useState([]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    if (!userInfo?.accountId) return undefined;

    // Server identifies the user via trusted X-User-Id header injected by
    // API Gateway from the JWT cookie – no client-supplied id needed.
    const accountId = userInfo?.accountId;

    // Fetch initial history from real backend API
    const fetchNotifications = async () => {
      if (!accountId) return;
      try {
        // X-User-Id is injected by API Gateway from the JWT cookie.
        const data = await apiService.get(
          "/api/v1/notifications/mine",
        );
        const values = Array.isArray(data) ? data : data?.data || [];
        setNotifications(
          values.map((notification) => ({
            id: notification.referenceId || notification.id,
            notifId: notification.id,
            title: notification.title,
            message: notification.message,
            time: new Date(notification.createdAt),
            read: Boolean(notification.isRead ?? notification.read),
          })),
        );
      } catch (error) {
        notify.error(
          getApiErrorMessage(
            error,
            "Không thể tải thông báo. Vui lòng thử lại.",
          ),
          { title: "Không thể tải thông báo" },
        );
      }
    };
    fetchNotifications();

    // Setup WebSocket connection for real-time notifications
    const socket = io(GATEWAY_URL, {
      path: "/notification-socket",
      transports: ["websocket"],
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log("Connected to notification socket");
      // Server uses trusted X-User-Id header from JWT, not client payload.
      // The identify event triggers server-side room join using the gateway-verified identity.
      socket.emit("identify", {});
    });

    socket.on("new_notification", (notif) => {
      setHasNewNotification(true);
      notify.info(
        notif.message || notif.title || "Bạn có thông báo mới từ hệ thống.",
        { title: "Thông báo mới" },
      );
      // Re-fetch to ensure we have the latest list
      fetchNotifications();
    });

    return () => {
      socket.disconnect();
    };
  }, [notify, role, userInfo?.accountId]);

  const markAllAsRead = async () => {
    if (!userInfo?.accountId) return;
    try {
      // X-User-Id is injected by API Gateway from the JWT cookie.
      await apiService.post(
        "/api/v1/notifications/mark-all-read",
        {},
      );
      setNotifications((previous) =>
        previous.map((notification) => ({ ...notification, read: true })),
      );
    } catch (error) {
      notify.error(
        getApiErrorMessage(error, "Không thể đánh dấu thông báo đã đọc."),
        { title: "Không thể cập nhật thông báo" },
      );
    }
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

  const handleNotificationItemClick = (notif) => {
    handleClose();
    if (!notif) return;

    // Mark single notification as read locally
    setNotifications((prev) =>
      prev.map((n) =>
        (n.notifId && n.notifId === notif.notifId) || n.id === notif.id
          ? { ...n, read: true }
          : n,
      ),
    );

    const id = notif.id || notif.notifId;
    if (!id) return;
    const destination =
      role === "carrier"
        ? `/carrier/auctions/${id}`
        : role === "shipper"
          ? `/shipper/bidding/sessions`
          : "/admin/operations";
    router.push(destination);
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
          promise.catch((err) =>
            console.error("Error entering fullscreen:", err),
          );
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
          promise.catch((err) =>
            console.error("Error exiting fullscreen:", err),
          );
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
                "&:hover": {
                  color: "#1B4965",
                  backgroundColor: "rgba(27, 73, 101, 0.04)",
                },
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
                "&:hover": {
                  color: "#1B4965",
                  backgroundColor: "rgba(27, 73, 101, 0.04)",
                },
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
                color: unreadCount > 0 ? "#1B4965" : "#64748B",
                width: 36,
                height: 36,
                "&:hover": {
                  color: "#1B4965",
                  backgroundColor: "rgba(27, 73, 101, 0.04)",
                },
              }}
            >
              <Badge
                color="error"
                badgeContent={unreadCount}
                max={99}
                invisible={unreadCount === 0}
              >
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
            overflow: "visible",
            filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.12))",
            mt: 1.5,
            width: 360,
            borderRadius: "16px",
            "& .MuiAvatar-root": {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Box
          sx={{
            px: 2,
            py: 1.5,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold">
            Thông báo{" "}
            {unreadCount > 0 && (
              <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-bold">
                ({unreadCount} chưa đọc)
              </span>
            )}
          </Typography>
          <Typography
            variant="caption"
            color="primary"
            onClick={markAllAsRead}
            sx={{ cursor: "pointer", fontWeight: 600 }}
          >
            Đánh dấu đã đọc tất cả
          </Typography>
        </Box>
        <Divider />
        <List sx={{ p: 0, maxHeight: 360, overflow: "auto" }}>
          {notifications.length === 0 ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="body2" color="text.secondary">
                Chưa có thông báo nào.
              </Typography>
            </Box>
          ) : (
            notifications.map((notif, index) => (
              <div key={notif.notifId || notif.id || index}>
                <ListItem
                  alignItems="flex-start"
                  button
                  onClick={() => handleNotificationItemClick(notif)}
                  sx={{
                    bgcolor: notif.read
                      ? "transparent"
                      : "rgba(25, 118, 210, 0.06)",
                    transition: "background-color 0.2s",
                    "&:hover": { bgcolor: "rgba(0, 0, 0, 0.04)" },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      sx={{ bgcolor: notif.read ? "grey.400" : "primary.main" }}
                    >
                      <NotificationsTwoToneIcon
                        fontSize="small"
                        sx={{ color: "#fff" }}
                      />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography
                        variant="body2"
                        fontWeight={notif.read ? "normal" : "bold"}
                        color="text.primary"
                      >
                        {notif.message ||
                          notif.title ||
                          "Bạn có thông báo mới từ hệ thống."}
                      </Typography>
                    }
                    secondary={
                      <>
                        <Typography
                          variant="caption"
                          display="block"
                          color="text.secondary"
                          sx={{ mt: 0.5 }}
                        >
                          {notif.title}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="primary"
                          sx={{ display: "block", mt: 0.5, fontWeight: 500 }}
                        >
                          {notif.time.toLocaleTimeString()} - Nhấn để xem chi
                          tiết
                        </Typography>
                      </>
                    }
                  />
                  {!notif.read && (
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        bgcolor: "primary.main",
                        mt: 2,
                      }}
                    />
                  )}
                </ListItem>
                {index < notifications.length - 1 && <Divider component="li" />}
              </div>
            ))
          )}
        </List>
        <Divider />
        <Box sx={{ p: 1, textAlign: "center" }}>
          <Button fullWidth size="small">
            Xem tất cả thông báo
          </Button>
        </Box>
      </Menu>
    </AppBar>
  );
}
