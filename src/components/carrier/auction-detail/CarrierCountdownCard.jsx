"use client";

import Typography from "@mui/material/Typography";
import AccessTimeIcon from "@mui/icons-material/AccessTimeOutlined";
import DynamicFeedIcon from "@mui/icons-material/DynamicFeedOutlined";
import LockIcon from "@mui/icons-material/LockOutlined";

import { formatTime } from "@/utils/auctionFormatters";

export default function CarrierCountdownCard({ countdown, auctionType }) {
  const isSealed = auctionType === "SEALED";
  const isUrgent = countdown <= 60;

  return (
    <div
      className="rounded-3xl border relative overflow-hidden transition-all shadow-md"
      style={{
        background: isSealed
          ? "linear-gradient(135deg, #1C0A00 0%, #1F1305 50%, #78350F 100%)"
          : "linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #064E3B 100%)",
        borderColor: isSealed ? "rgba(251,191,36,0.25)" : "rgba(52,211,153,0.25)",
      }}
    >
      {/* ambient glow */}
      <div
        className={`absolute -top-12 -right-12 w-44 h-44 rounded-full blur-3xl pointer-events-none ${
          isSealed ? "bg-amber-500/20" : "bg-emerald-500/20"
        }`}
      />

      <div className="p-5 flex items-center justify-between relative z-10">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {/* Live pulse dot */}
            <span className="relative flex h-2.5 w-2.5">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isUrgent ? "bg-red-400" : isSealed ? "bg-amber-400" : "bg-emerald-400"
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  isUrgent ? "bg-red-500" : isSealed ? "bg-amber-500" : "bg-emerald-500"
                }`}
              />
            </span>
            <Typography
              className={`font-extrabold uppercase tracking-widest text-[0.68rem] flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border ${
                isSealed
                  ? "text-amber-400 bg-amber-950/60 border-amber-500/30"
                  : "text-emerald-400 bg-emerald-950/60 border-emerald-500/30"
              }`}
            >
              {isSealed
                ? <><LockIcon className="!text-[0.8rem]" /> Thời gian đóng thầu còn lại</>
                : <><AccessTimeIcon className="!text-[0.8rem]" /> Thời gian đóng thầu còn lại</>
              }
            </Typography>
          </div>

          <Typography
            variant="h3"
            className={`!font-mono !font-black tracking-widest drop-shadow-md !text-4xl md:!text-5xl ${
              isUrgent ? "text-red-400 animate-pulse" : "text-white"
            }`}
          >
            {formatTime(countdown)}
          </Typography>

          <Typography
            variant="caption"
            className={`text-[0.68rem] flex items-center gap-1 font-medium ${
              isSealed ? "text-amber-400/70" : "text-emerald-400/70"
            }`}
          >
            {isSealed
              ? <><LockIcon className="!text-[0.75rem]" /> Đấu giá kín — Giá thầu bảo mật</>
              : <><DynamicFeedIcon className="!text-[0.75rem]" /> Cập nhật thời gian thực mỗi giây</>
            }
          </Typography>
        </div>

        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border backdrop-blur-md shadow-inner"
          style={{
            background: "rgba(255,255,255,0.08)",
            borderColor: "rgba(255,255,255,0.12)",
          }}
        >
          {isSealed ? "🔒" : "⏳"}
        </div>
      </div>
    </div>
  );
}
