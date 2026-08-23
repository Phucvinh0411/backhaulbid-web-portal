"use client";

import { useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import LinearProgress from "@mui/material/LinearProgress";
import Collapse from "@mui/material/Collapse";
import CheckCircleIcon from "@mui/icons-material/CheckCircleOutlined";
import ErrorIcon from "@mui/icons-material/ErrorOutlined";
import WarningIcon from "@mui/icons-material/WarningAmberOutlined";
import InfoIcon from "@mui/icons-material/InfoOutlined";
import CloseIcon from "@mui/icons-material/CloseOutlined";

const ICONS = {
  success: <CheckCircleIcon />,
  error: <ErrorIcon />,
  warning: <WarningIcon />,
  info: <InfoIcon />,
};

const TONE_COLORS = {
  success: { main: "#2E7D32", light: "#E8F5E9", bar: "#4CAF50" },
  error: { main: "#D32F2F", light: "#FFEBEE", bar: "#EF5350" },
  warning: { main: "#ED6C02", light: "#FFF3E0", bar: "#FF9800" },
  info: { main: "#1B4965", light: "#E3F2FD", bar: "#5FA8D3" },
};

function NotificationPopupItem({
  notification,
  onClose,
  onPause,
  onResume,
}) {
  const closeRef = useRef(null);
  const tone = TONE_COLORS[notification.type] || TONE_COLORS.info;
  const progress = (notification.remaining / notification.duration) * 100;

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose(notification.id);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [notification.id, onClose]);

  return (
    <Box
      role="alert"
      aria-live="polite"
      onMouseEnter={() => onPause(notification.id)}
      onMouseLeave={() => onResume(notification.id)}
      sx={{
        width: 380,
        maxWidth: "calc(100vw - 32px)",
        backgroundColor: "#FFFFFF",
        borderRadius: "14px",
        border: `1px solid ${tone.main}25`,
        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.06)",
        overflow: "hidden",
        cursor: notification.onClick ? "pointer" : "default",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 12px 32px rgba(0, 0, 0, 0.16), 0 4px 12px rgba(0, 0, 0, 0.08)",
        },
      }}
      onClick={notification.onClick ? () => notification.onClick() : undefined}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", p: 2, gap: 1.5 }}>
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: "10px",
            backgroundColor: tone.light,
            color: tone.main,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {ICONS[notification.type] || ICONS.info}
        </Box>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          {notification.title && (
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                color: "#1E293B",
                lineHeight: 1.4,
                mb: notification.message ? 0.25 : 0,
              }}
            >
              {notification.title}
            </Typography>
          )}
          <Typography
            variant="body2"
            sx={{
              color: "#475569",
              lineHeight: 1.5,
              wordBreak: "break-word",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {notification.message}
          </Typography>
        </Box>

        <IconButton
          ref={closeRef}
          size="small"
          aria-label="Đóng thông báo"
          onClick={(event) => {
            event.stopPropagation();
            onClose(notification.id);
          }}
          sx={{
            color: "#94A3B8",
            width: 28,
            height: 28,
            flexShrink: 0,
            "&:hover": { color: "#475569", backgroundColor: "#F1F5F9" },
          }}
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      <LinearProgress
        variant="determinate"
        value={progress}
        aria-label="Thời gian tự động đóng"
        sx={{
          height: 3,
          backgroundColor: "#F1F5F9",
          "& .MuiLinearProgress-bar": {
            backgroundColor: tone.bar,
            transition: "width 0.1s linear",
          },
        }}
      />
    </Box>
  );
}

export default function NotificationPopup({
  notifications,
  onClose,
  onPause,
  onResume,
}) {
  return (
    <Box
      data-testid="global-notification-popup"
      sx={{
        position: "fixed",
        top: 88,
        right: 16,
        zIndex: (theme) => theme.zIndex.snackbar,
        display: "flex",
        flexDirection: "column",
        gap: 1.25,
        pointerEvents: "none",
        "& > *": { pointerEvents: "auto" },
      }}
    >
      {notifications.map((notification) => (
        <Collapse key={notification.id} in timeout={250} orientation="horizontal">
          <NotificationPopupItem
            notification={notification}
            onClose={onClose}
            onPause={onPause}
            onResume={onResume}
          />
        </Collapse>
      ))}
    </Box>
  );
}
