"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AuctionDetailScreen from "@/components/shipper/AuctionDetailScreen";
import BiddingHistoryListScreen from "@/components/shipper/BiddingHistoryListScreen";

function AuctionDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  
  if (id) {
    return <AuctionDetailScreen id={id} />;
  }
  
  return <BiddingHistoryListScreen />;
}

export default function AuctionDetailPage() {
  return (
    <Suspense fallback={
      <div className="w-full min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-500 animate-pulse font-medium">Đang tải thông tin lịch sử đấu giá...</div>
      </div>
    }>
      <AuctionDetailContent />
    </Suspense>
  );
}
