import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  mapAuction,
  mapAuctionListResponse,
  mapBidListResponse,
  mapMyRegistrationsResponse,
} from "./auctionMapper.js";
import {
  mapBackendToBid,
  mapBackendToShipment,
} from "../shipperAuctionMapper.js";
import {
  getContractTrackingHref,
  mapContractResponses,
  normalizeContracts,
} from "../contractMapper.js";
import { getPageItems, getPageMeta, unwrapListData } from "../responseData.js";
import {
  mapAdminWalletSummary,
  mapPaymentOrderPage,
  mapWallet,
  mapWalletTransactionPage,
  mapWithdrawalPage,
} from "./walletMapper.js";
import { mapDrivers, mapEmptyRoutes, mapVehicles } from "./fleetMapper.js";
import { mapComplaints } from "./complaintMapper.js";
import { mapAddresses } from "./addressMapper.js";
import { mapNotifications } from "./notificationMapper.js";
import {
  mapCargoDocumentsResponse,
  mapDelaySettlements,
  mapDeliveryProofs,
  mapInsuranceClaims,
  mapJourneyEvents,
  mapLocationHistoryResponse,
  mapTripHandovers,
  mapTripLocations,
  mapTripReviews,
  mapTrips,
  mapTripTrackingSnapshot,
} from "./tripMapper.js";

describe("end-to-end frontend consumer compatibility with api mappers", () => {
  it("supports shipperAuctionMapper, ActionInbox, BiddingSessionsScreen, and useShipperDashboard over mapped auctions", () => {
    const rawPage = {
      statusCode: 200,
      data: {
        data: [
          {
            _id: "auc-e2e-1",
            shipperId: "shipper-1",
            title: "Lo hang linh kien dien tu",
            goodsType: "ELECTRONICS",
            weight: 8,
            volume: 24,
            goodsValue: "350000000.00",
            vehicleTypeRequired: "TRUCK_HEAVY",
            origin: "TP.HCM",
            destination: "Ha Noi",
            pickupLocation: {
              locationName: "Kho Tan Binh",
              address: "10 Cong Hoa",
              province: "TP.HCM",
              earliestTime: "2026-11-21T08:00:00.000Z",
              latestTime: "2026-11-21T12:00:00.000Z",
            },
            deliveryLocation: {
              locationName: "Kho Long Bien",
              address: "20 Nguyen Van Linh",
              province: "Ha Noi",
              earliestTime: "2026-11-23T08:00:00.000Z",
              latestTime: "2026-11-23T18:00:00.000Z",
            },
            auctionType: "PUBLIC",
            requireCarrierCoverage: true,
            maxPrice: "22000000.00",
            priceStep: "500000.00",
            maxBids: 10,
            isDepositRequired: true,
            depositAmount: "2200000.00",
            participationFeeAmount: "100000.00",
            status: "OPEN",
            roomOpen: true,
            startTime: "2026-11-20T09:00:00.000Z",
            endTime: "2026-11-20T18:00:00.000Z",
            registrationEndTime: "2026-11-20T08:30:00.000Z",
          },
        ],
        pagination: { page: 1, pageSize: 20, totalItems: 1, totalPages: 1 },
      },
    };

    const mappedPage = mapAuctionListResponse(rawPage);
    const items = unwrapListData(mappedPage);
    const meta = getPageMeta(mappedPage);

    assert.equal(items.length, 1);
    assert.equal(meta.totalPages, 1);
    assert.equal(items[0].id, "auc-e2e-1");
    assert.equal(items[0].maxPrice, 22000000);

    // Verify idempotency when shipperAuctionMapper is called on an already-mapped auction
    const shipment = mapBackendToShipment(items[0]);
    assert.equal(shipment.id, "auc-e2e-1");
    assert.equal(shipment.maxPrice, 22000000);
    assert.equal(shipment.priceStep, 500000);
    assert.equal(shipment.depositAmount, 2200000);
    assert.equal(shipment.participationFee, 100000);
    assert.equal(shipment.from.province, "TP.HCM");
    assert.equal(shipment.to.province, "Ha Noi");
    assert.equal(shipment.status, "active_bids");

    // Verify bids list & mapBackendToBid compatibility
    const bidPage = mapBidListResponse({
      data: [
        { _id: "b-1", carrierId: "c-1", bidAmount: "20000000.00", bidTime: "2026-11-20T10:00:00Z" },
        { _id: "b-2", carrierId: "c-2", bidAmount: "19500000.00", bidTime: "2026-11-20T10:05:00Z" },
      ],
      pagination: { page: 1, pageSize: 20, totalItems: 2, totalPages: 1, remainingBids: 8 },
    });
    const uiBids = bidPage.data.map(mapBackendToBid);
    assert.equal(uiBids[1].isLowest, true);
    assert.equal(uiBids[1].bidAmount, 19500000);
    assert.equal(bidPage.pagination.remainingBids, 8);

    // Verify carrier my-registrations list
    const myRegs = mapMyRegistrationsResponse({
      data: [
        {
          registration: { _id: "r-1", auctionId: "auc-e2e-1", vehicleId: "v-1", participationFeeAmount: "100000" },
          auction: mapAuction(items[0]),
          access: { canEnter: true, accessStatus: "AUCTION_OPEN" },
        },
      ],
      pagination: { page: 1, pageSize: 20, totalItems: 1, totalPages: 1 },
    });
    assert.equal(unwrapListData(myRegs)[0].registration.id, "r-1");
  });

  it("supports ActionInbox, useShipperDashboard, and ContractsManagementScreen over normalized contracts and trips", () => {
    const normalizedList = normalizeContracts([
      {
        id: "con-101",
        contractCode: "HD-2026-101",
        shipperId: "shipper-1",
        carrierId: "carrier-1",
        status: "WAITING_SIGNATURE",
        signingDeadlineAt: "2026-11-21T10:00:00Z",
        createdAt: "2026-11-20T10:00:00Z",
        trip: {
          id: "trip-101",
          auctionId: "auc-e2e-1",
          pickupLocation: "TP.HCM",
          deliveryLocation: "Ha Noi",
          agreedPrice: "19500000.00",
          status: "WAITING_PICKUP",
          lateMinutes: 0,
        },
        signatures: [{ accountId: "carrier-1", role: "CARRIER", signedAt: "2026-11-20T11:00:00Z" }],
      },
    ]);

    // 1. ActionInbox & useShipperDashboard read raw status + trip.agreedPrice directly from contractApi.listMine()
    assert.equal(normalizedList[0].status, "WAITING_SIGNATURE");
    assert.equal(normalizedList[0].trip.agreedPrice, 19500000);
    assert.equal(normalizedList[0].agreedPrice, 19500000);

    // 2. ContractsManagementScreen & carrier/contracts call mapContractResponses(normalizedList, role)
    const shipperCards = mapContractResponses(normalizedList, "shipper");
    assert.equal(shipperCards[0].backendId, "con-101");
    assert.equal(shipperCards[0].id, "HD-2026-101");
    assert.equal(shipperCards[0].canSign, true);
    assert.equal(getContractTrackingHref(shipperCards[0], "shipper"), "/shipper/tracking?id=trip-101");

    // 3. Trip sub-resources
    assert.equal(mapTrips([{ id: "trip-101", agreedPrice: "19500000" }])[0].agreedPrice, 19500000);
    assert.equal(mapTripLocations([{ id: "loc-1", latitude: "10.7", longitude: "106.6" }])[0].latitude, 10.7);
    assert.equal(mapJourneyEvents([{ id: "ev-1", eventType: "DRIVER_ACCEPTED" }])[0].eventType, "DRIVER_ACCEPTED");
    assert.equal(mapDeliveryProofs([{ id: "dp-1", imageUrl: "/img.png" }])[0].imageUrl, "/img.png");
    assert.equal(mapTripHandovers([{ tripId: "trip-101", readyForPickup: true }])[0].readyForPickup, true);
    assert.equal(mapTripReviews([{ id: "rev-1", rating: "5" }])[0].rating, 5);
    assert.equal(mapDelaySettlements([{ id: "ds-1", totalCompensationAmount: "500000" }])[0].totalCompensationAmount, 500000);
    assert.equal(mapCargoDocumentsResponse({ declaredGoodsValue: "100000000", documents: [{ id: "cd-1" }] }).declaredGoodsValue, 100000000);
    assert.equal(mapInsuranceClaims([{ id: "clm-1", claimedAmount: "2000000" }])[0].claimedAmount, 2000000);
    assert.equal(mapTripTrackingSnapshot({ tripId: "trip-101", routeVersion: "2" }).routeVersion, 2);
    assert.equal(mapLocationHistoryResponse({ points: [{ id: "p-1", latitude: "10.8" }], totalPoints: "1" }).points[0].latitude, 10.8);
  });

  it("supports WalletScreen, AdminWalletsPage, Fleet, Complaints, Addresses, and Header Notifications", () => {
    const wallet = mapWallet({ accountId: "acc-1", balance: "10000000.00", frozenBalance: "2000000.00" });
    assert.equal(wallet.availableBalance, 8000000);

    const summary = mapAdminWalletSummary({
      auctionFees: "500000.00",
      deposits: "20000000.00",
      withdrawals: "4000000.00",
      successfulTransactions: 42,
    });
    assert.equal(summary.auctionFees, 500000);
    assert.equal(summary.deposits, 20000000);
    assert.equal(summary.withdrawals, 4000000);
    assert.equal(summary.successfulTransactions, 42);

    const txPage = mapWalletTransactionPage({
      data: [{ id: "tx-1", amount: "500000.00", type: "DEPOSIT", status: "SUCCESS" }],
      page: 1,
      pageSize: 10,
      totalItems: 1,
      totalPages: 1,
    });
    assert.equal(getPageItems(txPage)[0].amount, 500000);

    const wdPage = mapWithdrawalPage({
      items: [{ id: "wd-1", amount: "1000000.00", status: "PENDING" }],
      page: 1,
      pageSize: 10,
      totalItems: 1,
      totalPages: 1,
    });
    assert.equal(getPageItems(wdPage)[0].amount, 1000000);

    const topUpPage = mapPaymentOrderPage({
      items: [{ paymentOrderId: "po-1", invoiceNumber: "INV-1", amount: "2000000.00" }],
      page: 1,
      pageSize: 10,
      totalItems: 1,
      totalPages: 1,
    });
    assert.equal(getPageItems(topUpPage)[0].amount, 2000000);

    assert.equal(mapVehicles([{ id: "v-1", licensePlate: "51C-11111", payloadCapacity: 8000 }])[0].capacityTons, 8);
    assert.equal(mapDrivers([{ id: "d-1", fullName: "Tai Xe A", status: "VERIFIED" }])[0].active, true);
    assert.equal(mapEmptyRoutes([{ id: "er-1", latitude: "10.7", longitude: "106.7" }])[0].latitude, 10.7);
    assert.equal(mapComplaints([{ id: "c-1", title: "Kieu nai" }])[0].id, "c-1");
    assert.equal(mapAddresses([{ id: "a-1", latitude: "10.9" }])[0].latitude, 10.9);
    assert.equal(mapNotifications([{ _id: "n-1", isRead: false }])[0].notifId, "n-1");
  });
});
