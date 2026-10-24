"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { io } from "socket.io-client";
import { GATEWAY_URL } from "@/config/clientConfig";
import { apiService, appApiService } from "@/services/apiService";
import { getApiErrorMessage } from "@/services/errorMessage";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import Popover from "@mui/material/Popover";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import ListItemIcon from "@mui/material/ListItemIcon";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { useGlobalNotification } from "@/components/common/NotificationPopup";
import { formatDateTime } from "@/lib/format";
import { homePathByRole } from "@/navigation/navigation";
import BrandMark from "./BrandMark";
import { getNotificationDestination } from "@/lib/notificationRouting";
import { toMediaViewUrl } from "@/lib/mediaUrl";

export default function Header({ userInfo, role = "admin" }) {
  const router = useRouter();
  const notify = useGlobalNotification();
  const [anchorEl, setAnchorEl] = useState(null);
  const [accountAnchorEl, setAccountAnchorEl] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [markingAll, setMarkingAll] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const profilePath = { shipper: "/shipper/profile", carrier: "/carrier/profile", admin: "/admin/profile" }[role] || "/";

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await appApiService.post("/api/auth/logout");
      window.localStorage.removeItem("userRole");
      window.localStorage.removeItem("isEkycVerified");
      router.replace("/login");
      router.refresh();
    } catch {
      notify.error("Không thể đăng xuất. Vui lòng thử lại.");
      setLoggingOut(false);
    }
  };

  useEffect(() => {
    if (!userInfo?.accountId) return undefined;

    // The API Gateway injects X-User-Id from the JWT cookie; no client-supplied id is sent.
    const fetchNotifications = async () => {
      try {
        const data = await apiService.get("/api/v1/notifications/mine", undefined, { skipGlobalNotification: true });
        const values = Array.isArray(data) ? data : data?.data || [];
        setNotifications(
          values.map((notification) => ({
            notifId: notification.id || notification._id,
            referenceId: notification.referenceId,
            type: notification.type,
            title: notification.title,
            message: notification.message,
            time: notification.createdAt,
            read: Boolean(notification.isRead ?? notification.read),
          })),
        );
        setLoadError("");
      } catch (error) {
        setLoadError(getApiErrorMessage(error, "Không thể tải thông báo."));
      }
    };
    fetchNotifications();

    const socket = io(GATEWAY_URL, {
      path: "/notification-socket",
      transports: ["polling", "websocket"],
      withCredentials: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    // Server joins the room from the gateway-verified identity, not from this payload.
    socket.on("connect", () => socket.emit("identify", {}));
    socket.on("new_notification", (notif) => {
      notify.info(notif?.message || notif?.title || "Bạn có thông báo mới.", { title: "Thông báo mới" });
      fetchNotifications();
    });

    socket.on("connect_error", async (err) => {
      if (err?.message?.includes("401") || err?.message?.includes("Authentication") || err?.message?.includes("unauthorized")) {
        socket.disconnect();
        try {
          const res = await fetch("/api/auth/refresh", { method: "POST" });
          if (res.ok) {
            socket.connect();
          }
        } catch {
          // ignore refresh failure
        }
      }
    });

    // Cleanly close socket on bfcache navigation and restore on pageshow
    const handlePageHide = () => {
      socket.disconnect();
    };
    const handlePageShow = (event) => {
      if (event.persisted) {
        fetchNotifications();
        socket.connect();
      }
    };
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("pageshow", handlePageShow);
      socket.disconnect();
    };
  }, [notify, role, userInfo?.accountId]);

  const markAllAsRead = async () => {
    if (markingAll) return;
    setMarkingAll(true);
    try {
      await apiService.post("/api/v1/notifications/mark-all-read", {});
      setNotifications((previous) => previous.map((item) => ({ ...item, read: true })));
    } catch (error) {
      notify.error(getApiErrorMessage(error, "Không thể đánh dấu đã đọc."), { title: "Không thể cập nhật thông báo" });
    } finally {
      setMarkingAll(false);
    }
  };

  const openNotification = (notification) => {
    const destination = getNotificationDestination(notification, role);
    if (!destination) return;
    setAnchorEl(null);
    router.push(destination.href);
  };

  return (
    <Box
      component="header"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 1080,
        bgcolor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
        pt: "var(--safe-top)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, minHeight: 56, px: { xs: 1.5, md: 3 } }}>
        <Box component={Link} href={homePathByRole[role] || "/"} sx={{ display: { xs: "flex", md: "none" }, textDecoration: "none" }} aria-label="Về trang chính">
          <BrandMark />
        </Box>
        <Box sx={{ flex: 1 }} />

        <IconButton
          onClick={(event) => setAnchorEl(event.currentTarget)}
          aria-label={unreadCount ? `Thông báo, ${unreadCount} chưa đọc` : "Thông báo"}
          aria-haspopup="dialog"
          sx={{ width: 44, height: 44, color: "text.secondary" }}
        >
          <Badge color="error" badgeContent={unreadCount} max={99} invisible={unreadCount === 0}>
            <NotificationsOutlinedIcon />
          </Badge>
        </IconButton>

        <ButtonBase
          onClick={(event) => setAccountAnchorEl(event.currentTarget)}
          aria-label="Mở menu tài khoản"
          aria-haspopup="menu"
          aria-expanded={Boolean(accountAnchorEl)}
          aria-controls={accountAnchorEl ? "header-account-menu" : undefined}
          sx={{ display: "flex", alignItems: "center", gap: 1, borderRadius: 2, p: 0.5, pl: { md: 1.5 }, minHeight: 44, "&.Mui-focusVisible": { outline: "2px solid var(--color-focus)" } }}
        >
          <Box sx={{ display: { xs: "none", md: "block" }, textAlign: "right" }}>
            <Typography sx={{ fontSize: "0.8125rem", fontWeight: 700, lineHeight: 1.2 }}>{userInfo?.name || "Tài khoản"}</Typography>
            <Typography sx={{ fontSize: "0.75rem", color: "text.secondary", lineHeight: 1.2 }}>{userInfo?.role || ""}</Typography>
          </Box>
          <Avatar src={toMediaViewUrl(userInfo?.avatarUrl, GATEWAY_URL) || undefined} alt="" sx={{ width: 34, height: 34, bgcolor: "primary.main", color: "primary.contrastText", fontSize: "0.8125rem", fontWeight: 700 }}>{userInfo?.avatar || userInfo?.name?.trim()?.[0]?.toLocaleUpperCase("vi-VN") || userInfo?.phone?.[0] || "T"}</Avatar>
        </ButtonBase>
      </Box>

      <Menu
        id="header-account-menu"
        anchorEl={accountAnchorEl}
        open={Boolean(accountAnchorEl)}
        onClose={() => setAccountAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{ sx: { minWidth: 208, mt: 1, p: 0.5, border: "1px solid", borderColor: "divider" } }}
        MenuListProps={{ "aria-label": "Menu tài khoản" }}
      >
        <MenuItem component={Link} href={profilePath} onClick={() => setAccountAnchorEl(null)} sx={{ minHeight: 44, borderRadius: 1.5, fontSize: 14 }}>
          <ListItemIcon><PersonOutlineOutlinedIcon fontSize="small" /></ListItemIcon>
          Hồ sơ
        </MenuItem>
        <Divider sx={{ my: 0.5 }} />
        <MenuItem onClick={handleLogout} disabled={loggingOut} sx={{ minHeight: 44, borderRadius: 1.5, fontSize: 14 }}>
          <ListItemIcon><LogoutOutlinedIcon fontSize="small" /></ListItemIcon>
          {loggingOut ? "Đang đăng xuất…" : "Đăng xuất"}
        </MenuItem>
      </Menu>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{ sx: { width: "min(380px, calc(100vw - 24px))", maxHeight: "70vh", display: "flex", flexDirection: "column", border: "1px solid", borderColor: "divider", mt: 1 } }}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, py: 1, borderBottom: "1px solid", borderColor: "divider" }}>
          <Typography component="h2" sx={{ fontWeight: 700, fontSize: "0.9375rem" }}>
            Thông báo{unreadCount > 0 ? ` (${unreadCount} chưa đọc)` : ""}
          </Typography>
          <Button size="small" onClick={markAllAsRead} disabled={markingAll || unreadCount === 0}>
            Đánh dấu đã đọc
          </Button>
        </Box>
        <Box component="ul" sx={{ m: 0, p: 0, overflowY: "auto" }}>
          {loadError && (
            <Typography component="li" role="alert" sx={{ listStyle: "none", p: 2, color: "error.main", fontSize: "0.875rem" }}>
              {loadError}
            </Typography>
          )}
          {!loadError && notifications.length === 0 && (
            <Typography component="li" sx={{ listStyle: "none", p: 3, textAlign: "center", color: "text.secondary", fontSize: "0.875rem" }}>
              Chưa có thông báo nào.
            </Typography>
          )}
          {notifications.map((notification, index) => {
            const destination = getNotificationDestination(notification, role);
            const body = (
              <>
                <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                  {!notification.read && <Box aria-label="Chưa đọc" sx={{ mt: 0.75, width: 8, height: 8, borderRadius: "50%", bgcolor: "primary.main", flexShrink: 0 }} />}
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontSize: "0.875rem", fontWeight: notification.read ? 500 : 700, color: "text.primary" }}>
                      {notification.title || "Thông báo"}
                    </Typography>
                    {notification.message && <Typography variant="body2" sx={{ color: "text.secondary" }}>{notification.message}</Typography>}
                    <Typography variant="caption" className="tabular" sx={{ color: "text.secondary" }}>
                      {formatDateTime(notification.time, "")}
                      {destination ? ` · ${destination.label}` : ""}
                    </Typography>
                  </Box>
                </Box>
              </>
            );
            return (
              <Box component="li" key={notification.notifId || index} sx={{ listStyle: "none", borderBottom: "1px solid", borderColor: "divider" }}>
                {destination ? (
                  <ButtonBase onClick={() => openNotification(notification)} sx={{ display: "block", width: "100%", textAlign: "left", px: 2, py: 1.5, "&:hover": { bgcolor: "action.hover" } }}>
                    {body}
                  </ButtonBase>
                ) : (
                  <Box sx={{ px: 2, py: 1.5 }}>{body}</Box>
                )}
              </Box>
            );
          })}
        </Box>
      </Popover>
    </Box>
  );
}
