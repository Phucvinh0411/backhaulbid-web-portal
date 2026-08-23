import { mediaApi } from "../../../services/mediaApi.js";
import { validateAuctionImages } from "./auctionImageValidation.js";

export async function uploadAuctionImages(files) {
  const validation = validateAuctionImages(files);
  if (!validation.valid) throw new Error(validation.message);

  return Promise.all(
    validation.files.map((file) => mediaApi.uploadFile(file, "auction-goods")),
  );
}
