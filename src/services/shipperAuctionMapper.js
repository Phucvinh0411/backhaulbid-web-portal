const UNKNOWN = "Chưa cập nhật";

const parseDecimal = (value) => {
  if (value === null || value === undefined || value === "") return 0;
  if (typeof value === "object" && value.$numberDecimal) {
    return Number(value.$numberDecimal) || 0;
  }
  return Number(value) || 0;
};

const asText = (...values) => {
  const value = values.find(
    (item) => item !== undefined && item !== null && String(item).trim() !== "",
  );
  return value === undefined ? "" : String(value);
};

const formatQuantity = (value, unit) => {
  const number = parseDecimal(value);
  return number > 0 ? `${number} ${unit}` : UNKNOWN;
};

const getAddress = (location = {}, fallback = "") =>
  asText(location.address, location.detailAddress, fallback, location.province, UNKNOWN);

const getProvince = (location = {}, fallback = "") =>
  asText(location.province, fallback, UNKNOWN);

const getVehicleType = (auction) =>
  asText(auction.vehicleTypeRequired, auction.requiredVehicleType, auction.vehicleType);

const getParticipationFee = (auction) =>
  parseDecimal(auction.participationFeeAmount ?? auction.participationFee);

export const mapStatusToFrontend = (backendStatus) => {
  switch (backendStatus) {
    case "PENDING":
    case "UPCOMING":
      return "pending_bids";
    case "OPEN":
    case "ACTIVE":
    case "IN_PROGRESS":
      return "active_bids";
    case "AWARDED":
    case "SIGNED":
      return "awarded";
    case "WAITING_PICKUP":
    case "PICKED_UP":
    case "IN_TRANSIT":
    case "DELIVERED":
      return "shipping";
    case "COMPLETED":
    case "ENDED":
      return "completed";
    case "CANCELLED":
      return "cancelled";
    default:
      return "pending_bids";
  }
};

export const mapBackendToShipment = (auction = {}) => {
  const pickupLocation = auction.pickupLocation || auction.route?.from || {};
  const deliveryLocation = auction.deliveryLocation || auction.route?.to || {};
  const title = asText(auction.title, auction.goodsName, auction.goodsInfo?.goodsName);
  const goodsType = asText(
    auction.goodsType,
    auction.goodsInfo?.goodsName,
    auction.cargoType,
    title,
    "Không xác định",
  );
  const fromProvince = getProvince(pickupLocation, auction.originProvince || auction.origin);
  const fromDetail = getAddress(pickupLocation, auction.originAddress || auction.origin);
  const toProvince = getProvince(deliveryLocation, auction.destinationProvince || auction.destination);
  const toDetail = getAddress(deliveryLocation, auction.destinationAddress || auction.destination);
  const maxPrice = parseDecimal(auction.maxPrice ?? auction.auctionConfig?.maxPrice);
  const winningBidAmount = parseDecimal(auction.winningBidAmount ?? auction.winningBid?.amount);
  const finalPrice = parseDecimal(auction.finalPrice) || winningBidAmount;
  const frontendStatus = mapStatusToFrontend(auction.trip?.status || auction.status);

  return {
    id: auction.id || auction._id || auction.auctionCode || "Chưa có mã",
    title,
    goodsType,
    weight: formatQuantity(auction.weight ?? auction.goodsInfo?.weight, "tấn"),
    volume: formatQuantity(auction.volume ?? auction.goodsInfo?.volume, "m³"),
    maxPrice,
    currentLowestBid: parseDecimal(auction.currentLowestBid ?? auction.lowestBid),
    bidCount: Number(auction.bidCount ?? auction.totalBids ?? 0),
    finalPrice,
    dateCreated: auction.createdAt || auction.createdTime || auction.startTime || null,
    closeTime: auction.endTime || auction.auctionConfig?.endTime || null,
    status: frontendStatus,
    auctionType: auction.auctionType || auction.auctionConfig?.auctionType || "PUBLIC",
    carrier: asText(
      auction.winningCarrierName,
      auction.carrierName,
      auction.winningBid?.carrierName,
      auction.winningBidId,
    ),
    auctionCreator: asText(auction.shipperName, auction.shipperId),
    regStartTime: auction.registrationStartTime || auction.regStartTime || null,
    regEndTime: auction.registrationEndTime || auction.regEndTime || null,
    startTime: auction.startTime || null,
    endTime: auction.endTime || auction.auctionConfig?.endTime || null,
    priceStep: parseDecimal(auction.priceStep ?? auction.auctionConfig?.priceStep),
    maxBids: auction.maxBids ?? null,
    participationFee: getParticipationFee(auction),
    depositAmount: parseDecimal(auction.depositAmount),
    requiredVehicleType: getVehicleType(auction),
    requiredVehicleDims: auction.requiredVehicleDims || auction.vehicleDimensions || auction.vehicleSpecs || null,
    goodsCategory: asText(auction.goodsCategory, auction.goodsType),
    requiredTemp: auction.requiredTemp ?? null,
    goodsValue: parseDecimal(auction.goodsValue),
    description: asText(auction.description, auction.goodsDescription, auction.notes),
    goodsNotes: asText(auction.goodsNotes, auction.notes),
    earliestPickup: pickupLocation.earliestTime || auction.earliestPickup || null,
    latestPickup: pickupLocation.latestTime || auction.latestPickup || null,
    earliestDelivery: deliveryLocation.earliestTime || auction.earliestDelivery || null,
    latestDelivery: deliveryLocation.latestTime || auction.latestDelivery || null,
    driverName: asText(auction.trip?.driverName, auction.driverName),
    driverPlate: asText(auction.trip?.vehiclePlate, auction.vehiclePlate),
    tripStatus: auction.trip?.status || null,
    tripId: auction.trip?.id || auction.tripId || null,
    cancelReason: asText(auction.cancelReason, auction.cancellationReason),
    from: {
      name: asText(pickupLocation.name, pickupLocation.locationName, auction.originLocationName, fromProvince),
      address: fromDetail,
      detail: fromDetail,
      province: fromProvince,
    },
    to: {
      name: asText(deliveryLocation.name, deliveryLocation.locationName, auction.destinationLocationName, toProvince),
      address: toDetail,
      detail: toDetail,
      province: toProvince,
    },
    originalData: auction,
  };
};

export const mapBackendToBid = (bid = {}, index = 0, bids = []) => {
  const amount = parseDecimal(bid.bidAmount ?? bid.amount);
  const lowest = bids.length
    ? Math.min(...bids.map((item) => parseDecimal(item.bidAmount ?? item.amount)).filter((value) => value > 0))
    : amount;

  return {
    ...bid,
    id: bid.id || bid._id || `bid-${index + 1}`,
    carrierId: bid.carrierId || bid.carrierCode || "",
    carrierCode: bid.carrierCode || bid.carrierId || "",
    carrierName: bid.carrierName || bid.carrierId || "Nhà xe chưa cập nhật tên",
    bidAmount: amount,
    time: bid.bidTime || bid.createdAt || null,
    isLowest: amount > 0 && amount === lowest,
  };
};

export const formatAuctionCurrency = (value) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

export const formatAuctionDateTime = (value) => {
  if (!value) return UNKNOWN;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return UNKNOWN;
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

export const formatAuctionTimeRange = (start, end) => {
  if (!start && !end) return UNKNOWN;
  if (!start) return `Đến ${formatAuctionDateTime(end)}`;
  if (!end) return `Từ ${formatAuctionDateTime(start)}`;
  return `${formatAuctionDateTime(start)} - ${formatAuctionDateTime(end)}`;
};

export const calculateTripProgress = (status) => {
  switch (status) {
    case "WAITING_PICKUP":
      return 10;
    case "PICKED_UP":
      return 35;
    case "IN_TRANSIT":
      return 65;
    case "DELIVERED":
      return 90;
    case "COMPLETED":
      return 100;
    default:
      return 0;
  }
};
