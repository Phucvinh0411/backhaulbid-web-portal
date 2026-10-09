"use client";

import Button from "@mui/material/Button";

/**
 * ActionButton - Reusable design system Button component for BackHaulBid.
 * Supports primary, secondary, outlined, danger, success, warning & text variants
 * with consistent rounded corners, typography, hover elevation, and icon integration.
 */
export default function ActionButton({
  children,
  variant = "primary", // "primary" | "secondary" | "outlined" | "danger" | "danger-outlined" | "success" | "warning" | "text"
  size = "md", // "sm" | "md" | "lg"
  fullWidth = false,
  disabled = false,
  startIcon,
  endIcon,
  onClick,
  className = "",
  sx = {},
  ...props
}) {
  const sizeClasses = {
    sm: "!py-1.5 !px-3.5 !text-xs !rounded-xl",
    md: "!py-2.5 !px-5 !text-xs md:!text-sm !rounded-xl",
    lg: "!py-3.5 !px-6 !text-sm md:!text-base !rounded-xl",
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return {
          background: "var(--color-brand)",
          color: "var(--color-surface)",
          boxShadow: "none",
          "&:hover": {
            background: "var(--color-brand-hover)",
            boxShadow: "none",
            transform: "translateY(-1px)",
          },
        };

      case "secondary":
      case "outlined":
        return {
          backgroundColor: "var(--color-surface)",
          color: "var(--color-brand)",
          border: "1px solid var(--color-line-strong)",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          "&:hover": {
            backgroundColor: "var(--color-surface-sunken)",
            borderColor: "var(--color-brand)",
            transform: "translateY(-1px)",
          },
        };

      case "danger":
        return {
          background: "var(--color-danger)",
          color: "var(--color-surface)",
          boxShadow: "none",
          "&:hover": {
            background: "var(--color-danger)", filter: "brightness(0.88)",
            transform: "translateY(-1px)",
          },
        };

      case "danger-outlined":
        return {
          backgroundColor: "var(--color-danger-soft)",
          color: "var(--color-danger)",
          border: "1px solid var(--color-danger-soft)",
          "&:hover": {
            backgroundColor: "var(--color-danger-soft)",
            borderColor: "var(--color-danger)",
            transform: "translateY(-1px)",
          },
        };

      case "success":
        return {
          background: "var(--color-success)",
          color: "var(--color-surface)",
          boxShadow: "none",
          "&:hover": {
            background: "var(--color-success)", filter: "brightness(0.88)",
            transform: "translateY(-1px)",
          },
        };

      case "warning":
        return {
          background: "var(--color-warning)",
          color: "var(--color-surface)",
          boxShadow: "none",
          "&:hover": {
            background: "var(--color-warning)", filter: "brightness(0.88)",
            transform: "translateY(-1px)",
          },
        };

      case "text":
        return {
          backgroundColor: "transparent",
          color: "var(--color-brand)",
          "&:hover": {
            backgroundColor: "rgba(27, 73, 101, 0.06)",
          },
        };

      default:
        return {};
    }
  };

  return (
    <Button
      fullWidth={fullWidth}
      disabled={disabled}
      startIcon={startIcon}
      endIcon={endIcon}
      onClick={onClick}
      className={`!font-extrabold !capitalize !transition-all !duration-200 ${
        sizeClasses[size] || sizeClasses.md
      } ${className}`}
      sx={{
        ...getVariantStyles(),
        "&.Mui-disabled": {
          background: "var(--color-line)",
          backgroundImage: "none",
          borderColor: "var(--color-line-strong)",
          color: "var(--color-ink-muted)",
          boxShadow: "none",
          opacity: 1,
        },
        ...sx,
      }}
      {...props}
    >
      {children}
    </Button>
  );
}
