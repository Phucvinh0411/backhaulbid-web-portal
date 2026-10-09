import AccessTimeIcon from "@mui/icons-material/AccessTimeOutlined";
import ShieldIcon from "@mui/icons-material/ShieldOutlined";

const formatTime = (value) => value
  ? new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value))
  : "Vừa cập nhật";

export default function CarrierReputationHistory({ reputation }) {
  if (!reputation) return null;
  const history = Array.isArray(reputation.history) ? reputation.history : [];

  return (
    <section className="mb-6 rounded-xl border border-brand-soft bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-xl bg-brand-soft p-2 text-brand"><ShieldIcon /></div>
        <div>
          <h2 className="font-black text-ink">Lịch sử điểm uy tín</h2>
          <p className="text-sm text-ink-muted">Điểm này dùng để xét điều kiện tham gia phiên đấu giá, tách biệt với đánh giá sao.</p>
        </div>
        <strong className="ml-auto text-xl text-brand">{reputation.score} / 100</strong>
      </div>
      {history.length === 0 ? (
        <p className="rounded-xl bg-surface-sunken p-4 text-sm text-ink-muted">Chưa có lần điều chỉnh điểm uy tín nào.</p>
      ) : (
        <div className="space-y-3">
          {history.map((entry) => (
            <div key={`${entry.tripId}-${entry.tier}`} className="flex flex-wrap items-center gap-3 rounded-xl border border-line p-3">
              <AccessTimeIcon className="text-ink-subtle" />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-ink">{entry.reason}</p>
                <p className="text-xs text-ink-muted">Chuyến {String(entry.tripId).slice(0, 8)} · {formatTime(entry.createdAt)}</p>
              </div>
              <span className="font-black text-danger">{entry.pointsDelta} điểm</span>
              <span className="rounded-full bg-brand-soft px-3 py-1 text-sm font-bold text-brand">Còn {entry.scoreAfter}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
