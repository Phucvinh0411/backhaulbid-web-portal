import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const walletSource = fs.readFileSync(path.join(currentDir, "WalletScreen.jsx"), "utf8");
const adminWalletSource = fs.readFileSync(
  path.join(currentDir, "../../app/admin/wallets/page.jsx"),
  "utf8",
);

test("Given a wallet transaction row, When the user opens its detail, Then the portal calls the ownership-scoped transaction API and renders a detail dialog", () => {
  assert.match(walletSource, /walletApi\.getTransaction\(transaction\.id\)/);
  assert.match(walletSource, /Chi tiết giao dịch/);
  assert.match(walletSource, /open=\{Boolean\(selectedTransaction\)\}/);
});

test("Given an admin SePay row, When the admin opens its detail, Then the portal calls the admin top-up API", () => {
  assert.match(adminWalletSource, /walletApi\.getAdminTopUp\(item\.invoiceNumber\)/);
  assert.match(adminWalletSource, /Chi tiết đơn nạp/);
});

test("Given an admin SePay row with an account id, When the admin opens the wallet, Then the portal calls the admin wallet API", () => {
  assert.match(adminWalletSource, /walletApi\.getAdminWallet\(accountId\)/);
  assert.match(adminWalletSource, /handleOpenWalletDetail\(item\.accountId\)/);
  assert.match(adminWalletSource, /Chi tiết ví tài khoản/);
});
