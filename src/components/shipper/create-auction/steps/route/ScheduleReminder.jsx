import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import WarningAmberIcon from "@mui/icons-material/WarningAmberOutlined";
import { formatDateTime, formatTimeWindow } from "@/lib/format";

/** Time the winner has to sign the contract after the auction closes (SIGNING_WINDOW_MS in the bidding service). */
const SIGNING_WINDOW_HOURS = 24;
const HOUR_MS = 60 * 60 * 1000;

const toTime = (value) => {
  if (!value) return null;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
};

/** Order problems between the auction close and the pickup/delivery windows; reminders only, never blocking. */
function scheduleWarnings(form) {
  const end = toTime(form.endTime);
  const earliestPickup = toTime(form.earliestPickup);
  const latestPickup = toTime(form.latestPickup);
  const earliestDelivery = toTime(form.earliestDelivery);
  const latestDelivery = toTime(form.latestDelivery);
  const warnings = [];
  const firstPickup = earliestPickup ?? latestPickup;
  if (end && firstPickup) {
    if (firstPickup <= end) warnings.push("Thời gian nhận hàng đang trước hoặc trùng lúc kết thúc đấu giá.");
    else if (firstPickup - end < SIGNING_WINDOW_HOURS * HOUR_MS) {
      warnings.push(`Nhận hàng cách lúc kết thúc đấu giá chưa đủ ${SIGNING_WINDOW_HOURS} giờ, nhà xe có thể chưa kịp ký hợp đồng.`);
    }
  }
  if (earliestPickup && latestPickup && earliestPickup > latestPickup) warnings.push("Nhận hàng sớm nhất đang sau nhận hàng trễ nhất.");
  if (earliestDelivery && latestDelivery && earliestDelivery > latestDelivery) warnings.push("Giao hàng sớm nhất đang sau giao hàng trễ nhất.");
  const lastDelivery = latestDelivery ?? earliestDelivery;
  if (firstPickup && lastDelivery && lastDelivery < firstPickup) warnings.push("Thời gian giao hàng đang trước thời gian nhận hàng.");
  return warnings;
}

/**
 * Reminder linking the two time blocks of the form, which live on different steps.
 * step "shipping" sits in the shipping window card (step 2), step "auction" in the auction timeframe (step 3).
 */
export default function ScheduleReminder({ form, step }) {
  const warnings = scheduleWarnings(form);
  const end = toTime(form.endTime);
  const firstPickup = toTime(form.earliestPickup) ?? toTime(form.latestPickup);

  const lines = step === "shipping"
    ? [
        `Nhận hàng chỉ bắt đầu sau khi phiên đấu giá (đặt ở Bước 3) kết thúc và nhà xe thắng ký hợp đồng, tối đa ${SIGNING_WINDOW_HOURS} giờ.`,
        end
          ? `Phiên đang kết thúc lúc ${formatDateTime(end)}, nên nhận hàng từ ${formatDateTime(end + SIGNING_WINDOW_HOURS * HOUR_MS)} trở đi.`
          : `Nên đặt nhận hàng sớm nhất cách lúc kết thúc đấu giá ít nhất ${SIGNING_WINDOW_HOURS} giờ.`,
      ]
    : [
        `Khung vận chuyển ở Bước 2 — Nhận: ${formatTimeWindow(form.earliestPickup, form.latestPickup, "chưa nhập")} · Giao: ${formatTimeWindow(form.earliestDelivery, form.latestDelivery, "chưa nhập")}.`,
        firstPickup
          ? `Phiên nên kết thúc trước ${formatDateTime(firstPickup - SIGNING_WINDOW_HOURS * HOUR_MS)} để còn ${SIGNING_WINDOW_HOURS} giờ chọn nhà xe và ký hợp đồng trước khi nhận hàng.`
          : `Phiên cần kết thúc trước lúc nhận hàng ít nhất ${SIGNING_WINDOW_HOURS} giờ để chọn nhà xe và ký hợp đồng.`,
      ];

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2.5 rounded-xl border border-info-soft bg-info-soft/60 px-4 py-3">
        <InfoOutlinedIcon className="!text-[1.1rem] mt-0.5 text-info" />
        <div className="space-y-1 text-[0.72rem] leading-relaxed text-ink-muted">
          {lines.map((line) => <p key={line}>{line}</p>)}
        </div>
      </div>
      {warnings.length > 0 && (
        <div role="status" className="flex items-start gap-2.5 rounded-xl border border-warning-soft bg-warning-soft/60 px-4 py-3">
          <WarningAmberIcon className="!text-[1.1rem] mt-0.5 text-warning" />
          <div className="space-y-1 text-[0.72rem] font-semibold leading-relaxed text-ink">
            {warnings.map((warning) => <p key={warning}>{warning}</p>)}
          </div>
        </div>
      )}
    </div>
  );
}
