import assert from "node:assert/strict";
import test from "node:test";

import { validateAuctionImages } from "./auctionImageValidation.js";

const file = (name, type, size) => ({ name, type, size });

test("accepts supported auction images within the size limit", () => {
  const result = validateAuctionImages([
    file("cargo-a.jpg", "image/jpeg", 2 * 1024 * 1024),
    file("cargo-b.png", "image/png", 3 * 1024 * 1024),
  ]);

  assert.equal(result.valid, true);
  assert.equal(result.files.length, 2);
});

test("rejects unsupported types and oversized files", () => {
  const result = validateAuctionImages([
    file("cargo.pdf", "application/pdf", 1024),
    file("cargo.webp", "image/webp", 11 * 1024 * 1024),
  ]);

  assert.equal(result.valid, false);
  assert.match(result.message, /JPEG|PNG|WebP/);
});

test("rejects more than five images", () => {
  const result = validateAuctionImages(
    Array.from({ length: 6 }, (_, index) => file(`${index}.jpg`, "image/jpeg", 1024)),
  );

  assert.equal(result.valid, false);
  assert.match(result.message, /5/);
});
