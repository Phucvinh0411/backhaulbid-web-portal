export const AUCTION_IMAGE_MAX_COUNT = 5;
export const AUCTION_IMAGE_MAX_BYTES = 10 * 1024 * 1024;
export const AUCTION_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export function validateAuctionImages(files) {
  const selectedFiles = Array.from(files || []);

  if (selectedFiles.length > AUCTION_IMAGE_MAX_COUNT) {
    return { valid: false, files: [], message: `Tối đa ${AUCTION_IMAGE_MAX_COUNT} ảnh cho mỗi lô hàng.` };
  }

  const invalidType = selectedFiles.find((file) => !AUCTION_IMAGE_TYPES.has(file.type));
  if (invalidType) {
    return { valid: false, files: [], message: "Ảnh phải có định dạng JPEG, PNG hoặc WebP." };
  }

  const oversized = selectedFiles.find((file) => file.size > AUCTION_IMAGE_MAX_BYTES);
  if (oversized) {
    return { valid: false, files: [], message: "Mỗi ảnh không được vượt quá 10 MB." };
  }

  return { valid: true, files: selectedFiles };
}
