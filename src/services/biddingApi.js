import { apiService } from "./apiService";

const biddingPath = (path) => `/api/v1/bidding${path}`;

export const createAuction = (payload) =>
  apiService.post(biddingPath("/auctions"), payload);

export const listAuctions = (params) =>
  apiService.get(biddingPath("/auctions"), params);

export const getAuction = (auctionId) =>
  apiService.get(biddingPath(`/auctions/${auctionId}`));

export const getAuctionAccess = (auctionId) =>
  apiService.get(biddingPath(`/auctions/${auctionId}/registrations/access`));

export const listMyRegistrations = (params) =>
  apiService.get(biddingPath("/my-registrations"), params);

export const registerForAuction = (auctionId, payload) =>
  apiService.post(
    biddingPath(`/auctions/${auctionId}/registrations`),
    payload,
  );

export const retryRegistrationPayment = (auctionId, registrationId, payload) =>
  apiService.post(
    biddingPath(
      `/auctions/${auctionId}/registrations/${registrationId}/retry-payment`,
    ),
    payload,
  );

export const cancelRegistration = (auctionId, registrationId) =>
  apiService.delete(
    biddingPath(`/auctions/${auctionId}/registrations/${registrationId}`),
  );

export const placeBid = (auctionId, payload) =>
  apiService.post(biddingPath(`/auctions/${auctionId}/bids`), payload);

export const listBids = (auctionId, params) =>
  apiService.get(biddingPath(`/auctions/${auctionId}/bids`), params);

export const cancelAuction = (auctionId) =>
  apiService.post(biddingPath(`/auctions/${auctionId}/cancel`));

export const flagAuction = (auctionId, payload) =>
  apiService.post(biddingPath(`/auctions/${auctionId}/fraud-flag`), payload);
