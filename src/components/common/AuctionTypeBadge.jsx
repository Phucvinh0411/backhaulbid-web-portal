"use client";

import LockIcon from "@mui/icons-material/LockOutlined";
import PublicIcon from "@mui/icons-material/PublicOutlined";

export default function AuctionTypeBadge({
  type = "PUBLIC",
  showIcon = true,
  size = "md", // "sm" | "md" | "lg"
  className = "",
}) {
  const isSealed = type === "SEALED";

  const sizeClasses = {
    sm: "text-[0.62rem] px-2 py-0.5 gap-1",
    md: "text-[0.68rem] px-2.5 py-1 gap-1.5",
    lg: "text-xs px-3 py-1.5 gap-1.5 font-bold",
  };

  const iconSizes = {
    sm: "!text-[0.7rem]",
    md: "!text-[0.8rem]",
    lg: "!text-[0.95rem]",
  };

  return (
    <span
      className={`inline-flex items-center font-extrabold rounded-full border whitespace-nowrap shrink-0 transition-colors ${
        sizeClasses[size] || sizeClasses.md
      } ${
        isSealed
          ? "bg-amber-50 text-amber-800 border-amber-200/90"
          : "bg-sky-50 text-sky-800 border-sky-200/90"
      } ${className}`}
    >
      
      {isSealed ? "Đấu giá kín" : "Công khai"}
    </span>
  );
}
