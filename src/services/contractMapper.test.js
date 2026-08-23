import assert from "node:assert/strict";
import test from "node:test";

import {
  mapContractResponse,
  mapContractResponses,
} from "./contractMapper.js";

test("Given a signed backend contract with trip data, When mapping it for the portal, Then real IDs, route, price and active status are preserved", () => {
  const mapped = mapContractResponse({
    id: "contract-1",
    tripId: "trip-1",
    shipperId: "shipper-1",
    carrierId: "carrier-1",
    contractCode: "HD-2026-001",
    status: "SIGNED",
    createdAt: "2026-08-23T04:00:00Z",
    trip: {
      pickupLocation: "Kho Sóng Thần, Bình Dương",
      deliveryLocation: "Cảng Cát Lái, TP. Hồ Chí Minh",
      agreedPrice: 5350000,
      status: "WAITING_PICKUP",
    },
  });

  assert.equal(mapped.backendId, "contract-1");
  assert.equal(mapped.id, "HD-2026-001");
  assert.equal(mapped.tripId, "trip-1");
  assert.equal(mapped.origin, "Kho Sóng Thần, Bình Dương");
  assert.equal(mapped.destination, "Cảng Cát Lái, TP. Hồ Chí Minh");
  assert.equal(mapped.value, "5.350.000 ₫");
  assert.equal(mapped.status, "ACTIVE");
  assert.equal(mapped.cargoType, "Chưa cập nhật thông tin hàng hóa");
});

test("Given a contract waiting for signature, When mapping it, Then it is shown as pending and exposes the real partner ID without fake company data", () => {
  const mapped = mapContractResponse({
    id: "contract-2",
    tripId: "trip-2",
    shipperId: "shipper-2",
    carrierId: "carrier-2",
    contractCode: "HD-2026-002",
    status: "WAITING_SIGNATURE",
    trip: null,
  }, "shipper");

  assert.equal(mapped.status, "PENDING_SIGNATURE");
  assert.equal(mapped.carrierName, "Mã nhà xe: carrier-2");
  assert.equal(mapped.shipperName, "Mã chủ hàng: shipper-2");
  assert.equal(mapped.origin, "Chưa cập nhật điểm nhận");
  assert.equal(mapped.destination, "Chưa cập nhật điểm giao");
});

test("Given a completed trip or cancelled contract, When mapping a response list, Then the UI status matches the business state", () => {
  const mapped = mapContractResponses([
    {
      id: "contract-3",
      contractCode: "HD-2026-003",
      status: "SIGNED",
      trip: { status: "COMPLETED" },
    },
    {
      id: "contract-4",
      contractCode: "HD-2026-004",
      status: "CANCELLED",
    },
  ]);

  assert.deepEqual(mapped.map((contract) => contract.status), [
    "COMPLETED",
    "CANCELLED",
  ]);
});
