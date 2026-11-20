"use client";

import Button from "@mui/material/Button";

// Maps the legacy ActionButton API onto the theme's MUI Button variants so every
// button shares the same pill shape, sizes, focus ring and press feedback (src/theme/theme.jsx).
const VARIANTS = {
  primary: { variant: "contained", color: "primary" },
  secondary: { variant: "outlined", color: "primary" },
  outlined: { variant: "outlined", color: "primary" },
  danger: { variant: "contained", color: "error" },
  "danger-outlined": { variant: "outlined", color: "error" },
  success: { variant: "contained", color: "success" },
  warning: { variant: "contained", color: "warning" },
  text: { variant: "text", color: "primary" },
};

const SIZES = { sm: "small", md: "medium", lg: "large" };

/**
 * ActionButton - thin wrapper kept for existing call sites.
 * variant: "primary" | "secondary" | "outlined" | "danger" | "danger-outlined" | "success" | "warning" | "text"
 * size: "sm" | "md" | "lg"
 */
export default function ActionButton({ children, variant = "primary", size = "md", ...props }) {
  const mapped = VARIANTS[variant] || VARIANTS.primary;
  return (
    <Button variant={mapped.variant} color={mapped.color} size={SIZES[size] || "medium"} {...props}>
      {children}
    </Button>
  );
}
