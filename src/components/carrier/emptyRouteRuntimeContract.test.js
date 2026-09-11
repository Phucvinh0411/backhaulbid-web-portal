import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync(
  new URL("./EmptyRouteDialog.jsx", import.meta.url),
  "utf8",
);

test("Given carrier empty-route declaration, When sending payload, Then it uses vehicle licensePlate and no hardcoded company placeholder", () => {
  assert.match(source, /value=\{v\.licensePlate\s*\|\|\s*v\.plate\s*\|\|\s*""\}/);
  assert.doesNotMatch(source, /MY_COMPANY/);
});

test("Given carrier empty-route form, When initializing coordinates, Then no hardcoded HCM defaults", () => {
  assert.doesNotMatch(source, /useState\(10\.8231\)/);
  assert.doesNotMatch(source, /useState\(106\.6297\)/);
});