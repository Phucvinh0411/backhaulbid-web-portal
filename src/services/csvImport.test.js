import assert from "node:assert/strict";
import test from "node:test";
import { parseSimpleCsv } from "./csvImport.js";

test("parseSimpleCsv_validRows_returnsTrimmedObjects", () => {
  const actualRows = parseSimpleCsv(
    "licensePlate,payloadCapacity,vehicleType,bodyType\n 51A-001.23 , 10 ,TRUCK_MEDIUM, Thung kin "
  );

  assert.deepEqual(actualRows, [
    {
      licensePlate: "51A-001.23",
      payloadCapacity: "10",
      vehicleType: "TRUCK_MEDIUM",
      bodyType: "Thung kin",
    },
  ]);
});

test("parseSimpleCsv_withoutDataRows_throwsValidationError", () => {
  assert.throws(
    () => parseSimpleCsv("licensePlate,payloadCapacity"),
    /CSV phải có dòng tiêu đề và ít nhất một bản ghi/
  );
});

test("parseSimpleCsv_withBlankHeader_throwsValidationError", () => {
  assert.throws(
    () => parseSimpleCsv("licensePlate,,vehicleType\n51A-001.23,10,TRUCK_MEDIUM"),
    /CSV có tên cột trống/
  );
});
