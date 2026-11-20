import { apiService } from "./apiService";
import {
  VEHICLE_TYPE_LABELS,
  mapDriver,
  mapDrivers,
  mapEmptyRoute,
  mapVehicle,
  mapVehicles,
} from "./mappers/fleetMapper";

export { VEHICLE_TYPE_LABELS };

export const getMyVehicles = () =>
  apiService.get("/api/v1/vehicles/mine").then(mapVehicles);

export const createVehicle = (payload) =>
  apiService.post("/api/v1/vehicles", payload).then(mapVehicle);

export const updateVehicle = (vehicleId, payload) =>
  apiService.patch(`/api/v1/vehicles/${vehicleId}`, payload).then(mapVehicle);

export const deactivateVehicle = (vehicleId) =>
  apiService.delete(`/api/v1/vehicles/${vehicleId}`);

export const getMyDrivers = () =>
  apiService.get("/api/v1/drivers/mine").then(mapDrivers);

export const createDriver = (payload) =>
  apiService.post("/api/v1/drivers", payload).then(mapDriver);

export const updateDriver = (driverId, payload) =>
  apiService.patch(`/api/v1/drivers/${driverId}`, payload).then(mapDriver);

export const deleteDriver = (driverId) =>
  apiService.delete(`/api/v1/drivers/${driverId}`);

export const getAdminVehicleReviews = (status = "PENDING") =>
  apiService.get("/api/v1/admin/fleet/vehicles", { status }).then(mapVehicles);

export const reviewAdminVehicle = (vehicleId, payload) =>
  apiService
    .patch(`/api/v1/admin/fleet/vehicles/${vehicleId}/verification`, payload)
    .then(mapVehicle);

export const getAdminDriverReviews = (status = "PENDING") =>
  apiService.get("/api/v1/admin/fleet/drivers", { status }).then(mapDrivers);

export const reviewAdminDriver = (driverId, payload) =>
  apiService
    .patch(`/api/v1/admin/fleet/drivers/${driverId}/verification`, payload)
    .then(mapDriver);

export const declareEmptyRoute = (payload) =>
  apiService.post("/api/v1/empty-routes", payload).then(mapEmptyRoute);
