"use client";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import AccessTimeIcon from "@mui/icons-material/AccessTimeOutlined";
import { formatTime } from "./mockData";

export default function LiveCountdownCard({ countdown }) {
  return (
    <Card
      className="!rounded-3xl border border-amber-400/20"
      sx={{
        background: "linear-gradient(135deg, #FF5A5F 0%, #FF7A00 100%)",
        boxShadow: "0 10px 30px rgba(255, 90, 95, 0.35)",
        color: "#fff",
      }}
    >
      <CardContent className="!p-6 flex items-center justify-between">
        <div className="space-y-1">
          <Typography className="!text-slate-300 font-bold uppercase tracking-wider text-xs flex items-center gap-1.5">
            <AccessTimeIcon className="!text-[1rem]" /> Thời gian đóng thầu còn lại
          </Typography>
          <Typography variant="h3" className="!font-mono !font-black tracking-widest">
            {formatTime(countdown)}
          </Typography>
        </div>
        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-2xl border border-white/10 animate-float">
          ⏳
        </div>
      </CardContent>
    </Card>
  );
}
