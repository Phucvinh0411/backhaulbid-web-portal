import axios from "axios";
import { GATEWAY_URL } from "@/config/clientConfig";
import { dispatchGlobalNotification } from "@/components/common/NotificationPopup";
import { getApiErrorMessage } from "@/services/errorMessage";

const sharedConfig = {
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
};

// Axios client gọi thẳng tới API Gateway.
export const axiosClient = axios.create({
  baseURL: GATEWAY_URL,
  ...sharedConfig,
});

// Client gọi các API Route cùng origin do Next.js cung cấp.
export const appApiClient = axios.create(sharedConfig);

const notifyApiError = (error: any) => {
  const config = error?.config;
  if (config?.skipGlobalNotification || error?.response?.status === 401) return;

  dispatchGlobalNotification({
    type: "error",
    title: "Không thể thực hiện yêu cầu",
    message: getApiErrorMessage(error, "Không thể kết nối tới máy chủ."),
  });
};

// Response interceptor tự động refresh token khi nhận 401.
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshRes = await axios.post("/api/auth/refresh");

        if (refreshRes.status === 200) {
          return axiosClient(originalRequest);
        }
      } catch (refreshError) {
        if (typeof window !== "undefined" && window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
        notifyApiError(refreshError);
        return Promise.reject(refreshError);
      }
    }
    notifyApiError(error);
    return Promise.reject(error);
  },
);

appApiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    notifyApiError(error);
    return Promise.reject(error);
  },
);
