"use client";

export default function StatusBadge({ status }) {
  switch (status) {
    case "pending_bids":
      return (
        <span className="text-[0.72rem] font-bold px-3 py-1 bg-amber-50 text-amber-600 border border-amber-100 rounded-full">
          Chờ đấu giá
        </span>
      );
    case "active_bids":
      return (
        <span className="text-[0.72rem] font-bold px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full animate-pulse-subtle">
          Đấu giá hoạt động
        </span>
      );
    case "awarded":
      return (
        <span className="text-[0.72rem] font-bold px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-full">
          Đã chốt thầu
        </span>
      );
    case "shipping":
      return (
        <span className="text-[0.72rem] font-bold px-3 py-1 bg-cyan-50 text-cyan-600 border border-cyan-100 rounded-full">
          Đang vận chuyển
        </span>
      );
    case "completed":
      return (
        <span className="text-[0.72rem] font-bold px-3 py-1 bg-slate-50 text-slate-600 border border-slate-200 rounded-full">
          Đã hoàn thành
        </span>
      );
    case "cancelled":
      return (
        <span className="text-[0.72rem] font-bold px-3 py-1 bg-rose-50 text-rose-600 border border-rose-100 rounded-full">
          Đã hủy
        </span>
      );
    default:
      return null;
  }
}
