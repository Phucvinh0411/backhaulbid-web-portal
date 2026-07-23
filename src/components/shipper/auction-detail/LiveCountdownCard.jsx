"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import AccessTimeIcon from "@mui/icons-material/AccessTimeOutlined";
import DynamicFeedIcon from "@mui/icons-material/DynamicFeedOutlined";
import { formatTime } from "./mockData";

export default function LiveCountdownCard({ countdown }) {
  return (
    <Card
      className="!rounded-3xl border border-emerald-500/20 relative overflow-hidden transition-all shadow-md hover:shadow-lg"
      sx={{
        background: "linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #064E3B 100%)",
        color: "#fff",
      }}
    >
      {/* Background ambient lighting */}
      <div className="absolute -top-12 -right-12 w-44 h-44 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      
      <CardContent className="!p-6 flex items-center justify-between relative z-10">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <Typography className="!text-emerald-400 font-extrabold uppercase tracking-widest text-[0.7rem] flex items-center gap-1.5 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
              <AccessTimeIcon className="!text-[0.85rem]" /> Thời gian đóng thầu còn lại
            </Typography>
          </div>

          <Typography variant="h3" className="!font-mono !font-black tracking-widest text-white drop-shadow-md !text-4xl md:!text-5xl">
            {formatTime(countdown)}
          </Typography>

          <Typography variant="caption" className="text-slate-400 text-[0.7rem] flex items-center gap-1 font-medium">
            <DynamicFeedIcon className="!text-[0.8rem] text-emerald-400" /> Hệ thống đấu giá tự động cập nhật mỗi giây
          </Typography>
        </div>

        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-3xl border border-white/15 backdrop-blur-md shadow-inner text-amber-300">
          ⏳
        </div>
      </CardContent>
    </Card>
  );
}
