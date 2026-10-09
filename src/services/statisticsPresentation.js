const VIETNAM_OFFSET_MS = 7 * 60 * 60 * 1000;

export const STAT_RANGE_OPTIONS = Object.freeze([
  { value: "7d", label: "7 ngày", days: 7, bucket: "DAY" },
  { value: "30d", label: "30 ngày", days: 30, bucket: "DAY" },
  { value: "90d", label: "90 ngày", days: 90, bucket: "WEEK" },
  { value: "12m", label: "12 tháng", months: 12, bucket: "MONTH" },
  { value: "custom", label: "Tùy chỉnh", bucket: "DAY" },
]);

function calendarDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return date;
}

function addCalendarDays(date, days) {
  const shifted = new Date(date);
  shifted.setUTCDate(shifted.getUTCDate() + days);
  return shifted;
}

function addCalendarMonths(date, months) {
  const targetMonth = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
  const lastDay = new Date(Date.UTC(targetMonth.getUTCFullYear(), targetMonth.getUTCMonth() + 1, 0)).getUTCDate();
  targetMonth.setUTCDate(Math.min(date.getUTCDate(), lastDay));
  return targetMonth;
}

function todayInVietnam(now) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(now);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return calendarDate(`${values.year}-${values.month}-${values.day}`);
}

function vietnamMidnight(date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) - VIETNAM_OFFSET_MS);
}

export function validateCustomStatisticsRange(from, to) {
  const start = calendarDate(from);
  const selectedEnd = calendarDate(to);
  if (from && !start || to && !selectedEnd) return "invalid-date";
  if (!start) return "from-required";
  if (!selectedEnd) return "to-required";
  if (start > selectedEnd) return "end-before-start";
  const exclusiveEnd = addCalendarDays(selectedEnd, 1);
  if (exclusiveEnd > addCalendarMonths(start, 24)) return "max-range-exceeded";
  return null;
}

export function buildStatisticsRange(value, { now = new Date(), from, to } = {}) {
  const option = STAT_RANGE_OPTIONS.find((item) => item.value === value && item.value !== "custom")
    || STAT_RANGE_OPTIONS.find((item) => item.value === "30d");
  let start;
  let exclusiveEnd;
  let bucket = option.bucket;

  if (value === "custom") {
    if (validateCustomStatisticsRange(from, to)) return null;
    start = calendarDate(from);
    exclusiveEnd = addCalendarDays(calendarDate(to), 1);
  } else {
    exclusiveEnd = addCalendarDays(todayInVietnam(now), 1);
    start = option.months
      ? addCalendarMonths(exclusiveEnd, -option.months)
      : addCalendarDays(exclusiveEnd, -option.days);
  }

  return {
    dateFrom: vietnamMidnight(start).toISOString(),
    dateTo: vietnamMidnight(exclusiveEnd).toISOString(),
    bucket,
  };
}

export function formatStatisticCount(value) {
  return typeof value === "number" && Number.isFinite(value) ? new Intl.NumberFormat("vi-VN").format(value) : "—";
}

export function formatStatisticCurrency(value) {
  return typeof value === "number" && Number.isFinite(value)
    ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(value)
    : "—";
}

export function statusRows(value) {
  if (Array.isArray(value)) return value.filter((row) => row && typeof row.status === "string");
  if (value && typeof value === "object") return Object.entries(value).map(([status, count]) => ({ status, count }));
  return [];
}
