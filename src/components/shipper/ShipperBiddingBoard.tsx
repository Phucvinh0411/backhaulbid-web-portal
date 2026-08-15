"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useSocket } from '@/hooks/useSocket';
import toast from 'react-hot-toast';

export interface Bid {
  id: string;
  orderId: string;
  truckId: string;
  companyId: string;
  shipperId: string;
  bidPrice: number;
  message?: string;
  createdAt: string;
  isNew?: boolean; // Cờ UI để nháy highlight CSS
}

export default function ShipperBiddingBoard() {
  // Giả lập thông tin Chủ hàng hiện tại
  const currentShipperId = "3b2b78c5-f7ef-441f-ade7-d7754528fedb"; 
  const currentOrderId = "ORDER-123";

  // Sử dụng Hook Socket đã viết trước đó
  const { listen, socket } = useSocket();
  const [bids, setBids] = useState<Bid[]>([]);
  
  // Dùng Ref để lưu trữ ds ID tránh lặp khi socket bị fire 2 lần
  const processedBidIds = useRef<Set<string>>(new Set());

  // Join Room & Lắng nghe event
  useEffect(() => {
    if (!socket) return;

    // 1. Join đúng room của Shipper này để chỉ nhận báo giá của mình
    socket.emit('join_shipper_room', { shipperId: currentShipperId });

    // 2. Lắng nghe báo giá mới
    const unlisten = listen('new_bid_received', (newBid: Bid) => {
      console.log('Nhận báo giá mới:', newBid);
      
      // Chống duplicate: Nếu ID đã xử lý rồi thì bỏ qua
      if (processedBidIds.current.has(newBid.id)) return;
      processedBidIds.current.add(newBid.id);

      // Thêm flag isNew = true để render CSS highlight
      const incomingBid = { ...newBid, isNew: true };

      // Cập nhật state cẩn thận: đưa bid mới lên đầu mảng
      setBids((prevBids) => [incomingBid, ...prevBids]);

      // Bật Toast thông báo
      toast.success(
        `💵 Báo giá mới từ nhà xe ${incomingBid.companyId}: ${incomingBid.bidPrice.toLocaleString()} đ`, 
        { position: 'top-right', duration: 4000 }
      );

      // Xóa cờ isNew sau 3 giây để tắt hiệu ứng nháy vàng
      setTimeout(() => {
        setBids((currentBids) => 
          currentBids.map(b => b.id === newBid.id ? { ...b, isNew: false } : b)
        );
      }, 3000);
    });

    return () => {
      if (unlisten) unlisten();
    };
  }, [listen, socket, currentShipperId]);

  const handleAcceptBid = (bidId: string) => {
    toast(`Đã chọn báo giá ${bidId}. Đang tạo hợp đồng...`, { icon: '🤝' });
    // Logic gọi API để chốt hợp đồng sẽ nằm ở đây
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Bảng Theo Dõi Đấu Giá</h1>
          <p className="text-sm text-gray-500 mt-1">Đơn hàng: <span className="font-semibold text-blue-600">{currentOrderId}</span></p>
        </div>
        <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-sm font-medium text-gray-700">Live Bidding</span>
        </div>
      </div>

      <div className="space-y-4">
        {bids.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <p className="text-gray-500 text-lg">Chưa có nhà xe nào báo giá.</p>
            <p className="text-gray-400 text-sm mt-1">Đang chờ tín hiệu từ mạng lưới...</p>
          </div>
        ) : (
          bids.map((bid) => (
            <div 
              key={bid.id} 
              // CSS hiệu ứng chớp màu vàng khi isNew = true
              className={`flex items-center justify-between p-5 rounded-xl border transition-all duration-1000 ease-out shadow-sm
                ${bid.isNew ? 'bg-yellow-100 border-yellow-300 scale-[1.01]' : 'bg-white border-gray-100 scale-100 hover:shadow-md'}
              `}
            >
              <div className="flex items-center space-x-5">
                <div className={`h-12 w-12 rounded-full flex items-center justify-center font-bold text-lg
                  ${bid.isNew ? 'bg-yellow-200 text-yellow-800' : 'bg-blue-100 text-blue-700'}
                `}>
                  {bid.companyId.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-gray-800 font-semibold text-lg flex items-center gap-2">
                    Công ty {bid.companyId}
                    {bid.isNew && <span className="text-[10px] bg-red-500 text-white px-2 py-0.5 rounded-full uppercase font-bold animate-pulse">Mới</span>}
                  </h3>
                  <div className="flex items-center text-sm text-gray-500 mt-1 space-x-3">
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                      Biển số: {bid.truckId}
                    </span>
                    <span>•</span>
                    <span>{new Date(bid.createdAt).toLocaleTimeString('vi-VN')}</span>
                  </div>
                  {bid.message && (
                    <p className="text-sm text-gray-600 mt-2 italic border-l-2 border-gray-200 pl-2">"{bid.message}"</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {bid.bidPrice.toLocaleString('vi-VN')} <span className="text-sm text-gray-500 font-normal">VNĐ</span>
                </div>
                <button 
                  onClick={() => handleAcceptBid(bid.id)}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors text-sm shadow-sm"
                >
                  Chấp nhận giá này
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
