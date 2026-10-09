// Rewrites src/lib/designTokenBaseline.json from the current source (see DESIGN.md).
// Run only to lower counts after cleaning files; never to accept new raw colours.
import { writeFileSync } from "node:fs";
import { countViolations } from "../src/lib/designTokenScan.js";

const current = await countViolations();
const sorted = Object.fromEntries(Object.entries(current).sort(([a], [b]) => a.localeCompare(b)));
writeFileSync(new URL("../src/lib/designTokenBaseline.json", import.meta.url), `${JSON.stringify(sorted, null, 2)}\n`);
console.log(`${Object.keys(sorted).length} files, ${Object.values(sorted).reduce((a, b) => a + b, 0)} raw colours`);
