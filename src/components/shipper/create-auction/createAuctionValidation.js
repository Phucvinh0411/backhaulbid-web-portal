import { getParticipationFeeQuote } from "./mockData.js";
import { isCompletePlace, locationPayloadFromPlace } from "./routePlace.js";
import {
  CHECKLIST_NOTE,
  everyDocumentClassified,
  valueDocumentChecklist,
} from "./valueDocumentChecklist.js";

const hasValue = (value) => value !== undefined && value !== null && String(value).trim() !== "";

const toDate = (value) => {
  if (!hasValue(value)) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const validateCreateAuctionForm = (form, now = new Date()) => {
  if (!hasValue(form.goodsName)) return "Vui lòng nhập tên lô hàng.";
  if (!hasValue(form.goodsCategory)) return "Vui lòng chọn loại hàng hóa.";
  if (!Number.isFinite(Number(form.weight)) || Number(form.weight) <= 0) {
    return "Trọng lượng phải lớn hơn 0.";
  }
  if (!hasValue(form.requiredVehicleType)) return "Vui lòng chọn loại xe yêu cầu.";
  const documents = form.valueDocuments ?? [];
  if (!everyDocumentClassified(documents)) return "Chọn loại cho từng chứng từ giá trị hàng.";
  const checklist = valueDocumentChecklist({
    requireCarrierCoverage: form.requireCarrierCoverage,
    goodsValue: form.goodsValue,
    documents,
  });
  if (!checklist.satisfied) {
    return `Phiên yêu cầu nhà xe có bảo hiểm còn thiếu: ${checklist.missingItems.join("; ")}. ${CHECKLIST_NOTE}`;
  }
  if (!isCompletePlace(form.fromPlace)) {
    return "Vui lòng chọn địa chỉ lấy hàng từ gợi ý hoặc trên bản đồ.";
  }
  if (!isCompletePlace(form.toPlace)) {
    return "Vui lòng chọn địa chỉ giao hàng từ gợi ý hoặc trên bản đồ.";
  }
  if (!Number.isFinite(Number(form.maxPrice)) || Number(form.maxPrice) <= 0) {
    return "Vui lòng nhập giá trần lớn hơn 0.";
  }
  if (!Number.isFinite(Number(form.priceStep)) || Number(form.priceStep) <= 0) {
    return "Vui lòng nhập bước giá lớn hơn 0.";
  }
  if (Number(form.priceStep) > Number(form.maxPrice)) {
    return "Bước giá không được lớn hơn giá trần. Vui lòng giảm bước giá hoặc tăng giá trần.";
  }
  if (form.isDepositRequired !== false && (!hasValue(form.depositAmount) || Number(form.depositAmount) <= 0)) {
    return "Vui lòng nhập tiền đặt cọc khi bật yêu cầu đặt cọc.";
  }
  if (form.isDepositRequired !== false && Number(form.depositAmount) > Number(form.maxPrice)) {
    return "Tiền đặt cọc không được lớn hơn giá trần. Vui lòng điều chỉnh lại số tiền.";
  }

  const registrationStart = toDate(form.regStartTime);
  const registrationEnd = toDate(form.regEndTime);
  const start = toDate(form.startTime);
  const end = toDate(form.endTime);
  if (hasValue(form.regStartTime) && !registrationStart) {
    return "Thời điểm mở đăng ký không hợp lệ. Vui lòng chọn lại.";
  }
  if (!registrationStart || !registrationEnd || !start || !end) {
    return "Vui lòng nhập đủ thời gian mở/đóng đăng ký và bắt đầu/kết thúc đấu giá.";
  }
  if (registrationStart && registrationStart > registrationEnd) {
    return "Thời điểm mở đăng ký phải trước thời điểm đóng đăng ký.";
  }
  if (registrationEnd <= now) {
    return "Thời điểm đóng đăng ký phải ở tương lai. Vui lòng chọn thời gian sau hiện tại.";
  }
  if (registrationEnd > start) {
    return "Thời điểm đóng đăng ký phải trước hoặc bằng thời điểm bắt đầu đấu giá.";
  }
  if (start >= end) {
    return "Thời điểm bắt đầu đấu giá phải trước thời điểm kết thúc đấu giá.";
  }

  return null;
};

const toIsoOrUndefined = (value) => {
  const date = toDate(value);
  return date ? date.toISOString() : undefined;
};

export const mapFormToAuctionPayload = (form) => ({
  title: form.goodsName.trim(),
  goodsType: form.goodsCategory,
  weight: Number(form.weight),
  volume: form.volume ? Number(form.volume) : undefined,
  goodsValue: form.goodsValue ? Number(form.goodsValue).toString() : undefined,
  // Value documents go as their private object key and the kind the shipper chose; no storage URL is sent.
  valueDocuments: form.valueDocuments?.length
    ? form.valueDocuments.map((document) => ({ key: document.key, kind: document.kind }))
    : undefined,
  // Sent only when the shipper ticks the box; without it the payload is the same as before this requirement existed.
  ...(form.requireCarrierCoverage === true ? { requireCarrierCoverage: true } : {}),
  vehicleTypeRequired: form.requiredVehicleType,
  requiredTemp: form.requiredTemp?.trim() || undefined,
  vehicleSpecs: {
    length: form.vehicleLength ? Number(form.vehicleLength) : undefined,
    width: form.vehicleWidth ? Number(form.vehicleWidth) : undefined,
    height: form.vehicleHeight ? Number(form.vehicleHeight) : undefined,
  },
  pickupLocation: {
    ...locationPayloadFromPlace(form.fromPlace),
    contactName: form.fromContactName?.trim() || undefined,
    contactPhone: form.fromContactPhone?.trim() || undefined,
    earliestTime: toIsoOrUndefined(form.earliestPickup),
    latestTime: toIsoOrUndefined(form.latestPickup),
  },
  deliveryLocation: {
    ...locationPayloadFromPlace(form.toPlace),
    contactName: form.toContactName?.trim() || undefined,
    contactPhone: form.toContactPhone?.trim() || undefined,
    earliestTime: toIsoOrUndefined(form.earliestDelivery),
    latestTime: toIsoOrUndefined(form.latestDelivery),
  },
  auctionType: form.auctionType || "PUBLIC",
  maxPrice: Number(form.maxPrice).toString(),
  priceStep: Number(form.priceStep).toString(),
  participationFeeTier: getParticipationFeeQuote(form.maxPrice).tier,
  maxBids: form.maxBids ? Number(form.maxBids) : undefined,
  notes: form.description?.trim() || "",
  isDepositRequired: form.isDepositRequired !== false,
  depositAmount:
    form.isDepositRequired !== false && Number(form.depositAmount) > 0
      ? Number(form.depositAmount).toString()
      : undefined,
  registrationStartTime: toIsoOrUndefined(form.regStartTime),
  registrationEndTime: toIsoOrUndefined(form.regEndTime),
  startTime: toIsoOrUndefined(form.startTime),
  endTime: toIsoOrUndefined(form.endTime),
  images: (form.images || []).filter((image) => /^https?:\/\//.test(image)),
});
