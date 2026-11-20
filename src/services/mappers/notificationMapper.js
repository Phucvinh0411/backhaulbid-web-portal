import { toId, toIsoString, unwrapData, unwrapList } from "./primitives.js";

/**
 * Normalizes a notification DTO (REST or Socket.IO `new_notification`) into a single UI-ready shape.
 * Strips Mongo internals (`_id`, `__v`, `dedupeKey`) and unifies `read`/`isRead` and `time`/`createdAt`.
 */
export function mapNotification(response) {
  const raw = unwrapData(response);
  if (!raw || typeof raw !== "object") return null;

  const id = toId(raw) || raw.notifId || null;
  const createdAt = toIsoString(raw.createdAt ?? raw.time);
  const isRead = Boolean(raw.isRead ?? raw.read);

  return {
    id,
    notifId: id,
    userId: raw.userId ?? null,
    title: raw.title ?? "",
    message: raw.message ?? "",
    type: raw.type ?? "INFO",
    referenceId: raw.referenceId ?? null,
    isRead,
    read: isRead,
    createdAt,
    time: createdAt,
  };
}

export function mapNotifications(response) {
  return unwrapList(response).map(mapNotification).filter(Boolean);
}
