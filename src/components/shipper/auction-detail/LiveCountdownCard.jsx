"use client";

import { useState, useEffect, useMemo } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import AccessTimeIcon from "@mui/icons-material/AccessTimeOutlined";
import HowToRegIcon from "@mui/icons-material/HowToRegOutlined";
import GavelIcon from "@mui/icons-material/GavelOutlined";
import LockIcon from "@mui/icons-material/LockOutlined";
import EventIcon from "@mui/icons-material/EventOutlined";

/**
 * Determine which auction phase we are in based on the shipment time fields.
 *
 * Phase 0 - WAITING_REG  : now < regStartTime   => countdown to reg-open
 * Phase 1 - REGISTERING  : regStartTime <= now < (regEndTime | startTime) => countdown to reg-close
 * Phase 2 - BEFORE_BID   : regEndTime <= now < startTime => countdown to bid-start
 * Phase 3 - BIDDING      : startTime <= now < endTime    => countdown to bid-end (ACTIVE)
 * Phase 4 - CLOSED       : now >= endTime
 */
function resolvePhase(shipment, nowMs) {
  const ts = (v) => (v ? new Date(v).getTime() : null);
  const regStart = ts(shipment?.regStartTime);
  const regEnd   = ts(shipment?.regEndTime);
  const bidStart = ts(shipment?.startTime);
  const bidEnd   = ts(shipment?.endTime);

  const closedStatuses = ["awarded", "shipping", "completed", "cancelled"];
  if (closedStatuses.includes(shipment?.status)) {
    return { phase: 4, remaining: 0, targetMs: bidEnd };
  }

  if (bidEnd && nowMs >= bidEnd) return { phase: 4, remaining: 0, targetMs: bidEnd };

  if (bidStart && nowMs >= bidStart) {
    return { phase: 3, remaining: Math.floor((bidEnd - nowMs) / 1000), targetMs: bidEnd };
  }

  const regCloseMs = regEnd || bidStart;
  if (regStart && nowMs >= regStart && regCloseMs && nowMs < regCloseMs) {
    return { phase: 1, remaining: Math.floor((regCloseMs - nowMs) / 1000), targetMs: regCloseMs };
  }

  if (regCloseMs && nowMs >= regCloseMs && bidStart && nowMs < bidStart) {
    return { phase: 2, remaining: Math.floor((bidStart - nowMs) / 1000), targetMs: bidStart };
  }

  const targetMs = regStart || bidStart || bidEnd;
  const remaining = targetMs ? Math.max(0, Math.floor((targetMs - nowMs) / 1000)) : 0;
  return { phase: 0, remaining, targetMs };
}

const formatTime = (seconds) => {
  const s = Math.max(0, Number(seconds) || 0);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return [h, m, sec].map((p) => String(p).padStart(2, "0")).join(":");
};

const formatDateTime = (value) => {
  if (!value) return null;
  const d = new Date(value);
  if (isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit", minute: "2-digit",
    day: "2-digit", month: "2-digit", year: "numeric",
  }).format(d);
};

const PHASE_CONFIG = {
  0: {
    label: "Chờ mở đăng ký",
    sublabel: "Đăng ký nhà xe tham gia chưa bắt đầu",
    bg: "linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0C4A6E 100%)",
    borderColor: "border-sky-500/20",
    ambientClass: "bg-sky-500/15",
    emoji: "📋",
    pillClass: "!text-sky-400 bg-sky-950/60 border-sky-500/30",
    pingClass: "bg-sky-400",
    dotClass: "bg-sky-500",
  },
  1: {
    label: "Đang mở đăng ký",
    sublabel: "Nhà xe đang đăng ký tham gia đấu giá",
    bg: "linear-gradient(135deg, #0F172A 0%, #1E3A5F 50%, #1D4ED8 100%)",
    borderColor: "border-blue-400/20",
    ambientClass: "bg-blue-400/15",
    emoji: "📝",
    pillClass: "!text-blue-300 bg-blue-950/60 border-blue-400/30",
    pingClass: "bg-blue-400",
    dotClass: "bg-blue-500",
  },
  2: {
    label: "Chờ bắt đầu đấu giá",
    sublabel: "Đăng ký đã đóng — Phiên đấu giá sắp bắt đầu",
    bg: "linear-gradient(135deg, #0F172A 0%, #1C1400 50%, #78350F 100%)",
    borderColor: "border-amber-500/20",
    ambientClass: "bg-amber-500/15",
    emoji: "⏰",
    pillClass: "!text-amber-300 bg-amber-950/60 border-amber-500/30",
    pingClass: "bg-amber-400",
    dotClass: "bg-amber-500",
  },
  3: {
    label: "Đang đấu giá — Thời gian đóng thầu còn lại",
    sublabel: "Hệ thống đấu giá tự động cập nhật mỗi giây",
    bg: "linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #064E3B 100%)",
    borderColor: "border-emerald-500/20",
    ambientClass: "bg-emerald-500/20",
    emoji: "⏳",
    pillClass: "!text-emerald-400 bg-emerald-950/60 border-emerald-500/30",
    pingClass: "bg-emerald-400",
    dotClass: "bg-emerald-500",
  },
  4: {
    label: "Phiên đấu giá đã kết thúc",
    sublabel: "Hệ thống đã khóa nhận báo giá mới",
    bg: "linear-gradient(135deg, #18181B 0%, #27272A 50%, #7F1D1D 100%)",
    borderColor: "border-rose-500/20",
    ambientClass: "bg-rose-500/10",
    emoji: "🛑",
    pillClass: "!text-rose-400 bg-rose-950/60 border-rose-500/30",
    pingClass: null,
    dotClass: null,
  },
};

const PHASE_LABELS = {
  0: "Chờ mở đăng ký",
  1: "Đang mở đăng ký",
  2: "Chờ bắt đầu đấu giá",
  3: "Đang đấu giá — Thời gian đóng thầu còn lại",
  4: "Phiên đấu giá đã kết thúc",
};

const PHASE_SUBLABELS = {
  0: "Đăng ký nhà xe tham gia chưa bắt đầu",
  1: "Nhà xe đang đăng ký tham gia đấu giá",
  2: "Đăng ký đã đóng — Phiên đấu giá sắp bắt đầu",
  3: "Hệ thống đấu giá tự động cập nhật mỗi giây",
  4: "Hệ thống đã khóa nhận báo giá mới",
};

function PhaseSteps({ phase }) {
  const steps = [
    { id: 0, label: "Chờ đăng ký" },
    { id: 1, label: "Đang đấu giá" },
    { id: 2, label: "Đóng thầu" },
  ];

  const activeStep = phase <= 0 ? 0 : phase <= 3 ? 1 : 2;

  return (
    <div className="flex items-center gap-0 mt-3 mb-1">
      {steps.map((step, idx) => {
        const isDone = activeStep > idx;
        const isActive = activeStep === idx;
        return (
          <div key={step.id} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-0.5 min-w-[52px]">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[0.6rem] font-extrabold border-2 transition-all ${
                  isDone
                    ? "bg-emerald-500 border-emerald-400 text-white"
                    : isActive
                    ? "bg-white/20 border-white/60 text-white animate-pulse"
                    : "bg-white/5 border-white/15 text-white/30"
                }`}
              >
                {isDone ? "✓" : idx + 1}
              </div>
              <span
                className={`text-[0.58rem] font-semibold text-center leading-tight ${
                  isDone ? "text-emerald-400" : isActive ? "text-white" : "text-white/30"
                }`}
              >
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`flex-1 h-[2px] mx-1 mb-4 rounded-full transition-all ${
                  activeStep > idx ? "bg-emerald-500" : "bg-white/10"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function LiveCountdownCard({ shipment }) {
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { phase, remaining } = useMemo(
    () => resolvePhase(shipment, nowMs),
    [shipment, nowMs]
  );

  const cfg = PHASE_CONFIG[phase] ?? PHASE_CONFIG[3];
  const isClosed = phase === 4;

  const footerDate = useMemo(() => {
    if (!shipment) return null;
    if (phase === 0) return { label: "Mở đăng ký lúc:", value: formatDateTime(shipment.regStartTime) };
    if (phase === 1) return { label: "Đóng đăng ký lúc:", value: formatDateTime(shipment.regEndTime || shipment.startTime) };
    if (phase === 2) return { label: "Bắt đầu đấu giá lúc:", value: formatDateTime(shipment.startTime) };
    if (phase === 3) return { label: "Đóng thầu lúc:", value: formatDateTime(shipment.endTime) };
    return { label: "Đã đóng thầu lúc:", value: formatDateTime(shipment.endTime) };
  }, [shipment, phase]);

  return (
    <Card
      className={`!rounded-3xl border relative overflow-hidden transition-all shadow-md hover:shadow-lg ${cfg.borderColor}`}
      sx={{ background: cfg.bg, color: "#fff" }}
    >
      <div className={`absolute -top-12 -right-12 w-44 h-44 rounded-full blur-3xl pointer-events-none ${cfg.ambientClass}`} />

      <CardContent className="!p-5 relative z-10">
        <div className="flex items-center gap-2 mb-3">
          {!isClosed && cfg.dotClass && (
            <span className="relative flex h-2.5 w-2.5 shrink-0">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${cfg.pingClass}`} />
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${cfg.dotClass}`} />
            </span>
          )}
          <Typography
            className={`font-extrabold uppercase tracking-widest text-[0.68rem] flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border ${cfg.pillClass}`}
          >
            <AccessTimeIcon className="!text-[0.85rem]" />
            {PHASE_LABELS[phase]}
          </Typography>
        </div>

        <PhaseSteps phase={phase} />

        <Typography
          variant="h3"
          className="!font-mono !font-black tracking-widest text-white drop-shadow-md !text-4xl mt-3 mb-1"
        >
          {isClosed ? "ĐÃ ĐÓNG THẦU" : formatTime(remaining)}
        </Typography>

        <Typography
          variant="caption"
          className={`text-[0.68rem] font-medium block ${isClosed ? "text-rose-300/70" : "text-slate-400"}`}
        >
          {PHASE_SUBLABELS[phase]}
        </Typography>

        {footerDate?.value && (
          <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
            <span className="text-[0.62rem] text-white/40 font-medium flex items-center gap-1">
              <EventIcon className="!text-[0.75rem]" />
              {footerDate.label}
            </span>
            <span className="text-[0.68rem] font-mono font-bold text-white/70">{footerDate.value}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}