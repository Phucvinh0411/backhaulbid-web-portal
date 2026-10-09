// Counts raw hex colours and Tailwind built-in palette classes per source file (DESIGN.md rule).
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const EXEMPT = [/^theme[\\/]/, /\.test\.[jt]sx?$/, /[\\/]map[\\/]/, /mockData\.js$/];
const PATTERN = /#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b(?![0-9a-fA-F])|\b(?:bg|text|border|from|to|via|ring|fill|stroke|shadow|outline|divide|decoration|accent|caret|placeholder)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/g;

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : /\.(jsx|tsx|js|ts)$/.test(entry.name) ? [full] : [];
  }));
  return files.flat();
}

export async function countViolations() {
  const result = {};
  for (const file of await walk(SRC)) {
    const relative = path.relative(SRC, file).split(path.sep).join("/");
    if (EXEMPT.some((pattern) => pattern.test(relative))) continue;
    const matches = (await readFile(file, "utf8")).match(PATTERN);
    if (matches?.length) result[relative] = matches.length;
  }
  return result;
}

