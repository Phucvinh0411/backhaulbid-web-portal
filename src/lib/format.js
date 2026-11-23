// Formatting helpers shared by every screen: Vietnamese locale, VND, 24h time.

const UNKNOWN = "Chưa cập nhật";

const moneyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 });

export function toAmount(value) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "object" && value.$numberDecimal !== undefined) value = value.$numberDecimal;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

/** "12.500.000 ₫"; returns the fallback when the amount is missing instead of "0 ₫". */
export function formatMoney(value, fallback = UNKNOWN) {
  const amount = toAmount(value);
  return amount === null ? fallback : moneyFormatter.format(amount);
}

/** Digits with thousand separators, for inputs: 12500000 -> "12.500.000". */
export function formatAmountInput(value) {
  const amount = toAmount(value);
  return amount && amount > 0 ? numberFormatter.format(amount) : "";
}

/** Inverse of formatAmountInput; keeps digits only. */
export function parseAmountInput(text) {
  const digits = String(text ?? "").replace(/\D/g, "");
  return digits ? Number(digits) : 0;
}

function toDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDateTime(value, fallback = UNKNOWN) {
  const date = toDate(value);
  if (!date) return fallback;
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour12: false,
  }).format(date);
}

export function formatDate(value, fallback = UNKNOWN) {
  const date = toDate(value);
  if (!date) return fallback;
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }).format(date);
}

export function formatTimeWindow(start, end, fallback = UNKNOWN) {
  if (!start && !end) return fallback;
  if (!start) return `Trước ${formatDateTime(end)}`;
  if (!end) return `Từ ${formatDateTime(start)}`;
  return `${formatDateTime(start)} – ${formatDateTime(end)}`;
}

/** Whole seconds until a timestamp, never negative. Display only: the server decides outcomes. */
export function secondsUntil(value, now = Date.now()) {
  const date = toDate(value);
  if (!date) return 0;
  return Math.max(0, Math.floor((date.getTime() - now) / 1000));
}

/** "2 ngày 03:04:05" / "03:04:05". */
export function formatCountdown(totalSeconds) {
  const safe = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const days = Math.floor(safe / 86400);
  const hours = Math.floor((safe % 86400) / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  const seconds = safe % 60;
  const clock = [hours, minutes, seconds].map((part) => String(part).padStart(2, "0")).join(":");
  return days > 0 ? `${days} ngày ${clock}` : clock;
}

/** Short, readable reference for UUIDs: first 8 characters, uppercased. */
export function shortId(value) {
  if (!value) return "—";
  return String(value).slice(0, 8).toUpperCase();
}

export function formatWeight(value) {
  const amount = toAmount(value);
  return amount && amount > 0 ? `${numberFormatter.format(amount)} tấn` : UNKNOWN;
}

/** Compact chart tick for VND values so Y-axis labels stay readable in narrow gutters. */
export function formatCurrencyAxisTick(value) {
  const amount = Number(value) || 0;
  if (Math.abs(amount) >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1).replace(/\.0$/, "")}tr`;
  }
  return `${Math.round(amount / 1000)}k`;
}

/** Removes consecutive duplicate comma-separated location segments (e.g. "Bình Dương, Bình Dương"). */
export function formatAddress(value, fallback = UNKNOWN) {
  const raw = String(value || "").trim();
  if (!raw) return fallback;
  const parts = raw.split(",").map((part) => part.trim()).filter(Boolean);
  const deduped = [];
  for (const part of parts) {
    const prev = deduped.at(-1);
    if (!prev || prev.toLocaleLowerCase("vi") !== part.toLocaleLowerCase("vi")) {
      deduped.push(part);
    }
  }
  return deduped.join(", ") || fallback;
}

export { UNKNOWN };
