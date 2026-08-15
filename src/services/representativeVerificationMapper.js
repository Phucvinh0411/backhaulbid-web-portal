function readText(value) {
  if (typeof value === "string" || typeof value === "number") {
    return String(value).trim();
  }
  if (!value || typeof value !== "object") return "";
  return readText(
    value.value ?? value.text ?? value.name ?? value.hash ?? value.url ?? value.data
  );
}

function getOcrObject(result) {
  return (
    result?.ocr?.object ||
    result?.ocr?.data?.object ||
    result?.ocr?.result?.object ||
    result?.ocr?.data ||
    {}
  );
}

export function getRepresentativeVerificationFailureMessage(result) {
  if (result?.ocrPassed === false) {
    return "Không nhận diện được CCCD hợp lệ. Hãy chụp đúng CCCD, đủ bốn góc và bảo đảm thông tin rõ nét.";
  }

  if (result?.documentAuthenticityPassed === false) {
    return "Giấy tờ có dấu hiệu bị chụp lại, in lại hoặc thay ảnh. Vui lòng sử dụng CCCD bản gốc.";
  }

  if (result?.documentLivenessPassed === false) {
    return "Kiểm tra giấy tờ thật không đạt. Vui lòng chụp trực tiếp CCCD bản gốc trong môi trường đủ sáng.";
  }

  const livenessFailed = result?.livenessPassed === false;
  const faceMismatch = result?.faceMatched === false;
  const score = Number(result?.faceMatchScore);
  const scoreText = Number.isFinite(score)
    ? ` (điểm VNPT: ${score.toFixed(1)})`
    : "";

  if (livenessFailed && faceMismatch) {
    return `Không đạt 2 kiểm tra: kiểm tra người thật chưa đạt; khuôn mặt chưa khớp với ảnh trên giấy tờ${scoreText}.`;
  }

  if (livenessFailed) {
    return "Kiểm tra người thật không đạt: hệ thống chưa xác nhận được khuôn mặt sống. Hãy nhìn thẳng, giữ đủ sáng và thực hiện đúng chuyển động được hướng dẫn.";
  }

  if (faceMismatch) {
    return `Đối chiếu khuôn mặt không đạt: ảnh khuôn mặt chưa khớp với ảnh trên giấy tờ${scoreText}.`;
  }

  return "Kết quả xác thực chưa đạt nhưng hệ thống không nhận được lý do chi tiết từ VNPT. Vui lòng thực hiện lại.";
}

export function buildRepresentativeVerificationPayload(result) {
  const ocr = result?.ocr || {};
  const ocrObject = getOcrObject(result);
  const identityNumber = readText(
    ocrObject?.id ??
      ocrObject?.identityNumber ??
      ocrObject?.id_number ??
      ocrObject?.identity_number
  );
  const fullName = readText(
    ocrObject?.name ??
      ocrObject?.fullName ??
      ocrObject?.full_name ??
      ocrObject?.fullname ??
      ocrObject?.identityName
  );
  const frontImageUrl = readText(
    result?.data_hash_document?.img_front ?? result?.data_hash_document?.front
  );
  const backImageUrl = readText(
    result?.data_hash_document?.img_back ?? result?.data_hash_document?.back
  );
  const selfieImageUrl = readText(result?.hash_img ?? result?.selfie_hash);
  const frontDocumentCheck = result?.liveness_card_front?.object;
  const backDocumentCheck = result?.liveness_card_back?.object;
  const documentChecks = [frontDocumentCheck, backDocumentCheck];
  const ocrPassed =
    ocr?.message === "IDG-00000000" &&
    ocrObject?.msg === "OK" &&
    ocrObject?.msg_back === "OK" &&
    Boolean(identityNumber) &&
    ocrObject?.id_fake_warning !== "yes" &&
    ocrObject?.tampering?.is_legal === "yes" &&
    (ocrObject?.tampering?.warning?.length ?? 0) === 0 &&
    (ocrObject?.general_warning?.length ?? 0) === 0;
  const documentLivenessPassed = documentChecks.every(
    (check) => check?.liveness === "success"
  );
  const documentAuthenticityPassed = documentChecks.every(
    (check) =>
      check &&
      check.face_swapping !== true &&
      check.fake_liveness !== true &&
      check.fake_print_photo !== true
  );
  const livenessPassed =
    result?.liveness_face?.object?.liveness === "success";
  const faceMatched = result?.compare?.object?.msg === "MATCH";
  const faceMatchScore = Number(result?.compare?.object?.prob);

  if (!frontImageUrl || !backImageUrl || !selfieImageUrl || !Number.isFinite(faceMatchScore)) {
    throw new Error(
      "Kết quả VNPT eKYC không đầy đủ. Vui lòng thực hiện lại quy trình."
    );
  }

  if (ocrPassed && (!identityNumber || !fullName)) {
    throw new Error(
      "Kết quả OCR VNPT chưa có đủ số CCCD và họ tên. Vui lòng thực hiện lại quy trình."
    );
  }

  return {
    identityNumber,
    fullName,
    frontImageUrl,
    backImageUrl,
    selfieImageUrl,
    ocrPassed,
    documentLivenessPassed,
    documentAuthenticityPassed,
    livenessPassed,
    faceMatched,
    faceMatchScore,
  };
}
