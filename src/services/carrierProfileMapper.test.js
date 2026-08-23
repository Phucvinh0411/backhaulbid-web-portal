import assert from "node:assert/strict";
import test from "node:test";

import { mapCarrierProfile } from "./carrierProfileMapper.js";

test("Given real company, vehicle and driver responses, When mapping a carrier profile, Then IDs and verified fields are preserved without fabricated metrics", () => {
  const profile = mapCarrierProfile({
    company: {
      accountId: "carrier-1",
      companyName: "Nhà xe thật",
      legalRepresentative: "Nguyễn Văn A",
      verificationStatus: "VERIFIED",
      taxCode: "0123456789",
      address: "Bình Dương",
      contactPhone: "0900000000",
      contactEmail: "carrier@test.local",
    },
    vehicles: [{ id: "vehicle-1", licensePlate: "51H-12345", vehicleType: "TRUCK_MEDIUM", payloadCapacity: 8.5, status: "VERIFIED" }],
    drivers: [{ id: "driver-1", fullName: "Trần Văn B", phone: "0911111111", licenseNumber: "FC", status: "VERIFIED" }],
  });

  assert.equal(profile.code, "carrier-1");
  assert.equal(profile.fleet[0].plate, "51H-12345");
  assert.equal(profile.drivers[0].name, "Trần Văn B");
  assert.equal(profile.rating, "Chưa cập nhật");
  assert.deepEqual(profile.reviews, []);
});
