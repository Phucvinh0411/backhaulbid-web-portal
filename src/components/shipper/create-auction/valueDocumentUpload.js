import { mediaApi } from "../../../services/mediaApi.js";

/**
 * Uploads checked value-document files to the private value-document folder. Each file is kept as its object key
 * and its display name; no storage URL is kept, because the private folder never has a public link. The kind is chosen
 * by the shipper afterwards, so a new file starts with none. The caller must run validateValueDocumentFiles first.
 */
export async function uploadValueDocuments(files) {
  const keys = await Promise.all(files.map((file) => mediaApi.uploadPrivateFile(file, "goods-value-docs")));
  return files.map((file, index) => ({ key: keys[index], name: file.name, kind: "" }));
}
