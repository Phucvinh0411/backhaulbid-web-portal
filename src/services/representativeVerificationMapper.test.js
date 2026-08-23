import assert from "node:assert/strict";
import test from "node:test";

import {
  getRepresentativeVerificationSaveErrorMessage,
} from "./representativeVerificationMapper.js";

test("Given the eKYC API returns a technical English error, When building popup feedback, Then the user receives a Vietnamese next step", () => {
  const message = getRepresentativeVerificationSaveErrorMessage({
    response: {
      status: 500,
      data: { message: "Internal Server Error" },
    },
  });

  assert.equal(
    message,
    "Không thể lưu kết quả eKYC lúc này. Vui lòng kiểm tra lại thông tin và thử lại sau."
  );
});

test("Given the eKYC API returns a Vietnamese business message, When building popup feedback, Then the useful instruction is preserved", () => {
  const message = getRepresentativeVerificationSaveErrorMessage({
    response: {
      status: 422,
      data: { message: "CCCD chưa khớp với người đại diện." },
    },
  });

  assert.equal(message, "CCCD chưa khớp với người đại diện.");
});
