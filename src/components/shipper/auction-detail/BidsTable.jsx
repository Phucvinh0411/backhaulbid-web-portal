"use client";

import { useState, useMemo } from "react";
import Rating from "@mui/material/Rating";
import StarIcon from "@mui/icons-material/Star";
import VerifiedIcon from "@mui/icons-material/Verified";
import InfoIcon from "@mui/icons-material/InfoOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import LockIcon from "@mui/icons-material/LockOutlined";
import PublicIcon from "@mui/icons-material/PublicOutlined";
import GavelIcon from "@mui/icons-material/GavelOutlined";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

import { formatCurrency } from "./mockData";

function AvatarBubble({ name, isWinner }) {
  const initials = name
    ? name
        .split(" ")
        .slice(-2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()
    : "NX";
  return (
    <div
      className={`w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-xs shrink-0 select-none transition-transform hover:scale-110 border ${
        isWinner
          ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-300 border-emerald-300"
          : "bg-gradient-to-br from-[#1B4965] to-[#0D2B3E] text-white border-slate-300"
      }`}
    >
      {initials}
    </div>
  );
}

function SealedBidRow({ bid, rank, onOpenCarrierModal, onOpenOtpDialog, shipmentStatus, onSelectBid, isSelected }) {
  return (
    <div
      onClick={() => onSelectBid ? onSelectBid(bid) : onOpenCarrierModal(bid)}
      className={`group relative flex items-center gap-3 px-4 py-3.5 rounded-2xl cursor-pointer transition-all border ${
        isSelected
          ? "bg-amber-100/80 border-amber-400 shadow-sm"
          : bid.isLowest
          ? "bg-amber-50/70 border-amber-200 hover:border-amber-400 hover:bg-amber-50"
          : "bg-white/60 border-slate-100 hover:border-slate-200 hover:bg-white"
      }`}
    >
      {/* Rank Badge */}
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
          rank === 1
            ? "bg-amber-400 text-white shadow shadow-amber-300"
            : rank === 2
            ? "bg-slate-300 text-slate-700"
            : "bg-slate-100 text-slate-500"
        }`}
      >
        {rank}
      </div>

      {/* Avatar */}
      <AvatarBubble name={bid.carrierName} isWinner={bid.isLowest} />

      {/* Carrier info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-bold text-slate-800 text-sm truncate leading-tight">{bid.carrierName}</span>
          {bid.isLowest && (
            <span className="inline-flex items-center gap-0.5 text-[0.62rem] font-extrabold bg-emerald-500 text-white px-1.5 py-0.5 rounded-full leading-tight shrink-0">
              <EmojiEventsIcon className="!text-[0.7rem]" /> Thấp nhất
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 mt-0.5">
          <Rating
            value={bid.rating}
            precision={0.1}
            readOnly
            size="small"
            emptyIcon={<StarIcon className="text-slate-200" fontSize="inherit" />}
            className="!text-[0.7rem]"
          />
          <span className="text-[0.68rem] text-slate-500 font-semibold">{bid.rating}</span>
          <span className="text-slate-200">·</span>
          <VerifiedIcon className="!text-[0.65rem] text-sky-500" />
          <span className="text-[0.65rem] text-slate-400 font-medium">B2B</span>
        </div>
      </div>

      {/* Price */}
      <div className="text-right shrink-0">
        <div
          className={`font-black font-mono text-sm leading-tight ${
            bid.isLowest ? "text-emerald-600" : "text-slate-700"
          }`}
        >
          {formatCurrency(bid.bidAmount)}
        </div>
        <div className="text-[0.65rem] text-slate-400 font-medium mt-0.5">{bid.time}</div>
      </div>

      {/* Action button (SEALED only: shipper manually picks winner) */}
      {shipmentStatus === "active_bids" && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenOtpDialog(bid);
          }}
          className="shrink-0 opacity-0 group-hover:opacity-100 transition-all bg-amber-600 hover:bg-amber-700 text-white text-[0.7rem] font-bold px-2.5 py-1.5 rounded-xl shadow-sm"
        >
          Chọn
        </button>
      )}

      <InfoIcon
        onClick={(e) => {
          e.stopPropagation();
          onOpenCarrierModal(bid);
        }}
        className="!text-[1rem] text-slate-300 hover:text-[#1B4965] shrink-0 transition-colors"
      />
    </div>
  );
}

function PublicBidRow({ bid, rank, prevBidAmount, onOpenCarrierModal, shipmentStatus }) {
  const diff = prevBidAmount ? bid.bidAmount - prevBidAmount : null;
  return (
    <div
      onClick={() => onOpenCarrierModal(bid)}
      className={`group relative flex items-center gap-3 px-4 py-3.5 rounded-2xl cursor-pointer transition-all border ${
        bid.isLowest
          ? "bg-emerald-50/80 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50"
          : "bg-white/60 border-slate-100 hover:border-slate-200 hover:bg-white"
      }`}
    >
      {/* Rank Badge */}
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 `}
      >
        {rank}
      </div>

      {/* Avatar */}
      <AvatarBubble name={bid.carrierName} isWinner={bid.isLowest} />

      {/* Carrier info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-bold text-slate-800 text-sm truncate leading-tight">{bid.carrierName}</span>
          {bid.isLowest && (
            <span className="inline-flex items-center gap-0.5 text-[0.62rem] font-extrabold bg-emerald-500 text-white px-1.5 py-0.5 rounded-full leading-tight shrink-0">
              <EmojiEventsIcon className="!text-[0.7rem]" /> Thấp nhất
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 mt-0.5">
          <Rating
            value={bid.rating}
            precision={0.1}
            readOnly
            size="small"
            emptyIcon={<StarIcon className="text-slate-200" fontSize="inherit" />}
            className="!text-[0.7rem]"
          />
          <span className="text-[0.68rem] text-slate-500 font-semibold">{bid.rating}</span>
          <span className="text-slate-200">·</span>
          <span className="text-[0.65rem] text-slate-400">{bid.time}</span>
        </div>
      </div>

      {/* Price with diff indicator */}
      <div className="text-right shrink-0">
        <div
          className={`font-black font-mono text-sm leading-tight ${
            bid.isLowest ? "text-emerald-600" : "text-slate-700"
          }`}
        >
          {formatCurrency(bid.bidAmount)}
        </div>
        {diff !== null && diff < 0 && (
          <div className="text-[0.62rem] font-bold text-emerald-600 flex items-center justify-end gap-0.5 mt-0.5">
            <ArrowDownwardIcon className="!text-[0.65rem]" />
            {formatCurrency(Math.abs(diff))}
          </div>
        )}
        {diff !== null && diff > 0 && (
          <div className="text-[0.62rem] font-bold text-rose-500 flex items-center justify-end gap-0.5 mt-0.5">
            <ArrowUpwardIcon className="!text-[0.65rem]" />
            {formatCurrency(Math.abs(diff))}
          </div>
        )}
      </div>

      {/* PUBLIC auction: no manual select button. Auto-picks lowest at close. Show badge instead */}
      {bid.isLowest && shipmentStatus === "active_bids" && (
        <span className="shrink-0 text-[0.62rem] font-extrabold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2 py-1 rounded-xl leading-tight">
          Tự động
        </span>
      )}

      <InfoIcon
        onClick={(e) => {
          e.stopPropagation();
          onOpenCarrierModal(bid);
        }}
        className="!text-[1rem] text-slate-300 hover:text-[#1B4965] shrink-0 transition-colors"
      />
    </div>
  );
}

export default function BidsTable({
  bids = [],
  shipmentStatus,
  auctionType = "PUBLIC",
  onOpenOtpDialog,
  onOpenCarrierModal,
  onOpenFullModal,
  onSelectBid,
  selectedBidId,
  isSimplified = false,
  isModalView = false,
}) {
  // PUBLIC auction: system auto-selects lowest bidder when countdown reaches 0
  // SEALED auction: shipper manually reviews and picks winner
  const [sortOrder, setSortOrder] = useState("asc");

  const sortedBids = useMemo(() => {
    return [...bids].sort((a, b) =>
      sortOrder === "asc" ? a.bidAmount - b.bidAmount : b.bidAmount - a.bidAmount
    );
  }, [bids, sortOrder]);

  const isSealed = auctionType === "SEALED";

  return (
    <div
      className={`flex flex-col flex-1 h-full ${
        isModalView ? "" : "bg-white/95 rounded-3xl border border-slate-100 shadow-sm overflow-hidden"
      }`}
    >
      {/* Header */}
      {!isModalView && (
        <div
          className={`px-5 py-4 border-b flex items-center justify-between gap-2 ${
            isSealed
              ? "bg-gradient-to-r from-amber-50 to-orange-50 border-amber-100"
              : "bg-gradient-to-r from-sky-50 to-blue-50 border-sky-100"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center shadow-xs ${
                isSealed
                  ? "bg-amber-100 border border-amber-200"
                  : "bg-sky-100 border border-sky-200"
              }`}
            >
              {isSealed ? (
                <LockIcon className={`!text-[1.1rem] text-amber-700`} />
              ) : (
                <PublicIcon className={`!text-[1.1rem] text-sky-700`} />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-slate-800 text-sm">
                  {isSealed ? "Đấu giá kín (Bid ẩn)" : "Đấu giá công khai"}
                </span>
                <span
                  className={`text-[0.62rem] font-extrabold px-2 py-0.5 rounded-full border ${
                    isSealed
                      ? "bg-amber-100 text-amber-800 border-amber-200"
                      : "bg-sky-100 text-sky-800 border-sky-200"
                  }`}
                >
                  {bids.length} nhà xe
                </span>
              </div>
              <p className={`text-[0.7rem] font-medium ${isSealed ? "text-amber-700" : "text-sky-700"}`}>
                {isSealed
                  ? "Giá thầu bị ẩn — Chủ hàng xem danh sách & chủ động chọn nhà xe trúng thầu"
                  : "Công khai giá — Hệ thống tự động chọn nhà xe thấp nhất khi đóng thầu"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Sort toggle */}
            <button
              onClick={() => setSortOrder((o) => (o === "asc" ? "desc" : "asc"))}
              className="flex items-center gap-1 text-[0.7rem] font-bold text-slate-500 hover:text-slate-800 bg-white/80 border border-slate-200 px-2.5 py-1.5 rounded-xl transition-all hover:border-slate-300"
            >
              <GavelIcon className="!text-[0.8rem]" />
              Giá {sortOrder === "asc" ? "↑" : "↓"}
            </button>

            {isSimplified && onOpenFullModal && (
              <button
                onClick={onOpenFullModal}
                className="flex items-center gap-1 text-[0.7rem] font-bold text-[#1B4965] hover:text-white bg-white/80 hover:bg-[#1B4965] border border-slate-200 hover:border-[#1B4965] px-2.5 py-1.5 rounded-xl transition-all"
              >
                <OpenInNewIcon className="!text-[0.8rem]" />
                Chi tiết
              </button>
            )}
          </div>
        </div>
      )}

      {/* Bid List — flex-1 min-h-0 allows overflow-y-auto to scroll within equal-height grid */}
      <div
        className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2 scroll-smooth"
        style={{ scrollbarWidth: "thin", scrollbarColor: "#CBD5E1 transparent" }}
      >
        {sortedBids.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-2">
            <GavelIcon className="!text-4xl opacity-20" />
            <p className="text-sm font-medium">Chưa có nhà xe nào báo giá.</p>
          </div>
        ) : isSealed ? (
          sortedBids.map((bid, idx) => (
            <SealedBidRow
              key={bid.id}
              bid={bid}
              rank={idx + 1}
              onOpenCarrierModal={onOpenCarrierModal}
              onOpenOtpDialog={onOpenOtpDialog}
              shipmentStatus={shipmentStatus}
              onSelectBid={onSelectBid}
              isSelected={selectedBidId === bid.id}
            />
          ))
        ) : (
          sortedBids.map((bid, idx) => (
            <PublicBidRow
              key={bid.id}
              bid={bid}
              rank={idx + 1}
              prevBidAmount={idx > 0 ? sortedBids[idx - 1].bidAmount : null}
              onOpenCarrierModal={onOpenCarrierModal}
              shipmentStatus={shipmentStatus}
            />
          ))
        )}
      </div>

      {/* Footer action */}
      {isSimplified && onOpenFullModal && bids.length > 0 && (
        <div className="px-4 pb-4 pt-2 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={onOpenFullModal}
            className="w-full flex items-center justify-center gap-1.5 text-[0.75rem] font-bold text-[#1B4965] hover:text-white bg-white hover:bg-[#1B4965] border border-slate-200 hover:border-[#1B4965] py-2.5 rounded-2xl transition-all shadow-xs hover:shadow-sm"
          >
            <OpenInNewIcon className="!text-[0.9rem]" />
            Mở Bảng Đấu Giá Đầy Đủ ({bids.length} nhà xe)
          </button>
        </div>
      )}
    </div>
  );
}
