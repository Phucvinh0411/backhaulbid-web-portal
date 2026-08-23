import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";

const source = fs.readFileSync(new URL("./EkycGuard.jsx", import.meta.url), "utf8");

test("Given the account is not eKYC verified, When the guard blocks the page, Then it uses the shared card and action button styles", () => {
  assert.match(source, /AppCard/);
  assert.match(source, /ActionButton/);
  assert.match(source, /Tài khoản chưa được xác thực/);
  assert.doesNotMatch(source, /from "@mui\/material\/Button"/);
  assert.doesNotMatch(source, /linear-gradient/);
});

test("Given the eKYC status check fails, When the guard cannot determine verification, Then it raises a global Vietnamese notification", () => {
  assert.match(source, /dispatchGlobalNotification/);
  assert.match(source, /Không thể kiểm tra trạng thái eKYC/);
});

test("Given the guard owns the detailed error message, When it checks eKYC status, Then the generic interceptor notification is skipped", () => {
  assert.match(source, /skipGlobalNotification:\s*true/);
});
