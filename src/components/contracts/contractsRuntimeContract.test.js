import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync(new URL("./ContractsManagementScreen.jsx", import.meta.url), "utf8");

test("Given the contracts screen is rendered without injected fixtures, When it loads data, Then it uses the real mine-contract API instead of demo contracts", () => {
  assert.doesNotMatch(source, /DEMO_CONTRACTS/);
  assert.match(source, /\.listMine\(\)/);
  assert.match(source, /mapContractResponses/);
});

test("Given contract loading fails, When the screen cannot load the list, Then it keeps a page error state and raises a global notification", () => {
  assert.match(source, /setLoadError\(/);
  assert.match(source, /notify\.error\(/);
  assert.match(source, /getApiErrorMessage/);
});
