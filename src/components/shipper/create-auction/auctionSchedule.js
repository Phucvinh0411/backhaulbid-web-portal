const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
/** Time the winner has to sign the contract after the auction closes (SIGNING_WINDOW_MS in the bidding service). */
export const SIGNING_WINDOW_MS = 24 * HOUR_MS;
const STEP_MS = 15 * MINUTE_MS;
/** Default lengths when there is no pickup time to plan backwards from. */
const DEFAULT_REGISTRATION_MS = 24 * HOUR_MS;
const DEFAULT_LIVE_MS = 2 * HOUR_MS;
/** Below this between now and the latest sensible close, planning backwards from pickup is not possible. */
const MIN_PLANNED_MS = HOUR_MS;

const toTime = (value) => {
  if (!value) return null;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
};

const roundUp = (time) => Math.ceil(time / STEP_MS) * STEP_MS;
const roundDown = (time) => Math.floor(time / STEP_MS) * STEP_MS;

/** Local "YYYY-MM-DDTHH:mm", the value format of a datetime-local input. */
const toInputValue = (time) => {
  const date = new Date(time);
  const pad = (number) => String(number).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

/**
 * Suggested auction timeframe. Registration opens now; when a pickup time is known the auction closes
 * SIGNING_WINDOW_MS before it, with live bidding right after registration closes. Without a pickup time, or when
 * pickup is too soon to plan backwards from, it uses a one-day registration and a two-hour live auction.
 */
export function suggestAuctionSchedule(form, now = Date.now()) {
  const registrationStart = roundUp(now + MINUTE_MS);
  const pickup = toTime(form.earliestPickup) ?? toTime(form.latestPickup);
  const latestClose = pickup ? roundDown(pickup - SIGNING_WINDOW_MS) : null;

  let start;
  let end;
  if (latestClose && latestClose - registrationStart >= MIN_PLANNED_MS) {
    end = latestClose;
    start = roundDown(end - Math.min(DEFAULT_LIVE_MS, (end - registrationStart) / 2));
  } else {
    start = registrationStart + DEFAULT_REGISTRATION_MS;
    end = start + DEFAULT_LIVE_MS;
  }

  return {
    regStartTime: toInputValue(registrationStart),
    regEndTime: toInputValue(start),
    startTime: toInputValue(start),
    endTime: toInputValue(end),
  };
}

export const AUCTION_TIME_FIELDS = ["regStartTime", "regEndTime", "startTime", "endTime"];
