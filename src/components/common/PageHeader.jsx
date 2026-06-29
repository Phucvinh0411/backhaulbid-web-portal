import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "next/link";

export default function PageHeader({ title, subtitle, breadcrumbs = [], action }) {
  return (
    <Box className="mb-6">
      {breadcrumbs.length > 0 && (
        <Breadcrumbs className="!mb-2 !text-sm" separator="›">
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return isLast ? (
              <Typography key={index} className="!text-sm text-slate-500">
                {crumb.label}
              </Typography>
            ) : (
              <Link
                key={index}
                href={crumb.path}
                className="text-sm text-slate-400 hover:text-[#1B4965] transition-colors no-underline"
              >
                {crumb.label}
              </Link>
            );
          })}
        </Breadcrumbs>
      )}

      <Box className="flex items-center justify-between flex-wrap gap-3">
        <Box>
          <Typography variant="h4" className="!font-bold text-slate-800">
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" className="text-slate-500 !mt-1">
              {subtitle}
            </Typography>
          )}
        </Box>
        {action && <Box>{action}</Box>}
      </Box>
    </Box>
  );
}
