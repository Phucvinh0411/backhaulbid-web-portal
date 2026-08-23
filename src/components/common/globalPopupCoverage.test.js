import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (file) => fs.readFileSync(new URL(file, import.meta.url), "utf8");

test("Given action feedback on admin settings, When the API succeeds or fails, Then the screen uses the global popup", () => {
  const files = [
    "../../app/admin/settings/page.jsx",
    "../../app/admin/settings/payment/page.jsx",
    "../../app/admin/settings/notification/page.jsx",
    "../../app/admin/settings/auction/page.jsx",
  ].map(read);

  files.forEach((source) => {
    assert.match(source, /useGlobalNotification/);
    assert.match(source, /notify\.(success|error)/);
    assert.doesNotMatch(source, /feedback && <Alert/);
  });
});

test("Given carrier fleet actions, When validation or API feedback is produced, Then it is routed to the global popup", () => {
  const files = [
    "../../app/carrier/vehicles/page.jsx",
    "../../app/carrier/drivers/page.jsx",
    "../../components/carrier/EmptyRouteDialog.jsx",
  ].map(read);

  files.forEach((source) => {
    assert.match(source, /useGlobalNotification/);
    assert.match(source, /getApiErrorMessage/);
    assert.doesNotMatch(source, /error\?\.response\?\.data\?\.message/);
    assert.doesNotMatch(source, /err\?\.response\?\.data\?\.message/);
    assert.doesNotMatch(source, /loadError\?\.response\?\.data\?\.message/);
    assert.doesNotMatch(source, /saveError\?\.response\?\.data\?\.message/);
    assert.doesNotMatch(source, /updateError\?\.response\?\.data\?\.message/);
    assert.doesNotMatch(source, /deleteError\?\.response\?\.data\?\.message/);
    assert.doesNotMatch(source, /\{error && <Box role="alert"/);
    assert.doesNotMatch(source, /successMsg && <Box role="status"/);
  });
});

test("Given auction room and history failures, When the API responds with an error, Then the user receives a global popup", () => {
  const files = [
    "../../components/shipper/BiddingHistoryListScreen.jsx",
    "../../components/complaints/ComplaintConversation.jsx",
    "../../components/carrier/auction-detail/CarrierRegistrationGate.jsx",
    "../../components/carrier/auction-detail/CarrierAuctionScreen.jsx",
    "../../components/carrier/auction-detail/AuctionRegistrationDialog.jsx",
  ].map(read);

  files.forEach((source) => {
    assert.match(source, /useGlobalNotification/);
    assert.match(source, /notify\.(error|warning|success)/);
    assert.doesNotMatch(source, /error\?\.response\?\.data\?\.message/);
    assert.doesNotMatch(source, /requestError\?\.response\?\.data\?\.message/);
  });

  [files[2], files[3], files[4]].forEach((source) => {
    assert.match(source, /getApiErrorMessage/);
  });
});

test("Given an eKYC configuration or verification failure, When the flow cannot continue, Then the existing UI also raises a Vietnamese global popup", () => {
  const files = [
    "../../components/eKYC/VNPTEkyc.jsx",
    "../../components/eKYC/EkycModal.jsx",
  ].map(read);

  files.forEach((source) => {
    assert.match(source, /dispatchGlobalNotification/);
    assert.match(source, /type:\s*["']error["']/);
  });
});

test("Given admin and carrier operational actions, When an API fails, Then the user gets a mapped Vietnamese popup", () => {
  const files = [
    "../../app/admin/users/page.jsx",
    "../../app/admin/fleet-verifications/page.jsx",
    "../../app/carrier/contracts/page.jsx",
    "../../app/carrier/transports/page.jsx",
  ].map(read);

  files.forEach((source) => {
    assert.match(source, /useGlobalNotification/);
    assert.match(source, /getApiErrorMessage/);
    assert.match(source, /notify\.error/);
    assert.doesNotMatch(
      source,
      /(?:error|loadError|reviewError)\?\.response\?\.data\?\.message/,
    );
  });
});
