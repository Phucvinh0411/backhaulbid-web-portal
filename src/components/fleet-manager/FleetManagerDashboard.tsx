"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useGlobalNotification } from "@/components/common/NotificationPopup";
import { emptyRouteService, EmptyRoute } from '@/services/emptyRouteService';
import { identityApi } from '@/services/identityApi';
import { getMyVehicles } from '@/services/fleetApi';
import { getApiErrorMessage } from '@/services/errorMessage';
import { useSocket } from '@/hooks/useSocket';

export interface MatchingEvent {
  routeId: string;
  orderId: string;
  truckId: string;
  message: string;
}

export default function FleetManagerDashboard() {
  const notify = useGlobalNotification();
  const [currentAccount, setCurrentAccount] = useState<{ accountId?: string } | null>(null);
  const [vehicles, setVehicles] = useState<Array<{
    id?: string;
    plate?: string;
    licensePlate?: string;
    type?: string;
    vehicleType?: string;
    capacity?: string;
    payloadCapacity?: number;
  }>>([]);
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
    expectedArrivalTime: '',
    latitude: '',
    longitude: '',
    origin: '',
    destination: '',
    destLatitude: '',
    destLongitude: '',
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
        const message = getApiErrorMessage(error, 'Không thể tải thông tin tài khoản và đội xe. Vui lòng thử lại.');
        setLoadError(message);
        notify.error(message);
      });

    return () => {
      active = false;
    };
  }, [notify]);

  const loadRoutes = useCallback(async () => {
    if (!currentCompanyId) return false;

    setIsLoading(true);
    setLoadError('');
    try {
      const data = await emptyRouteService.getEmptyRoutesByCompany();
      setEmptyRoutes(data || []);
      return true;
    } catch (error) {
      const message = getApiErrorMessage(error, 'Không thể tải danh sách xe rỗng. Vui lòng thử lại.');
      setEmptyRoutes([]);
      setLoadError(message);
      notify.error(message);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentCompanyId, notify]);

  useEffect(() => {
    loadRoutes();
  }, [loadRoutes]);

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
      notify.success(
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
  }, [listen, notify]);

  // Xử lý Submit Form khai báo
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.truckId || !formData.expectedEmptyTime || !currentCompanyId) {
      notify.error('Vui lòng điền đủ thông tin Biển số xe và Thời gian dự kiến');
      return;
    }

    const latitude = Number(formData.latitude);
    const longitude = Number(formData.longitude);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      notify.error('Vui lòng nhập tọa độ hợp lệ.');
      return;
    }

    // Điểm đến: nếu không nhập thì dùng cùng toạ độ điểm xuất phát (fallback)
    const destLat = formData.destLatitude ? Number(formData.destLatitude) : latitude;
    const destLng = formData.destLongitude ? Number(formData.destLongitude) : longitude;

    // Thời gian đến: nếu không nhập thì mặc định +12 giờ sau giờ xuất phát
    const departureDate = new Date(formData.expectedEmptyTime);
    const arrivalISO = formData.expectedArrivalTime
      ? new Date(formData.expectedArrivalTime).toISOString()
      : new Date(departureDate.getTime() + 12 * 60 * 60 * 1000).toISOString();

    setIsSubmitting(true);
    try {
      const payload = {
        truckId:             formData.truckId,
        companyId:           currentCompanyId,
        expectedEmptyTime:   departureDate.toISOString(),
        expectedArrivalTime: arrivalISO,
        latitude,
        longitude,
        destLatitude:        destLat,
        destLongitude:       destLng,
        origin:              formData.origin  || `${latitude}, ${longitude}`,
        destination:         formData.destination || `${destLat}, ${destLng}`,
      };

      await emptyRouteService.createEmptyRoute(payload);
      await loadRoutes();

      notify.success('Đã khai báo xe rỗng thành công. Hệ thống đang rà soát đơn hàng!');
      setFormData(prev => ({ ...prev, truckId: '', expectedEmptyTime: '', expectedArrivalTime: '', origin: '', destination: '', destLatitude: '', destLongitude: '' }));
    } catch (error) {
      notify.error(getApiErrorMessage(error, 'Không thể khai báo xe rỗng. Vui lòng kiểm tra thông tin và thử lại.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-sunken p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-ink mb-6">Trạm Điều Phối & Rà Soát Xe Rỗng</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Cột Trái: Form Khai báo */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-line p-6">
              <h2 className="text-lg font-semibold text-ink mb-4 flex items-center">
                <span className="bg-brand-soft text-brand p-2 rounded-lg mr-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                </span>
                Khai Báo Xe Rỗng
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Chọn biển số xe</label>
                  <select 
                    value={formData.truckId}
                    onChange={(e) => setFormData({...formData, truckId: e.target.value})}
                    className="w-full border-line-strong rounded-lg shadow-sm focus:border-brand focus:ring-brand p-2.5 border"
                  >
                    <option value="">-- Chọn xe --</option>
                    {vehicles.map((vehicle) => {
                      const plate = vehicle.plate || vehicle.licensePlate;
                      if (!plate) return null;
                      const typeLabel = vehicle.type || vehicle.vehicleType || "";
                      const cap = vehicle.capacity || (vehicle.payloadCapacity ? `${vehicle.payloadCapacity} tấn` : "");
                      const desc = [typeLabel, cap].filter(Boolean).join(" · ");
                      return (
                        <option key={vehicle.id || plate} value={plate}>
                          {plate} {desc ? `– ${desc}` : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Thời gian dự kiến rỗng hàng</label>
                  <input 
                    type="datetime-local" 
                    value={formData.expectedEmptyTime}
                    onChange={(e) => setFormData({...formData, expectedEmptyTime: e.target.value})}
                    className="w-full border-line-strong rounded-lg shadow-sm focus:border-brand focus:ring-brand p-2.5 border"
                  />
                  <p className="text-xs text-ink-muted mt-1">Giờ dự kiến xe hoàn tất trả hàng trước đó.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-ink mb-1">Tọa độ dự kiến (Vĩ độ - Kinh độ)</label>
                  <div className="flex gap-2">
                    <input 
                      type="number" 
                      step="any"
                      value={formData.latitude}
                      onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                      className="w-1/2 border-line-strong rounded-lg shadow-sm focus:border-brand focus:ring-brand p-2.5 border text-sm"
                      placeholder="Lat"
                    />
                    <input 
                      type="number" 
                      step="any"
                      value={formData.longitude}
                      onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                      className="w-1/2 border-line-strong rounded-lg shadow-sm focus:border-brand focus:ring-brand p-2.5 border text-sm"
                      placeholder="Lng"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full mt-4 flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-brand hover:bg-brand focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand disabled:opacity-70 disabled:cursor-not-allowed transition-all"
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
            <div className="bg-white rounded-xl shadow-sm border border-line overflow-hidden h-full flex flex-col">
              <div className="p-6 border-b border-line flex justify-between items-center bg-surface-sunken/50">
                <h2 className="text-lg font-semibold text-ink flex items-center">
                  <span className="relative flex h-3 w-3 mr-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
                  </span>
                  Radar Giám Sát Tuyến
                </h2>
                <span className="text-sm font-medium text-ink-muted bg-white px-3 py-1 rounded-full border border-line shadow-sm">
                  {emptyRoutes.length} Tuyến đang hoạt động
                </span>
              </div>
              
              <div className="flex-1 overflow-auto">
                {loadError && <div className="m-4 rounded-lg border border-danger-soft bg-danger-soft p-3 text-sm text-danger">{loadError}</div>}
                <table className="min-w-full divide-y divide-line">
                  <thead className="bg-surface-sunken sticky top-0 z-10">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-ink-muted uppercase tracking-wider">
                        Biển số xe
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-ink-muted uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-ink-muted uppercase tracking-wider">
                        Khung giờ dự kiến
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-ink-muted uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-line">
                    {isLoading ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-10 text-center text-ink-muted">
                          <CircularProgressSpinner />
                          <p className="mt-2 text-sm">Đang tải dữ liệu radar...</p>
                        </td>
                      </tr>
                    ) : emptyRoutes.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-6 py-10 text-center text-ink-muted">
                          <div className="flex flex-col items-center justify-center">
                            <svg className="w-12 h-12 text-line-strong mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M20 12H4M8 16l-4-4 4-4"></path></svg>
                            <p>Chưa có tuyến xe rỗng nào được khai báo.</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      emptyRoutes.map((route) => (
                        <tr key={route.id} className="hover:bg-brand-soft/30 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0 bg-surface-sunken rounded-lg flex items-center justify-center border border-line">
                                <svg className="w-6 h-6 text-ink-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-semibold text-ink">{route.truckId}</div>
                                <div className="text-xs text-ink-muted font-mono">ID: {route.id.substring(0,8)}...</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {route.status === 'PENDING' ? (
                              <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-warning-soft text-warning border border-warning-soft">
                                <span className="w-1.5 h-1.5 rounded-full bg-warning mr-1.5 mt-1"></span>
                                Đang dò tìm
                              </span>
                            ) : route.status === 'MATCHED' ? (
                              <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-success-soft text-success border border-success-soft shadow-sm animate-pulse-once">
                                <span className="w-1.5 h-1.5 rounded-full bg-success mr-1.5 mt-1"></span>
                                Đã chốt đơn
                              </span>
                            ) : (
                              <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-surface-sunken text-ink border border-line">
                                Đã Hủy
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-ink">
                              {new Date(route.expectedEmptyTime).toLocaleDateString('vi-VN')}
                            </div>
                            <div className="text-xs text-ink-muted">
                              {new Date(route.expectedEmptyTime).toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button className="text-brand hover:text-brand transition-colors">
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
  <svg className="animate-spin h-8 w-8 text-brand mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);
