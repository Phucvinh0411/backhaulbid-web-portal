import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const seedUrl = new URL("../../../../../be/backhaulbid-demo-data/carrier-admin/seed-postgres.sql", import.meta.url);

test("Given the canonical demo shipper, When loading the wallet fixture, Then wallet and payment scenarios exist", (t) => {
  if (!fs.existsSync(seedUrl)) {
    t.skip("External demo seed fixture not found in current environment");
    return;
  }
  const seed = fs.readFileSync(seedUrl, "utf8");
  assert.match(seed, /'33333333-3333-3333-3333-333333333333', 12000000\.00/);
  assert.match(seed, /TEST-TOPUP-PAID-SHIPPER-01/);
  assert.match(seed, /TEST-TOPUP-CREATED-SHIPPER-01/);
  assert.match(seed, /TEST-005-WITHDRAW/);
});
