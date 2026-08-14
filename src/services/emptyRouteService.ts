import { appApiService } from "./apiService";

export interface EmptyRoute {
  id: string;
  truckId: string;
  companyId: string;
  expectedEmptyTime: string;
  latitude: number;
  longitude: number;
  status: 'PENDING' | 'MATCHED' | 'CANCELLED';
}

export interface EmptyRouteRequest {
  truckId: string;
  companyId: string;
  expectedEmptyTime: string; // ISO String
  latitude: number;
  longitude: number;
}

class EmptyRouteService {
  /**
   * Khai báo tuyến chạy rỗng mới
   */
  async createEmptyRoute(data: EmptyRouteRequest): Promise<EmptyRoute> {
    return appApiService.post<EmptyRoute>('/api/v1/empty-routes', data);
  }

  /**
   * Lấy danh sách các tuyến chạy rỗng của công ty
   */
  async getEmptyRoutesByCompany(companyId: string): Promise<EmptyRoute[]> {
    // API endpoint này phụ thuộc vào thiết kế Backend (ví dụ có query param ?companyId=...)
    return appApiService.get<EmptyRoute[]>('/api/v1/empty-routes', { companyId });
  }
}

export const emptyRouteService = new EmptyRouteService();
