import test from "node:test";
import assert from "node:assert/strict";
import { GLOBAL_NOTIFICATION_EVENT, dispatchGlobalNotification } from "./notificationEvents.js";

test("dispatches a typed global notification event", () => {
  const events = [];
  const target = {
    dispatchEvent(event) {
      events.push(event);
    },
  };

  const dispatched = dispatchGlobalNotification(
    { type: "error", message: "Không thể tải dữ liệu." },
    target,
  );

  assert.equal(dispatched, true);
  assert.equal(events[0].type, GLOBAL_NOTIFICATION_EVENT);
  assert.deepEqual(events[0].detail, {
    type: "error",
    message: "Không thể tải dữ liệu.",
  });
});

test("does not throw when notification events are unavailable", () => {
  assert.equal(dispatchGlobalNotification({ type: "info", message: "test" }, null), false);
});
