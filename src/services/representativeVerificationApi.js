import { apiService } from "./apiService";
import {
  REPRESENTATIVE_VERIFICATION_PATH,
  REPRESENTATIVE_VERIFICATION_STATUS_PATH,
} from "./representativeVerificationRoutes";

export {
  REPRESENTATIVE_VERIFICATION_PATH,
  REPRESENTATIVE_VERIFICATION_STATUS_PATH,
};

export async function submitRepresentativeVerification(payload) {
  return apiService.post(
    REPRESENTATIVE_VERIFICATION_PATH,
    payload
  );
}

export async function getRepresentativeVerificationStatus(config) {
  return apiService.get(
    REPRESENTATIVE_VERIFICATION_STATUS_PATH,
    undefined,
    config
  );
}
