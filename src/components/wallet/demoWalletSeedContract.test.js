import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const seedPath = "../../../../../be/backhaulbid-demo-data/carrier-admin/seed-postgres.sql";
const seed = fs.readFileSync(new URL(seedPath, import.meta.url), "utf8");

test("Given the canonical demo shipper, When loading the wallet fixture, Then wallet and payment scenarios exist", () => {
  assert.match(seed, /'33333333-3333-3333-3333-333333333333', 12000000\.00/);
  assert.match(seed, /TEST-TOPUP-PAID-SHIPPER-01/);
  assert.match(seed, /TEST-TOPUP-CREATED-SHIPPER-01/);
  assert.match(seed, /TEST-005-WITHDRAW/);
});
