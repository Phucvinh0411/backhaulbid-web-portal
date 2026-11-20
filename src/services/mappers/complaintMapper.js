import { toId, toIsoString, unwrapData, unwrapList } from "./primitives.js";

export function mapComplaintMessage(raw) {
  if (!raw || typeof raw !== "object") return null;
  return {
    id: toId(raw),
    senderId: raw.senderId ?? null,
    senderRole: raw.senderRole ?? null,
    message: raw.message ?? "",
    createdAt: toIsoString(raw.createdAt),
  };
}

export function mapComplaint(response) {
  const raw = unwrapData(response);
  if (!raw || typeof raw !== "object") return null;

  return {
    id: toId(raw),
    tripId: raw.tripId ?? null,
    reporterId: raw.reporterId ?? null,
    respondentId: raw.respondentId ?? null,
    category: raw.category ?? null,
    title: raw.title ?? "",
    description: raw.description ?? "",
    evidenceUrl: raw.evidenceUrl ?? null,
    status: raw.status ?? "PENDING",
    decision: raw.decision ?? null,
    resolution: raw.resolution ?? null,
    createdAt: toIsoString(raw.createdAt),
    updatedAt: toIsoString(raw.updatedAt),
    messages: Array.isArray(raw.messages)
      ? raw.messages.map(mapComplaintMessage).filter(Boolean)
      : [],
  };
}

export function mapComplaints(response) {
  return unwrapList(response).map(mapComplaint).filter(Boolean);
}
