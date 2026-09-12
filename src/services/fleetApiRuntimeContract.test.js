import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const source = fs.readFileSync(new URL("./fleetApi.js", import.meta.url), "utf8");

test("Given carrier vehicle loading, When backend fails, Then the client does not fabricate demo vehicles", () => {
  assert.match(source, /apiService\.get\("\/api\/v1\/vehicles\/mine"\)/);
  const vehicleLoader = source.match(
    /export const getMyVehicles\s*=\s*async\s*\(\)\s*=>\s*\{[\s\S]*?\n\};/,
  )?.[0] || "";
  assert.ok(vehicleLoader.length > 0);
  assert.doesNotMatch(vehicleLoader, /\.catch\s*\(/);
});

test("Given carrier dashboard, When vehicle API fails, Then vehicle loading is not silently swallowed by safeFetch", () => {
  const dashboardSource = fs.readFileSync(
    path.resolve(__dirname, '../app/carrier/dashboard/page.jsx'), 'utf8'
  );
  assert.doesNotMatch(dashboardSource, /safeFetch\(getMyVehicles\(\)\)/);
});