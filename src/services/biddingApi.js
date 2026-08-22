import { apiService } from "./apiService";

const biddingPath = (path) => `/api/v1/bidding${path}`;

const unwrapApiData = (response) => response?.data ?? response;

export const createAuction = (payload) =>
  apiService.post(biddingPath("/auctions"), payload);

export const listAuctions = (params) =>
  apiService.get(biddingPath("/auctions"), params);

export const getAuction = (auctionId) =>
  apiService
    .get(biddingPath(`/auctions/${auctionId}`))
    .then(unwrapApiData);

export const getAuctionAccess = (auctionId) =>
  apiService
    .get(biddingPath(`/auctions/${auctionId}/registrations/access`))
    .then(unwrapApiData);

export const listMyRegistrations = (params) =>
  apiService.get(biddingPath("/my-registrations"), params);

export const registerForAuction = (auctionId, payload) =>
  apiService.post(
    biddingPath(`/auctions/${auctionId}/registrations`),
    payload,
  ).then(unwrapApiData);

export const retryRegistrationPayment = (auctionId, registrationId, payload) =>
  apiService.post(
    biddingPath(
      `/auctions/${auctionId}/registrations/${registrationId}/retry-payment`,
    ),
    payload,
  ).then(unwrapApiData);

export const cancelRegistration = (auctionId, registrationId) =>
  apiService.delete(
    biddingPath(`/auctions/${auctionId}/registrations/${registrationId}`),
  );

export const placeBid = (auctionId, payload) =>
  apiService
    .post(biddingPath(`/auctions/${auctionId}/bids`), payload)
    .then(unwrapApiData);

export const listBids = (auctionId, params) =>
  apiService
    .get(biddingPath(`/auctions/${auctionId}/bids`), params)
    .then(unwrapApiData);

export const cancelAuction = (auctionId) =>
  apiService.post(biddingPath(`/auctions/${auctionId}/cancel`));

export const flagAuction = (auctionId, payload) =>
  apiService.post(biddingPath(`/auctions/${auctionId}/fraud-flag`), payload);
