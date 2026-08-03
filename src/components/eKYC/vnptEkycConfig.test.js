import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import test from "node:test";

import {
  VNPT_DOCUMENT_FLOW_CONFIG,
  VNPT_EKYC_ASSETS,
  normalizeVnptAccessToken,
  validateVnptEkycConfig,
} from "./vnptEkycConfig.js";

test("shows the document picker before starting the CCCD flow", () => {
  assert.deepEqual(VNPT_DOCUMENT_FLOW_CONFIG.LIST_TYPE_DOCUMENT, [-1, 9]);
  assert.equal(VNPT_DOCUMENT_FLOW_CONFIG.DOCUMENT_TYPE_START, 999);
});

const REQUIRED_CONFIG = {
  BACKEND_URL: "https://api.idg.vnpt.vn",
  TOKEN_KEY: "token-key",
  TOKEN_ID: "token-id",
};

function createJwt(expiryInSeconds) {
  const payload = Buffer.from(
    JSON.stringify({ exp: expiryInSeconds })
  ).toString("base64url");

  return `header.${payload}.signature`;
}

test("removes the Bearer prefix copied from the VNPT portal", () => {
  assert.equal(
    normalizeVnptAccessToken("  Bearer header.payload.signature  "),
    "header.payload.signature",
  );
});

test("removes repeated Bearer prefixes copied into local env files", () => {
  assert.equal(
    normalizeVnptAccessToken("  bearer Bearer header.payload.signature  "),
    "header.payload.signature"
  );
});

test("uses the local VNPT face-liveness assets", () => {
  assert.deepEqual(VNPT_EKYC_ASSETS, {
    FACE_SDK_SCRIPT: "/lib/VNPTBrowserSDKAppV4.1.0.js",
    WEB_OVAL: "/lib/web-oval.json",
    MOBILE_OVAL: "/lib/mobile-oval.json",
    ENGLISH_TUTORIAL: "/lib/english-tutorial.mp4",
    VIETNAMESE_TUTORIAL: "/lib/vietnamese-tutorial.mp4",
  });
});

test("rejects VNPT configuration with missing credentials", () => {
  const result = validateVnptEkycConfig({
    ...REQUIRED_CONFIG,
    TOKEN_KEY: "",
    ACCESS_TOKEN: createJwt(2_000_000_000),
  });

  assert.equal(result.ok, false);
  assert.equal(result.code, "missing_config");
  assert.deepEqual(result.missingKeys, ["TOKEN_KEY"]);
});

test("rejects an expired VNPT access token", () => {
  const now = Date.UTC(2026, 6, 31, 12, 0, 0);
  const result = validateVnptEkycConfig(
    {
      ...REQUIRED_CONFIG,
      ACCESS_TOKEN: createJwt(Math.floor(now / 1000) - 1),
    },
    now
  );

  assert.equal(result.ok, false);
  assert.equal(result.code, "expired_token");
});

test("rejects a VNPT token that will expire during the eKYC flow", () => {
  const now = Date.UTC(2026, 6, 31, 12, 0, 0);
  const result = validateVnptEkycConfig(
    {
      ...REQUIRED_CONFIG,
      ACCESS_TOKEN: createJwt(Math.floor((now + 60_000) / 1000)),
    },
    now
  );

  assert.equal(result.ok, false);
  assert.equal(result.code, "token_expiring");
});

test("accepts complete configuration with a sufficiently valid token", () => {
  const now = Date.UTC(2026, 6, 31, 12, 0, 0);
  const result = validateVnptEkycConfig(
    {
      ...REQUIRED_CONFIG,
      ACCESS_TOKEN: createJwt(Math.floor((now + 10 * 60_000) / 1000)),
    },
    now
  );

  assert.equal(result.ok, true);
});
