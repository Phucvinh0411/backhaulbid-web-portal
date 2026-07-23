"use client";

/**
 * AsymmetricCornerBox - Reusable container box with 1 distinctively styled accent corner
 * (e.g. top-right enlarged curve or top-left cut) for featured cards, hero stats, and highlights.
 */
export default function AsymmetricCornerBox({
  children,
  className = "",
  cornerPosition = "top-right", // "top-right" | "top-left" | "bottom-right" | "bottom-left"
  glass = true,
  hoverEffect = true,
  padding = "md",
  accentBorder = true,
  onClick,
  ...props
}) {
  const cornerClasses = {
    "top-right": "rounded-3xl rounded-tr-[3.5rem]",
    "top-left": "rounded-3xl rounded-tl-[3.5rem]",
    "bottom-right": "rounded-3xl rounded-br-[3.5rem]",
    "bottom-left": "rounded-3xl rounded-bl-[3.5rem]",
  };

  const paddingClasses = {
    none: "p-0",
    sm: "p-3.5 md:p-4",
    md: "p-5 md:p-6",
    lg: "p-6 md:p-8",
  };

  return (
    <div
      onClick={onClick}
      className={`border border-slate-200/80 shadow-xs relative overflow-hidden transition-all duration-300 ${
        cornerClasses[cornerPosition] || cornerClasses["top-right"]
      } ${glass ? "bg-white/95 backdrop-blur-xl" : "bg-white"} ${
        hoverEffect
          ? "hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5"
          : ""
      } ${paddingClasses[padding] || paddingClasses.md} ${className}`}
      {...props}
    >
      {/* Top accent border glow */}
      {accentBorder && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1B4965] via-sky-400 to-emerald-400 opacity-80" />
      )}
      {children}
    </div>
  );
}
