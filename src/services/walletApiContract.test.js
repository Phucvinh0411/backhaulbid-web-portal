import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const source = fs.readFileSync(path.join(currentDir, "walletApi.js"), "utf8");

test("Given the wallet history and admin audit flows, When the portal calls the API client, Then every planned endpoint is declared", () => {
  assert.match(source, /listTopUps:/);
  assert.match(source, /cancelTopUp:/);
  assert.match(source, /getTransaction:/);
  assert.match(source, /getAdminTopUps:/);
  assert.match(source, /getAdminTopUp:/);
  assert.match(source, /getAdminWallet:/);
});
