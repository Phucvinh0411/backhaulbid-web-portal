import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";

const HOOK_SOURCE_PATH = path.resolve("src/hooks/useSocket.ts");

test("connects through the configured gateway instead of a hardcoded port", async () => {
  const source = await readFile(HOOK_SOURCE_PATH, "utf8");

  assert.match(source, /process\.env\.NEXT_PUBLIC_GATEWAY_URL/);
  assert.doesNotMatch(source, /localhost:3001/);
});

test("targets the bidding websocket route exposed by the api gateway", async () => {
  const source = await readFile(HOOK_SOURCE_PATH, "utf8");

  assert.match(source, /path:\s*['"]\/bidding-socket['"]/);
});

test("sends credentials so the gateway can forward authenticated headers", async () => {
  const source = await readFile(HOOK_SOURCE_PATH, "utf8");

  assert.match(source, /withCredentials:\s*true/);
});

test("exposes the live socket instance instead of a frozen null value", async () => {
  const source = await readFile(HOOK_SOURCE_PATH, "utf8");

  assert.match(source, /setSocket\(/);
  assert.match(source, /return\s*\{\s*listen,\s*socket\s*\}/);
});

test("queues listeners registered before the socket exists", async () => {
  const source = await readFile(HOOK_SOURCE_PATH, "utf8");

  assert.match(source, /pendingListenersRef/);
});
