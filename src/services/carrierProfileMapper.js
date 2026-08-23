const UNKNOWN = "Chưa cập nhật";

const formatPayload = (value) =>
  value === null || value === undefined ? UNKNOWN : `${value} tấn`;

const getInitials = (name) => {
  const parts = String(name || "N").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts.at(-1)[0]}`.toUpperCase();
};

export function mapCarrierProfile({ company, vehicles = [], drivers = [] }) {
  const companyName = company?.companyName || "Nhà xe chưa cập nhật tên";
  const verified = company?.verificationStatus === "VERIFIED";

  return {
    code: company?.accountId || UNKNOWN,
    carrierName: companyName,
    representative: company?.legalRepresentative || UNKNOWN,
    avatar: getInitials(companyName),
    badge: verified ? "Nhà xe đã xác minh" : "Chưa hoàn tất xác minh",
    verified,
    rating: UNKNOWN,
    completedTrips: UNKNOWN,
    onTimeRate: UNKNOWN,
    cancellationRate: UNKNOWN,
    taxCode: company?.taxCode || UNKNOWN,
    foundingYear: UNKNOWN,
    address: company?.address || UNKNOWN,
    hotline: company?.contactPhone || UNKNOWN,
    email: company?.contactEmail || UNKNOWN,
    licenseNo: UNKNOWN,
    insuranceAmount: UNKNOWN,
    fleet: vehicles.map((vehicle) => ({
      id: vehicle.id,
      plate: vehicle.licensePlate || UNKNOWN,
      type: vehicle.vehicleType || UNKNOWN,
      brand: vehicle.bodyType || UNKNOWN,
      dims: UNKNOWN,
      volume: UNKNOWN,
      payload: formatPayload(vehicle.payloadCapacity),
      gpsActive: false,
      status: vehicle.status || UNKNOWN,
    })),
    drivers: drivers.map((driver) => ({
      id: driver.id,
      name: driver.fullName || UNKNOWN,
      birthYear: UNKNOWN,
      phone: driver.phone || UNKNOWN,
      license: driver.licenseNumber || UNKNOWN,
      experience: UNKNOWN,
      safetyRecord: driver.status === "VERIFIED" ? "Đã xác thực" : "Chưa xác thực",
    })),
    reviews: [],
  };
}
