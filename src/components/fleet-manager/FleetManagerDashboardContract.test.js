import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync(new URL("./FleetManagerDashboard.tsx", import.meta.url), "utf8");

test("Given an empty route is declared, When the API succeeds, Then the radar reloads server data and confirms the action", () => {
  assert.match(source, /emptyRouteService\.getEmptyRoutesByCompany\(\)/);
  assert.match(source, /await emptyRouteService\.getEmptyRoutesByCompany\(\)/);
  assert.doesNotMatch(source, /setEmptyRoutes\(prev\s*=>\s*\[newRoute,\s*\.\.\.prev\]/);
  assert.match(source, /notify\.success\(/);
});

test("Given loading or declaration fails, When the radar cannot continue, Then it exposes a Vietnamese popup message", () => {
  assert.match(source, /getApiErrorMessage/);
  assert.match(source, /notify\.error\(/);
});
