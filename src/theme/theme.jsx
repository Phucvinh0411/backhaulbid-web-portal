"use client";

// ============================================
// src/theme/theme.jsx - MUI v5 Theme Configuration
// Theme: Xanh dương (Primary) + Trắng (Surface)
// ============================================

import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#1B4965",
      light: "#5FA8D3",
      dark: "#0D2B3E",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#62B6CB",
      light: "#BEE9E8",
      dark: "#3A8FA0",
      contrastText: "#FFFFFF",
    },
    success: {
      main: "#2E7D32",
      light: "#4CAF50",
      dark: "#1B5E20",
    },
    warning: {
      main: "#ED6C02",
      light: "#FF9800",
      dark: "#E65100",
    },
    error: {
      main: "#D32F2F",
      light: "#EF5350",
      dark: "#C62828",
    },
    background: {
      default: "#F8FAFC",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#1E293B",
      secondary: "#64748B",
    },
  },
  typography: {
    fontFamily: "var(--font-inter), 'Inter', 'Roboto', sans-serif",
    h1: { fontSize: "2.25rem", fontWeight: 700, lineHeight: 1.2 },
    h2: { fontSize: "1.875rem", fontWeight: 700, lineHeight: 1.3 },
    h3: { fontSize: "1.5rem", fontWeight: 600, lineHeight: 1.4 },
    h4: { fontSize: "1.25rem", fontWeight: 600, lineHeight: 1.4 },
    h5: { fontSize: "1.125rem", fontWeight: 600, lineHeight: 1.5 },
    h6: { fontSize: "1rem", fontWeight: 600, lineHeight: 1.5 },
    body1: { fontSize: "0.9375rem", lineHeight: 1.6 },
    body2: { fontSize: "0.875rem", lineHeight: 1.6 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: {
    borderRadius: 10,
  },
  shadows: [
    "none",
    "0px 1px 3px rgba(0, 0, 0, 0.04), 0px 1px 2px rgba(0, 0, 0, 0.06)",
    "0px 2px 6px rgba(0, 0, 0, 0.06), 0px 1px 3px rgba(0, 0, 0, 0.08)",
    "0px 4px 12px rgba(0, 0, 0, 0.07), 0px 2px 4px rgba(0, 0, 0, 0.06)",
    "0px 6px 16px rgba(0, 0, 0, 0.08), 0px 3px 6px rgba(0, 0, 0, 0.06)",
    "0px 8px 24px rgba(0, 0, 0, 0.09), 0px 4px 8px rgba(0, 0, 0, 0.06)",
    ...Array(19).fill(
      "0px 10px 32px rgba(0, 0, 0, 0.1), 0px 5px 10px rgba(0, 0, 0, 0.06)"
    ),
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "8px 20px",
          fontSize: "0.875rem",
        },
        contained: {
          boxShadow: "0px 2px 6px rgba(0, 0, 0, 0.12)",
          "&:hover": {
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.16)",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.06)",
          border: "1px solid rgba(0, 0, 0, 0.06)",
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: "outlined",
        size: "small",
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          border: "none",
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          // Fix label overlapping with border when Tailwind Preflight breaks the legend gap
          backgroundColor: "#FFFFFF",
          paddingLeft: "4px",
          paddingRight: "4px",
          borderRadius: "4px",
        },
      },
    },
  },
});

export default theme;
