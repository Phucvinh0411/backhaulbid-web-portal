import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const walletSource = fs.readFileSync(path.join(currentDir, "WalletScreen.jsx"), "utf8");

test("Given a wallet action completes or fails, When WalletScreen reports it, Then it uses the global notification hook", () => {
  assert.match(walletSource, /useGlobalNotification/);
  assert.match(walletSource, /notify\.(success|error|warning)/);
  assert.doesNotMatch(walletSource, /walletActionError && <Alert/);
  assert.doesNotMatch(walletSource, /walletMessage && <Alert/);
});

