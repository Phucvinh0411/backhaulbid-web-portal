import { appApiService } from "./apiService";

/**
 * Service to interact with Bidding/Auction APIs.
 */
class AuctionService {
  /**
   * Fetch all auctions for the current shipper.
   * @param params Query parameters (page, limit, status, etc.)
   */
  async getShipperAuctions(params = {}) {
    return appApiService.get("/api/bidding/auctions", { params });
  }

  /**
   * Fetch a specific auction by ID.
   * @param id Auction ID
   */
  async getAuctionById(id) {
    return appApiService.get(`/api/bidding/auctions/${id}`);
  }

  /**
   * Create a new auction (shipper only).
   * @param payload Auction creation payload
   */
  async createAuction(payload) {
    return appApiService.post("/api/bidding/auctions", payload);
  }

  /**
   * Cancel an auction.
   * @param id Auction ID
   * @param reason Reason for cancellation
   */
  async cancelAuction(id, reason) {
    return appApiService.post(`/api/bidding/auctions/${id}/cancel`, { reason });
  }
}

export const auctionService = new AuctionService();
