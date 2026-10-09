// One-off migration of legacy colours to DESIGN.md tokens.
// Usage: node scripts/design-token-codemod.mjs <file> [...files]   (paths relative to src/)
// Tailwind palette classes become token classes; known hex values become CSS variables.
// Hex inside SVG/chart fill, stroke and stopColor is left alone (CSS variables are not
// reliable in presentation attributes); the design-token test still reports those.
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../src");
const NEUTRAL = new Set(["slate", "gray", "zinc", "neutral", "stone"]);
const FAMILY = {
  green: "success", emerald: "success", lime: "success", teal: "success",
  amber: "warning", yellow: "warning", orange: "warning",
  red: "danger", rose: "danger", pink: "danger",
  sky: "info", cyan: "info",
  blue: "brand", indigo: "brand", violet: "brand", purple: "brand", fuchsia: "brand",
};

function neutralToken(prefix, shade) {
  if (prefix === "text" || prefix === "decoration" || prefix === "accent" || prefix === "caret") {
    if (shade >= 700) return "ink";
    if (shade >= 500) return "ink-muted";
    if (shade >= 400) return "ink-subtle";
    if (shade >= 200) return "line-strong";
    return "surface-sunken";
  }
  if (prefix === "placeholder") return "ink-subtle";
  if (prefix === "bg" || prefix === "from" || prefix === "to" || prefix === "via" || prefix === "fill") {
    if (shade <= 100) return "surface-sunken";
    if (shade <= 200) return "line";
    if (shade <= 400) return "line-strong";
    if (shade <= 600) return "ink-muted";
    return "ink";
  }
  // border, divide, ring, outline, stroke, shadow
  if (shade <= 200) return "line";
  if (shade <= 400) return "line-strong";
  return "ink-muted";
}

function semanticToken(prefix, family, shade) {
  const base = FAMILY[family];
  if (prefix === "text" || prefix === "decoration" || prefix === "placeholder" || prefix === "accent" || prefix === "caret") return base;
  if (prefix === "bg" || prefix === "from" || prefix === "to" || prefix === "via" || prefix === "fill") return shade <= 200 ? `${base}-soft` : base;
  return shade <= 300 ? `${base}-soft` : base;
}

const CLASS = /\b(bg|text|border|from|to|via|ring|fill|stroke|shadow|outline|divide|decoration|accent|caret|placeholder)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-(\d{2,3})\b/g;

const HEX = {
  "#1B4965": "var(--color-brand)", "#143A51": "var(--color-brand-hover)", "#0D2B3E": "var(--color-brand-hover)",
  "#0F172A": "var(--color-ink)", "#1E293B": "var(--color-ink)", "#0A1929": "var(--color-ink)", "#0F1E2E": "var(--color-ink)",
  "#334155": "var(--color-ink-muted)", "#475569": "var(--color-ink-muted)", "#64748B": "var(--color-ink-muted)", "#4A5B6C": "var(--color-ink-muted)",
  "#94A3B8": "var(--color-ink-subtle)", "#6B7A8A": "var(--color-ink-subtle)",
  "#CBD5E1": "var(--color-line-strong)", "#C3CCD6": "var(--color-line-strong)",
  "#E2E8F0": "var(--color-line)", "#DCE2E9": "var(--color-line)",
  "#F1F5F9": "var(--color-surface-sunken)", "#F8FAFC": "var(--color-surface-sunken)", "#EEF1F5": "var(--color-surface-sunken)", "#F3F5F8": "var(--color-canvas)",
  "#FFFFFF": "var(--color-surface)",
  "#BEE9E8": "var(--color-brand-soft)", "#EAF4F8": "var(--color-brand-soft)", "#E6EEF4": "var(--color-brand-soft)", "#62B6CB": "var(--color-info)",
  "#10B981": "var(--color-success)", "#059669": "var(--color-success)", "#047857": "var(--color-success)", "#065F46": "var(--color-success)", "#064E3B": "var(--color-success)", "#2E7D32": "var(--color-success)", "#1E7A46": "var(--color-success)",
  "#ECFDF5": "var(--color-success-soft)", "#D1FAE5": "var(--color-success-soft)", "#A7F3D0": "var(--color-success-soft)", "#E5F4EC": "var(--color-success-soft)",
  "#D97706": "var(--color-warning)", "#F59E0B": "var(--color-warning)", "#B45309": "var(--color-warning)", "#ED6C02": "var(--color-warning)", "#78350F": "var(--color-warning)", "#9A5B00": "var(--color-warning)", "#B86E00": "var(--color-warning)",
  "#FFFBEB": "var(--color-warning-soft)", "#FDE68A": "var(--color-warning-soft)", "#FFF3E0": "var(--color-warning-soft)", "#FDF1DC": "var(--color-warning-soft)",
  "#BE123C": "var(--color-danger)", "#E11D48": "var(--color-danger)", "#9F1239": "var(--color-danger)", "#DC2626": "var(--color-danger)", "#B42318": "var(--color-danger)",
  "#FECDD3": "var(--color-danger-soft)", "#FFF1F2": "var(--color-danger-soft)", "#FEF2F2": "var(--color-danger-soft)", "#FFEBEE": "var(--color-danger-soft)", "#FFE4E6": "var(--color-danger-soft)", "#FDECEA": "var(--color-danger-soft)",
  "#1D4ED8": "var(--color-info)", "#1E40AF": "var(--color-info)", "#1D5FA8": "var(--color-info)",
  "#EFF6FF": "var(--color-info-soft)", "#BFDBFE": "var(--color-info-soft)", "#F0F9FF": "var(--color-info-soft)", "#E7F0FB": "var(--color-info-soft)",
  "#7C3AED": "var(--color-brand)",
};
const SKIP_LINE = /\b(fill|stroke|stopColor|stop-color)\s*[=:]/;

export function migrate(source) {
  let changes = 0;
  const lines = source.split("\n").map((line) => {
    let next = line.replace(CLASS, (match, prefix, family, shadeText) => {
      const shade = Number(shadeText);
      const token = NEUTRAL.has(family) ? neutralToken(prefix, shade) : semanticToken(prefix, family, shade);
      changes += 1;
      return `${prefix}-${token}`;
    });
    next = next.replace(/\brounded-(2xl|3xl)\b/g, () => { changes += 1; return "rounded-xl"; });
    if (!SKIP_LINE.test(next)) {
      next = next.replace(/#[0-9a-fA-F]{6}\b/g, (hex) => {
        const value = HEX[hex.toUpperCase()];
        if (!value) return hex;
        changes += 1;
        return value;
      });
    }
    return next;
  });
  return { output: lines.join("\n"), changes };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  let total = 0;
  for (const relative of process.argv.slice(2)) {
    const file = path.join(SRC, relative);
    const { output, changes } = migrate(readFileSync(file, "utf8"));
    if (changes) writeFileSync(file, output);
    total += changes;
    console.log(`${changes}\t${relative}`);
  }
  console.log(`${total} replacements`);
}
