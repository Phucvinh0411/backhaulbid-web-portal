import assert from "node:assert/strict";
import test from "node:test";

import { createMultipartUploadConfig, getUploadedFileUrl } from "./mediaUploadConfig.js";

test("Given a media upload, When creating its request config, Then it uses multipart content type", () => {
  const config = createMultipartUploadConfig();

  assert.equal(config.headers["Content-Type"], "multipart/form-data");
});

test("Given a media response, When reading its URL, Then it supports the gateway response shape", () => {
  assert.equal(getUploadedFileUrl({ url: "https://cdn.test/image.png" }), "https://cdn.test/image.png");
});
