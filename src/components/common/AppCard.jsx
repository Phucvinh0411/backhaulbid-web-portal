import Card from "@mui/material/Card";

/**
 * Plain bordered card used by list items across roles. Hover only changes the
 * border so cards stay calm in dense operational lists. `accent`/`showAccent`
 * are accepted for compatibility and intentionally render nothing decorative.
 */
// eslint-disable-next-line no-unused-vars
export default function AppCard({ children, accent = "primary", showAccent = false, className = "", sx, ...props }) {
  return (
    <Card
      {...props}
      className={`relative flex h-full flex-col overflow-hidden ${className}`}
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        boxShadow: "none",
        transition: "border-color 150ms",
        "&:hover": { borderColor: "var(--color-line-strong)" },
        ...sx,
      }}
    >
      {children}
    </Card>
  );
}
