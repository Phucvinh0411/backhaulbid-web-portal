import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

const screenSource = fs.readFileSync(
  path.join(
    process.cwd(),
    "src/components/shipper/create-auction/CreateAuctionScreen.jsx",
  ),
  "utf8",
);
const biddingApiSource = fs.readFileSync(
  path.join(process.cwd(), "src/services/biddingApi.js"),
  "utf8",
);

test("sends one stable idempotency key for retrying the same creation request", () => {
  assert.match(screenSource, /useRef/);
  assert.match(screenSource, /X-Idempotency-Key/);
  assert.match(screenSource, /randomUUID/);
  assert.match(screenSource, /res\?\.id/);
  assert.match(biddingApiSource, /createAuction[\s\S]*unwrapApiData/);
  assert.doesNotMatch(screenSource, /showToast\(error\?\.message/);
  assert.doesNotMatch(screenSource, /55555555-5555-5555-5555-555555555555/);
});
