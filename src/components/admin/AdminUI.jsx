"use client";

import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import TableContainer from "@mui/material/TableContainer";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import SearchIcon from "@mui/icons-material/Search";

export const adminColors = {
  primary: "#1B4965",
  primaryDark: "#0D2B3E",
  secondary: "#62B6CB",
  text: "#1E293B",
  muted: "#64748B",
  border: "#E2E8F0",
  surface: "rgba(255, 255, 255, 0.86)",
};

const toneConfig = {
  success: { bg: "#ECFDF5", color: "#047857", border: "#A7F3D0" },
  warning: { bg: "#FFFBEB", color: "#B45309", border: "#FDE68A" },
  danger: { bg: "#FFF1F2", color: "#BE123C", border: "#FECDD3" },
  info: { bg: "#EFF6FF", color: "#1D4ED8", border: "#BFDBFE" },
  primary: { bg: "#EAF4F8", color: adminColors.primary, border: "#C9E3EC" },
  neutral: { bg: "#F8FAFC", color: "#475569", border: "#E2E8F0" },
};

export function AdminPageShell({ children }) {
  return (
    <Box
      className="animate-fade-in-up"
      sx={{
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 3,
      }}
    >
      {children}
    </Box>
  );
}

export function AdminPageHeader({ title, subtitle, breadcrumbs = [], action }) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 1.5,
      }}
    >
      {breadcrumbs.length > 0 && (
        <Breadcrumbs
          separator="›"
          sx={{
            color: "#94A3B8",
            fontSize: "0.8125rem",
            "& .MuiBreadcrumbs-separator": { mx: 0.75 },
          }}
        >
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return isLast || !crumb.path ? (
              <Typography key={crumb.label} sx={{ fontSize: "0.8125rem", color: "#64748B", fontWeight: 600 }}>
                {crumb.label}
              </Typography>
            ) : (
              <Link
                key={crumb.label}
                href={crumb.path}
                className="no-underline"
                style={{ color: "#94A3B8", fontSize: "0.8125rem", fontWeight: 600 }}
              >
                {crumb.label}
              </Link>
            );
          })}
        </Breadcrumbs>
      )}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", md: "center" },
          gap: 2,
          flexDirection: { xs: "column", md: "row" },
        }}
      >
        <Box sx={{ maxWidth: 720 }}>
          <Typography
            variant="h4"
            sx={{
              color: adminColors.text,
              fontWeight: 800,
              letterSpacing: 0,
              fontSize: { xs: "1.5rem", md: "1.875rem" },
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" sx={{ color: adminColors.muted, mt: 0.5, maxWidth: 680 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {action && <Box sx={{ width: { xs: "100%", md: "auto" } }}>{action}</Box>}
      </Box>
    </Box>
  );
}

export function AdminMetricCard({ title, value, helper, icon: Icon, tone = "primary" }) {
  const colors = toneConfig[tone] || toneConfig.primary;

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        borderRadius: 3,
        border: `1px solid ${adminColors.border}`,
        background: adminColors.surface,
        boxShadow: "0 10px 24px rgba(15, 23, 42, 0.04)",
      }}
    >
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2 }}>
          <Box>
            <Typography variant="body2" sx={{ color: adminColors.muted, fontWeight: 700 }}>
              {title}
            </Typography>
            <Typography variant="h4" sx={{ color: adminColors.text, fontWeight: 800, mt: 0.75, letterSpacing: 0 }}>
              {value}
            </Typography>
            {helper && (
              <Typography variant="caption" sx={{ color: colors.color, fontWeight: 700, mt: 1, display: "block" }}>
                {helper}
              </Typography>
            )}
          </Box>
          {Icon && (
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                display: "grid",
                placeItems: "center",
                bgcolor: colors.bg,
                border: `1px solid ${colors.border}`,
                color: colors.color,
                flex: "0 0 auto",
              }}
            >
              <Icon fontSize="small" />
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export function AdminSectionCard({ children, title, subtitle, action, sx }) {
  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: `1px solid ${adminColors.border}`,
        background: adminColors.surface,
        boxShadow: "0 10px 24px rgba(15, 23, 42, 0.04)",
        overflow: "hidden",
        ...sx,
      }}
    >
      {(title || subtitle || action) && (
        <Box
          sx={{
            px: 2.5,
            py: 2,
            borderBottom: `1px solid ${adminColors.border}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", md: "center" },
            gap: 2,
            flexDirection: { xs: "column", md: "row" },
            bgcolor: "rgba(248, 250, 252, 0.72)",
          }}
        >
          <Box>
            {title && (
              <Typography variant="h6" sx={{ color: adminColors.text, fontWeight: 800, fontSize: "1rem" }}>
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="body2" sx={{ color: adminColors.muted, mt: 0.25 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          {action && <Box sx={{ width: { xs: "100%", md: "auto" } }}>{action}</Box>}
        </Box>
      )}
      {children}
    </Card>
  );
}

export function AdminToolbar({ title, subtitle, children }) {
  return (
    <Box
      sx={{
        px: 2.5,
        py: 2,
        borderBottom: `1px solid ${adminColors.border}`,
        bgcolor: "rgba(248, 250, 252, 0.72)",
        display: "flex",
        alignItems: { xs: "stretch", md: "center" },
        justifyContent: "space-between",
        gap: 2,
        flexDirection: { xs: "column", lg: "row" },
      }}
    >
      <Box>
        <Typography variant="h6" sx={{ color: adminColors.text, fontWeight: 800, fontSize: "1rem" }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" sx={{ color: adminColors.muted, mt: 0.25 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {children && (
        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
          {children}
        </Box>
      )}
    </Box>
  );
}

export function AdminStatusChip({ label, tone = "neutral", icon }) {
  const colors = toneConfig[tone] || toneConfig.neutral;

  return (
    <Chip
      label={label}
      icon={icon}
      size="small"
      sx={{
        bgcolor: colors.bg,
        color: colors.color,
        border: `1px solid ${colors.border}`,
        borderRadius: 1.5,
        fontWeight: 800,
        fontSize: "0.72rem",
        height: 26,
        "& .MuiChip-icon": {
          color: "inherit",
          ml: 0.75,
        },
      }}
    />
  );
}

export function AdminSearchField({ value, onChange, placeholder = "Tìm kiếm..." }) {
  return (
    <TextField
      size="small"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      sx={{
        minWidth: { xs: "100%", sm: 280 },
        bgcolor: "#FFFFFF",
        borderRadius: 2,
        "& .MuiOutlinedInput-root": { borderRadius: 2 },
      }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon fontSize="small" sx={{ color: "#94A3B8" }} />
          </InputAdornment>
        ),
      }}
    />
  );
}

export function AdminSelectField({ value, onChange, options, minWidth = 160 }) {
  return (
    <TextField
      select
      size="small"
      value={value}
      onChange={onChange}
      sx={{
        minWidth: { xs: "100%", sm: minWidth },
        bgcolor: "#FFFFFF",
        borderRadius: 2,
        "& .MuiOutlinedInput-root": { borderRadius: 2 },
      }}
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
}

export function AdminPrimaryButton({ children, sx, ...props }) {
  return (
    <Button
      variant="contained"
      disableElevation
      sx={{
        borderRadius: 2,
        bgcolor: adminColors.primary,
        fontWeight: 800,
        px: 2.25,
        "&:hover": { bgcolor: adminColors.primaryDark },
        ...sx,
      }}
      {...props}
    >
      {children}
    </Button>
  );
}

export function AdminSecondaryButton({ children, sx, ...props }) {
  return (
    <Button
      variant="outlined"
      sx={{
        borderRadius: 2,
        borderColor: "#CBD5E1",
        color: adminColors.text,
        bgcolor: "#FFFFFF",
        fontWeight: 800,
        px: 2.25,
        "&:hover": {
          borderColor: adminColors.primary,
          bgcolor: "#F8FAFC",
        },
        ...sx,
      }}
      {...props}
    >
      {children}
    </Button>
  );
}

export function AdminLoadingState({ label = "Đang tải dữ liệu...", minHeight = 220 }) {
  return (
    <Box role="status" aria-label={label} sx={{ minHeight, display: "grid", placeItems: "center", gap: 1, color: adminColors.muted }}>
      <CircularProgress size={28} />
      <Typography variant="body2">{label}</Typography>
    </Box>
  );
}

export function AdminEmptyState({ children = "Không có dữ liệu phù hợp.", minHeight = 160 }) {
  return (
    <Box role="status" sx={{ minHeight, display: "grid", placeItems: "center", px: 3, py: 5, textAlign: "center", color: adminColors.muted }}>
      <Typography variant="body2">{children}</Typography>
    </Box>
  );
}

export function AdminTableContainer({ children, minWidth = 720 }) {
  return <TableContainer sx={{ overflowX: "auto", "& .MuiTable-root": { minWidth } }}>{children}</TableContainer>;
}

export function AdminDialog({ children, PaperProps, ...props }) {
  return (
    <Dialog
      {...props}
      PaperProps={{
        ...PaperProps,
        sx: {
          borderRadius: 3,
          border: `1px solid ${adminColors.border}`,
          ...PaperProps?.sx,
        },
      }}
    >
      {children}
    </Dialog>
  );
}
