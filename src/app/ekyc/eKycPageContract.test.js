import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";

const source = fs.readFileSync(new URL("./page.jsx", import.meta.url), "utf8");

test("Given the eKYC page is opened, When the current portal shell is rendered, Then the page uses the shared header and card language", () => {
  assert.match(source, /PageHeader/);
  assert.match(source, /AppCard/);
  assert.match(source, /Xác thực danh tính eKYC/);
  assert.match(source, /VNPTEkyc/);
});

test("Given no VNPT result exists yet, When the eKYC page is rendered, Then the user sees a clear Vietnamese waiting state", () => {
  assert.match(source, /Chưa có kết quả xác thực/);
  assert.match(source, /role="status"/);
});

test("Given VNPT returns a result, When the result panel is shown, Then technical data remains available without dominating the workflow", () => {
  assert.match(source, /Dữ liệu kỹ thuật/);
  assert.match(source, /JSON\.stringify\(result/);
  assert.match(source, /<details/);
});
