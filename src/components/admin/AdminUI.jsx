"use client";

import Box from "@mui/material/Box";
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
import SearchIcon from "@mui/icons-material/Search";
import PageHeader from "@/components/common/PageHeader";

export const adminColors = {
  primary: "var(--color-brand)",
  primaryDark: "var(--color-brand-hover)",
  secondary: "var(--color-brand)",
  text: "var(--color-ink)",
  muted: "var(--color-ink-muted)",
  border: "var(--color-line)",
  surface: "var(--color-surface)",
};

const toneConfig = {
  success: { bg: "var(--color-success-soft)", color: "var(--color-success)", border: "var(--color-success-soft)" },
  warning: { bg: "var(--color-warning-soft)", color: "var(--color-warning)", border: "var(--color-warning-soft)" },
  danger: { bg: "var(--color-danger-soft)", color: "var(--color-danger)", border: "var(--color-danger-soft)" },
  info: { bg: "var(--color-info-soft)", color: "var(--color-info)", border: "var(--color-info-soft)" },
  primary: { bg: "var(--color-brand-soft)", color: adminColors.primary, border: "var(--color-brand-soft)" },
  neutral: { bg: "var(--color-surface-sunken)", color: "var(--color-ink-muted)", border: "var(--color-line)" },
};

export function AdminPageShell({ children }) {
  return (
    <Box
      sx={{
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      {children}
    </Box>
  );
}

export function AdminPageHeader({ title, subtitle, breadcrumbs = [], action }) {
  return <PageHeader title={title} subtitle={subtitle} breadcrumbs={breadcrumbs} action={action} />;
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
        bgcolor: "var(--color-surface)",
        borderRadius: 2,
        "& .MuiOutlinedInput-root": { borderRadius: 2 },
      }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon fontSize="small" sx={{ color: "var(--color-ink-subtle)" }} />
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
        bgcolor: "var(--color-surface)",
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
        borderColor: "var(--color-line-strong)",
        color: adminColors.text,
        bgcolor: "var(--color-surface)",
        fontWeight: 800,
        px: 2.25,
        "&:hover": {
          borderColor: adminColors.primary,
          bgcolor: "var(--color-surface-sunken)",
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
