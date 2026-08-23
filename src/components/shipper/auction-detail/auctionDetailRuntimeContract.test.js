import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const source = fs.readFileSync(path.join(currentDir, "AuctionDetailScreen.jsx"), "utf8");

test("Given auction data is still loading or unavailable, When the detail screen renders, Then it does not dereference a null shipment", () => {
  assert.match(source, /const isSealed = shipment\?\.auctionType/);
});

test("Given the auction detail API fails, When the page reports the failure, Then it uses the shared Vietnamese error adapter and popup", () => {
  assert.match(source, /getApiErrorMessage/);
  assert.match(source, /notify\.error/);
});
