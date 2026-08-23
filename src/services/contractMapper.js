function formatCurrency(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "Chưa cập nhật";
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(value) {
  if (!value) {
    return "Chưa cập nhật";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Chưa cập nhật";
  }

  return new Intl.DateTimeFormat("vi-VN").format(date);
}

function getPartnerLabel(id, roleLabel) {
  return id ? `Mã ${roleLabel}: ${id}` : `Chưa cập nhật ${roleLabel}`;
}

function mapStatus(status, tripStatus) {
  if (status === "CANCELLED" || tripStatus === "CANCELLED") {
    return "CANCELLED";
  }

  if (status === "SIGNED") {
    return tripStatus === "COMPLETED" ? "COMPLETED" : "ACTIVE";
  }

  return "PENDING_SIGNATURE";
}

export function mapContractResponse(response = {}, role = "carrier") {
  const trip = response.trip || {};
  const isShipper = role === "shipper";

  return {
    backendId: response.id,
    id: response.contractCode || response.id || "Chưa có mã hợp đồng",
    tripId: response.tripId || trip.id || null,
    auctionId: response.tripId || "Chưa có mã chuyến",
    origin: trip.pickupLocation || "Chưa cập nhật điểm nhận",
    destination: trip.deliveryLocation || "Chưa cập nhật điểm giao",
    pickupAddress: trip.pickupLocation || "",
    deliveryAddress: trip.deliveryLocation || "",
    cargoType: "Chưa cập nhật thông tin hàng hóa",
    value: formatCurrency(trip.agreedPrice),
    date: formatDate(response.createdAt || trip.createdAt),
    status: mapStatus(response.status, trip.status),
    shipperName: getPartnerLabel(response.shipperId, "chủ hàng"),
    carrierName: getPartnerLabel(response.carrierId, "nhà xe"),
    partnerId: isShipper ? response.carrierId : response.shipperId,
    pdfUrl: response.pdfUrl || "",
    signatures: Array.isArray(response.signatures) ? response.signatures : [],
  };
}

export function mapContractResponses(response, role = "carrier") {
  const values = Array.isArray(response) ? response : response?.data;
  return Array.isArray(values)
    ? values.map((contract) => mapContractResponse(contract, role))
    : [];
}
