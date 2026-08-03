import assert from "node:assert/strict";
import test from "node:test";

import {
  REPRESENTATIVE_VERIFICATION_PATH,
  buildRepresentativeVerificationPayload,
  getRepresentativeVerificationFailureMessage,
} from "./representativeVerificationApi.js";
import { businessVerificationLookupPath } from "../businessVerification/businessVerificationApi.js";

test("representative and business verification use separate API resources", () => {
  assert.equal(
    REPRESENTATIVE_VERIFICATION_PATH,
    "/api/v1/representative-verifications"
  );
  assert.equal(
    businessVerificationLookupPath("0102030405"),
    "/api/v1/business-verifications/lookup/0102030405"
  );
});

test("maps the documented VNPT SDK result to representative identity only", () => {
  const payload = buildRepresentativeVerificationPayload({
    ocr: {
      message: "IDG-00000000",
      object: {
        id: "079123456789",
        name: "Nguyễn Văn A",
        msg: "OK",
        msg_back: "OK",
        id_fake_warning: "no",
        tampering: { is_legal: "yes", warning: [] },
        general_warning: [],
      },
    },
    liveness_card_front: {
      message: "IDG-00000000",
      object: {
        liveness: "success",
        face_swapping: false,
        fake_liveness: false,
        fake_print_photo: false,
      },
    },
    liveness_card_back: {
      message: "IDG-00000000",
      object: {
        liveness: "success",
        face_swapping: false,
        fake_liveness: false,
        fake_print_photo: false,
      },
    },
    data_hash_document: {
      img_front: "idg/front-hash",
      img_back: "idg/back-hash",
    },
    hash_img: "idg/face-hash",
    liveness_face: { object: { liveness: "success" } },
    compare: { object: { msg: "MATCH", prob: 98.5 } },
  });

  assert.deepEqual(payload, {
    identityNumber: "079123456789",
    fullName: "Nguyễn Văn A",
    frontImageUrl: "idg/front-hash",
    backImageUrl: "idg/back-hash",
    selfieImageUrl: "idg/face-hash",
    ocrPassed: true,
    documentLivenessPassed: true,
    documentAuthenticityPassed: true,
    livenessPassed: true,
    faceMatched: true,
    faceMatchScore: 98.5,
  });
  assert.equal("taxCode" in payload, false);
  assert.equal("companyName" in payload, false);
  assert.equal("businessLicenseUrl" in payload, false);
});

test("maps nested OCR values and hash objects returned by SDK adapters", () => {
  const payload = buildRepresentativeVerificationPayload({
    ocr: {
      message: "IDG-00000000",
      data: {
        object: {
          id_number: { value: "079123456789" },
          full_name: { value: "Nguyễn Văn B" },
          msg: "OK",
          msg_back: "OK",
          id_fake_warning: "no",
          tampering: { is_legal: "yes", warning: [] },
          general_warning: [],
        },
      },
    },
    liveness_card_front: { object: { liveness: "success" } },
    liveness_card_back: { object: { liveness: "success" } },
    data_hash_document: {
      img_front: { hash: "front-hash" },
      img_back: { hash: "back-hash" },
    },
    hash_img: { hash: "face-hash" },
    liveness_face: { object: { liveness: "success" } },
    compare: { object: { msg: "MATCH", prob: 99 } },
  });

  assert.equal(payload.identityNumber, "079123456789");
  assert.equal(payload.fullName, "Nguyễn Văn B");
  assert.equal(payload.frontImageUrl, "front-hash");
  assert.equal(payload.backImageUrl, "back-hash");
  assert.equal(payload.selfieImageUrl, "face-hash");
});

test("rejects a successful-looking OCR result without representative name", () => {
  assert.throws(
    () =>
      buildRepresentativeVerificationPayload({
        ocr: {
          message: "IDG-00000000",
          object: {
            id: "079123456789",
            msg: "OK",
            msg_back: "OK",
            tampering: { is_legal: "yes", warning: [] },
            general_warning: [],
          },
        },
        data_hash_document: { img_front: "front", img_back: "back" },
        hash_img: "face",
        liveness_card_front: { object: { liveness: "success" } },
        liveness_card_back: { object: { liveness: "success" } },
        liveness_face: { object: { liveness: "success" } },
        compare: { object: { msg: "MATCH", prob: 99 } },
      }),
    /OCR VNPT.*họ tên/i
  );
});

test("marks a recaptured or printed document as inauthentic", () => {
  const payload = buildRepresentativeVerificationPayload({
    ocr: {
      message: "IDG-00000000",
      object: {
        id: "079123456789",
        name: "Nguyễn Văn A",
        msg: "OK",
        msg_back: "OK",
        id_fake_warning: "no",
        tampering: { is_legal: "yes", warning: [] },
        general_warning: [],
      },
    },
    liveness_card_front: {
      message: "IDG-00000000",
      object: {
        liveness: "failure",
        face_swapping: false,
        fake_liveness: true,
        fake_print_photo: true,
      },
    },
    liveness_card_back: {
      message: "IDG-00000000",
      object: {
        liveness: "success",
        face_swapping: false,
        fake_liveness: false,
        fake_print_photo: false,
      },
    },
    data_hash_document: {
      img_front: "idg/front-hash",
      img_back: "idg/back-hash",
    },
    hash_img: "idg/face-hash",
    liveness_face: { object: { liveness: "success" } },
    compare: { object: { msg: "MATCH", prob: 98.5 } },
  });

  assert.equal(payload.documentLivenessPassed, false);
  assert.equal(payload.documentAuthenticityPassed, false);
  assert.match(
    getRepresentativeVerificationFailureMessage(payload),
    /chụp lại|in lại/i
  );
});

test("marks a non-document OCR result as failed", () => {
  const payload = buildRepresentativeVerificationPayload({
    ocr: {
      message: "IDG-00010102",
      object: {
        id: "",
        msg: "NOK",
        msg_back: "NOK",
        id_fake_warning: "yes",
        tampering: { is_legal: "no", warning: ["invalid"] },
      },
    },
    liveness_card_front: {
      object: {
        liveness: "failure",
        face_swapping: false,
        fake_liveness: false,
      },
    },
    liveness_card_back: {
      object: {
        liveness: "failure",
        face_swapping: false,
        fake_liveness: false,
      },
    },
    data_hash_document: {
      img_front: "idg/front-hash",
      img_back: "idg/back-hash",
    },
    hash_img: "idg/face-hash",
    liveness_face: { object: { liveness: "success" } },
    compare: { object: { msg: "MATCH", prob: 98.5 } },
  });

  assert.equal(payload.ocrPassed, false);
  assert.match(
    getRepresentativeVerificationFailureMessage(payload),
    /không nhận diện được CCCD/i
  );
});

test("rejects an incomplete VNPT result instead of submitting mock identity data", () => {
  assert.throws(
    () => buildRepresentativeVerificationPayload({}),
    /không đầy đủ/i
  );
});

test("explains when the liveness check fails", () => {
  assert.equal(
    getRepresentativeVerificationFailureMessage({
      livenessPassed: false,
      faceMatched: true,
      faceMatchScore: 98.5,
    }),
    "Kiểm tra người thật không đạt: hệ thống chưa xác nhận được khuôn mặt sống. Hãy nhìn thẳng, giữ đủ sáng và thực hiện đúng chuyển động được hướng dẫn."
  );
});

test("explains when the document face does not match the selfie", () => {
  assert.equal(
    getRepresentativeVerificationFailureMessage({
      livenessPassed: true,
      faceMatched: false,
      faceMatchScore: 42.34,
    }),
    "Đối chiếu khuôn mặt không đạt: ảnh khuôn mặt chưa khớp với ảnh trên giấy tờ (điểm VNPT: 42.3)."
  );
});

test("reports both independent failure reasons", () => {
  assert.equal(
    getRepresentativeVerificationFailureMessage({
      livenessPassed: false,
      faceMatched: false,
      faceMatchScore: 18,
    }),
    "Không đạt 2 kiểm tra: kiểm tra người thật chưa đạt; khuôn mặt chưa khớp với ảnh trên giấy tờ (điểm VNPT: 18.0)."
  );
});
