import { apiService } from "./apiService";

const QUIET = { skipGlobalNotification: true };

function unwrap(response) {
  return response?.data ?? response;
}

async function settled(promise) {
  try {
    return { state: "ready", data: unwrap(await promise) };
  } catch (error) {
    return { state: "error", error };
  }
}

export async function loadAccountProfile() {
  return settled(apiService.get("/api/v1/accounts/me", undefined, QUIET));
}

export async function updateAccountAvatar(avatarUrl) {
  return unwrap(await apiService.patch("/api/v1/accounts/me/avatar", { avatarUrl }, QUIET));
}

export async function loadBusinessProfile() {
  return settled(apiService.get("/api/v1/business-verifications/me", undefined, QUIET));
}

export async function loadRepresentativeProfile() {
  const [verification, overview] = await Promise.all([
    settled(apiService.get("/api/v1/representative-verifications/me", undefined, QUIET)),
    settled(apiService.get("/api/v1/representative-verifications/me/overview", { reveal: true }, QUIET)),
  ]);

  return { verification, overview };
}

export async function loadOwnerProfile() {
  const [account, business, representative] = await Promise.all([
    loadAccountProfile(),
    loadBusinessProfile(),
    loadRepresentativeProfile(),
  ]);
  return { account, business, representative };
}
