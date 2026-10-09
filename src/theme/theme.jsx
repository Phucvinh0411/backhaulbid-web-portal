"use client";

// ============================================
// src/theme/theme.jsx — BackHaulBid design tokens for MUI.
// The same values are exposed as CSS variables in app/globals.css so
// Tailwind utilities and MUI components share one palette.
// Rules and measured contrast ratios live in DESIGN.md at the repository root.
// ============================================

import { createTheme } from "@mui/material/styles";

// Navy is the only action colour; greys are cool-tinted to match it.
export const tokens = {
  ink: "#0F1E2E",
  inkMuted: "#4A5B6C",
  inkSubtle: "#5E6A77",
  canvas: "#F4F6F8",
  surface: "#FFFFFF",
  surfaceSunken: "#EDF0F4",
  line: "#DFE4EA",
  lineStrong: "#C3CCD6",
  brand: "#1B4965",
  brandHover: "#143A51",
  brandSoft: "#E6EEF4",
  band: "#102F44",
  bandHover: "#1A3D55",
  onBandSoft: "#B7C6D3",
  focus: "#2B7BB9",
  success: "#0E7C3A",
  successSoft: "#E3F3E8",
  warning: "#8A5300",
  warningSoft: "#FBEFD9",
  danger: "#C0262D",
  dangerSoft: "#FBE7E7",
  info: "#1F5FBF",
  infoSoft: "#E6EEFA",
  neutralSoft: "#EDF0F4",
};

export const radii = { sm: 6, md: 8, lg: 12, xl: 16, pill: 999 };

export const elevation = {
  level1: "0 4px 16px rgba(15, 30, 46, 0.10)",
  level2: "0 4px 16px rgba(15, 30, 46, 0.16)",
  level3: "0 2px 8px rgba(15, 30, 46, 0.16)",
};

// Be Vietnam Pro is loaded by next/font in app/layout.jsx as the --font-be-vietnam variable.
const fontStack = 'var(--font-be-vietnam), "Be Vietnam Pro", system-ui, "Segoe UI", Roboto, Arial, sans-serif';

const focusRing = { outline: `2px solid ${tokens.focus}`, outlineOffset: 2 };
const press = { "&:active:not(.Mui-disabled)": { transform: "scale(0.98)" } };

const theme = createTheme({
  breakpoints: {
    values: { xs: 0, sm: 600, md: 900, lg: 1200, xl: 1536 },
  },
  palette: {
    primary: { main: tokens.brand, dark: tokens.brandHover, light: "#3E6E8C", contrastText: "#FFFFFF" },
    // Kept for older screens; new UI uses primary only (DESIGN.md: one action colour).
    secondary: { main: tokens.brand, light: tokens.brandSoft, dark: tokens.brandHover, contrastText: "#FFFFFF" },
    success: { main: tokens.success, light: tokens.successSoft, dark: "#0A5E2C", contrastText: "#FFFFFF" },
    warning: { main: tokens.warning, light: tokens.warningSoft, dark: "#6B4000", contrastText: "#FFFFFF" },
    error: { main: tokens.danger, light: tokens.dangerSoft, dark: "#951C22", contrastText: "#FFFFFF" },
    info: { main: tokens.info, light: tokens.infoSoft, dark: "#174A95", contrastText: "#FFFFFF" },
    background: { default: tokens.canvas, paper: tokens.surface },
    text: { primary: tokens.ink, secondary: tokens.inkMuted, disabled: "#8A97A5" },
    divider: tokens.line,
    action: { hover: "rgba(15, 30, 46, 0.04)", selected: tokens.brandSoft, focus: "rgba(43, 123, 185, 0.16)" },
  },
  typography: {
    fontFamily: fontStack,
    h1: { fontSize: "2rem", fontWeight: 700, lineHeight: 1.25 },
    h2: { fontSize: "1.5rem", fontWeight: 700, lineHeight: 1.33 },
    h3: { fontSize: "1.25rem", fontWeight: 700, lineHeight: 1.4 },
    h4: { fontSize: "1.5rem", fontWeight: 700, lineHeight: 1.33 },
    h5: { fontSize: "1.125rem", fontWeight: 700, lineHeight: 1.4 },
    h6: { fontSize: "1rem", fontWeight: 700, lineHeight: 1.45 },
    subtitle1: { fontSize: "1rem", fontWeight: 500 },
    subtitle2: { fontSize: "0.875rem", fontWeight: 500 },
    body1: { fontSize: "0.9375rem", lineHeight: 1.55 },
    body2: { fontSize: "0.875rem", lineHeight: 1.45 },
    caption: { fontSize: "0.75rem", lineHeight: 1.5 },
    overline: { fontSize: "0.75rem", fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" },
    button: { textTransform: "none", fontWeight: 500, fontSize: "0.9375rem" },
  },
  shape: { borderRadius: radii.md },
  shadows: [
    "none",
    "none",
    elevation.level3,
    elevation.level3,
    elevation.level1,
    elevation.level1,
    ...Array(19).fill(elevation.level2),
  ],
  zIndex: { appBar: 1100, drawer: 1200, modal: 1300, snackbar: 1400, tooltip: 1500 },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: tokens.canvas, color: tokens.ink },
      },
    },
    MuiButtonBase: { defaultProps: { disableRipple: false } },
    // Pill controls: one navy primary per view, white/soft secondaries.
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: radii.pill,
          minHeight: 40,
          padding: "8px 18px",
          transition: "background-color 150ms, border-color 150ms, color 150ms, transform 150ms",
          "&.Mui-focusVisible": focusRing,
          "@media (pointer: coarse)": { minHeight: 44 },
          ...press,
        },
        sizeSmall: { minHeight: 32, padding: "4px 14px", fontSize: "0.875rem", "@media (pointer: coarse)": { minHeight: 40 } },
        sizeLarge: { minHeight: 48, padding: "12px 24px", fontSize: "1rem" },
        // Transparent so outlined buttons also work on the navy band.
        outlined: { borderColor: tokens.line, color: tokens.ink, "&:hover": { borderColor: tokens.lineStrong, backgroundColor: "rgba(15, 30, 46, 0.04)" } },
        outlinedPrimary: { color: tokens.brand },
        // Status outlined buttons keep their colour; the plain outlined override above would turn them ink.
        outlinedError: { color: tokens.danger, borderColor: tokens.dangerSoft, "&:hover": { borderColor: tokens.danger, backgroundColor: tokens.dangerSoft } },
        outlinedSuccess: { color: tokens.success, borderColor: tokens.successSoft, "&:hover": { borderColor: tokens.success, backgroundColor: tokens.successSoft } },
        outlinedWarning: { color: tokens.warning, borderColor: tokens.warningSoft, "&:hover": { borderColor: tokens.warning, backgroundColor: tokens.warningSoft } },
        text: { "&:hover": { backgroundColor: tokens.brandSoft } },
        containedInherit: { backgroundColor: tokens.surfaceSunken, color: tokens.ink, "&:hover": { backgroundColor: tokens.line } },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: { borderRadius: radii.pill, "&.Mui-focusVisible": focusRing, ...press },
      },
    },
    MuiToggleButton: {
      styleOverrides: { root: { textTransform: "none", fontWeight: 500, borderColor: tokens.line } },
    },
    MuiFab: { styleOverrides: { root: { boxShadow: elevation.level3 } } },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        rounded: { borderRadius: radii.xl },
        outlined: { borderColor: tokens.line },
      },
    },
    MuiCard: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { borderRadius: radii.xl, border: `1px solid ${tokens.line}`, boxShadow: "none" },
      },
    },
    MuiCardContent: { styleOverrides: { root: { padding: 20, "&:last-child": { paddingBottom: 20 } } } },
    // Soft-filled inputs (DESIGN.md): label inside the field, no border at rest,
    // navy 2 px ring on focus, danger ring on error. Explicit variant="outlined" still works.
    MuiTextField: { defaultProps: { variant: "filled", size: "small", InputLabelProps: { shrink: true } } },
    MuiFormControl: { defaultProps: { variant: "filled" } },
    // Labels always sit shrunk inside the field, so an empty value must still show its "Tất cả" option.
    MuiSelect: { defaultProps: { variant: "filled", displayEmpty: true }, styleOverrides: { icon: { color: tokens.inkMuted } } },
    MuiFilledInput: {
      defaultProps: { disableUnderline: true },
      styleOverrides: {
        root: {
          borderRadius: radii.md,
          backgroundColor: tokens.surfaceSunken,
          border: "2px solid transparent",
          transition: "background-color 150ms, border-color 150ms",
          "&:hover": { backgroundColor: tokens.line },
          "&.Mui-focused": { backgroundColor: tokens.surface, borderColor: tokens.brand },
          "&.Mui-error": { borderColor: tokens.danger },
          "&.Mui-disabled": { backgroundColor: tokens.canvas },
        },
        input: { "@media (pointer: coarse)": { fontSize: 16 } },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: radii.md,
          backgroundColor: tokens.surfaceSunken,
          "& .MuiOutlinedInput-notchedOutline": { borderColor: "transparent" },
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: tokens.lineStrong },
          "&.Mui-focused": { backgroundColor: tokens.surface },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: tokens.brand, borderWidth: 2 },
          "&.Mui-error .MuiOutlinedInput-notchedOutline": { borderColor: tokens.danger, borderWidth: 2 },
          "&.Mui-disabled": { backgroundColor: tokens.canvas },
        },
        input: { "@media (pointer: coarse)": { fontSize: 16 } },
      },
    },
    MuiInputLabel: { styleOverrides: { root: { color: tokens.inkMuted, "&.Mui-focused": { color: tokens.brand } } } },
    MuiFormHelperText: { styleOverrides: { root: { marginLeft: 2, marginRight: 0 } } },
    MuiChip: {
      styleOverrides: {
        // Only the neutral chip is restyled; coloured chips keep their palette colour.
        root: { borderRadius: radii.pill, fontWeight: 500, "&.MuiChip-filled.MuiChip-colorDefault": { backgroundColor: tokens.surfaceSunken, color: tokens.ink } },
        outlined: { borderColor: tokens.line },
        sizeSmall: { height: 24, fontSize: "0.75rem" },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: { borderRadius: radii.lg, alignItems: "flex-start" },
        standardInfo: { backgroundColor: tokens.infoSoft, color: "#163F7D" },
        standardSuccess: { backgroundColor: tokens.successSoft, color: "#0A4F25" },
        standardWarning: { backgroundColor: tokens.warningSoft, color: "#5E3900" },
        standardError: { backgroundColor: tokens.dangerSoft, color: "#7A161B" },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { borderRadius: radii.xl, border: "none", boxShadow: elevation.level2 },
        paperFullScreen: { borderRadius: 0 },
      },
    },
    MuiDialogTitle: { styleOverrides: { root: { fontWeight: 700, fontSize: "1.125rem" } } },
    MuiDrawer: { styleOverrides: { paper: { border: "none" } } },
    MuiMenu: { styleOverrides: { paper: { borderRadius: radii.lg, boxShadow: elevation.level2 } } },
    MuiPopover: { styleOverrides: { paper: { borderRadius: radii.lg, boxShadow: elevation.level2 } } },
    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: tokens.line, fontSize: "0.875rem" },
        head: { color: tokens.inkMuted, fontWeight: 500, backgroundColor: tokens.surfaceSunken },
      },
    },
    MuiTableRow: { styleOverrides: { hover: { "&:hover": { backgroundColor: `${tokens.canvas} !important` } } } },
    MuiTab: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 500, minHeight: 44, "&.Mui-selected": { color: tokens.brand } },
      },
    },
    MuiTabs: { styleOverrides: { root: { minHeight: 44 }, indicator: { height: 3, borderRadius: 3, backgroundColor: tokens.brand } } },
    MuiTooltip: { styleOverrides: { tooltip: { backgroundColor: tokens.ink, fontSize: "0.75rem", borderRadius: radii.sm } } },
    MuiLinearProgress: { styleOverrides: { root: { borderRadius: radii.pill, backgroundColor: tokens.surfaceSunken } } },
    MuiSkeleton: { defaultProps: { animation: "wave" }, styleOverrides: { root: { backgroundColor: tokens.surfaceSunken } } },
    // Initials avatars: navy with white text (9.6:1) instead of MUI grey (white on #BDBDBD is 1.9:1).
    MuiAvatar: { styleOverrides: { colorDefault: { backgroundColor: tokens.brand, color: "#FFFFFF", fontWeight: 600 } } },
    MuiSwitch: { styleOverrides: { switchBase: { "&.Mui-checked + .MuiSwitch-track": { backgroundColor: tokens.brand, opacity: 1 } } } },
  },
});

export default theme;
