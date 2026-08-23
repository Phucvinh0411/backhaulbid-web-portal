const parseDecimal = (value) => {
  if (!value) return 0;
  if (typeof value === "object" && value.$numberDecimal) return Number(value.$numberDecimal);
  return Number(value) || 0;
};

export const mapStatusToFrontend = (backendStatus) => {
  switch (backendStatus) {
    case "PENDING":
    case "UPCOMING":
      return "pending_bids";
    case "ACTIVE":
    case "IN_PROGRESS":
      return "active_bids";
    case "COMPLETED":
    case "ENDED":
      return "awarded";
    case "CANCELLED":
      return "cancelled";
    default:
      return "pending_bids";
  }
};

export const mapBackendToShipment = (auction) => {
  const goodsType = auction.goodsType || auction.goodsInfo?.goodsName || auction.title || "Không xác định";
  const weight = auction.weight || auction.goodsInfo?.weight || 0;
  const volume = auction.volume || auction.goodsInfo?.volume || 0;
  const fromProvince = auction.pickupLocation?.province || auction.route?.from?.province || auction.origin || "Không rõ";
  const fromDetail = auction.pickupLocation?.address || auction.route?.from?.detailAddress || "Không rõ";
  const toProvince = auction.deliveryLocation?.province || auction.route?.to?.province || auction.destination || "Không rõ";
  const toDetail = auction.deliveryLocation?.address || auction.route?.to?.detailAddress || "Không rõ";
  const maxPrice = parseDecimal(auction.maxPrice || auction.auctionConfig?.maxPrice);

  return {
    id: auction.id || auction._id || auction.auctionCode || "N/A",
    goodsType,
    weight: `${weight} tấn`,
    volume: `${volume} m³`,
    maxPrice,
    currentLowestBid: parseDecimal(auction.currentLowestBid || auction.lowestBid),
    bidCount: Number(auction.bidCount || auction.totalBids || 0),
    finalPrice: parseDecimal(auction.finalPrice || auction.winningBid?.amount),
    dateCreated: auction.createdAt || auction.createdTime || auction.startTime || null,
    closeTime: auction.endTime || auction.auctionConfig?.endTime || null,
    status: mapStatusToFrontend(auction.status),
    auctionType: auction.auctionType || auction.auctionConfig?.auctionType || "PUBLIC",
    carrier: auction.winningCarrierName || auction.carrierName || "",
    auctionCreator: auction.shipperName || auction.shipperId || "",
    regStartTime: auction.registrationStartTime || auction.regStartTime || auction.startTime || null,
    regEndTime: auction.registrationEndTime || auction.regEndTime || auction.startTime || null,
    startTime: auction.startTime || auction.createdAt || null,
    endTime: auction.endTime || auction.auctionConfig?.endTime || null,
    priceStep: parseDecimal(auction.priceStep),
    maxBids: auction.maxBids ?? null,
    participationFee: parseDecimal(auction.participationFee),
    depositAmount: parseDecimal(auction.depositAmount),
    requiredVehicleType: auction.requiredVehicleType || auction.vehicleType || "",
    requiredVehicleDims: auction.requiredVehicleDims || auction.vehicleDimensions || null,
    goodsCategory: auction.goodsCategory || "",
    requiredTemp: auction.requiredTemp ?? null,
    goodsValue: parseDecimal(auction.goodsValue),
    description: auction.description || auction.goodsDescription || "",
    goodsNotes: auction.goodsNotes || "",
    from: {
      name: auction.pickupLocation?.name || fromProvince,
      address: fromDetail,
      province: fromProvince,
    },
    to: {
      name: auction.deliveryLocation?.name || toProvince,
      address: toDetail,
      province: toProvince,
    },
    originalData: auction,
  };
};

export const mapBackendToBid = (bid, index = 0, bids = []) => {
  const amount = parseDecimal(bid.bidAmount || bid.amount);
  const lowest = bids.length
    ? Math.min(...bids.map((item) => parseDecimal(item.bidAmount || item.amount)))
    : amount;
  return {
    ...bid,
    id: bid.id || bid._id || `bid-${index + 1}`,
    carrierId: bid.carrierId || bid.carrierCode || "",
    carrierCode: bid.carrierCode || bid.carrierId || "",
    carrierName: bid.carrierName || bid.carrierId || "Nhà xe chưa cập nhật tên",
    bidAmount: amount,
    time: bid.bidTime || bid.createdAt || null,
    isLowest: amount === lowest,
  };
};
