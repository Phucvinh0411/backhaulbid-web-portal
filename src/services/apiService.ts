import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { appApiClient, axiosClient } from '../configs/axiosClient';

/**
 * Interface cho chuẩn response trả về từ Spring Boot (tùy theo cấu trúc dự án của bạn).
 * Bạn có thể tùy chỉnh lại theo chuẩn chung của Backend.
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  // page, size, totalElements... dành cho phân trang
}

/**
 * Trạm Axios chung (Wrapper) để gọi API, tự động bắt lỗi và ép kiểu dữ liệu
 */
const createApiService = (client: AxiosInstance) => ({
  /**
   * Phương thức GET
   * @param url Đường dẫn API (ví dụ: '/api/v1/companies')
   * @param params Query string (ví dụ: { page: 1, limit: 10 })
   * @param config Cấu hình mở rộng của Axios
   */
  async get<T>(url: string, params?: object, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await client.get(url, { ...config, params });
    return response.data;
  },

  /**
   * Phương thức POST
   * @param url Đường dẫn API
   * @param data Dữ liệu payload (body)
   * @param config Cấu hình mở rộng của Axios
   */
  async post<T>(url: string, data?: object, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await client.post(url, data, config);
    return response.data;
  },

  /**
   * Phương thức PUT (Dùng để update toàn bộ object)
   */
  async put<T>(url: string, data?: object, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await client.put(url, data, config);
    return response.data;
  },

  /**
   * Phương thức PATCH (Dùng để update 1 phần nhỏ của object)
   */
  async patch<T>(url: string, data?: object, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await client.patch(url, data, config);
    return response.data;
  },

  /**
   * Phương thức DELETE
   */
  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response: AxiosResponse<T> = await client.delete(url, config);
    return response.data;
  }
});

// Dùng cho API của Spring Boot qua gateway.
export const apiService = createApiService(axiosClient);

// Dùng cho API Route cùng origin do Next.js cung cấp.
export const appApiService = createApiService(appApiClient);
