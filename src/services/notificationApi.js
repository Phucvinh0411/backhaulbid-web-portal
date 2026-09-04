import { apiService } from "./apiService";

export const notificationApi = {
  /**
   * Tạo thông báo mới qua notification service
   * @param {{ userId: string, title: string, message: string, referenceId?: string, type?: string }} notificationData
   */
  createNotification: async (notificationData) => {
    return apiService.post("/api/v1/notifications/internal/create", notificationData);
  },
};
