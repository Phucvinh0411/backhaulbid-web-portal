import Card from "@mui/material/Card";
import Box from "@mui/material/Box";

const ACCENT_CLASSES = {
  primary: "from-[#1B4965] to-[#62B6CB]",
  warning: "from-amber-400 to-amber-200",
  success: "from-emerald-400 to-emerald-200",
  danger: "from-rose-400 to-rose-200",
};

export default function AppCard({ children, accent = "primary", showAccent = true, className = "", sx, ...props }) {
  return (
    <Card
      {...props}
      className={`group relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-100/80 bg-white/80 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${className}`}
      sx={{
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.02)",
        "&:hover": {
          borderColor: "rgba(27, 73, 101, 0.15)",
          boxShadow: "0 12px 30px rgba(27, 73, 101, 0.05)",
        },
        ...sx,
      }}
    >
      {showAccent && (
        <Box
          aria-hidden="true"
          className={`absolute left-0 top-0 h-1 w-full bg-gradient-to-r opacity-0 transition-all duration-300 group-hover:opacity-100 ${ACCENT_CLASSES[accent] || ACCENT_CLASSES.primary}`}
        />
      )}
      {children}
    </Card>
  );
}
