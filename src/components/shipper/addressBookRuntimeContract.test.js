import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const profileSource = fs.readFileSync(
  new URL("./ProfileWalletScreen.jsx", import.meta.url),
  "utf8",
);
const pickerSource = fs.readFileSync(
  new URL("./create-auction/AddressBookModal.jsx", import.meta.url),
  "utf8",
);

test("Given the profile address book, When it loads or mutates data, Then it uses the shared backend API and confirmation dialog", () => {
  assert.doesNotMatch(profileSource, /INITIAL_ADDRESSES/);
  assert.doesNotMatch(profileSource, /\bconfirm\s*\(/);
  assert.match(profileSource, /addressBookApi\s*\.list\s*\(\s*\)/);
  assert.match(profileSource, /addressBookApi\.create\(/);
  assert.match(profileSource, /addressBookApi\.update\(/);
  assert.match(profileSource, /addressBookApi\.remove\(/);
  assert.match(profileSource, /Dialog.*X[oó]a|X[oó]a.*Dialog/s);
});

test("Given the auction address picker, When it opens, Then it reads the authenticated address book instead of mock data", () => {
  assert.doesNotMatch(pickerSource, /MOCK_ADDRESS_BOOK/);
  assert.match(pickerSource, /addressBookApi\s*\.list\s*\(\s*\)/);
  assert.match(pickerSource, /useGlobalNotification/);
});
