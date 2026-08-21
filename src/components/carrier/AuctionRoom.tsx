'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { axiosClient } from '@/configs/axiosClient';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import {
  Truck,
  MapPin,
  Package,
  Weight,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Send,
  Radio,
  DollarSign,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

// ==========================================
// INTERFACES & TYPES
// ==========================================

export type BidStatus = 'INVITED' | 'JOINED' | 'SUBMITTED' | 'REJECTED' | 'ACCEPTED' | 'CANCELLED';

export interface OrderInfo {
  orderId: string;
  pickupLocation: string;
  deliveryLocation: string;
  cargoType: string;
  weight: string | number;
  priceStart?: number;
  notes?: string;
}

export interface BidDetailResponse {
  bidId: string;
  orderId: string;
  companyId: string;
  status: BidStatus;
  order: OrderInfo;
  currentLowestPrice?: number;
}

export interface PriceUpdatedPayload {
  orderId: string;
  lowestPrice: number;
  companyId?: string;
  bidId?: string;
  timestamp?: string;
}

interface AuctionRoomProps {
  bidId: string;
  companyId?: string;
  onDecline?: () => void;
}

// ==========================================
// COMPONENT: AuctionRoom
// ==========================================

export default function AuctionRoom({ bidId, companyId = 'default-company', onDecline }: AuctionRoomProps) {
  // State quản lý dữ liệu và UI
  const [bidDetail, setBidDetail] = useState<BidDetailResponse | null>(null);
  const [status, setStatus] = useState<BidStatus>('INVITED');
  const [lowestPrice, setLowestPrice] = useState<number | null>(null);
  const [inputPrice, setInputPrice] = useState<string>('');
  
  // State loading & error
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmittingJoin, setIsSubmittingJoin] = useState<boolean>(false);
  const [isSubmittingPrice, setIsSubmittingPrice] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Effect nhấp nháy cho bảng điện tử
  const [isFlashing, setIsFlashing] = useState<boolean>(false);
  const socketRef = useRef<Socket | null>(null);

  // ------------------------------------------
  // 1. FETCH DỮ LIỆU THẬT (ON MOUNT)
  // ------------------------------------------
  const fetchBidDetail = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const response = await axiosClient.get<{ data: BidDetailResponse } | BidDetailResponse>(
        `/api/v1/bids/${bidId}/detail`
      );
      
      const data = 'data' in response.data ? response.data.data : response.data;
      setBidDetail(data);
      setStatus(data.status || 'INVITED');
      if (data.currentLowestPrice) {
        setLowestPrice(data.currentLowestPrice);
      } else if (data.order?.priceStart) {
        setLowestPrice(data.order.priceStart);
      }
    } catch (err: any) {
      console.error('Lỗi fetch chi tiết Bid:', err);
      setIsError(true);
      const msg = err.response?.data?.message || 'Không thể tải thông tin phòng đấu giá.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [bidId]);

  useEffect(() => {
    if (bidId) {
      fetchBidDetail();
    }
  }, [bidId, fetchBidDetail]);

  // ------------------------------------------
  // 2. GIAO DIỆN BƯỚC 1: ĐỒNG Ý THAM GIA PHÒNG ĐẤU GIÁ
  // ------------------------------------------
  const handleJoinAuction = async () => {
    setIsSubmittingJoin(true);
    try {
      const response = await axiosClient.post(`/api/v1/bids/${bidId}/join`);
      if (response.status === 200 || response.status === 201) {
        setStatus('JOINED');
        toast.success('Bạn đã tham gia phòng đấu giá thành công!');
      }
    } catch (err: any) {
      console.error('Lỗi khi tham gia phòng đấu giá:', err);
      const msg = err.response?.data?.message || 'Không thể tham gia phòng đấu giá. Vui lòng thử lại!';
      toast.error(msg);
    } finally {
      setIsSubmittingJoin(false);
    }
  };

  const handleDeclineAuction = () => {
    if (onDecline) {
      onDecline();
    } else {
      toast('Bạn đã từ chối tham gia phiên đấu giá này.', { icon: 'ℹ️' });
      setStatus('REJECTED');
    }
  };

  // ------------------------------------------
  // 3. GIAO DIỆN BƯỚC 2: KẾT NỐI SOCKET.IO KHI STATUS IS 'JOINED'
  // ------------------------------------------
  useEffect(() => {
    if (status !== 'JOINED' || !bidDetail?.orderId) return;

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
    
    // Khởi tạo kết nối Socket
    const socket = io(socketUrl, {
      transports: ['websocket'],
      autoConnect: true,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('🔗 Connected to Auction Socket Server:', socket.id);
      
      // Emit event join_auction_room với payload { orderId, companyId }
      socket.emit('join_auction_room', {
        orderId: bidDetail.orderId,
        companyId: companyId,
      });
    });

    // Lắng nghe event price_updated từ Server
    socket.on('price_updated', (payload: PriceUpdatedPayload) => {
      console.log('⚡ Mức giá mới nhận từ Socket:', payload);
      if (payload && payload.lowestPrice !== undefined) {
        setLowestPrice(payload.lowestPrice);
        
        // Kích hoạt hiệu ứng nhấp nháy 1s
        setIsFlashing(true);
        setTimeout(() => setIsFlashing(false), 1000);

        toast(`Giá sàn vừa cập nhật: ${payload.lowestPrice.toLocaleString('vi-VN')} VNĐ`, {
          icon: '📉',
        });
      }
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    // CLEANUP CONNECTION ON UNMOUNT OR STATUS CHANGE
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        console.log('🔌 Socket disconnected and cleaned up');
      }
    };
  }, [status, bidDetail?.orderId, companyId]);

  // ------------------------------------------
  // SUBMIT BÁO GIÁ MỚI VIA REST API
  // ------------------------------------------
  const handleSubmitPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceNum = parseFloat(inputPrice);

    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error('Vui lòng nhập mức giá hợp lệ lớn hơn 0');
      return;
    }

    if (lowestPrice && priceNum >= lowestPrice) {
      toast.error(`Giá gửi phải nhỏ hơn mức giá hiện tại (${lowestPrice.toLocaleString('vi-VN')} VNĐ)`);
      return;
    }

    setIsSubmittingPrice(true);
    try {
      const response = await axiosClient.post(`/api/v1/bids/${bidId}/submit-price`, {
        price: priceNum,
      });

      if (response.status === 200 || response.status === 201) {
        toast.success('Đã gửi mức giá báo thành công!');
        setInputPrice('');
      }
    } catch (err: any) {
      console.error('Lỗi khi gửi giá đấu:', err);
      const msg = err.response?.data?.message || 'Gửi mức giá thất bại. Vui lòng thử lại!';
      toast.error(msg);
    } finally {
      setIsSubmittingPrice(false);
    }
  };

  // ------------------------------------------
  // RENDER UI: LOADING SKELETON
  // ------------------------------------------
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-sm border border-slate-100 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/3 mb-6"></div>
        <div className="space-y-4">
          <div className="h-20 bg-slate-100 rounded-xl"></div>
          <div className="h-20 bg-slate-100 rounded-xl"></div>
          <div className="h-32 bg-slate-100 rounded-xl"></div>
        </div>
      </div>
    );
  }

  // ------------------------------------------
  // RENDER UI: ERROR STATE
  // ------------------------------------------
  if (isError || !bidDetail) {
    return (
      <div className="max-w-xl mx-auto p-8 bg-red-50 border border-red-200 rounded-2xl text-center my-8">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-red-800 mb-1">Không thể tải thông tin</h3>
        <p className="text-sm text-red-600 mb-4">{errorMessage || 'Đã có lỗi xảy ra khi truy vấn dữ liệu.'}</p>
        <button
          onClick={fetchBidDetail}
          className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl text-sm transition"
        >
          Thử lại
        </button>
      </div>
    );
  }

  const { order } = bidDetail;

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4 sm:p-6">
      {/* HEADER TOP CARD */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 opacity-10">
          <Truck className="w-64 h-64 text-white" />
        </div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-semibold tracking-wide">
                MÃ ĐƠN HÀNG: #{order?.orderId || bidDetail.orderId}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                status === 'JOINED' 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {status === 'JOINED' ? '🔴 ĐANG TRỰC TIẾP' : '⏳ CHỜ THAM GIA'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Phòng Đấu Giá Vận Tải B2B</h1>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-300 bg-white/5 backdrop-blur px-3 py-1.5 rounded-lg border border-white/10">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Xác thực bởi BackHaulBid Gateway</span>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------- */}
      {/* 2. GIAO DIỆN BƯỚC 1: XEM TRƯỚC (PREVIEW) - STATUS: INVITED */}
      {/* ---------------------------------------------------- */}
      {status === 'INVITED' && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <Package className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-800">Thông Tin Đơn Hàng Mời Đấu Giá</h2>
          </div>

          {/* LỘ TRÌNH VẬN CHUYỂN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Điểm nhận hàng (Pickup)</p>
                <p className="text-sm font-semibold text-slate-800">{order?.pickupLocation || 'Chưa cập nhật'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-100 text-red-600 rounded-lg shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Điểm giao hàng (Delivery)</p>
                <p className="text-sm font-semibold text-slate-800">{order?.deliveryLocation || 'Chưa cập nhật'}</p>
              </div>
            </div>
          </div>

          {/* CHI TIẾT HÀNG HÓA */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-100">
              <div className="flex items-center gap-1.5 text-xs text-indigo-600 font-medium mb-1">
                <Package className="w-4 h-4" />
                <span>Loại hàng hóa</span>
              </div>
              <p className="text-sm font-bold text-slate-800">{order?.cargoType || 'N/A'}</p>
            </div>

            <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-100">
              <div className="flex items-center gap-1.5 text-xs text-blue-600 font-medium mb-1">
                <Weight className="w-4 h-4" />
                <span>Khối lượng</span>
              </div>
              <p className="text-sm font-bold text-slate-800">{order?.weight ? `${order.weight} Tấn` : 'N/A'}</p>
            </div>

            <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-100 col-span-2 sm:col-span-1">
              <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium mb-1">
                <DollarSign className="w-4 h-4" />
                <span>Giá khởi điểm</span>
              </div>
              <p className="text-sm font-bold text-emerald-700">
                {order?.priceStart ? `${order.priceStart.toLocaleString('vi-VN')} VNĐ` : 'Thỏa thuận'}
              </p>
            </div>
          </div>

          {/* HÀNH ĐỘNG: XÁC NHẬN HOẶC TỪ CHỐI */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3">
            <button
              onClick={handleDeclineAuction}
              disabled={isSubmittingJoin}
              className="w-full sm:w-auto px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-sm transition flex items-center justify-center gap-2"
            >
              <XCircle className="w-4 h-4 text-slate-500" />
              <span>Từ chối</span>
            </button>

            <button
              onClick={handleJoinAuction}
              disabled={isSubmittingJoin}
              className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmittingJoin ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Đồng ý tham gia phòng đấu giá</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ---------------------------------------------------- */}
      {/* 3. GIAO DIỆN BƯỚC 2: PHÒNG LIVE (LIVE ROOM) - STATUS: JOINED */}
      {/* ---------------------------------------------------- */}
      {(status === 'JOINED' || status === 'SUBMITTED') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* BẢNG ĐIỆN TỬ MỨC GIÁ THẤP NHẤT */}
          <div className="lg:col-span-5 bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bảng điện tử Realtime</span>
                <span className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  <span>Socket Live</span>
                </span>
              </div>

              <p className="text-xs text-slate-500 font-medium mb-1">Mức giá thấp nhất hiện tại (Giá sàn)</p>
              
              {/* VÙNG GIÁ VỚI HIỆU ỨNG NHẤP NHÁY */}
              <div className={`p-4 rounded-xl transition-all duration-300 border ${
                isFlashing 
                  ? 'bg-amber-400 text-slate-950 scale-105 shadow-xl border-amber-500' 
                  : 'bg-slate-900 text-emerald-400 border-slate-800'
              }`}>
                <p className="text-xs font-medium opacity-80 mb-1">BEST BID PRICE</p>
                <div className="text-2xl sm:text-3xl font-black tracking-tight flex items-baseline gap-1">
                  {lowestPrice ? lowestPrice.toLocaleString('vi-VN') : '---'}
                  <span className="text-sm font-semibold opacity-70">VNĐ</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-2">
              <div className="flex justify-between">
                <span>Loại hàng:</span>
                <span className="font-semibold text-slate-700">{order?.cargoType}</span>
              </div>
              <div className="flex justify-between">
                <span>Khối lượng:</span>
                <span className="font-semibold text-slate-700">{order?.weight} Tấn</span>
              </div>
            </div>
          </div>

          {/* FORM NHẬP GIÁ ĐẤU */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 shadow-sm border border-slate-200 space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <Send className="w-4 h-4 text-indigo-600" />
                <span>Báo Giá Vận Chuyển</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Nhập mức giá cạnh tranh để giành quyền vận chuyển đơn hàng này.</p>
            </div>

            <form onSubmit={handleSubmitPrice} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Mức giá đề xuất của nhà xe (VNĐ)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={inputPrice}
                    onChange={(e) => setInputPrice(e.target.value)}
                    placeholder={lowestPrice ? `Thấp hơn ${lowestPrice.toLocaleString('vi-VN')}` : 'Nhập giá gửi...'}
                    className="w-full pl-4 pr-16 py-3 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-bold text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                    min="1"
                    step="10000"
                    required
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    VNĐ
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Mức giá gửi sẽ được ghi nhận vào Database qua API và tự động phát sóng tới tất cả các bên tham gia phòng đấu giá.
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmittingPrice || !inputPrice}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/25 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmittingPrice ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Gửi Giá Báo Ngay</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TRẠNG THÁI KHÁC (TỪ CHỐI / THÀNH CÔNG) */}
      {status === 'REJECTED' && (
        <div className="bg-slate-50 rounded-2xl p-8 text-center border border-slate-200 text-slate-600">
          <XCircle className="w-12 h-12 text-slate-400 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-800">Bạn đã từ chối tham gia</h3>
          <p className="text-xs text-slate-500 mt-1">Cảm ơn bạn đã quan tâm. Bạn có thể tham gia các đơn hàng khác trên sàn.</p>
        </div>
      )}
    </div>
  );
}
