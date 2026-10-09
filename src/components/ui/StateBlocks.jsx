"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import InboxIcon from "@mui/icons-material/InboxOutlined";
import ErrorIcon from "@mui/icons-material/ErrorOutline";
import LockIcon from "@mui/icons-material/LockOutlined";

function Block({ icon: Icon, title, description, action, tone = "neutral", role }) {
  const danger = tone === "danger";
  return (
    <Box
      role={role}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: 1,
        py: 5,
        px: 2,
        // DESIGN.md: soft panel, 16 px radius, no dashed outline.
        borderRadius: 2,
        bgcolor: danger ? "var(--color-danger-soft)" : "var(--color-surface-sunken)",
      }}
    >
      <Icon aria-hidden sx={{ fontSize: 32, color: danger ? "error.main" : "text.secondary" }} />
      <Typography component="p" sx={{ fontWeight: 700, color: "text.primary" }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 440 }}>
          {description}
        </Typography>
      )}
      {action && <Box sx={{ mt: 1 }}>{action}</Box>}
    </Box>
  );
}

export function EmptyState({ title, description, action, icon = InboxIcon }) {
  return <Block icon={icon} title={title} description={description} action={action} role="status" />;
}

export function ErrorState({ title = "Không tải được dữ liệu", description, onRetry, retryLabel = "Thử lại" }) {
  return (
    <Block
      icon={ErrorIcon}
      tone="danger"
      role="alert"
      title={title}
      description={description}
      action={
        onRetry ? (
          <Button variant="outlined" color="error" onClick={onRetry}>
            {retryLabel}
          </Button>
        ) : null
      }
    />
  );
}

export function ForbiddenState({ description = "Tài khoản hiện tại không có quyền xem nội dung này." }) {
  return <Block icon={LockIcon} title="Không có quyền truy cập" description={description} role="alert" />;
}

/** Skeleton rows standing in for a list while it loads. */
export function ListSkeleton({ rows = 4, height = 88, label = "Đang tải dữ liệu" }) {
  return (
    <Box aria-busy="true" aria-label={label} sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} variant="rounded" height={height} sx={{ borderRadius: 2 }} />
      ))}
    </Box>
  );
}
