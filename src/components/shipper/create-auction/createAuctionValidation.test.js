import test from "node:test";
import assert from "node:assert/strict";

import {
  mapFormToAuctionPayload,
  validateCreateAuctionForm,
} from "./createAuctionValidation.js";

const validForm = {
  goodsName: "Linh kiện điện tử",
  goodsCategory: "Điện tử",
  weight: 5,
  volume: 20,
  goodsValue: 100000000,
  requiredVehicleType: "TRUCK_MEDIUM",
  requiredTemp: "",
  vehicleLength: 6,
  vehicleWidth: 2,
  vehicleHeight: 2.2,
  fromLocationName: "Kho A",
  fromProvince: "Hồ Chí Minh",
  fromAddress: "12 Nguyễn Huệ",
  fromContactName: "Nguyễn Văn A",
  fromContactPhone: "0900000000",
  toLocationName: "Kho B",
  toProvince: "Đồng Nai",
  toAddress: "KCN Biên Hòa",
  toContactName: "Trần Văn B",
  toContactPhone: "0911111111",
  earliestPickup: "2030-01-10T08:00",
  latestPickup: "2030-01-10T10:00",
  earliestDelivery: "2030-01-11T08:00",
  latestDelivery: "2030-01-11T10:00",
  auctionType: "PUBLIC",
  maxPrice: 12000000,
  priceStep: 100000,
  isDepositRequired: true,
  depositAmount: 1000000,
  maxBids: 5,
  regStartTime: "2030-01-01T08:00",
  regEndTime: "2030-01-02T08:00",
  startTime: "2030-01-02T08:00",
  endTime: "2030-01-02T18:00",
  description: "Hàng dễ vỡ",
  images: ["https://cdn.example.test/cargo.jpg"],
};

test("Given a complete form, When validating it, Then no error is returned", () => {
  const error = validateCreateAuctionForm(validForm, new Date("2029-12-01T00:00:00Z"));

  assert.equal(error, null);
});

test("Given an incomplete route, When validating it, Then the pickup or delivery error is returned", () => {
  const error = validateCreateAuctionForm(
    { ...validForm, fromAddress: "" },
    new Date("2029-12-01T00:00:00Z"),
  );

  assert.equal(
    error,
    "Vui lòng chọn đầy đủ điểm lấy hàng (tên kho, tỉnh/thành và địa chỉ).",
  );
});

test("Given an invalid auction schedule, When validating it, Then the schedule error is returned", () => {
  const error = validateCreateAuctionForm(
    { ...validForm, regEndTime: undefined },
    new Date("2029-12-01T00:00:00Z"),
  );

  assert.equal(
    error,
    "Vui lòng nhập đủ thời gian mở/đóng đăng ký và bắt đầu/kết thúc đấu giá.",
  );
});

test("Given registration closes after bidding starts, When validating it, Then the order error is returned", () => {
  const error = validateCreateAuctionForm(
    { ...validForm, regEndTime: "2030-01-03T08:00" },
    new Date("2029-12-01T00:00:00Z"),
  );

  assert.equal(
    error,
    "Thời điểm đóng đăng ký phải trước hoặc bằng thời điểm bắt đầu đấu giá.",
  );
});

test("Given registration opens after it closes, When validating it, Then a clear time-order error is returned", () => {
  const error = validateCreateAuctionForm(
    {
      ...validForm,
      regStartTime: "2030-01-02T23:55",
      regEndTime: "2030-01-02T12:00",
    },
    new Date("2029-12-01T00:00:00Z"),
  );

  assert.equal(
    error,
    "Thời điểm mở đăng ký phải trước thời điểm đóng đăng ký.",
  );
});

test("Given registration closes in the past, When validating it, Then the user is told to choose a future time", () => {
  const error = validateCreateAuctionForm(
    {
      ...validForm,
      regStartTime: "2029-11-29T08:00",
      regEndTime: "2029-11-30T08:00",
    },
    new Date("2029-12-01T00:00:00Z"),
  );

  assert.equal(
    error,
    "Thời điểm đóng đăng ký phải ở tương lai. Vui lòng chọn thời gian sau hiện tại.",
  );
});

test("Given bidding ends before it starts, When validating it, Then the user is told how to fix the schedule", () => {
  const error = validateCreateAuctionForm(
    { ...validForm, startTime: "2030-01-02T18:00", endTime: "2030-01-02T08:00" },
    new Date("2029-12-01T00:00:00Z"),
  );

  assert.equal(
    error,
    "Thời điểm bắt đầu đấu giá phải trước thời điểm kết thúc đấu giá.",
  );
});

test("Given a deposit greater than the maximum price, When validating it, Then the financial error is returned", () => {
  const error = validateCreateAuctionForm(
    { ...validForm, depositAmount: 12000001 },
    new Date("2029-12-01T00:00:00Z"),
  );

  assert.equal(
    error,
    "Tiền đặt cọc không được lớn hơn giá trần. Vui lòng điều chỉnh lại số tiền.",
  );
});

test("Given deposit is required but empty, When validating it, Then the deposit error is returned", () => {
  const error = validateCreateAuctionForm(
    { ...validForm, depositAmount: "" },
    new Date("2029-12-01T00:00:00Z"),
  );

  assert.equal(
    error,
    "Vui lòng nhập tiền đặt cọc khi bật yêu cầu đặt cọc.",
  );
});

test("Given a valid form, When mapping it, Then the API receives the backend DTO field names", () => {
  const payload = mapFormToAuctionPayload(validForm);

  assert.equal(payload.vehicleTypeRequired, "TRUCK_MEDIUM");
  assert.equal(payload.pickupLocation.locationName, "Kho A");
  assert.equal(payload.deliveryLocation.locationName, "Kho B");
  assert.equal(payload.maxPrice, "12000000");
  assert.equal(payload.images.length, 1);
  assert.match(payload.startTime, /^2030-01-02T/);
});
