import {
  mapPageResponse,
  toId,
  toIsoString,
  toNullableNumber,
  toNumber,
  unwrapData,
  unwrapList,
} from "./primitives.js";

function mapLocation(location) {
  if (!location || typeof location !== "object") return null;
  return {
    locationName: location.locationName ?? location.name ?? null,
    address: location.address ?? location.detailAddress ?? null,
    province: location.province ?? null,
    contactName: location.contactName ?? null,
    contactPhone: location.contactPhone ?? null,
    latitude: toNullableNumber(location.latitude),
    longitude: toNullableNumber(location.longitude),
    coordinateSource: location.coordinateSource ?? location.source ?? null,
    earliestTime: toIsoString(location.earliestTime),
    latestTime: toIsoString(location.latestTime),
  };
}

export function mapAwardProgress(raw) {
  if (!raw || typeof raw !== "object") return null;
  return {
    currentAttempt: toNumber(raw.currentAttempt, 0),
    maximumAttempts: toNumber(raw.maximumAttempts, 4),
    status: raw.status ?? null,
    signingDeadlineAt: toIsoString(raw.signingDeadlineAt),
  };
}

export function mapAuction(response) {
  const raw = unwrapData(response);
  if (!raw || typeof raw !== "object") return null;

  const pickupLocation = mapLocation(raw.pickupLocation);
  const deliveryLocation = mapLocation(raw.deliveryLocation);
  const vehicleSpecs = raw.vehicleSpecs
    ? {
        ...raw.vehicleSpecs,
        length: toNullableNumber(raw.vehicleSpecs.length),
        width: toNullableNumber(raw.vehicleSpecs.width),
        height: toNullableNumber(raw.vehicleSpecs.height),
      }
    : null;

  return {
    id: toId(raw),
    shipperId: raw.shipperId ?? null,
    title: raw.title ?? "",
    goodsType: raw.goodsType ?? "",
    weight: toNumber(raw.weight, 0),
    volume: toNullableNumber(raw.volume),
    goodsValue: toNullableNumber(raw.goodsValue),
    vehicleTypeRequired: raw.vehicleTypeRequired ?? null,
    requiredTemp: toNullableNumber(raw.requiredTemp),
    vehicleSpecs,
    requiredVehicleDims: raw.requiredVehicleDims ?? vehicleSpecs,
    origin: raw.origin ?? pickupLocation?.province ?? "",
    destination: raw.destination ?? deliveryLocation?.province ?? "",
    pickupLocation,
    deliveryLocation,
    originLocationName: raw.originLocationName ?? pickupLocation?.locationName ?? null,
    originAddress: raw.originAddress ?? pickupLocation?.address ?? null,
    originProvince: raw.originProvince ?? pickupLocation?.province ?? null,
    originContactName: raw.originContactName ?? pickupLocation?.contactName ?? null,
    originContactPhone: raw.originContactPhone ?? pickupLocation?.contactPhone ?? null,
    destinationLocationName:
      raw.destinationLocationName ?? deliveryLocation?.locationName ?? null,
    destinationAddress: raw.destinationAddress ?? deliveryLocation?.address ?? null,
    destinationProvince: raw.destinationProvince ?? deliveryLocation?.province ?? null,
    destinationContactName:
      raw.destinationContactName ?? deliveryLocation?.contactName ?? null,
    destinationContactPhone:
      raw.destinationContactPhone ?? deliveryLocation?.contactPhone ?? null,
    earliestPickup: toIsoString(raw.earliestPickup ?? pickupLocation?.earliestTime),
    latestPickup: toIsoString(raw.latestPickup ?? pickupLocation?.latestTime),
    earliestDelivery: toIsoString(raw.earliestDelivery ?? deliveryLocation?.earliestTime),
    latestDelivery: toIsoString(raw.latestDelivery ?? deliveryLocation?.latestTime),
    auctionType: raw.auctionType ?? "PUBLIC",
    requireCarrierCoverage: Boolean(raw.requireCarrierCoverage),
    maxPrice: toNumber(raw.maxPrice, 0),
    priceStep: toNullableNumber(raw.priceStep),
    maxBids: toNullableNumber(raw.maxBids),
    images: Array.isArray(raw.images) ? raw.images : [],
    notes: raw.notes ?? "",
    isDepositRequired: Boolean(raw.isDepositRequired),
    depositAmount: toNullableNumber(raw.depositAmount),
    participationFeeTier: raw.participationFeeTier ?? null,
    participationFeeAmount: toNumber(raw.participationFeeAmount, 0),
    creationFeeTier: raw.creationFeeTier ?? null,
    creationFeeAmount: toNullableNumber(raw.creationFeeAmount),
    creationFeeStatus: raw.creationFeeStatus ?? null,
    registrationStartTime: toIsoString(raw.registrationStartTime),
    registrationEndTime: toIsoString(raw.registrationEndTime),
    startTime: toIsoString(raw.startTime),
    endTime: toIsoString(raw.endTime),
    status: raw.status ?? "PENDING",
    registrationOpen: Boolean(raw.registrationOpen),
    roomOpen: Boolean(raw.roomOpen),
    winningBidId: raw.winningBidId ?? null,
    winningBidAmount: toNullableNumber(raw.winningBidAmount),
    currentLowestBid: toNullableNumber(raw.currentLowestBid ?? raw.lowestBid),
    bidCount: toNumber(raw.bidCount ?? raw.totalBids, 0),
    awardStatus: raw.awardStatus ?? null,
    awardTripId: raw.awardTripId ?? null,
    awardError: raw.awardError ?? null,
    awardProgress: mapAwardProgress(raw.awardProgress),
    cancellationReason: raw.cancellationReason ?? null,
    fraudFlag: Boolean(raw.fraudFlag),
    fraudReason: raw.fraudReason ?? null,
    createdAt: toIsoString(raw.createdAt),
    updatedAt: toIsoString(raw.updatedAt),
  };
}

export function mapAuctionListResponse(response) {
  return mapPageResponse(response, mapAuction);
}

export function mapBid(response) {
  const raw = unwrapData(response);
  if (!raw || typeof raw !== "object") return null;

  const amount = toNumber(raw.bidAmount ?? raw.amount, 0);
  const bidTime = toIsoString(raw.bidTime ?? raw.createdAt);

  return {
    id: toId(raw),
    auctionId: raw.auctionId ?? null,
    carrierId: raw.carrierId ?? null,
    carrierCode: raw.carrierCode ?? raw.carrierId ?? null,
    carrierName: raw.carrierName ?? null,
    bidAmount: amount,
    amount,
    bidTime,
    time: bidTime,
    idempotencyKey: raw.idempotencyKey ?? null,
  };
}

export function mapBidListResponse(response) {
  return mapPageResponse(response, mapBid);
}

export function mapRegistration(response) {
  const raw = unwrapData(response);
  if (!raw || typeof raw !== "object") return null;

  return {
    id: toId(raw),
    auctionId: raw.auctionId ?? null,
    carrierId: raw.carrierId ?? null,
    vehicleId: raw.vehicleId ?? null,
    status: raw.status ?? null,
    paymentStatus: raw.paymentStatus ?? null,
    depositStatus: raw.depositStatus ?? null,
    participationFeeStatus: raw.participationFeeStatus ?? null,
    participationFeeAmount: toNumber(raw.participationFeeAmount, 0),
    depositAmount: toNullableNumber(raw.depositAmount),
    depositHoldId: raw.depositHoldId ?? null,
    participationFeeTransactionId: raw.participationFeeTransactionId ?? null,
    paymentErrorCode: raw.paymentErrorCode ?? null,
    startTime: toIsoString(raw.startTime),
    registeredAt: toIsoString(raw.registeredAt ?? raw.createdAt),
    updatedAt: toIsoString(raw.updatedAt),
  };
}

export function mapMyRegistrationItem(item) {
  if (!item || typeof item !== "object") return null;
  return {
    registration: item.registration ? mapRegistration(item.registration) : null,
    auction: item.auction ? mapAuction(item.auction) : null,
    access: item.access ?? null,
  };
}

export function mapMyRegistrationsResponse(response) {
  return mapPageResponse(response, mapMyRegistrationItem);
}

export function mapAuctionValueDocument(raw) {
  if (!raw || typeof raw !== "object") return null;
  return {
    documentId: raw.documentId ?? toId(raw),
    kind: raw.kind ?? "OTHER",
    uploadedAt: toIsoString(raw.uploadedAt),
    fileLink: raw.fileLink ?? null,
  };
}

export function mapAuctionValueDocumentsResponse(response) {
  const raw = unwrapData(response) || {};
  return {
    data: unwrapList(raw).map(mapAuctionValueDocument),
    checklist: raw.checklist
      ? {
          required: Boolean(raw.checklist.required),
          satisfied: Boolean(raw.checklist.satisfied),
          missingItems: Array.isArray(raw.checklist.missingItems)
            ? raw.checklist.missingItems
            : [],
        }
      : { required: false, satisfied: true, missingItems: [] },
  };
}
