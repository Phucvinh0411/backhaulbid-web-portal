import assert from "node:assert/strict";
import test from "node:test";

import {
  BUSINESS_VERIFICATION_PATH,
  BUSINESS_VERIFICATION_STATUS_PATH,
  businessVerificationDocumentPath,
  businessVerificationLookupPath,
  compareRepresentativeNames,
  normalizeRepresentativeName,
  validateAuthorizationLetter,
  validateBusinessLicense,
} from "./businessVerificationApi.js";

test("uses a separate resource for business verification", () => {
  assert.equal(
    BUSINESS_VERIFICATION_PATH,
    "/api/v1/business-verifications"
  );
  assert.equal(
    BUSINESS_VERIFICATION_STATUS_PATH,
    "/api/v1/business-verifications/me"
  );
  assert.equal(
    businessVerificationLookupPath("0312345678"),
    "/api/v1/business-verifications/lookup/0312345678"
  );
  assert.equal(
    businessVerificationDocumentPath("verification-id"),
    "/api/v1/business-verifications/verification-id/document"
  );
  assert.equal(
    businessVerificationDocumentPath("verification-id", "authorizationLetter"),
    "/api/v1/business-verifications/verification-id/document?type=authorizationLetter"
  );
});

test("accepts PDF, PNG and JPEG licenses up to 5MB", () => {
  for (const type of ["application/pdf", "image/png", "image/jpeg"]) {
    assert.deepEqual(
      validateBusinessLicense({ type, size: 5 * 1024 * 1024 }),
      { valid: true, message: "" }
    );
  }
});

test("rejects missing, oversized and unsupported license files", () => {
  assert.equal(validateBusinessLicense(null).valid, false);
  assert.match(
    validateBusinessLicense({
      type: "application/pdf",
      size: 5 * 1024 * 1024 + 1,
    }).message,
    /5MB/
  );
  assert.match(
    validateBusinessLicense({
      type: "text/html",
      size: 100,
    }).message,
    /PDF, PNG hoặc JPG/
  );
});

test("validates the authorization letter with the same safe upload rules", () => {
  assert.equal(validateAuthorizationLetter(null).valid, false);
  assert.match(
    validateAuthorizationLetter({
      type: "application/pdf",
      size: 5 * 1024 * 1024 + 1,
    }).message,
    /5MB/
  );
  assert.deepEqual(
    validateAuthorizationLetter({ type: "image/jpeg", size: 1024 }),
    { valid: true, message: "" }
  );
});

test("normalizes and compares legal representative names", () => {
  assert.equal(
    normalizeRepresentativeName(" Nguyễn Văn A (Giám đốc) "),
    "nguyen van a"
  );
  assert.equal(
    compareRepresentativeNames("Nguyễn Văn A", "Nguyen Van A (Giám đốc)"),
    "MATCH"
  );
  assert.equal(
    compareRepresentativeNames("Trần Văn B", "Nguyễn Văn A"),
    "MISMATCH"
  );
  assert.equal(compareRepresentativeNames("", "Nguyễn Văn A"), "UNKNOWN");
});
