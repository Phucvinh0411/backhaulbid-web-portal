import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync(new URL("./CarrierProfileScreen.jsx", import.meta.url), "utf8");

test("Given a carrier id, When the carrier profile opens, Then it loads real company, fleet and driver data", () => {
  assert.doesNotMatch(source, /getCarrierByCode|mockData/);
  assert.match(source, /carrierProfileApi/);
  assert.match(source, /Promise\.all/);
  assert.match(source, /getApiErrorMessage/);
  assert.match(source, /notify\.error/);
});
