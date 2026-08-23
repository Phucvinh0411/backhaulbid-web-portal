import assert from "node:assert/strict";
import test from "node:test";

import {
  FRONTEND_ENV_KEYS,
  mergeFrontendEnvironment,
  parseDotEnv,
  selectFrontendEnvironment,
  validateRequiredFrontendEnvironment,
} from "../../scripts/sharedInfrastructureEnv.mjs";

test("Given infrastructure env contains public and private variables, When selecting frontend config, Then only frontend variables are returned", () => {
  const parsed = parseDotEnv(`
NEXT_PUBLIC_GATEWAY_URL="http://localhost:8080"
NEXT_PUBLIC_VNPT_EKYC_AUTH='bearer shared-token'
AWS_SECRET_ACCESS_KEY=private-value
`);

  const selected = selectFrontendEnvironment(parsed);

  assert.deepEqual(selected, {
    NEXT_PUBLIC_GATEWAY_URL: "http://localhost:8080",
    NEXT_PUBLIC_VNPT_EKYC_AUTH: "bearer shared-token",
  });
  assert.equal(FRONTEND_ENV_KEYS.includes("AWS_SECRET_ACCESS_KEY"), false);
});

test("Given FE has a stale eKYC value, When infrastructure env is merged, Then the shared value wins including an explicit blank", () => {
  const merged = mergeFrontendEnvironment(
    {
      NEXT_PUBLIC_VNPT_EKYC_AUTH: "bearer stale-token",
      NEXT_PUBLIC_GATEWAY_URL: "http://old-gateway:8080",
      AWS_SECRET_ACCESS_KEY: "must-stay-private",
    },
    {
      NEXT_PUBLIC_VNPT_EKYC_AUTH: "",
      NEXT_PUBLIC_GATEWAY_URL: "http://localhost:8080",
    },
  );

  assert.equal(merged.NEXT_PUBLIC_VNPT_EKYC_AUTH, "");
  assert.equal(merged.NEXT_PUBLIC_GATEWAY_URL, "http://localhost:8080");
  assert.equal(merged.AWS_SECRET_ACCESS_KEY, "must-stay-private");
});

test("Given required VNPT variables are incomplete, When validating shared frontend env, Then missing variable names are returned without exposing values", () => {
  const missing = validateRequiredFrontendEnvironment({
    NEXT_PUBLIC_VNPT_EKYC_BACKEND_URL: "https://api.idg.vnpt.vn",
    NEXT_PUBLIC_VNPT_EKYC_TOKEN_KEY: "",
    NEXT_PUBLIC_VNPT_EKYC_TOKEN_ID: "token-id",
    NEXT_PUBLIC_VNPT_EKYC_AUTH: "",
  });

  assert.deepEqual(missing, [
    "NEXT_PUBLIC_VNPT_EKYC_TOKEN_KEY",
    "NEXT_PUBLIC_VNPT_EKYC_AUTH",
  ]);
});
