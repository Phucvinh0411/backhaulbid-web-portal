import assert from "node:assert/strict";
import test from "node:test";
import fs from "node:fs";

const source = fs.readFileSync(new URL("./representativeVerificationApi.js", import.meta.url), "utf8");

test("Given status lookup accepts optional request config, When called by a guarded flow, Then it forwards that config without changing the endpoint", () => {
  assert.match(source, /getRepresentativeVerificationStatus\(config\)/);
  assert.match(
    source,
    /apiService\.get\(\s*REPRESENTATIVE_VERIFICATION_STATUS_PATH,\s*undefined,\s*config\s*\)/
  );
});
