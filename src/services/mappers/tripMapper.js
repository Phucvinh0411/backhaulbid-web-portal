import {
  toId,
  toIsoString,
  toNullableNumber,
  toNumber,
  unwrapData,
  unwrapList,
} from "./primitives.js";

function mapRoutePoint(raw) {
  if (!raw || typeof raw !== "object") return null;
  return {
    latitude: toNullableNumber(raw.latitude),
    longitude: toNullableNumber(raw.longitude),
    label: raw.label ?? null,
    address: raw.address ?? null,
    source: raw.source ?? null,
  };
}

export function mapTrackingLog(raw) {
  if (!raw || typeof raw !== "object") return null;
  return {
    id: toId(raw),
    latitude: toNullableNumber(raw.latitude),
    longitude: toNullableNumber(raw.longitude),
    status: raw.status ?? null,
    recordedAt: toIsoString(raw.recordedAt),
  };
}

export function mapTrip(response) {
  const raw = unwrapData(response);
  if (!raw || typeof raw !== "object") return null;

  return {
    id: toId(raw),
    shipperId: raw.shipperId ?? null,
    carrierId: raw.carrierId ?? null,
    vehicleId: raw.vehicleId ?? null,
    driverId: raw.driverId ?? null,
    driverAccountId: raw.driverAccountId ?? null,
    driverName: raw.driverName ?? null,
    vehiclePlate: raw.vehiclePlate ?? null,
    hasAssignmentPin: Boolean(raw.hasAssignmentPin),
    auctionId: raw.auctionId ?? null,
    winningBidId: raw.winningBidId ?? null,
    pickupLocation: raw.pickupLocation ?? "",
    deliveryLocation: raw.deliveryLocation ?? "",
    agreedPrice: toNumber(raw.agreedPrice, 0),
    expectedDeliveryAt: toIsoString(raw.expectedDeliveryAt),
    deliveredAt: toIsoString(raw.deliveredAt),
    depositAmount: toNullableNumber(raw.depositAmount),
    depositReleasedAt: toIsoString(raw.depositReleasedAt),
    latePolicyEnabled: Boolean(raw.latePolicyEnabled),
    lateMinutes: toNumber(raw.lateMinutes, 0),
    canCancelForLateDelivery: Boolean(raw.canCancelForLateDelivery),
    status: raw.status ?? "WAITING_PICKUP",
    contractStatus: raw.contractStatus ?? null,
    cancellationReason: raw.cancellationReason ?? null,
    createdAt: toIsoString(raw.createdAt),
    updatedAt: toIsoString(raw.updatedAt),
    latestTracking: mapTrackingLog(raw.latestTracking),
    pickupPoint: mapRoutePoint(raw.pickupPoint),
    deliveryPoint: mapRoutePoint(raw.deliveryPoint),
    routeVersion: toNumber(raw.routeVersion, 0),
    driverConnected: Boolean(raw.driverConnected),
    assignmentVersion: toNumber(raw.assignmentVersion, 0),
  };
}

export function mapTrips(response) {
  return unwrapList(response).map(mapTrip).filter(Boolean);
}

export function mapTripLocation(response) {
  const raw = unwrapData(response);
  if (!raw || typeof raw !== "object") return null;

  return {
    id: toId(raw),
    tripId: raw.tripId ?? null,
    actorId: raw.actorId ?? null,
    latitude: toNullableNumber(raw.latitude),
    longitude: toNullableNumber(raw.longitude),
    label: raw.label ?? null,
    source: raw.source ?? null,
    status: raw.status ?? null,
    recordedAt: toIsoString(raw.recordedAt),
    capturedAt: toIsoString(raw.capturedAt),
    accuracyMeters: toNullableNumber(raw.accuracyMeters),
  };
}

export function mapTripLocations(response) {
  return unwrapList(response).map(mapTripLocation).filter(Boolean);
}

export function mapJourneyEvent(response) {
  const raw = unwrapData(response);
  if (!raw || typeof raw !== "object") return null;

  return {
    id: toId(raw),
    tripId: raw.tripId ?? null,
    actorId: raw.actorId ?? null,
    eventType: raw.eventType ?? null,
    status: raw.status ?? null,
    note: raw.note ?? null,
    evidenceUrl: raw.evidenceUrl ?? null,
    recordedAt: toIsoString(raw.recordedAt),
  };
}

export function mapJourneyEvents(response) {
  return unwrapList(response).map(mapJourneyEvent).filter(Boolean);
}

export function mapDeliveryProof(response) {
  const raw = unwrapData(response);
  if (!raw || typeof raw !== "object") return null;

  return {
    id: toId(raw),
    tripId: raw.tripId ?? null,
    imageUrl: raw.imageUrl ?? "",
    note: raw.note ?? null,
    uploadedAt: toIsoString(raw.uploadedAt),
  };
}

export function mapDeliveryProofs(response) {
  return unwrapList(response).map(mapDeliveryProof).filter(Boolean);
}

export function mapTripHandover(response) {
  const raw = unwrapData(response);
  if (!raw || typeof raw !== "object") return null;

  return {
    tripId: raw.tripId ?? null,
    cargoCategory: raw.cargoCategory ?? "",
    packageCount: toNullableNumber(raw.packageCount),
    grossWeightKg: toNullableNumber(raw.grossWeightKg),
    conditionStatus: raw.conditionStatus ?? null,
    conditionNote: raw.conditionNote ?? null,
    sealNumber: raw.sealNumber ?? null,
    placeNote: raw.placeNote ?? null,
    photoPaths: Array.isArray(raw.photoPaths) ? raw.photoPaths : [],
    recordedByType: raw.recordedByType ?? null,
    recordedAt: toIsoString(raw.recordedAt),
    shipperSignerName: raw.shipperSignerName ?? null,
    shipperConfirmedAt: toIsoString(raw.shipperConfirmedAt),
    readyForPickup: Boolean(raw.readyForPickup),
  };
}

export function mapTripHandovers(response) {
  return unwrapList(response).map(mapTripHandover).filter(Boolean);
}

export function mapTripReview(response) {
  const raw = unwrapData(response);
  if (!raw || typeof raw !== "object") return null;

  return {
    id: toId(raw),
    tripId: raw.tripId ?? null,
    carrierId: raw.carrierId ?? null,
    rating: toNumber(raw.rating, 0),
    comment: raw.comment ?? null,
    createdAt: toIsoString(raw.createdAt),
  };
}

export function mapTripReviews(response) {
  return unwrapList(response).map(mapTripReview).filter(Boolean);
}

export function mapDelaySettlement(response) {
  const raw = unwrapData(response);
  if (!raw || typeof raw !== "object") return null;

  return {
    id: toId(raw),
    tripId: raw.tripId ?? null,
    auctionId: raw.auctionId ?? null,
    shipperId: raw.shipperId ?? null,
    carrierId: raw.carrierId ?? null,
    tier: toNumber(raw.tier, 0),
    lateMinutes: toNumber(raw.lateMinutes, 0),
    cumulativePenaltyPercent: toNumber(raw.cumulativePenaltyPercent, 0),
    totalCompensationAmount: toNumber(raw.totalCompensationAmount, 0),
    incrementalCompensationAmount: toNumber(raw.incrementalCompensationAmount, 0),
    pointsDeducted: toNumber(raw.pointsDeducted, 0),
    walletStatus: raw.walletStatus ?? null,
    reputationStatus: raw.reputationStatus ?? null,
    notificationStatus: raw.notificationStatus ?? null,
    overallStatus: raw.overallStatus ?? null,
    lastError: raw.lastError ?? null,
    attempts: toNumber(raw.attempts, 0),
    updatedAt: toIsoString(raw.updatedAt),
  };
}

export function mapDelaySettlements(response) {
  return unwrapList(response).map(mapDelaySettlement).filter(Boolean);
}

export function mapCargoDocument(response) {
  const raw = unwrapData(response);
  if (!raw || typeof raw !== "object") return null;

  return {
    id: toId(raw),
    kind: raw.kind ?? "OTHER",
    source: raw.source ?? null,
    uploadedAt: toIsoString(raw.uploadedAt),
    fileLink: raw.fileLink ?? null,
  };
}

export function mapCargoDocumentsResponse(response) {
  const raw = unwrapData(response) || {};
  return {
    declaredGoodsValue: toNullableNumber(raw.declaredGoodsValue),
    hasAwardSnapshot: Boolean(raw.hasAwardSnapshot),
    hasValueProof: Boolean(raw.hasValueProof),
    documents: Array.isArray(raw.documents)
      ? raw.documents.map(mapCargoDocument).filter(Boolean)
      : [],
  };
}

export function mapInsuranceClaim(response) {
  const raw = unwrapData(response);
  if (!raw || typeof raw !== "object") return null;

  return {
    ...raw,
    id: toId(raw),
    claimedAmount: toNullableNumber(raw.claimedAmount),
    declaredGoodsValue: toNullableNumber(raw.declaredGoodsValue),
    revision: toNumber(raw.revision, 1),
    sharedRevision: toNullableNumber(raw.sharedRevision),
    carrierAcknowledgedRevision: toNullableNumber(raw.carrierAcknowledgedRevision),
    shareStale: Boolean(raw.shareStale),
    canShare: Boolean(raw.canShare),
    acknowledged: Boolean(raw.acknowledged),
    missingItems: Array.isArray(raw.missingItems) ? raw.missingItems : [],
    cargoDocuments: Array.isArray(raw.cargoDocuments) ? raw.cargoDocuments : [],
    evidence: Array.isArray(raw.evidence) ? raw.evidence : [],
    occurredAt: toIsoString(raw.occurredAt),
    sharedAt: toIsoString(raw.sharedAt),
    carrierAcknowledgedAt: toIsoString(raw.carrierAcknowledgedAt),
    createdAt: toIsoString(raw.createdAt),
    updatedAt: toIsoString(raw.updatedAt),
  };
}

export function mapInsuranceClaims(response) {
  return unwrapList(response).map(mapInsuranceClaim).filter(Boolean);
}

export function mapTripTrackingSnapshot(response) {
  const raw = unwrapData(response);
  if (!raw || typeof raw !== "object") return null;

  return {
    ...raw,
    pickupPoint: mapRoutePoint(raw.pickupPoint),
    deliveryPoint: mapRoutePoint(raw.deliveryPoint),
    routeVersion: toNumber(raw.routeVersion, 0),
    latestLocation: mapTripLocation(raw.latestLocation),
    lastEventAt: toIsoString(raw.lastEventAt),
  };
}

export function mapLocationHistoryResponse(response) {
  const raw = unwrapData(response) || {};
  return {
    ...raw,
    points: Array.isArray(raw.points)
      ? raw.points.map(mapTripLocation).filter(Boolean)
      : [],
    hasMore: Boolean(raw.hasMore),
    sampled: Boolean(raw.sampled),
    totalPoints: toNumber(raw.totalPoints, 0),
  };
}
