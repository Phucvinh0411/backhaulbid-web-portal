import { apiService } from "./apiService";

const VEHICLE_TYPE_LABELS = {
  TRUCK_SMALL: "Xe tải nhỏ",
  TRUCK_MEDIUM: "Xe tải trung",
  TRUCK_HEAVY: "Xe tải nặng",
  CONTAINER_TRACTOR: "Xe đầu kéo container",
  REFRIGERATED_TRUCK: "Xe tải đông lạnh",
  SPECIALIZED_TRUCK: "Xe chuyên dụng",
};

export const getMyVehicles = async () => {
  const res = await apiService.get("/api/v1/vehicles/mine");
  const vehicles = res?.data || res;
  return (Array.isArray(vehicles) ? vehicles : []).map((vehicle) => ({
    ...vehicle,
    plate: vehicle.licensePlate,
    capacity: `${vehicle.payloadCapacity || 0} tấn`,
    type: vehicle.bodyType || VEHICLE_TYPE_LABELS[vehicle.vehicleType] || vehicle.vehicleType,
    verification: vehicle.status,
    active: vehicle.status !== "INACTIVE",
  }));
};

export const createVehicle = (payload) => apiService.post("/api/v1/vehicles", payload);

export const createVehiclesBulk = (payload) => apiService.post("/api/v1/vehicles/bulk", payload);

export const updateVehicle = (vehicleId, payload) =>
  apiService.patch(`/api/v1/vehicles/${vehicleId}`, payload);

export const deactivateVehicle = (vehicleId) =>
  apiService.delete(`/api/v1/vehicles/${vehicleId}`);

export const getMyDrivers = async () => {
  const res = await apiService.get("/api/v1/drivers/mine").catch(() => []);
  const drivers = res?.data || res;
  return (Array.isArray(drivers) ? drivers : []).map((driver) => ({
    ...driver,
    name: driver.fullName,
    licenseClass: driver.licenseNumber,
    verification: driver.status,
    active: driver.status === "VERIFIED",
  }));
};

export const createDriver = (payload) => apiService.post("/api/v1/drivers", payload);

export const createDriversBulk = (payload) => apiService.post("/api/v1/drivers/bulk", payload);

export const updateDriver = (driverId, payload) =>
  apiService.patch(`/api/v1/drivers/${driverId}`, payload);

export const deleteDriver = (driverId) => apiService.delete(`/api/v1/drivers/${driverId}`);

export const getAdminVehicleReviews = (status = "PENDING") =>
  apiService.get("/api/v1/admin/fleet/vehicles", { status });

export const reviewAdminVehicle = (vehicleId, payload) =>
  apiService.patch(`/api/v1/admin/fleet/vehicles/${vehicleId}/verification`, payload);

export const getAdminDriverReviews = (status = "PENDING") =>
  apiService.get("/api/v1/admin/fleet/drivers", { status });

export const reviewAdminDriver = (driverId, payload) =>
  apiService.patch(`/api/v1/admin/fleet/drivers/${driverId}/verification`, payload);

export const declareEmptyRoute = (payload) =>
  apiService.post("/api/v1/empty-routes", payload);
