import { mediaApi } from "../../../services/mediaApi.js";

/**
 * Uploads checked value-document files to the private value-document folder and returns their upload URLs in the
 * same order. The caller must run validateValueDocumentFiles first.
 */
export async function uploadValueDocuments(files) {
  return Promise.all(files.map((file) => mediaApi.uploadFile(file, "goods-value-docs")));
}
