"use client";

import Box from "@mui/material/Box";
import ScheduleIcon from "@mui/icons-material/ScheduleOutlined";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import HourglassIcon from "@mui/icons-material/HourglassBottomOutlined";
import PendingIcon from "@mui/icons-material/PendingActionsOutlined";
import DoneIcon from "@mui/icons-material/CheckCircleOutline";
import CloseIcon from "@mui/icons-material/RemoveCircleOutline";
import CancelIcon from "@mui/icons-material/CancelOutlined";
import HelpIcon from "@mui/icons-material/HelpOutline";
import ErrorIcon from "@mui/icons-material/ErrorOutline";
import HowToRegIcon from "@mui/icons-material/HowToRegOutlined";
import InventoryIcon from "@mui/icons-material/Inventory2Outlined";
import LocalShippingIcon from "@mui/icons-material/LocalShippingOutlined";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedInOutlined";
import DrawIcon from "@mui/icons-material/DrawOutlined";
import GavelIcon from "@mui/icons-material/GavelOutlined";
import EditIcon from "@mui/icons-material/EditOutlined";
import TrophyIcon from "@mui/icons-material/EmojiEventsOutlined";
import LockIcon from "@mui/icons-material/LockOutlined";
import PublicIcon from "@mui/icons-material/PublicOutlined";
import LabelIcon from "@mui/icons-material/LabelOutlined";

const ICONS = {
  schedule: ScheduleIcon,
  live: FiberManualRecordIcon,
  hourglass: HourglassIcon,
  pending: PendingIcon,
  done: DoneIcon,
  close: CloseIcon,
  remove: CloseIcon,
  cancel: CancelIcon,
  help: HelpIcon,
  error: ErrorIcon,
  how_to_reg: HowToRegIcon,
  inventory: InventoryIcon,
  local_shipping: LocalShippingIcon,
  assignment_turned_in: AssignmentTurnedInIcon,
  draw: DrawIcon,
  gavel: GavelIcon,
  edit: EditIcon,
  emoji_events: TrophyIcon,
  lock: LockIcon,
  public: PublicIcon,
  label: LabelIcon,
};

// DESIGN.md: soft fill + status-coloured text (each pair measured >= 4.6:1), no border.
export const TONE_STYLES = {
  neutral: { bg: "var(--color-surface-sunken)", fg: "var(--color-ink-muted)" },
  info: { bg: "var(--color-info-soft)", fg: "var(--color-info)" },
  success: { bg: "var(--color-success-soft)", fg: "var(--color-success)" },
  warning: { bg: "var(--color-warning-soft)", fg: "var(--color-warning)" },
  danger: { bg: "var(--color-danger-soft)", fg: "var(--color-danger)" },
  brand: { bg: "var(--color-brand-soft)", fg: "var(--color-brand)" },
};

/**
 * Status pill: tone + icon + text, so meaning never depends on colour alone.
 * Pass a meta object ({label, tone, icon}) or the individual props.
 */
export default function StatusBadge({ meta, label, tone, icon, size = "md", className, sx }) {
  const resolvedLabel = label ?? meta?.label ?? "";
  const resolvedTone = tone ?? meta?.tone ?? "neutral";
  const iconKey = icon ?? meta?.icon;
  const Icon = iconKey ? ICONS[iconKey] : null;
  const style = TONE_STYLES[resolvedTone] || TONE_STYLES.neutral;
  const small = size === "sm";

  return (
    <Box
      component="span"
      className={className}
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0.5,
        px: small ? 1 : 1.25,
        py: small ? 0.125 : 0.25,
        minHeight: small ? 22 : 26,
        borderRadius: "999px",
        bgcolor: style.bg,
        color: style.fg,
        fontSize: small ? "0.75rem" : "0.8125rem",
        fontWeight: 600,
        lineHeight: 1.2,
        whiteSpace: "nowrap",
        ...sx,
      }}
    >
      {Icon && <Icon aria-hidden sx={{ fontSize: iconKey === "live" ? 10 : small ? 14 : 16 }} />}
      {resolvedLabel}
    </Box>
  );
}
