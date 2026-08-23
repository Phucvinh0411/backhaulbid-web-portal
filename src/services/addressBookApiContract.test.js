import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

const source = fs.readFileSync(new URL("./addressBookApi.js", import.meta.url), "utf8");

test("Given an authenticated shipper or carrier, When the address book is used, Then the client exposes CRUD endpoints", () => {
  assert.match(source, /list:\s*\(\)\s*=>\s*apiService\.get\("\/api\/v1\/addresses"\)/);
  assert.match(source, /create:\s*\(payload\)\s*=>\s*apiService\.post\("\/api\/v1\/addresses",\s*payload\)/);
  assert.match(source, /update:\s*\(addressId,\s*payload\)\s*=>\s*apiService\.patch\(`\/api\/v1\/addresses\/\$\{addressId\}`,\s*payload\)/);
  assert.match(source, /remove:\s*\(addressId\)\s*=>\s*apiService\.delete\(`\/api\/v1\/addresses\/\$\{addressId\}`\)/);
});
