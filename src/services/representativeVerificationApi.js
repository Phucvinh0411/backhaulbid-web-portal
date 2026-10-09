import { apiService } from "./apiService";
import { REPRESENTATIVE_VERIFICATION_STATUS_PATH } from "./representativeVerificationRoutes";

/** Fetches the signed-in account's existing representative verification status. */
export function getRepresentativeVerificationStatus(config) {
  return apiService.get(
    REPRESENTATIVE_VERIFICATION_STATUS_PATH,
    undefined,
    config
  );
}
