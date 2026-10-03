import AccessTimeIcon from "@mui/icons-material/AccessTimeOutlined";
import ShieldIcon from "@mui/icons-material/ShieldOutlined";

const formatTime = (value) => value
  ? new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value))
  : "Vừa cập nhật";

export default function CarrierReputationHistory({ reputation }) {
  if (!reputation) return null;
  const history = Array.isArray(reputation.history) ? reputation.history : [];

  return (
    <section className="mb-6 rounded-3xl border border-indigo-100 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-xl bg-indigo-50 p-2 text-indigo-700"><ShieldIcon /></div>
        <div>
          <h2 className="font-black text-slate-800">Lịch sử điểm uy tín</h2>
          <p className="text-sm text-slate-500">Điểm này dùng để xét điều kiện tham gia phiên đấu giá, tách biệt với đánh giá sao.</p>
        </div>
        <strong className="ml-auto text-xl text-indigo-800">{reputation.score} / 100</strong>
      </div>
      {history.length === 0 ? (
        <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">Chưa có lần điều chỉnh điểm uy tín nào.</p>
      ) : (
        <div className="space-y-3">
          {history.map((entry) => (
            <div key={`${entry.tripId}-${entry.tier}`} className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-100 p-3">
              <AccessTimeIcon className="text-slate-400" />
              <div className="min-w-0 flex-1">
                <p className="font-bold text-slate-800">{entry.reason}</p>
                <p className="text-xs text-slate-500">Chuyến {String(entry.tripId).slice(0, 8)} · {formatTime(entry.createdAt)}</p>
              </div>
              <span className="font-black text-rose-700">{entry.pointsDelta} điểm</span>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-sm font-bold text-indigo-800">Còn {entry.scoreAfter}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
