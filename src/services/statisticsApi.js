import { apiService } from "./apiService";

const QUIET = { skipGlobalNotification: true };
const unwrap = (response) => response?.data ?? response;
const settle = async (request) => {
  try { return { state: "ready", data: unwrap(await request()) }; }
  catch (error) { return { state: "error", error }; }
};

export const statisticsApi = {
  shipper: (range) => Promise.all([
    settle(() => apiService.get("/api/v1/bidding/statistics/me", range, QUIET)),
    settle(() => apiService.get("/api/v1/trips/statistics/me", range, QUIET)),
  ]).then(([auctions, trips]) => ({ auctions, trips })),
  carrier: (range) => Promise.all([
    settle(() => apiService.get("/api/v1/bidding/statistics/me", range, QUIET)),
    settle(() => apiService.get("/api/v1/trips/statistics/me", range, QUIET)),
    settle(() => apiService.get("/api/v1/fleet/statistics/me", undefined, QUIET)),
  ]).then(([auctions, trips, fleet]) => ({ auctions, trips, fleet })),
  admin: (range) => Promise.all([
    settle(() => apiService.get("/api/v1/accounts/statistics/admin", range, QUIET)),
    settle(() => apiService.get("/api/v1/bidding/statistics/admin", range, QUIET)),
    settle(() => apiService.get("/api/v1/trips/statistics/admin", range, QUIET)),
    settle(() => apiService.get("/api/v1/wallets/statistics/admin", range, QUIET)),
    settle(() => apiService.get("/api/v1/fleet/statistics/admin", undefined, QUIET)),
    settle(() => apiService.get("/api/v1/complaints/statistics/admin", undefined, QUIET)),
  ]).then(([accounts, auctions, trips, wallet, fleet, complaints]) => ({ accounts, auctions, trips, wallet, fleet, complaints })),
};
