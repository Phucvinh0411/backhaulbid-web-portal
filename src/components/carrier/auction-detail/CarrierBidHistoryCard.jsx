"use client";

import Typography from "@mui/material/Typography";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import GavelIcon from "@mui/icons-material/GavelOutlined";
import LockIcon from "@mui/icons-material/LockOutlined";

import { formatCurrency } from "./mockData";

function HistoryRow({ entry, isSealed, index }) {
  const isWinner = index === 0; // Lowest (first after sort)
  const isMe = entry.isMe;

  return (
    <div
      className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl border transition-all ${
        isMe
          ? isSealed
            ? "bg-amber-50/80 border-amber-200"
            : "bg-sky-50/80 border-sky-200"
          : isWinner && !isSealed
          ? "bg-emerald-50/70 border-emerald-200"
          : "bg-white/60 border-slate-100"
      }`}
    >
      {/* Rank badge */}
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
          isWinner && !isSealed
            ? "bg-amber-400 text-white shadow shadow-amber-200"
            : index === 1
            ? "bg-slate-300 text-slate-700"
            : "bg-slate-100 text-slate-500"
        }`}
      >
        {isSealed ? "·" : index + 1}
      </div>

      {/* Bidder name */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span
            className={`font-bold text-sm truncate ${
              isMe ? (isSealed ? "text-amber-800" : "text-sky-800") : "text-slate-700"
            }`}
          >
            {isMe ? "🏢 Bạn (Nhà xe của tôi)" : entry.bidder}
          </span>
          {isMe && (
            <span
              className={`text-[0.6rem] font-extrabold px-1.5 py-0.5 rounded-full ${
                isSealed ? "bg-amber-200 text-amber-900" : "bg-sky-200 text-sky-900"
              }`}
            >
              TÔI
            </span>
          )}
          {isWinner && !isSealed && !isMe && (
            <EmojiEventsIcon className="!text-[0.9rem] text-amber-500 shrink-0" />
          )}
        </div>
        <span className="text-[0.68rem] text-slate-400 font-medium">{entry.time}</span>
      </div>

      {/* Amount */}
      <span
        className={`font-mono font-black text-sm shrink-0 ${
          isMe
            ? isSealed ? "text-amber-700" : "text-sky-700"
            : isWinner && !isSealed
            ? "text-emerald-600"
            : "text-slate-700"
        }`}
      >
        {formatCurrency(entry.amount)}
      </span>
    </div>
  );
}

export default function CarrierBidHistoryCard({ bidHistory, auctionType }) {
  const isSealed = auctionType === "SEALED";

  // Sort by amount ASC (lowest first) for display
  const sorted = [...bidHistory].sort((a, b) => a.amount - b.amount);

  return (
    <div className="bg-white/95 rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col flex-1">
      {/* Header */}
      <div
        className={`px-5 py-4 border-b flex items-center justify-between ${
          isSealed
            ? "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-100"
            : "bg-gradient-to-r from-sky-50 to-blue-50 border-sky-100"
        }`}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-2xl flex items-center justify-center ${
              isSealed ? "bg-amber-100 border border-amber-200" : "bg-sky-100 border border-sky-200"
            }`}
          >
            {isSealed
              ? <LockIcon className="!text-[1.1rem] text-amber-700" />
              : <GavelIcon className="!text-[1.1rem] text-sky-700" />
            }
          </div>
          <div>
            <Typography className="!font-black !text-sm text-slate-800">
              {isSealed ? "Lịch sử giá thầu của bạn" : "Bảng báo giá thời gian thực"}
            </Typography>
            <p className={`text-[0.68rem] font-medium ${isSealed ? "text-amber-700" : "text-sky-700"}`}>
              {isSealed
                ? "Chỉ bạn thấy giá của mình — Nhà xe khác hoàn toàn bảo mật"
                : "Giá thầu xếp hạng từ thấp đến cao (Tên nhà xe được ẩn)"}
            </p>
          </div>
        </div>

        <span
          className={`text-[0.65rem] font-extrabold px-2.5 py-1 rounded-full border ${
            isSealed ? "bg-amber-100 text-amber-800 border-amber-200" : "bg-sky-100 text-sky-800 border-sky-200"
          }`}
        >
          {sorted.length} lượt giá
        </span>
      </div>

      {/*
        flex-1 min-h-0: key combo—
          flex-1 → takes all remaining height in the card.
          min-h-0 → lets flex child shrink below its natural content height
                      so overflow-y-auto actually triggers the scrollbar.
      */}
      <div
        className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2 scroll-smooth"
        style={{ scrollbarWidth: "thin", scrollbarColor: "#CBD5E1 transparent" }}
      >
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
            <GavelIcon className="!text-4xl opacity-20" />
            <p className="text-sm font-medium">Chưa có báo giá nào.</p>
          </div>
        ) : (
          sorted.map((entry, idx) => (
            <HistoryRow key={entry.id} entry={entry} isSealed={isSealed} index={idx} />
          ))
        )}
      </div>

      {/* Footer info for PUBLIC mode */}
      {!isSealed && (
        <div className="px-4 py-3 border-t border-slate-100 bg-sky-50/50 text-center">
          <p className="text-[0.68rem] text-sky-700 font-medium">
            💡 Người ra giá thấp nhất khi đồng hồ về <strong>00:00:00</strong> sẽ tự động trúng thầu
          </p>
        </div>
      )}
    </div>
  );
}
