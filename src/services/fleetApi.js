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
  const vehicles = await apiService.get("/api/v1/vehicles/mine");
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

export const createVehicleWithDocuments = (formData) =>
  apiService.post("/api/v1/vehicles/with-documents", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const createVehiclesBulk = (payload) => apiService.post("/api/v1/vehicles/bulk", payload);

export const importVehiclesZip = (formData) =>
  apiService.post("/api/v1/vehicles/import-zip", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const previewVehiclesZip = (formData) =>
  apiService.post("/api/v1/vehicles/import-zip/preview", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateVehicle = (vehicleId, payload) =>
  apiService.patch(`/api/v1/vehicles/${vehicleId}`, payload);

export const updateVehicleWithDocuments = (vehicleId, formData) =>
  apiService.patch(`/api/v1/vehicles/${vehicleId}/with-documents`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deactivateVehicle = (vehicleId) =>
  apiService.delete(`/api/v1/vehicles/${vehicleId}`);

export const getMyDrivers = async () => {
  const drivers = await apiService.get("/api/v1/drivers/mine");
  return (Array.isArray(drivers) ? drivers : []).map((driver) => ({
    ...driver,
    name: driver.fullName,
    licenseClass: driver.licenseNumber,
    verification: driver.status,
    active: driver.status === "VERIFIED",
  }));
};

export const createDriver = (payload) => apiService.post("/api/v1/drivers", payload);

export const createDriverWithDocuments = (formData) =>
  apiService.post("/api/v1/drivers/with-documents", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const createDriversBulk = (payload) => apiService.post("/api/v1/drivers/bulk", payload);

export const importDriversZip = (formData) =>
  apiService.post("/api/v1/drivers/import-zip", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const previewDriversZip = (formData) =>
  apiService.post("/api/v1/drivers/import-zip/preview", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateDriver = (driverId, payload) =>
  apiService.patch(`/api/v1/drivers/${driverId}`, payload);

export const updateDriverWithDocuments = (driverId, formData) =>
  apiService.patch(`/api/v1/drivers/${driverId}/with-documents`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteDriver = (driverId) => apiService.delete(`/api/v1/drivers/${driverId}`);

export const getAdminVehicleReviews = (status = "PENDING") =>
  apiService.get("/api/v1/admin/fleet/vehicles", { status });

export const reviewAdminVehicle = (vehicleId, payload) =>
  apiService.patch(`/api/v1/admin/fleet/vehicles/${vehicleId}/verification`, payload);

export const getAdminDriverReviews = (status = "PENDING") =>
  apiService.get("/api/v1/admin/fleet/drivers", { status });

export const reviewAdminDriver = (driverId, payload) =>
  apiService.patch(`/api/v1/admin/fleet/drivers/${driverId}/verification`, payload);
