"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import AccessTimeIcon from "@mui/icons-material/AccessTimeOutlined";
import DynamicFeedIcon from "@mui/icons-material/DynamicFeedOutlined";

const formatTime = (seconds) => {
  const safeSeconds = Math.max(0, Number(seconds) || 0);
  const h = Math.floor(safeSeconds / 3600);
  const m = Math.floor((safeSeconds % 3600) / 60);
  const s = safeSeconds % 60;
  return [h, m, s].map((part) => String(part).padStart(2, "0")).join(":");
};

export default function LiveCountdownCard({ countdown }) {
  const isExpired = countdown <= 0;

  return (
    <Card
      className={`!rounded-3xl border relative overflow-hidden transition-all shadow-md hover:shadow-lg ${
        isExpired ? "border-rose-500/20" : "border-emerald-500/20"
      }`}
      sx={{
        background: isExpired
          ? "linear-gradient(135deg, #18181B 0%, #27272A 50%, #7F1D1D 100%)"
          : "linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #064E3B 100%)",
        color: "#fff",
      }}
    >
      {/* Background ambient lighting */}
      <div className={`absolute -top-12 -right-12 w-44 h-44 rounded-full blur-3xl pointer-events-none ${isExpired ? 'bg-rose-500/10' : 'bg-emerald-500/20'}`} />
      
      <CardContent className="!p-6 flex items-center justify-between relative z-10">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {!isExpired && (
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            )}
            <Typography className={`font-extrabold uppercase tracking-widest text-[0.7rem] flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border ${
              isExpired 
                ? "!text-rose-400 bg-rose-950/60 border-rose-500/30" 
                : "!text-emerald-400 bg-emerald-950/60 border-emerald-500/30"
            }`}>
              <AccessTimeIcon className="!text-[0.85rem]" /> {isExpired ? "Phiên đấu giá đã kết thúc" : "Thời gian đóng thầu còn lại"}
            </Typography>
          </div>

          <Typography variant="h3" className="!font-mono !font-black tracking-widest text-white drop-shadow-md !text-4xl md:!text-5xl">
            {isExpired ? "ĐÃ ĐÓNG THẦU" : formatTime(countdown)}
          </Typography>

          <Typography variant="caption" className={`text-[0.7rem] flex items-center gap-1 font-medium ${isExpired ? 'text-rose-300/70' : 'text-slate-400'}`}>
            <DynamicFeedIcon className={`!text-[0.8rem] ${isExpired ? 'text-rose-400/70' : 'text-emerald-400'}`} /> 
            {isExpired ? "Hệ thống đã khóa nhận báo giá mới" : "Hệ thống đấu giá tự động cập nhật mỗi giây"}
          </Typography>
        </div>

        <div className={`w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-3xl border border-white/15 backdrop-blur-md shadow-inner ${isExpired ? 'grayscale opacity-70' : 'text-amber-300'}`}>
          {isExpired ? "🛑" : "⏳"}
        </div>
      </CardContent>
    </Card>
  );
}
