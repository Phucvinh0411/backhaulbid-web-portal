// Checks for the optional proof of the goods' declared value (invoice, receipt). Pure: no imports, no network.
// The server checks the real file type again from its first bytes; this only keeps the picker honest.
export const VALUE_DOCUMENT_MAX_FILES = 5;
export const VALUE_DOCUMENT_MAX_BYTES = 15 * 1024 * 1024;
export const VALUE_DOCUMENT_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/webp", "image/gif"];

/**
 * Checks the files chosen for value documents before anything is uploaded.
 * `alreadyAttached` counts the documents the form already holds, so the limit covers both.
 */
export function validateValueDocumentFiles(files, alreadyAttached = 0) {
  const list = Array.from(files ?? []);
  if (list.length === 0) return { valid: false, message: "Chọn ít nhất một tệp chứng từ.", files: [] };
  if (alreadyAttached + list.length > VALUE_DOCUMENT_MAX_FILES) {
    return { valid: false, message: `Tối đa ${VALUE_DOCUMENT_MAX_FILES} chứng từ cho một phiên.`, files: [] };
  }
  for (const file of list) {
    if (!VALUE_DOCUMENT_TYPES.includes(file.type)) {
      return { valid: false, message: `Tệp ${file.name} không phải PDF hoặc ảnh.`, files: [] };
    }
    if (file.size > VALUE_DOCUMENT_MAX_BYTES) {
      return { valid: false, message: `Tệp ${file.name} vượt quá 15 MB.`, files: [] };
    }
  }
  return { valid: true, message: "", files: list };
}
