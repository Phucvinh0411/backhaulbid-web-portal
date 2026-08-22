"use client";

import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { emptyRouteService, EmptyRoute } from '@/services/emptyRouteService';
import { identityApi } from '@/services/identityApi';
import { getMyVehicles } from '@/services/fleetApi';
import { useSocket } from '@/hooks/useSocket';

export interface MatchingEvent {
  routeId: string;
  orderId: string;
  truckId: string;
  message: string;
}

export default function FleetManagerDashboard() {
  const [currentAccount, setCurrentAccount] = useState<{ accountId?: string } | null>(null);
  const [vehicles, setVehicles] = useState<Array<{ id?: string; plate?: string; licensePlate?: string }>>([]);
  const [loadError, setLoadError] = useState('');

  const currentCompanyId = currentAccount?.accountId;
  const currentUserId = currentAccount?.accountId;

  const { listen } = useSocket({ companyId: currentCompanyId, userId: currentUserId });

  // State
  const [emptyRoutes, setEmptyRoutes] = useState<EmptyRoute[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    truckId: '',
    expectedEmptyTime: '',
    latitude: '',
    longitude: ''
  });

  useEffect(() => {
    let active = true;
    Promise.all([identityApi.getCurrentAccount(), getMyVehicles()])
      .then(([account, accountVehicles]) => {
        if (!active) return;
        setCurrentAccount(account);
        setVehicles(accountVehicles);
      })
      .catch((error) => {
        if (!active) return;
        setLoadError(error?.response?.data?.message || 'Không thể tải thông tin tài khoản và đội xe.');
      });

    return () => {
      active = false;
    };
  }, []);

  // Fetch dữ liệu khởi tạo
  useEffect(() => {
    if (!currentCompanyId) return undefined;
    const fetchRoutes = async () => {
      setIsLoading(true);
      setLoadError('');
      try {
        const data = await emptyRouteService.getEmptyRoutesByCompany(currentCompanyId);
        setEmptyRoutes(data || []);
      } catch (error) {
        console.error("Lỗi khi tải danh sách xe rỗng:", error);
        setEmptyRoutes([]);
        setLoadError('Không thể tải danh sách xe rỗng từ hệ thống.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoutes();
  }, [currentCompanyId]);

  // Đăng ký nhận sự kiện Socket Real-time
  useEffect(() => {
    // Hàm này sẽ được gọi khi Gateway WebSocket (NestJS) bắn event 'new_matching_order'
    const unlisten = listen('new_matching_order', (eventData: MatchingEvent) => {
      console.log('🎉 Có thông báo ghép cặp mới:', eventData);

      // Cập nhật State trực tiếp MÀ KHÔNG GỌI LẠI API (Tránh giật Lag / Tốn băng thông)
      setEmptyRoutes((prevRoutes) => 
        prevRoutes.map(route => 
          route.id === eventData.routeId 
            ? { ...route, status: 'MATCHED' } 
            : route
        )
      );

      // Hiển thị thông báo Toast đẹp mắt
      toast.success(
        `🎉 Chuyến xe ${eventData.truckId} đã tìm thấy đơn hàng phù hợp! Bấm để xem ngay.`,
        {
          duration: 5000,
          position: 'top-right',
        }
      );
    });

    return () => {
      if (unlisten) unlisten();
    };
  }, [listen]);

  // Xử lý Submit Form khai báo
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.truckId || !formData.expectedEmptyTime || !currentCompanyId) {
      toast.error('Vui lòng điền đủ thông tin Biển số xe và Thời gian dự kiến');
      return;
    }

    const latitude = Number(formData.latitude);
    const longitude = Number(formData.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      toast.error('Vui lòng nhập tọa độ hợp lệ.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        truckId: formData.truckId,
        companyId: currentCompanyId,
        // Chuyển đối thời gian từ input datetime-local sang chuẩn ISO để đẩy xuống Backend
        expectedEmptyTime: new Date(formData.expectedEmptyTime).toISOString(),
        latitude,
        longitude,
      };

      const newRoute = await emptyRouteService.createEmptyRoute(payload);
      
      // Update local state ngay lập tức thay vì gọi API get
      setEmptyRoutes(prev => [newRoute, ...prev]);
      
      toast.success('Đã khai báo xe rỗng thành công. Hệ thống đang rà soát đơn hàng!');
      setFormData(prev => ({ ...prev, truckId: '', expectedEmptyTime: '' }));
    } catch (error) {
      console.error("Lỗi khai báo:", error);
      toast.error('Có lỗi xảy ra khi khai báo xe rỗng');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Trạm Điều Phối & Rà Soát Xe Rỗng</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Cột Trái: Form Khai báo */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <span className="bg-blue-100 text-blue-600 p-2 rounded-lg mr-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                </span>
                Khai Báo Xe Rỗng
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Chọn biển số xe</label>
                  <select 
                    value={formData.truckId}
                    onChange={(e) => setFormData({...formData, truckId: e.target.value})}
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 border"
                  >
                    <option value="">-- Chọn xe --</option>
                    {vehicles.map((vehicle) => {
                      const plate = vehicle.plate || vehicle.licensePlate;
                      if (!plate) return null;
                      return <option key={vehicle.id || plate} value={plate}>{plate}</option>;
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian dự kiến rỗng hàng</label>
                  <input 
                    type="datetime-local" 
                    value={formData.expectedEmptyTime}
                    onChange={(e) => setFormData({...formData, expectedEmptyTime: e.target.value})}
                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 border"
                  />
                  <p className="text-xs text-gray-500 mt-1">Giờ dự kiến xe hoàn tất trả hàng trước đó.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tọa độ dự kiến (Vĩ độ - Kinh độ)</label>
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                      className="w-1/2 border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 border text-sm"
                      placeholder="Lat"
                    />
                    <input 
                      type="number" 
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                      className="w-1/2 border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 border text-sm"
                      placeholder="Lng"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full mt-4 flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang phát sóng...
                    </>
                  ) : (
                    "Phát sóng tìm đơn"
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Cột Phải: Radar Rà Soát (Bảng) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full flex flex-col">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                  <span className="relative flex h-3 w-3 mr-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                  Radar Giám Sát Tuyến
                </h2>
                <span className="text-sm font-medium text-gray-500 bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                  {emptyRoutes.length} Tuyến đang hoạt động
                </span>
              </div>
              
              <div className="flex-1 overflow-auto">
                {loadError && <div className="m-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{loadError}</div>}
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Biển số xe
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Khung giờ dự kiến
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {isLoading ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                          <CircularProgressSpinner />
                          <p className="mt-2 text-sm">Đang tải dữ liệu radar...</p>
                        </td>
                      </tr>
                    ) : emptyRoutes.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                          <div className="flex flex-col items-center justify-center">
                            <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 12H4M8 16l-4-4 4-4"></path></svg>
                            <p>Chưa có tuyến xe rỗng nào được khai báo.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      emptyRoutes.map((route) => (
                        <tr key={route.id} className="hover:bg-blue-50/30 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
                                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-semibold text-gray-900">{route.truckId}</div>
                                <div className="text-xs text-gray-500 font-mono">ID: {route.id.substring(0,8)}...</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {route.status === 'PENDING' ? (
                              <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mr-1.5 mt-1"></span>
                                Đang dò tìm
                              </span>
                            ) : route.status === 'MATCHED' ? (
                              <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 border border-green-200 shadow-sm animate-pulse-once">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 mt-1"></span>
                                Đã chốt đơn
                              </span>
                            ) : (
                              <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800 border border-gray-200">
                                Đã Hủy
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(route.expectedEmptyTime).toLocaleDateString('vi-VN')}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(route.expectedEmptyTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-blue-600 hover:text-blue-900 transition-colors">
                              Chi tiết
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

// Helper spinner component (nếu không import từ MUI)
const CircularProgressSpinner = () => (
  <svg className="animate-spin h-8 w-8 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);
