import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync(new URL("./emptyRouteService.ts", import.meta.url), "utf8");

test("Given an authenticated carrier, When the empty-route radar loads, Then it requests only the current user's routes through the gateway", () => {
  assert.match(source, /import\s+\{\s*apiService\s*\}\s+from\s+"\.\/apiService"/);
  assert.match(source, /getEmptyRoutesByCompany\(\):\s*Promise<EmptyRoute\[\]>/);
  assert.match(source, /apiService\.get<EmptyRoute\[\]>\('\/api\/v1\/empty-routes'\)/);
  assert.doesNotMatch(source, /appApiService/);
});
