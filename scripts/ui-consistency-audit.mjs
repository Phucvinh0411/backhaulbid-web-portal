#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { countViolations } from "../src/lib/designTokenScan.js";

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, "src");

const ALLOWED_HEX_FILES = new Set([
  "theme/theme.jsx",
  "app/globals.css",
  "components/auth/GoogleSignInSection.jsx",
  "components/carrier/RouteDetailMap.jsx",
  "components/shipper/create-auction/ShopeeLocationPicker.jsx",
  "components/shipper/create-auction/ShopeePinMap.jsx",
  "components/shipper/create-auction/steps/route/RouteRoadMap.jsx",
  "components/shipper/create-auction/steps/route/RouteRoadPreviewCard.jsx",
  "components/carrier/RoutePickerMap.jsx",
  "components/map/PointPickerMap.jsx",
  "app/admin/settings/notification/page.jsx",
]);

const ALLOWED_RAW_DIALOG_FILES = new Set([
  "components/ui/ResponsiveDialog.jsx",
  "components/ui/ConfirmDialog.jsx",
  "components/admin/AdminUI.jsx",
  "components/common/DetailDrawer.jsx",
  // Wizard/registration multi-pane modals with bespoke mobile scroll/header layouts:
  "components/carrier/EmptyRouteDialog.jsx",
  "components/carrier/auction-detail/AuctionRegistrationDialog.jsx",
  "app/carrier/drivers/page.jsx",
  "app/carrier/vehicles/page.jsx",
]);

const ALLOWED_BACKDROP_FILES = new Set([
  "app/admin/settings/notification/page.jsx",
]);

function walkFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name === "node_modules") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(full, out);
    } else if (/\.(js|jsx|ts|tsx|css)$/i.test(entry.name) && !/\.test\./i.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

function rel(file) {
  return path.relative(SRC_DIR, file).replace(/\\/g, "/");
}

async function run() {
  const errors = [];
  const warnings = [];

  if (fs.existsSync(path.join(SRC_DIR, "index.css"))) {
    errors.push("src/index.css exists (unused legacy CSS must stay removed).");
  }

  const files = walkFiles(SRC_DIR);

  for (const file of files) {
    const r = rel(file);
    const content = fs.readFileSync(file, "utf8");
    const lines = content.split(/\r?\n/);

    lines.forEach((line, idx) => {
      const n = idx + 1;

      // 1. Forbidden !capitalize or !rounded- on MUI Button
      if (/<Button\b/.test(line) || /className=.*!capitalize/.test(line)) {
        if (/!capitalize/.test(line)) {
          errors.push(`[button-copy] ${r}:${n} uses '!capitalize' (deforms Vietnamese text).`);
        }
      }

      if (/<Button\b[^>]*className="[^"]*!rounded-/.test(line)) {
        errors.push(`[button-shape] ${r}:${n} overrides Button shape with '!rounded-*' instead of pill theme.`);
      }

      // 2. Hardcoded px borderRadius inside Button blocks
      if (/<Button\b/.test(line)) {
        const block = lines.slice(idx, Math.min(lines.length, idx + 16)).join(" ");
        const matchEnd = block.indexOf(">");
        const tag = matchEnd !== -1 ? block.slice(0, matchEnd + 1) : block;
        if (/borderRadius:\s*["']\d+px["']/.test(tag)) {
          errors.push(`[button-shape] ${r}:${n} overrides <Button> borderRadius with pixel literal.`);
        }
        if (/!rounded-(?!full\b)/.test(tag)) {
          errors.push(`[button-shape] ${r}:${n} overrides <Button> border-radius via Tailwind '!rounded-*'.`);
        }
        if (/!capitalize/.test(tag)) {
          errors.push(`[button-copy] ${r}:${n} overrides <Button> casing via '!capitalize'.`);
        }
      }

      // 3. Outlined overrides on filled-theme inputs/selects
      if (r !== "theme/theme.jsx" && r !== "app/globals.css") {
        if (/MuiOutlinedInput-(root|notchedOutline)/.test(line)) {
          errors.push(`[input-override] ${r}:${n} targets '.MuiOutlinedInput-*' (inputs default to 'filled').`);
        }
        if (/variant="outlined"/.test(line)) {
          const prev = lines.slice(Math.max(0, idx - 8), idx + 1).join(" ");
          if (/<(?:TextField|Select)\b(?![^<]*\/>)(?![^<]*>[^<]*variant="outlined")[^<]*variant="outlined"/.test(prev)) {
            errors.push(`[input-variant] ${r}:${n} passes variant="outlined" to TextField/Select instead of theme default 'filled'.`);
          }
        }
      }

      // 4. Glass / backdrop blur / translucent card surfaces
      if (r !== "app/globals.css" && !ALLOWED_BACKDROP_FILES.has(r)) {
        if (/backdrop-blur|backdropFilter/.test(line)) {
          errors.push(`[surface-clarity] ${r}:${n} uses blur backdrop instead of solid surface.`);
        }
        if (/(?:bg-white\/(?:[5-8]0)|(?:bgcolor|backgroundColor|background)\s*:\s*["']rgba\(\s*255\s*,\s*255\s*,\s*255\s*,\s*0\.[5-8])/i.test(line)) {
          const ctx = lines.slice(Math.max(0, idx - 3), idx + 3).join(" ");
          if (!/mapbox|leaflet|tooltip|toast|sticky|map|auth|Hero|Brand|gradient|dark/i.test(ctx) && !/rgba\(\s*255,\s*255,\s*255,\s*0\.1/.test(line)) {
            warnings.push(`[surface-clarity] ${r}:${n} uses translucent white surface: ${line.trim()}`);
          }
        }
        if (/className="[^"]*\bglass\b/.test(line)) {
          errors.push(`[surface-clarity] ${r}:${n} still uses legacy '.glass' class.`);
        }
      }

      // 5. Monospace font on TextField input & English leakage
      if (/& input.*fontFamily:\s*["']monospace["']/.test(line)) {
        errors.push(`[typography] ${r}:${n} uses monospace font inside input (use fontVariantNumeric: "tabular-nums").`);
      }
      if (/Auto-calculated from max price/.test(line)) {
        errors.push(`[i18n] ${r}:${n} contains untranslated English helper text.`);
      }

      // 6. Layout animation anti-pattern
      if (/transition:\s*["'](?:width|height)\b/.test(line)) {
        errors.push(`[motion] ${r}:${n} animates layout property (width/height); use transform/opacity.`);
      }

      // 7. Border-bottom spinner anti-pattern
      if (/animate-spin[^\n]*border-b-2/.test(line)) {
        errors.push(`[loading-ui] ${r}:${n} uses raw 'border-b-2' spinner; use MUI <CircularProgress />.`);
      }

      // 8. Raw <Dialog outside allowed wrappers
      if (/<Dialog\b/.test(line) && !ALLOWED_RAW_DIALOG_FILES.has(r)) {
        warnings.push(`[dialog] ${r}:${n} uses raw <Dialog> instead of <ResponsiveDialog>.`);
      }

      // 9. Synthetic faux-bold weights not loaded by Be Vietnam Pro (400..700 only)
      if (/\b!?font-(?:black|extrabold)\b|fontWeight\s*:\s*[89]00\b|font-weight\s*:\s*[89]00\b|font-weight=["'][89]00["']/.test(line)) {
        errors.push(`[typography] ${r}:${n} uses synthetic faux-bold (>700); Be Vietnam Pro loads weights 400..700.`);
      }

      // 10. Decorative glow blobs
      if (/\bblur-3xl\b/.test(line)) {
        errors.push(`[anti-slop] ${r}:${n} uses decorative 'blur-3xl' glow blob.`);
      }
    });
  }

  // Run repo token scan for raw hex / raw Tailwind palette names
  const tokenViolations = await countViolations();
  for (const [file, count] of Object.entries(tokenViolations)) {
    if (!ALLOWED_HEX_FILES.has(file)) {
      warnings.push(`[token-scan] ${file} (${count} literal hex/palette tokens)`);
    }
  }

  console.log("=== BackHaulBid UI Consistency Audit ===");
  console.log(`Scanned ${files.length} files under src/`);
  console.log(`Errors: ${errors.length}, Warnings: ${warnings.length}`);

  if (errors.length) {
    console.log("\nERRORS (must fix):");
    errors.forEach((e) => console.log("  " + e));
  }
  if (warnings.length) {
    console.log("\nWARNINGS (review):");
    warnings.slice(0, 60).forEach((w) => console.log("  " + w));
    if (warnings.length > 60) {
      console.log(`  ...and ${warnings.length - 60} more warnings`);
    }
  }

  if (errors.length > 0) {
    process.exit(1);
  }
  console.log("\nUI consistency audit PASSED (0 errors).");
}

run();
