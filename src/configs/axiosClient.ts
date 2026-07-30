import axios from 'axios';

// Cấu hình Axios Client gọi thẳng tới Gateway
export const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_GATEWAY_URL || 'http://localhost:8080',
  withCredentials: true, // Quan trọng: Cho phép trình duyệt đính kèm Cookie
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response Interceptor xử lý tự động refresh token khi nhận 401
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Đảm bảo không bị lặp vô hạn
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Gọi lên Server Action / API Route của Next.js để làm mới Token
        const refreshRes = await axios.post('/api/auth/refresh');
        
        if (refreshRes.status === 200) {
          // Token Cookie đã được Next.js âm thầm cập nhật ở background
          // Tự động gọi lại request cũ, Cookie mới sẽ tự động được gửi đi
          return axiosClient(originalRequest);
        }
      } catch (refreshError) {
        // Nếu API refresh lỗi (hết hạn refreshToken) -> Chuyển về trang đăng nhập
        if (typeof window !== 'undefined') {
           window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
