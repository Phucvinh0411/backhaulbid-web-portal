import { apiService } from "./apiService";
import { dedupeInFlight } from "@/lib/inFlightRequest";
import {
  mapAuction,
  mapAuctionListResponse,
  mapAuctionValueDocumentsResponse,
  mapBid,
  mapBidListResponse,
  mapMyRegistrationsResponse,
  mapRegistration,
} from "./mappers/auctionMapper";
import { unwrapData } from "./mappers/primitives";

const biddingPath = (path) => `/api/v1/bidding${path}`;

export const createAuction = (payload, config) =>
  apiService
    .post(biddingPath("/auctions"), payload, config)
    .then(mapAuction);

export const listAuctions = (params) =>
  dedupeInFlight(`bidding:auctions:${JSON.stringify(params || {})}`, () =>
    apiService.get(biddingPath("/auctions"), params).then(mapAuctionListResponse),
  );

export const getAuction = (auctionId) =>
  apiService
    .get(biddingPath(`/auctions/${auctionId}`))
    .then(mapAuction);

export const getAuctionAccess = (auctionId) =>
  apiService
    .get(biddingPath(`/auctions/${auctionId}/registrations/access`))
    .then(unwrapData);

export const getBatchAuctionAccess = (auctionIds = []) => {
  const ids = auctionIds.map((id) => String(id || "").trim()).filter(Boolean);
  if (ids.length === 0) return Promise.resolve({});
  return apiService
    .get(biddingPath("/my-registrations/access"), {
      auctionIds: ids.join(","),
    })
    .then(unwrapData);
};

export const listMyRegistrations = (params) =>
  apiService
    .get(biddingPath("/my-registrations"), params)
    .then(mapMyRegistrationsResponse);

export const registerForAuction = (auctionId, payload) =>
  apiService
    .post(biddingPath(`/auctions/${auctionId}/registrations`), payload)
    .then(mapRegistration);

export const retryRegistrationPayment = (auctionId, registrationId, payload) =>
  apiService
    .post(
      biddingPath(
        `/auctions/${auctionId}/registrations/${registrationId}/retry-payment`,
      ),
      payload,
    )
    .then(mapRegistration);

export const cancelRegistration = (auctionId, registrationId) =>
  apiService
    .delete(
      biddingPath(`/auctions/${auctionId}/registrations/${registrationId}`),
    )
    .then(mapRegistration);

export const placeBid = (auctionId, payload) =>
  apiService
    .post(biddingPath(`/auctions/${auctionId}/bids`), payload)
    .then(mapBid);

export const listBids = (auctionId, params) =>
  apiService
    .get(biddingPath(`/auctions/${auctionId}/bids`), params)
    .then(mapBidListResponse);

export const cancelAuction = (auctionId, reason) =>
  apiService
    .post(biddingPath(`/auctions/${auctionId}/cancel`), reason ? { reason } : {})
    .then(mapAuction);

export const selectWinner = (auctionId, bidId) =>
  apiService
    .post(biddingPath(`/auctions/${auctionId}/winner`), { bidId })
    .then(mapAuction);

export const flagAuction = (auctionId, payload) =>
  apiService
    .post(biddingPath(`/auctions/${auctionId}/fraud-flag`), payload)
    .then(mapAuction);

// The owner's value documents of an auction, with the carrier-coverage checklist. Only the auction's shipper and an
// admin get it; the response never carries a storage key or URL.
export const listAuctionValueDocuments = (auctionId) =>
  apiService
    .get(biddingPath(`/auctions/${auctionId}/value-documents`))
    .then(mapAuctionValueDocumentsResponse);

// One value document, read as a blob with the signed-in session and never linked publicly.
export const downloadAuctionValueDocument = (fileLink) =>
  apiService.get(fileLink, undefined, { responseType: "blob" });
