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
    md: "!py-2.5 !px-5 !text-xs md:!text-sm !rounded-2xl",
    lg: "!py-3.5 !px-6 !text-sm md:!text-base !rounded-2xl",
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return {
          background: "linear-gradient(135deg, #1B4965 0%, #0D2B3E 100%)",
          color: "#FFFFFF",
          boxShadow: "0 4px 14px rgba(27, 73, 101, 0.25)",
          "&:hover": {
            background: "linear-gradient(135deg, #0D2B3E 0%, #1B4965 100%)",
            boxShadow: "0 6px 20px rgba(27, 73, 101, 0.35)",
            transform: "translateY(-1px)",
          },
        };

      case "secondary":
      case "outlined":
        return {
          backgroundColor: "#FFFFFF",
          color: "#1B4965",
          border: "1px solid #CBD5E1",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.04)",
          "&:hover": {
            backgroundColor: "#F8FAFC",
            borderColor: "#1B4965",
            transform: "translateY(-1px)",
          },
        };

      case "danger":
        return {
          background: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
          color: "#FFFFFF",
          boxShadow: "0 4px 14px rgba(239, 68, 68, 0.25)",
          "&:hover": {
            background: "linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)",
            transform: "translateY(-1px)",
          },
        };

      case "danger-outlined":
        return {
          backgroundColor: "#FEF2F2",
          color: "#E11D48",
          border: "1px solid #FECDD3",
          "&:hover": {
            backgroundColor: "#FFE4E6",
            borderColor: "#FDA4AF",
            transform: "translateY(-1px)",
          },
        };

      case "success":
        return {
          background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
          color: "#FFFFFF",
          boxShadow: "0 4px 14px rgba(16, 185, 129, 0.25)",
          "&:hover": {
            background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
            transform: "translateY(-1px)",
          },
        };

      case "warning":
        return {
          background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
          color: "#FFFFFF",
          boxShadow: "0 4px 14px rgba(245, 158, 11, 0.25)",
          "&:hover": {
            background: "linear-gradient(135deg, #D97706 0%, #B45309 100%)",
            transform: "translateY(-1px)",
          },
        };

      case "text":
        return {
          backgroundColor: "transparent",
          color: "#1B4965",
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
          background: "#E2E8F0",
          backgroundImage: "none",
          borderColor: "#CBD5E1",
          color: "#475569",
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
