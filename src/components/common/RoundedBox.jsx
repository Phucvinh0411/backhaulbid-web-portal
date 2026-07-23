"use client";

/**
 * RoundedBox - Reusable fully rounded container box for standard cards, panels & sections.
 * Features optional glassmorphism, hover elevation, and custom padding.
 */
export default function RoundedBox({
  children,
  className = "",
  glass = true,
  hoverEffect = true,
  padding = "md", // "none" | "sm" | "md" | "lg"
  onClick,
  ...props
}) {
  const paddingClasses = {
    none: "p-0",
    sm: "p-3.5 md:p-4",
    md: "p-5 md:p-6",
    lg: "p-6 md:p-8",
  };

  return (
    <div
      onClick={onClick}
      className={`rounded-3xl border border-slate-200/80 shadow-xs relative overflow-hidden transition-all duration-300 ${
        glass ? "bg-white/95 backdrop-blur-xl" : "bg-white"
      } ${
        hoverEffect
          ? "hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5"
          : ""
      } ${paddingClasses[padding] || paddingClasses.md} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
