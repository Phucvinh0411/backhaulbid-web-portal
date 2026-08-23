export function createMultipartUploadConfig() {
  return { headers: { "Content-Type": "multipart/form-data" } };
}

export function getUploadedFileUrl(response) {
  return response?.url || response?.data?.url || "";
}
