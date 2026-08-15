import { apiService } from "./apiService";

export const getAdminSettings = (scope) =>
  apiService.get(`/api/v1/admin/settings/${scope}`);

export const saveAdminSettings = (scope, values) =>
  apiService.put(`/api/v1/admin/settings/${scope}`, { values });
