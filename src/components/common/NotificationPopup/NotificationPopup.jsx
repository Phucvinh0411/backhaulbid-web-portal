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

// DESIGN.md status colours; bar uses the same hue as the text.
const TONE_COLORS = {
  success: { main: "var(--color-success)", light: "var(--color-success-soft)", bar: "var(--color-success)" },
  error: { main: "var(--color-danger)", light: "var(--color-danger-soft)", bar: "var(--color-danger)" },
  warning: { main: "var(--color-warning)", light: "var(--color-warning-soft)", bar: "var(--color-warning)" },
  info: { main: "var(--color-brand)", light: "var(--color-brand-soft)", bar: "var(--color-brand)" },
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
        backgroundColor: "var(--color-surface)",
        borderRadius: "16px",
        border: "none",
        boxShadow: "var(--shadow-level-2)",
        overflow: "hidden",
        cursor: notification.onClick ? "pointer" : "default",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "var(--shadow-level-2)",
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
                color: "var(--color-ink)",
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
              color: "var(--color-ink-muted)",
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
            color: "var(--color-ink-subtle)",
            width: 28,
            height: 28,
            flexShrink: 0,
            "&:hover": { color: "var(--color-ink-muted)", backgroundColor: "var(--color-surface-sunken)" },
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
          backgroundColor: "var(--color-surface-sunken)",
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
