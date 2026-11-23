import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  mapAuction,
  mapAuctionListResponse,
  mapBid,
  mapBidListResponse,
  mapMyRegistrationsResponse,
} from "./auctionMapper.js";
import { mapNotification, mapNotifications } from "./notificationMapper.js";
import { mapDriver, mapEmptyRoute, mapVehicle } from "./fleetMapper.js";
import { mapWallet, mapWalletTransactionPage, mapWithdrawal } from "./walletMapper.js";
import { mapComplaint } from "./complaintMapper.js";
import { mapTrip } from "./tripMapper.js";
import { mapAddress } from "./addressMapper.js";
import { mapContractResponse, normalizeContract } from "../contractMapper.js";

describe("web portal api mappers", () => {
  it("normalizes auction payloads, decimal amounts, and pagination without leaking _id", () => {
    const mapped = mapAuction({
      data: {
        _id: "auc-100",
        title: "HCM - Da Nang",
        maxPrice: "15000000.00",
        priceStep: { $numberDecimal: "250000" },
        depositAmount: "1500000.00",
        participationFeeAmount: "100000.00",
        weight: "12.5",
        isDepositRequired: true,
        status: "OPEN",
        awardProgress: { currentAttempt: 1, maximumAttempts: 4, status: "PENDING" },
      },
    });

    assert.equal(mapped.id, "auc-100");
    assert.equal(mapped.maxPrice, 15000000);
    assert.equal(mapped.priceStep, 250000);
    assert.equal(mapped.depositAmount, 1500000);
    assert.equal(mapped.participationFeeAmount, 100000);
    assert.equal(mapped.weight, 12.5);
    assert.equal("_id" in mapped, false);

    const page = mapAuctionListResponse({
      data: [{ _id: "auc-1", maxPrice: "5000000" }],
      pagination: { page: 1, pageSize: 20, totalItems: 1, totalPages: 1 },
    });
    assert.equal(page.data.length, 1);
    assert.equal(page.data[0].id, "auc-1");
    assert.equal(page.pagination.totalItems, 1);
  });

  it("normalizes bids and carrier registrations", () => {
    const bid = mapBid({ _id: "bid-9", auctionId: "auc-1", carrierId: "car-1", bidAmount: "9800000.00" });
    assert.equal(bid.id, "bid-9");
    assert.equal(bid.bidAmount, 9800000);
    assert.equal(bid.amount, 9800000);

    const bidPage = mapBidListResponse({
      data: [{ id: "bid-9", bidAmount: "9800000" }],
      pagination: { page: 1, pageSize: 10, totalItems: 1, totalPages: 1, remainingBids: 4 },
    });
    assert.equal(bidPage.pagination.remainingBids, 4);

    const regs = mapMyRegistrationsResponse({
      data: [
        {
          registration: { _id: "reg-1", participationFeeAmount: "50000", depositAmount: "500000" },
          auction: { id: "auc-1", maxPrice: "10000000" },
          access: { canEnter: true, accessStatus: "AUCTION_OPEN" },
        },
      ],
      pagination: { page: 1, pageSize: 10, totalItems: 1, totalPages: 1 },
    });
    assert.equal(regs.data[0].registration.id, "reg-1");
    assert.equal(regs.data[0].registration.participationFeeAmount, 50000);
    assert.equal(regs.data[0].auction.maxPrice, 10000000);
  });

  it("normalizes notifications cleanly and removes mongodb internals", () => {
    const item = mapNotification({
      _id: "notif-1",
      __v: 0,
      dedupeKey: "secret-key",
      userId: "u-1",
      title: "Thong bao",
      message: "Ban da thang thau",
      isRead: false,
      createdAt: "2026-11-20T10:00:00.000Z",
    });

    assert.equal(item.id, "notif-1");
    assert.equal(item.notifId, "notif-1");
    assert.equal(item.read, false);
    assert.equal(item.isRead, false);
    assert.equal(item.time, "2026-11-20T10:00:00.000Z");
    assert.equal("_id" in item, false);
    assert.equal("dedupeKey" in item, false);

    assert.equal(mapNotifications({ data: [item] }).length, 1);
  });

  it("normalizes vehicles, drivers, empty routes, wallet, complaints, addresses, trips, and contracts", () => {
    const vehicle = mapVehicle({
      id: "veh-1",
      licensePlate: "51C-12345",
      vehicleType: "TRUCK_HEAVY",
      payloadCapacity: 15000,
      status: "VERIFIED",
    });
    assert.equal(vehicle.plate, "51C-12345");
    assert.equal(vehicle.capacityTons, 15);
    assert.equal(vehicle.capacity, "15 tấn");
    assert.equal(vehicle.active, true);

    const driver = mapDriver({ id: "drv-1", fullName: "Nguyen Van A", licenseNumber: "FC", status: "VERIFIED" });
    assert.equal(driver.name, "Nguyen Van A");
    assert.equal(driver.active, true);

    const emptyRoute = mapEmptyRoute({ id: "er-1", truckId: "51C-12345", latitude: "10.7", longitude: "106.6", status: "PENDING" });
    assert.equal(emptyRoute.latitude, 10.7);
    assert.equal(emptyRoute.longitude, 106.6);

    const wallet = mapWallet({ id: "w-1", balance: "2500000.00", frozenBalance: "500000.00" });
    assert.equal(wallet.balance, 2500000);
    assert.equal(wallet.frozenBalance, 500000);

    const txPage = mapWalletTransactionPage({ items: [{ id: "tx-1", amount: "100000" }], page: 1, pageSize: 10, totalItems: 1, totalPages: 1 });
    assert.equal(txPage.items[0].amount, 100000);

    const wd = mapWithdrawal({ id: "wd-1", amount: "300000", maskedBankAccountNumber: "****1234" });
    assert.equal(wd.amount, 300000);

    const complaint = mapComplaint({ id: "c-1", title: "Late", messages: [{ id: "m-1", message: "Hi" }] });
    assert.equal(complaint.messages.length, 1);

    const address = mapAddress({ id: "a-1", province: "TP.HCM", latitude: "10.8", longitude: "106.7" });
    assert.equal(address.latitude, 10.8);

    const trip = mapTrip({
      id: "t-1",
      agreedPrice: "12000000",
      lateMinutes: "15",
      status: "IN_TRANSIT",
      contractStatus: "SIGNED",
      driverName: "Trương Văn Lực",
      vehiclePlate: "51C-905.31",
    });
    assert.equal(trip.agreedPrice, 12000000);
    assert.equal(trip.lateMinutes, 15);
    assert.equal(trip.contractStatus, "SIGNED");
    assert.equal(trip.driverName, "Trương Văn Lực");
    assert.equal(trip.vehiclePlate, "51C-905.31");

    const normalizedContract = normalizeContract({
      id: "con-1",
      contractCode: "HD-001",
      status: "WAITING_SIGNATURE",
      trip: { id: "t-1", auctionId: "auc-1", agreedPrice: "12000000", pickupLocation: "HCM", deliveryLocation: "HN" },
      signatures: [],
    });
    assert.equal(normalizedContract.agreedPrice, 12000000);
    assert.equal(normalizedContract.auctionId, "auc-1");
    const roleView = mapContractResponse(normalizedContract, "carrier");
    assert.equal(roleView.backendId, "con-1");
    assert.equal(roleView.id, "HD-001");
    assert.equal(roleView.canSign, true);
  });
});
