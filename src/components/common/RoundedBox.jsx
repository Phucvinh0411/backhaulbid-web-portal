"use client";

/** Plain bordered container. `glass`/`hoverEffect` kept for compatibility; no blur or lift. */
export default function RoundedBox({
  children,
  className = "",
  // eslint-disable-next-line no-unused-vars
  glass = false,
  hoverEffect = false,
  padding = "md",
  onClick,
  ...props
}) {
  const paddingClasses = { none: "p-0", sm: "p-3 md:p-4", md: "p-4 md:p-5", lg: "p-5 md:p-6" };
  return (
    <div
      onClick={onClick}
      className={`relative overflow-hidden rounded-xl border border-line bg-surface ${hoverEffect ? "hover:border-line-strong" : ""} ${paddingClasses[padding] || paddingClasses.md} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
