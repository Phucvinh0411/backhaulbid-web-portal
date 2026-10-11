// Pure rules for the goods' value documents: the kinds, their labels, and the carrier-coverage checklist. No imports,
// no network. The server applies the same rules (bidding-service value-documents.ts) and is the one that refuses a
// publish; this only tells the shipper what is still missing before they press the button.

export const VALUE_DOCUMENT_KIND_LABEL = {
  INVOICE: "Hóa đơn",
  RECEIPT: "Biên nhận",
  CONTRACT: "Hợp đồng mua bán",
  PAYMENT_PROOF: "Chứng từ thanh toán",
  OTHER: "Chứng từ khác",
  // Older records saved before kinds existed. Shown, never counted as proof of value.
  UNCLASSIFIED: "Chưa phân loại",
};

/** The kinds a shipper can choose. UNCLASSIFIED only marks an older record and is never offered. */
export const SELECTABLE_VALUE_DOCUMENT_KINDS = ["INVOICE", "RECEIPT", "CONTRACT", "PAYMENT_PROOF", "OTHER"];

/** Kinds that prove the goods' value for the checklist. OTHER and UNCLASSIFIED never do. */
export const VALUE_PROOF_KINDS = ["INVOICE", "RECEIPT", "CONTRACT", "PAYMENT_PROOF"];

export const GOODS_VALUE_MISSING_TEXT = "giá trị hàng khai báo lớn hơn 0";
export const VALUE_PROOF_MISSING_TEXT =
  "ít nhất một chứng từ chứng minh giá trị hàng (hóa đơn, biên nhận, hợp đồng hoặc chứng từ thanh toán)";
export const CHECKLIST_NOTE = "Đây là checklist chuẩn bị của nền tảng, không bảo đảm nhà bảo hiểm chấp thuận.";

export function isValueProofKind(kind) {
  return VALUE_PROOF_KINDS.includes(kind);
}

/**
 * The checklist for an auction that requires carrier coverage: a declared value above zero and at least one value-proof
 * document. Not required means nothing is missing.
 */
export function valueDocumentChecklist({ requireCarrierCoverage, goodsValue, documents = [] }) {
  if (requireCarrierCoverage !== true) {
    return { required: false, satisfied: true, missingItems: [] };
  }
  const missingItems = [];
  if (!(Number(goodsValue) > 0)) missingItems.push(GOODS_VALUE_MISSING_TEXT);
  if (!documents.some((document) => isValueProofKind(document.kind))) missingItems.push(VALUE_PROOF_MISSING_TEXT);
  return { required: true, satisfied: missingItems.length === 0, missingItems };
}

/** True when the shipper has chosen a kind for every document. */
export function everyDocumentClassified(documents = []) {
  return documents.every((document) => SELECTABLE_VALUE_DOCUMENT_KINDS.includes(document.kind));
}
