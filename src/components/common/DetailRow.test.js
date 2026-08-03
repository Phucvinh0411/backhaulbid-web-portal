import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

test("DetailRow renders component values outside Typography paragraphs", async () => {
  const source = await readFile(
    path.resolve("src/components/common/DetailRow.jsx"),
    "utf8"
  );

  assert.match(source, /React\.isValidElement\(value\)/);
  assert.match(source, /<Box component="div" className=\{valueClasses\}>/);
});
