import { apiService } from "./apiService";

// ─── Response Model (từ backend) ──────────────────────────────────────────────
export interface EmptyRoute {
  id: string;
  /** Biển số xe */
  truckId: string;
  /** Loại xe: TRUCK_VAN, TRUCK_BOX, CONTAINER_TRACTOR... */
  truckType?: string;
  companyId: string;
  /** Tải trọng còn trống (tấn) */
  availableCapacity?: number;
  /** Địa chỉ điểm xuất phát */
  origin?: string;
  latitude: number;
  longitude: number;
  /** Địa chỉ điểm đến */
  destination?: string;
  destLatitude?: number;
  destLongitude?: number;
  /** ISO datetime – thời gian xe bắt đầu rỗng */
  expectedEmptyTime: string;
  /** ISO datetime – thời gian dự kiến đến nơi */
  expectedArrivalTime?: string;
  /** Bán kính tìm kiếm lô hàng xung quanh điểm xuất phát (km) */
  searchRadius?: number;
  status: 'PENDING' | 'MATCHED' | 'CANCELLED';
}

// ─── Request DTO (gửi lên backend) ───────────────────────────────────────────
export interface EmptyRouteRequest {
  truckId: string;
  /** Không cần gửi – được inject ở server */
  companyId?: string;
  /** Tải trọng còn trống (tấn). Nếu null → backend dùng payloadCapacity của xe */
  availableCapacity?: number | null;
  /** Bắt buộc */
  origin: string;
  latitude: number;
  longitude: number;
  /** Bắt buộc */
  destination: string;
  destLatitude: number;
  destLongitude: number;
  /** ISO String – bắt buộc */
  expectedEmptyTime: string;
  /** ISO String – bắt buộc */
  expectedArrivalTime: string;
  /** Bán kính tìm kiếm (km). Mặc định 50 */
  searchRadius?: number;
}

class EmptyRouteService {
  /**
   * Khai báo tuyến chạy rỗng mới.
   * Yêu cầu vai trò CARRIER và xe đã VERIFIED.
   */
  async createEmptyRoute(data: EmptyRouteRequest): Promise<EmptyRoute> {
    return apiService.post<EmptyRoute>('/api/v1/empty-routes', data);
  }

  /**
   * Lấy danh sách tuyến chạy rỗng của công ty đang đăng nhập.
   */
  async getEmptyRoutesByCompany(): Promise<EmptyRoute[]> {
    return apiService.get<EmptyRoute[]>('/api/v1/empty-routes');
  }
}

export const emptyRouteService = new EmptyRouteService();
