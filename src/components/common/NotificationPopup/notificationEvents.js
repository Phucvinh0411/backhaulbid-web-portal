export const GLOBAL_NOTIFICATION_EVENT = "backhaulbid:notification";

export function dispatchGlobalNotification(detail, target = globalThis) {
  const EventConstructor = target?.CustomEvent || globalThis.CustomEvent;
  if (!target?.dispatchEvent || typeof EventConstructor === "undefined") return false;

  target.dispatchEvent(new EventConstructor(GLOBAL_NOTIFICATION_EVENT, { detail }));
  return true;
}
