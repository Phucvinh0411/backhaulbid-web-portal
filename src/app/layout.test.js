import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const layoutSource = await readFile(new URL("./layout.jsx", import.meta.url), "utf8");

test("root layout configures the MUI App Router SSR cache", () => {
  assert.match(
    layoutSource,
    /@mui\/material-nextjs\/v16-appRouter/,
    "RootLayout must use the cache provider built for Next.js 16",
  );

  const cacheProviderStart = layoutSource.indexOf("<AppRouterCacheProvider");
  const themeProviderStart = layoutSource.indexOf("<ThemeProvider");
  const themeProviderEnd = layoutSource.indexOf("</ThemeProvider>");
  const cacheProviderEnd = layoutSource.indexOf("</AppRouterCacheProvider>");

  assert.ok(cacheProviderStart >= 0, "AppRouterCacheProvider must be rendered");
  assert.ok(
    cacheProviderStart < themeProviderStart &&
      themeProviderStart < themeProviderEnd &&
      themeProviderEnd < cacheProviderEnd,
    "AppRouterCacheProvider must wrap ThemeProvider",
  );
});
