import { apiService } from "./apiService";
import { mapNotifications } from "./mappers/notificationMapper";

export const notificationApi = {
  listMine: (config) =>
    apiService.get("/api/v1/notifications/mine", undefined, config).then(mapNotifications),

  markAllRead: (config) =>
    apiService.post("/api/v1/notifications/mark-all-read", {}, config),
};
