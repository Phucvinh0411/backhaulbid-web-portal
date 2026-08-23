import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

const headerSource = fs.readFileSync(
  path.join(process.cwd(), "src/components/layout/Header.jsx"),
  "utf8",
);
const layoutSource = fs.readFileSync(
  path.join(process.cwd(), "src/components/layout/DashboardLayout.jsx"),
  "utf8",
);

test("uses the authenticated account for all notification roles", () => {
  assert.match(headerSource, /userInfo\?\.accountId/);
  assert.match(headerSource, /GATEWAY_URL/);
  assert.doesNotMatch(headerSource, /55555555-5555-5555-5555-555555555555/);
  assert.doesNotMatch(headerSource, /role !== ["']carrier["']/);
  assert.match(layoutSource, /accountId: u\.accountId/);
});
