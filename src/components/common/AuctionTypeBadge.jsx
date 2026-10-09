"use client";

export default function AuctionTypeBadge({
  type = "PUBLIC",
  size = "md", // "sm" | "md" | "lg"
  className = "",
}) {
  const isSealed = type === "SEALED";

  const sizeClasses = {
    sm: "text-[0.62rem] px-2 py-0.5 gap-1",
    md: "text-[0.68rem] px-2.5 py-1 gap-1.5",
    lg: "text-xs px-3 py-1.5 gap-1.5 font-bold",
  };

  return (
    <span
      className={`inline-flex items-center font-extrabold rounded-full border whitespace-nowrap shrink-0 transition-colors ${
        sizeClasses[size] || sizeClasses.md
      } ${
        isSealed
          ? "bg-warning-soft text-warning border-warning-soft/90"
          : "bg-info-soft text-info border-info-soft/90"
      } ${className}`}
    >
      
      {isSealed ? "Đấu giá kín" : "Công khai"}
    </span>
  );
}
