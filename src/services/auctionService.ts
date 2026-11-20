import { appApiService } from "./apiService";
import {
  mapAuction,
  mapAuctionListResponse,
  mapBidListResponse,
} from "./mappers/auctionMapper";

/**
 * Service to interact with Bidding/Auction APIs via Next.js origin proxy routes.
 */
class AuctionService {
  async getShipperAuctions(params = {}) {
    return appApiService.get("/api/bidding/auctions", params).then(mapAuctionListResponse);
  }

  async getAuctionById(id: string) {
    return appApiService.get(`/api/bidding/auctions/${id}`).then(mapAuction);
  }

  async listBids(id: string, params = {}) {
    return appApiService.get(`/api/bidding/auctions/${id}/bids`, params).then(mapBidListResponse);
  }

  async createAuction(payload: object) {
    return appApiService.post("/api/bidding/auctions", payload).then(mapAuction);
  }

  async cancelAuction(id: string, reason?: string) {
    return appApiService
      .post(`/api/bidding/auctions/${id}/cancel`, reason ? { reason } : {})
      .then(mapAuction);
  }
}

export const auctionService = new AuctionService();
