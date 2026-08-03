import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const APP_DIR = path.resolve("src/app");

async function routePageExists(route) {
  const routeDir = path.join(APP_DIR, ...route.split("/").filter(Boolean));
  const candidates = ["page.jsx", "page.tsx", "page.js", "page.ts"].map((file) =>
    path.join(routeDir, file)
  );

  for (const candidate of candidates) {
    try {
      await access(candidate);
      return true;
    } catch {
      // Try the next supported page extension.
    }
  }

  return false;
}

test("carrier and shipper shared flow links resolve to real pages", async () => {
  const sharedFlowRoutes = [
    "/carrier/contracts",
    "/shipper/contracts",
    "/shipper/tracking",
  ];

  for (const route of sharedFlowRoutes) {
    assert.equal(
      await routePageExists(route),
      true,
      `${route} must have a Next.js page`
    );
  }
});
