import { apiService as axiosClient } from "./apiService";
import { createMultipartUploadConfig, getUploadedFileUrl } from "./mediaUploadConfig.js";

export { createMultipartUploadConfig, getUploadedFileUrl } from "./mediaUploadConfig.js";

export const mediaApi = {
  /**
   * Upload a file to S3
   * @param {File} file 
   * @param {string} folder (optional) e.g., 'complaints', 'avatars'
   * @returns {Promise<{url: string}>}
   */
  uploadFile: async (file, folder = "uploads") => {
    const formData = new FormData();
    formData.append("file", file);
    if (folder) {
      formData.append("folder", folder);
    }
    
    // Gateway route: /api/v1/media/upload -> media-service
    const response = await axiosClient.post(
      "/api/v1/media/upload",
      formData,
      createMultipartUploadConfig(),
    );
    return getUploadedFileUrl(response);
  },
};
