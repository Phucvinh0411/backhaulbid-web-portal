"use client";

import { useEffect, useMemo, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import BlockIcon from "@mui/icons-material/Block";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import GavelIcon from "@mui/icons-material/Gavel";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import RemoveRedEyeOutlinedIcon from "@mui/icons-material/RemoveRedEyeOutlined";
import WifiOutlinedIcon from "@mui/icons-material/WifiOutlined";
import WifiOffOutlinedIcon from "@mui/icons-material/WifiOffOutlined";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AdminMetricCard,
  AdminPrimaryButton,
  AdminSearchField,
  AdminSecondaryButton,
  AdminSectionCard,
  AdminSelectField,
  AdminToolbar,
} from "@/components/admin/AdminUI";
import { useGlobalNotification } from "@/components/common/NotificationPopup";

const formatCurrency = (amount) =>
  amount == null || Number.isNaN(Number(amount))
    ? "Chưa có"
    : new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
      }).format(Number(amount));

const formatCountdown = (msRemaining) => {
  if (!Number.isFinite(msRemaining) || msRemaining <= 0) return "00:00:00";
  const totalSeconds = Math.floor(msRemaining / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
};

const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(date);
};

function LiveDot({ urgent = false }) {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span
        className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
          urgent ? "bg-red-400" : "bg-emerald-400"
        }`}
      />
      <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${urgent ? "bg-red-500" : "bg-emerald-500"}`} />
    </span>
  );
}

function ConnectionChip({ live }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[0.68rem] font-extrabold uppercase tracking-widest ${
        live
          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
          : "border-slate-300 bg-slate-100 text-slate-500"
      }`}
    >
      {live ? <WifiOutlinedIcon className="!text-[0.85rem]" /> : <WifiOffOutlinedIcon className="!text-[0.85rem]" />}
      {live ? "Realtime" : "Offline"}
    </span>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        p: 1.5,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        boxShadow: 2,
      }}
    >
      <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
        Thời gian: {label}
      </Typography>
      <Typography variant="body2" sx={{ color: "#047857", fontWeight: 700 }}>
        Giá thầu: {formatCurrency(payload[0].value)}
      </Typography>
    </Box>
  );
}

function BidFeed({ bids, highlightLatest = false, dark = false }) {
  const latest = [...bids].slice(-4).reverse();

  if (!latest.length) {
    return (
      <div
        className={`rounded-2xl border px-3.5 py-3 text-xs font-medium ${
          dark ? "border-white/10 bg-white/5 text-slate-400" : "border-slate-200 bg-slate-50 text-slate-500"
        }`}
      >
        Chưa có báo giá nào trong phiên này.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className={`text-[0.62rem] font-bold uppercase tracking-widest ${dark ? "text-slate-400" : "text-slate-500"}`}>
        Báo giá mới nhất
      </div>
      {latest.map((bid, index) => {
        const isLatest = index === 0 && highlightLatest;
        return (
          <div
            key={bid.id || `${bid.time}-${index}`}
            className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs transition-colors ${
              dark
                ? isLatest
                  ? "border-emerald-400/60 bg-emerald-500/15 text-emerald-100"
                  : "border-white/10 bg-white/5 text-slate-300"
                : isLatest
                  ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                  : "border-slate-200 bg-white text-slate-600"
            }`}
          >
            <span className={`font-mono text-[0.68rem] ${dark ? "text-slate-400" : "text-slate-400"}`}>{bid.time}</span>
            <span className="flex-1 truncate font-medium">
              {bid.carrierId ? `Nhà xe ${String(bid.carrierId).slice(0, 8)}` : "Nhà xe ẩn danh"}
            </span>
            <span className={`font-mono font-extrabold ${dark ? "text-emerald-300" : "text-emerald-700"}`}>
              {formatCurrency(bid.bid)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function DarkActionButton({ children, tone = "emerald", disabled = false, onClick }) {
  const toneClasses = {
    emerald: "border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10",
    amber: "border-amber-500/40 text-amber-300 hover:bg-amber-500/10",
    rose: "border-rose-500/60 bg-rose-500/15 text-rose-300 hover:bg-rose-500/25",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-[0.68rem] font-extrabold uppercase tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${toneClasses[tone]}`}
    >
      {children}
    </button>
  );
}

function LightActionButton({ children, tone = "primary", disabled = false, onClick }) {
  const toneClasses = {
    primary: "border-slate-300 bg-white text-slate-600 hover:bg-slate-50",
    amber: "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100",
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-[0.68rem] font-extrabold uppercase tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${toneClasses[tone]}`}
    >
      {children}
    </button>
  );
}

function SessionCard({ session, now, onDetail, onFlag, onStop }) {
  const bids = session.bidHistory || [];
  const sealed = session.auctionType === "SEALED";
  const isOpen = session.status === "OPEN";
  const isPending = session.status === "PENDING";
  const endTimeMs = new Date(session.endTime).getTime();
  const startTimeMs = new Date(session.startTime).getTime();
  const remainingMs = isOpen ? endTimeMs - now : startTimeMs - now;
  const urgent = isOpen && remainingMs > 0 && remainingMs <= 60000;
  const highlightLatest = Boolean(session.lastBidAt && now - session.lastBidAt < 4000);

  if (!isOpen && !isPending) {
    const isCancelled = session.status === "CANCELLED";
    return (
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/70 shadow-sm opacity-80">
        <div className="flex flex-col gap-3.5 p-5">
          <div className="flex items-center justify-between gap-3">
            <span
              className={`rounded-full border px-2.5 py-0.5 text-[0.68rem] font-extrabold uppercase tracking-widest ${
                isCancelled
                  ? "border-rose-300 bg-rose-50 text-rose-700"
                  : "border-sky-300 bg-sky-50 text-sky-700"
              }`}
            >
              {isCancelled ? "Đã hủy" : "Hoàn thành"}
            </span>
            <span className="font-mono text-[0.68rem] font-bold text-slate-400">{session.id}</span>
          </div>
          <div>
            <Typography variant="subtitle1" className="!font-extrabold !text-slate-700">
              {session.title}
            </Typography>
            <div className="mt-0.5 text-xs font-medium text-slate-500">
              {session.route} · {session.vehicleType}
            </div>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5">
            <span className="text-[0.62rem] font-bold uppercase tracking-widest text-slate-400">
              {session.winningBidAmount != null ? "Giá trúng thầu" : "Giá thấp nhất"}
            </span>
            <span className="font-mono text-base font-black text-slate-700">
              {formatCurrency(session.winningBidAmount ?? session.currentBid)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <LightActionButton onClick={() => onDetail(session.id)}>
              <RemoveRedEyeOutlinedIcon className="!text-[0.95rem]" /> Chi tiết
            </LightActionButton>
          </div>
        </div>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/90 shadow-sm">
        <div className="flex flex-col gap-4 p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-[0.68rem] font-extrabold uppercase tracking-widest text-amber-700">
                Chờ mở
              </span>
              {sealed && (
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-300 bg-slate-100 px-2.5 py-0.5 text-[0.68rem] font-extrabold uppercase tracking-widest text-slate-500">
                  <LockOutlinedIcon className="!text-[0.8rem]" /> Kín
                </span>
              )}
            </div>
            <div className="text-right">
              <div className="text-[0.62rem] font-bold uppercase tracking-widest text-slate-400">Mở thầu sau</div>
              <div className="font-mono text-xl font-black tracking-widest text-slate-700">
                {formatCountdown(remainingMs)}
              </div>
            </div>
          </div>
          <div>
            <div className="font-mono text-[0.68rem] font-bold uppercase tracking-widest text-slate-400">{session.id}</div>
            <Typography variant="subtitle1" className="!font-extrabold !text-slate-800">
              {session.title}
            </Typography>
            <div className="mt-0.5 text-xs font-medium text-slate-500">
              {session.route} · {session.vehicleType}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5">
              <div className="text-[0.62rem] font-bold uppercase tracking-widest text-slate-400">Giá khởi điểm</div>
              <div className="mt-0.5 font-mono text-sm font-black text-slate-700">{formatCurrency(session.startPrice)}</div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5">
              <div className="text-[0.62rem] font-bold uppercase tracking-widest text-slate-400">Mở thầu lúc</div>
              <div className="mt-0.5 font-mono text-sm font-black text-slate-700">{formatDateTime(session.startTime)}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <LightActionButton onClick={() => onDetail(session.id)}>
              <RemoveRedEyeOutlinedIcon className="!text-[0.95rem]" /> Chi tiết
            </LightActionButton>
            <LightActionButton tone="amber" disabled={session.fraudFlag} onClick={() => onFlag(session.id)}>
              <FlagOutlinedIcon className="!text-[0.95rem]" /> {session.fraudFlag ? "Đã gắn cờ" : "Gắn cờ"}
            </LightActionButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden rounded-3xl border shadow-md transition-all"
      style={{
        background: "linear-gradient(135deg, #0F172A 0%, #1E293B 55%, #064E3B 100%)",
        borderColor: urgent ? "rgba(248,113,113,0.45)" : "rgba(52,211,153,0.25)",
      }}
    >
      <div className="pointer-events-none absolute -right-12 -top-12 h-44 w-44 rounded-full bg-emerald-500/20 blur-3xl" />
      {session.fraudFlag && (
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-rose-500/15 blur-3xl" />
      )}
      <div className="relative z-10 flex flex-col gap-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <LiveDot urgent={urgent} />
            <span className="rounded-full border border-emerald-500/30 bg-emerald-950/60 px-2.5 py-0.5 text-[0.68rem] font-extrabold uppercase tracking-widest text-emerald-400">
              {sealed ? (
                <span className="inline-flex items-center gap-1">
                  <LockOutlinedIcon className="!text-[0.8rem]" /> Đấu giá kín
                </span>
              ) : (
                "LIVE"
              )}
            </span>
            {session.fraudFlag && (
              <span className="rounded-full border border-rose-500/40 bg-rose-950/60 px-2.5 py-0.5 text-[0.68rem] font-extrabold uppercase tracking-widest text-rose-300">
                Cờ rà soát
              </span>
            )}
          </div>
          <div className="text-right">
            <div className="text-[0.62rem] font-bold uppercase tracking-widest text-slate-400">Đóng thầu sau</div>
            <div
              className={`font-mono text-xl font-black tracking-widest ${
                urgent ? "animate-pulse text-red-400" : "text-white"
              }`}
            >
              {formatCountdown(remainingMs)}
            </div>
          </div>
        </div>

        <div>
          <div className="font-mono text-[0.68rem] font-bold uppercase tracking-widest text-slate-400">{session.id}</div>
          <Typography variant="subtitle1" className="!font-extrabold !text-white">
            {session.title}
          </Typography>
          <div className="mt-0.5 text-xs font-medium text-slate-300">
            {session.route} · {session.vehicleType}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-[0.62rem] font-bold uppercase tracking-widest text-emerald-400/80">
                Giá thấp nhất hiện tại
              </div>
              <div className="mt-1 font-mono text-2xl font-black tracking-tight text-emerald-300">
                {formatCurrency(session.currentBid)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[0.62rem] font-bold uppercase tracking-widest text-slate-400">Giá khởi điểm</div>
              <div className="mt-1 font-mono text-sm font-bold text-slate-200">{formatCurrency(session.startPrice)}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <div className="flex items-center gap-1 text-[0.62rem] font-bold uppercase tracking-widest text-slate-400">
              <GroupsOutlinedIcon className="!text-[0.8rem]" /> Nhà xe
            </div>
            <div className="mt-0.5 font-mono text-base font-extrabold text-white">{session.activeBidders}</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <div className="flex items-center gap-1 text-[0.62rem] font-bold uppercase tracking-widest text-slate-400">
              <GavelIcon className="!text-[0.8rem]" /> Lượt thầu
            </div>
            <div className="mt-0.5 font-mono text-base font-extrabold text-white">{bids.length}</div>
          </div>
        </div>

        <BidFeed bids={bids} highlightLatest={highlightLatest} dark />

        <div className="flex items-center gap-2">
          <DarkActionButton onClick={() => onDetail(session.id)}>
            <RemoveRedEyeOutlinedIcon className="!text-[0.95rem]" /> Chi tiết
          </DarkActionButton>
          <DarkActionButton tone="amber" disabled={session.fraudFlag} onClick={() => onFlag(session.id)}>
            <FlagOutlinedIcon className="!text-[0.95rem]" /> {session.fraudFlag ? "Đã gắn cờ" : "Gắn cờ"}
          </DarkActionButton>
          <DarkActionButton tone="rose" onClick={() => onStop(session.id)}>
            <BlockIcon className="!text-[0.95rem]" /> Dừng phiên
          </DarkActionButton>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value, emphasize = false }) {
  return (
    <Box sx={{ p: 1.5, border: "1px solid #E2E8F0", borderRadius: 2, bgcolor: "#F8FAFC" }}>
      <Typography variant="caption" sx={{ color: "#64748B", display: "block" }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ color: emphasize ? "#047857" : "#1E293B", fontWeight: 800, mt: 0.35 }}>
        {value}
      </Typography>
    </Box>
  );
}

function SessionDetailDialog({ session, open, onClose, onFlag, onStop }) {
  if (!session) return null;
  const bids = session.bidHistory || [];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          {session.title}
        </Typography>
        <Typography variant="caption" sx={{ color: "#64748B", fontFamily: "monospace" }}>
          {session.id} · {session.route}
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        {session.fraudFlag && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Phiên đang bị gắn cờ rà soát{session.fraudReason ? `: ${session.fraudReason}` : "."}
          </Alert>
        )}
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5, mb: 2.5 }}>
          <InfoItem label="Trạng thái" value={session.status === "OPEN" ? "Đang mở" : session.status === "PENDING" ? "Chờ mở" : session.status === "CANCELLED" ? "Đã hủy" : "Hoàn thành"} />
          <InfoItem label="Loại đấu giá" value={session.auctionType === "SEALED" ? "Đấu giá kín" : "Đấu giá công khai"} />
          <InfoItem label="Giá khởi điểm" value={formatCurrency(session.startPrice)} />
          <InfoItem label="Giá thấp nhất hiện tại" value={formatCurrency(session.currentBid)} emphasize />
          <InfoItem label="Số nhà xe tham gia" value={session.activeBidders} />
          <InfoItem label="Tổng lượt thầu" value={bids.length} />
          <InfoItem label="Bắt đầu" value={formatDateTime(session.startTime)} />
          <InfoItem label="Kết thúc" value={formatDateTime(session.endTime)} />
        </Box>

        <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
          Diễn biến giá thầu
        </Typography>
        <Box sx={{ height: 220, border: "1px solid #E2E8F0", borderRadius: 2, bgcolor: "#FFFFFF", p: 1 }}>
          {bids.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={bids} margin={{ top: 12, right: 16, left: 4, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} />
                <YAxis
                  tickFormatter={(value) => `${Math.round(value / 1000)}k`}
                  axisLine={false}
                  tickLine={false}
                  width={52}
                />
                <RechartsTooltip content={<ChartTooltip />} />
                <Line
                  type="stepAfter"
                  dataKey="bid"
                  stroke="#047857"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#047857", strokeWidth: 2, stroke: "#FFFFFF" }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <Box sx={{ height: "100%", display: "grid", placeItems: "center", color: "#64748B" }}>
              <Typography variant="body2">Chưa có báo giá trong phiên này.</Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1 }}>
        <AdminSecondaryButton onClick={onClose}>Đóng</AdminSecondaryButton>
        <AdminSecondaryButton
          startIcon={<FlagOutlinedIcon />}
          onClick={() => onFlag(session.id)}
          disabled={session.fraudFlag}
        >
          {session.fraudFlag ? "Đã gắn cờ" : "Gắn cờ gian lận"}
        </AdminSecondaryButton>
        <AdminPrimaryButton
          startIcon={<BlockIcon />}
          onClick={() => onStop(session.id)}
          disabled={session.status !== "OPEN"}
          sx={{ bgcolor: "#BE123C", "&:hover": { bgcolor: "#9F1239" } }}
        >
          Dừng phiên khẩn cấp
        </AdminPrimaryButton>
      </DialogActions>
    </Dialog>
  );
}

function EmptyState({ filtered, query }) {
  return (
    <Box role="status" sx={{ py: 8, px: 3, textAlign: "center" }}>
      <InsightsOutlinedIcon sx={{ color: "#94A3B8", fontSize: 42, mb: 1 }} />
      <Typography variant="h6" sx={{ color: "#1E293B", fontWeight: 800 }}>
        {filtered ? "Không tìm thấy phiên phù hợp" : "Chưa có phiên đấu giá đang theo dõi"}
      </Typography>
      <Typography variant="body2" sx={{ color: "#64748B", mt: 0.75, maxWidth: 520, mx: "auto" }}>
        {filtered
          ? `Không có phiên nào khớp với “${query}”. Hãy thử từ khóa khác.`
          : "Khi bidding service có phiên OPEN hoặc PENDING, dữ liệu sẽ xuất hiện tại đây."}
      </Typography>
    </Box>
  );
}

export default function AuctionMonitorView({ sessions, onCancelAuction, onFlagAuction, live = false }) {
  const notify = useGlobalNotification();
  const [selectedId, setSelectedId] = useState("");
  const [detailOpen, setDetailOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [stopDialogOpen, setStopDialogOpen] = useState(false);
  const [flagDialogOpen, setFlagDialogOpen] = useState(false);
  const [flagReason, setFlagReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const setActionError = (message) => { if (message) notify.error(message); };
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const selectedSession = sessions.find((session) => session.id === selectedId) || null;

  const filteredSessions = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase("vi");
    return sessions.filter((session) => {
      const matchesStatus = statusFilter === "ALL" || session.status === statusFilter;
      const matchesQuery =
        !query ||
        `${session.id} ${session.title} ${session.route} ${session.vehicleType}`
          .toLocaleLowerCase("vi")
          .includes(query);
      return matchesStatus && matchesQuery;
    });
  }, [searchQuery, sessions, statusFilter]);

  const openCount = sessions.filter((session) => session.status === "OPEN").length;
  const bidCount = sessions.reduce((total, session) => total + (session.bidHistory?.length || 0), 0);
  const bidderCount = sessions.reduce((total, session) => total + (session.activeBidders || 0), 0);
  const flaggedCount = sessions.filter((session) => session.fraudFlag).length;

  const openDetail = (sessionId) => {
    setSelectedId(sessionId);
    setActionError("");
    setDetailOpen(true);
  };

  const requestFlag = (sessionId) => {
    setSelectedId(sessionId);
    setActionError("");
    setDetailOpen(false);
    setFlagDialogOpen(true);
  };

  const requestStop = (sessionId) => {
    setSelectedId(sessionId);
    setActionError("");
    setDetailOpen(false);
    setStopDialogOpen(true);
  };

  const runAction = async (action, close) => {
    setActionLoading(true);
    setActionError("");
    try {
      await action();
      close();
    } catch (error) {
      setActionError(error?.response?.data?.message || error?.message || "Không thể thực hiện thao tác.");
    } finally {
      setActionLoading(false);
    }
  };

  const confirmStop = () => {
    if (!selectedSession) return;
    runAction(() => onCancelAuction(selectedSession.id), () => setStopDialogOpen(false));
  };

  const confirmFlag = () => {
    if (!selectedSession || !flagReason.trim()) return;
    runAction(
      () => onFlagAuction(selectedSession.id, flagReason.trim()),
      () => {
        setFlagDialogOpen(false);
        setFlagReason("");
      },
    );
  };

  return (
    <>
      <Box className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard title="Tổng phiên theo dõi" value={sessions.length} helper="OPEN + PENDING" icon={GavelIcon} />
        <AdminMetricCard title="Đang mở" value={openCount} helper="Có thể nhận báo giá" icon={InsightsOutlinedIcon} tone="success" />
        <AdminMetricCard title="Lượt báo giá" value={bidCount} helper={`${bidderCount} nhà xe đang tham gia`} icon={GroupsOutlinedIcon} tone="info" />
        <AdminMetricCard title="Cần rà soát" value={flaggedCount} helper="Cờ gian lận" icon={FlagOutlinedIcon} tone={flaggedCount ? "danger" : "neutral"} />
      </Box>

      <AdminSectionCard>
        <AdminToolbar
          title="Danh sách phiên đấu giá"
          subtitle={live ? "Đang nhận báo giá và trạng thái realtime qua WebSocket." : "Chưa kết nối realtime — dữ liệu lấy từ API khi tải trang."}
        >
          <ConnectionChip live={live} />
          <AdminSearchField
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Tìm mã phiên, tuyến, loại xe..."
          />
          <AdminSelectField
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            options={[
              { value: "ALL", label: "Tất cả trạng thái" },
              { value: "OPEN", label: "Đang mở" },
              { value: "PENDING", label: "Chờ mở" },
              { value: "COMPLETED", label: "Hoàn thành" },
              { value: "CANCELLED", label: "Đã hủy" },
            ]}
          />
        </AdminToolbar>

        {filteredSessions.length === 0 ? (
          <EmptyState filtered={sessions.length > 0} query={searchQuery.trim()} />
        ) : (
          <Box sx={{ p: 2.5 }}>
            <Box className="grid grid-cols-1 gap-3 xl:grid-cols-2">
              {filteredSessions.map((session) => (
                <SessionCard
                  key={session.id}
                  session={session}
                  now={now}
                  onDetail={openDetail}
                  onFlag={requestFlag}
                  onStop={requestStop}
                />
              ))}
            </Box>
          </Box>
        )}
      </AdminSectionCard>

      <SessionDetailDialog
        session={selectedSession}
        open={detailOpen && Boolean(selectedSession)}
        onClose={() => setDetailOpen(false)}
        onFlag={requestFlag}
        onStop={requestStop}
      />

      <Dialog open={stopDialogOpen} onClose={() => !actionLoading && setStopDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Dừng phiên đấu giá?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Phiên {selectedSession?.id} sẽ chuyển sang trạng thái đã hủy và không nhận thêm đăng ký hoặc báo giá.
          </Typography>
        </DialogContent>
        <DialogActions>
          <AdminSecondaryButton onClick={() => setStopDialogOpen(false)} disabled={actionLoading}>
            Hủy
          </AdminSecondaryButton>
          <AdminPrimaryButton
            onClick={confirmStop}
            disabled={actionLoading}
            sx={{ bgcolor: "#BE123C", "&:hover": { bgcolor: "#9F1239" } }}
          >
            {actionLoading ? "Đang dừng..." : "Xác nhận dừng"}
          </AdminPrimaryButton>
        </DialogActions>
      </Dialog>

      <Dialog open={flagDialogOpen} onClose={() => !actionLoading && setFlagDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Gắn cờ gian lận</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Lưu lý do rà soát phiên {selectedSession?.id}.
          </Typography>
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={3}
            label="Lý do"
            value={flagReason}
            onChange={(event) => setFlagReason(event.target.value)}
            inputProps={{ maxLength: 500 }}
          />
        </DialogContent>
        <DialogActions>
          <AdminSecondaryButton onClick={() => setFlagDialogOpen(false)} disabled={actionLoading}>
            Hủy
          </AdminSecondaryButton>
          <AdminPrimaryButton onClick={confirmFlag} disabled={actionLoading || !flagReason.trim()}>
            {actionLoading ? "Đang lưu..." : "Gắn cờ"}
          </AdminPrimaryButton>
        </DialogActions>
      </Dialog>
    </>
  );
}
