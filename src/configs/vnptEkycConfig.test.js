import assert from "node:assert/strict";
import test from "node:test";

import {
  getVnptEkycConfigMessage,
  validateVnptEkycConfig,
} from "./vnptEkycConfig.js";

test("Given Docker has no VNPT access token, When validating eKYC config, Then the user gets a clear Vietnamese action", () => {
  const validation = validateVnptEkycConfig({
    BACKEND_URL: "https://api.idg.vnpt.vn",
    TOKEN_KEY: "token-key",
    TOKEN_ID: "token-id",
    ACCESS_TOKEN: "",
  });

  assert.equal(validation.ok, false);
  assert.equal(validation.code, "missing_config");
  assert.equal(
    getVnptEkycConfigMessage(validation),
    "Chưa có access token VNPT eKYC. Hãy thêm NEXT_PUBLIC_VNPT_EKYC_AUTH vào cấu hình rồi khởi động lại frontend."
  );
});

test("Given the example placeholder is still configured, When validating eKYC config, Then it is treated as missing configuration", () => {
  const validation = validateVnptEkycConfig({
    BACKEND_URL: "https://api.idg.vnpt.vn",
    TOKEN_KEY: "token-key",
    TOKEN_ID: "token-id",
    ACCESS_TOKEN: "your_auth_token_here",
  });

  assert.equal(validation.ok, false);
  assert.equal(validation.code, "missing_config");
  assert.equal(
    getVnptEkycConfigMessage(validation),
    "Chưa có access token VNPT eKYC. Hãy thêm NEXT_PUBLIC_VNPT_EKYC_AUTH vào cấu hình rồi khởi động lại frontend."
  );
});

test("Given the configured VNPT access token is expired, When validating eKYC config, Then the user is told to issue a new token", () => {
  const validation = validateVnptEkycConfig(
    {
      BACKEND_URL: "https://api.idg.vnpt.vn",
      TOKEN_KEY: "token-key",
      TOKEN_ID: "token-id",
      ACCESS_TOKEN: "eyJhbGciOiJub25lIn0.eyJleHAiOjEwMDB9.signature",
    },
    2_000_000,
  );

  assert.equal(validation.ok, false);
  assert.equal(validation.code, "expired_token");
  assert.equal(
    getVnptEkycConfigMessage(validation),
    "Access token VNPT eKYC đã hết hạn. Hãy cấp token mới và khởi động lại frontend."
  );
});
