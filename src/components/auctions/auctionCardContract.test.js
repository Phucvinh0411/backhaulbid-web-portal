import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

async function source(relativePath) {
  return readFile(path.resolve(relativePath), "utf8");
}

test("carrier auction cards use the canonical auction card adapter", async () => {
  const carrierCard = await source("src/components/carrier/CarrierBiddingItem.jsx");
  assert.match(carrierCard, /@\/components\/auctions\/AuctionSessionCard/);
  assert.match(carrierCard, /normalizeCarrierAuction/);
});

test("shipper bidding sessions use the same canonical auction card", async () => {
  const shipperScreen = await source("src/components/shipper/BiddingSessionsScreen.jsx");
  assert.match(shipperScreen, /@\/components\/auctions\/AuctionSessionCard/);
  assert.match(shipperScreen, /<AuctionSessionCard/);
});

test("auction detail surfaces opt into the centered modal variant", async () => {
  const carrierPage = await source("src/app/carrier/auctions/page.jsx");
  const shipperPage = await source("src/components/shipper/BiddingSessionsScreen.jsx");
  assert.match(carrierPage, /<DetailDrawer[\s\S]*variant="modal"/);
  assert.match(shipperPage, /<DetailDrawer[\s\S]*variant="modal"/);
});

test("account settings does not render fake company or representative data", async () => {
  const settings = await source("src/components/settings/AccountSettingsScreen.jsx");
  assert.match(settings, /const EMPTY_EKYC/);
  assert.match(settings, /Dữ liệu doanh nghiệp chỉ xuất hiện sau khi tra cứu MST thành công/);
  assert.match(settings, /<BusinessVerificationPanel/);
  assert.doesNotMatch(settings, /defaultValue=/);
  assert.doesNotMatch(settings, /0101234567|0988112233|Công ty Cổ phần Sữa Việt Nam|Công ty TNHH Vận Tải Xuyên Việt/);
});
