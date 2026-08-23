import { apiService } from "./apiService";

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
    return apiService.post<EmptyRoute>('/api/v1/empty-routes', data);
  }

  /**
   * Lấy danh sách các tuyến chạy rỗng của công ty
   */
  async getEmptyRoutesByCompany(): Promise<EmptyRoute[]> {
    return apiService.get<EmptyRoute[]>('/api/v1/empty-routes');
  }
}

export const emptyRouteService = new EmptyRouteService();
