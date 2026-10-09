"use client";

import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "next/link";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

/**
 * Page title row shared by every portal screen.
 * Desktop shows breadcrumbs; phones show a single "back" link to the parent crumb
 * so the header stays short and the content starts above the fold.
 */
export default function PageHeader({ title, subtitle, breadcrumbs = [], action, meta }) {
  const linkable = breadcrumbs.slice(0, -1).filter((crumb) => crumb.path && crumb.path !== "#");
  const parent = breadcrumbs.length > 1 ? linkable[linkable.length - 1] : null;

  return (
    <Box component="header" sx={{ mb: { xs: 2, md: 3 } }}>
      {breadcrumbs.length > 0 && (
        <Breadcrumbs
          aria-label="Đường dẫn"
          separator="›"
          sx={{ display: { xs: "none", md: "block" }, mb: 1, fontSize: "0.8125rem", color: "text.secondary" }}
        >
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            if (isLast || !crumb.path || crumb.path === "#") {
              return (
                <Typography key={`${crumb.label}-${index}`} component="span" aria-current={isLast ? "page" : undefined} sx={{ fontSize: "0.8125rem", color: "text.secondary" }}>
                  {crumb.label}
                </Typography>
              );
            }
            return (
              <Link key={`${crumb.label}-${index}`} href={crumb.path} className="text-[0.8125rem] text-ink-muted no-underline hover:text-brand hover:underline">
                {crumb.label}
              </Link>
            );
          })}
        </Breadcrumbs>
      )}

      {parent && (
        <Link
          href={parent.path}
          className="mb-1 inline-flex min-h-[44px] items-center gap-1 text-sm font-semibold text-brand no-underline md:hidden"
        >
          <ArrowBackIcon sx={{ fontSize: 18 }} aria-hidden />
          {parent.label}
        </Link>
      )}

      <Box sx={{ display: "flex", alignItems: { xs: "stretch", sm: "flex-start" }, justifyContent: "space-between", flexDirection: { xs: "column", sm: "row" }, gap: 1.5 }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography component="h1" sx={{ fontSize: { xs: "1.25rem", md: "1.5rem" }, fontWeight: 700, color: "text.primary", lineHeight: 1.25, textWrap: "balance", overflowWrap: "anywhere" }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5, maxWidth: "70ch" }}>
              {subtitle}
            </Typography>
          )}
          {meta && <Box sx={{ mt: 1, display: "flex", flexWrap: "wrap", gap: 1 }}>{meta}</Box>}
        </Box>
        {action && <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", flexShrink: 0, "& > *": { flex: { xs: "1 1 auto", sm: "0 0 auto" } } }}>{action}</Box>}
      </Box>
    </Box>
  );
}
