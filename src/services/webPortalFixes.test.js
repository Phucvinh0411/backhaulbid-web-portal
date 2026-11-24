import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { getApiErrorMessage } from "./errorMessage.js";
import { getSepayOrderStatusMeta, getAdminStatusMeta } from "../lib/statusMeta.js";
import { getVehicleDocumentPath, getDriverLicenseDocumentPath } from "../lib/fleetDocuments.js";
import { dedupeInFlight } from "../lib/inFlightRequest.js";
import { formatAddress, formatCurrencyAxisTick } from "../lib/format.js";
import { getHandoverState } from "../components/tracking/tripHandoverPresentation.js";
import { validateCreateAuctionForm } from "../components/shipper/create-auction/createAuctionValidation.js";
import { mapCarrierProfile } from "./carrierProfileMapper.js";
import {
  formatPaymentMethodLabel,
  formatTransactionDescription,
  formatTransactionReference,
  formatTransactionShortId,
  formatTransactionStatusLabel,
  formatTransactionTypeLabel,
} from "./walletFormatters.js";

describe("web portal error localization, status labels, media proxies & chart ticks", () => {
  it("translates 409 already-verified eKYC errors and 503 outages cleanly without false network message", () => {
    const conflictError = {
      response: {
        status: 409,
        data: { message: "Identity is already verified" },
      },
    };
    const conflictMsg = getApiErrorMessage(conflictError, "Không thể kết nối tới máy chủ.");
    assert.match(conflictMsg, /đã hoàn tất xác thực/i);
    assert.doesNotMatch(conflictMsg, /Không thể kết nối/i);

    const outageError = {
      response: {
        status: 503,
        data: { message: "Identity verification service unavailable" },
      },
    };
    const outageMsg = getApiErrorMessage(outageError, "Không thể kết nối tới máy chủ.");
    assert.match(outageMsg, /tạm gián đoạn|quá tải/i);
    assert.doesNotMatch(outageMsg, /Không thể kết nối/i);

    const unknownHttp500 = {
      response: { status: 500, data: { message: "Unexpected NullPointerException" } },
    };
    const serverMsg = getApiErrorMessage(unknownHttp500, "Không thể kết nối tới máy chủ.");
    assert.doesNotMatch(serverMsg, /Không thể kết nối tới máy chủ/);

    const trueNetworkErr = { message: "Network Error" };
    assert.equal(
      getApiErrorMessage(trueNetworkErr, "Không thể kết nối tới máy chủ."),
      "Không thể kết nối tới máy chủ.",
    );
  });

  it("provides Vietnamese labels for SePay order and admin review statuses", () => {
    assert.equal(getSepayOrderStatusMeta("CREATED").label, "Chờ chuyển khoản");
    assert.equal(getSepayOrderStatusMeta("PAID").label, "Đã thanh toán");
    assert.equal(getSepayOrderStatusMeta("EXPIRED").label, "Hết hạn");
    assert.equal(getSepayOrderStatusMeta("PAID").tone, "success");

    assert.equal(getAdminStatusMeta("PENDING").label, "Chờ duyệt");
    assert.equal(getAdminStatusMeta("EXPIRED").label, "Hết hạn");
    assert.equal(getAdminStatusMeta("VERIFIED").label, "Đã xác minh");
  });

  it("builds authenticated fleet proxy paths instead of raw private S3 URLs", () => {
    assert.equal(
      getVehicleDocumentPath("veh-1", "registration"),
      "/api/v1/vehicles/veh-1/documents/registration",
    );
    assert.equal(
      getVehicleDocumentPath("veh-1", "inspection"),
      "/api/v1/vehicles/veh-1/documents/inspection",
    );
    assert.equal(
      getDriverLicenseDocumentPath("drv-1"),
      "/api/v1/drivers/drv-1/license-document",
    );
  });

  it("deduplicates concurrent in-flight requests cleanly and allows fresh calls after settlement", async () => {
    let calls = 0;
    const loader = () =>
      dedupeInFlight("contracts:mine", async () => {
        calls += 1;
        await new Promise((resolve) => setTimeout(resolve, 15));
        return [{ id: `c-${calls}` }];
      });

    const [a, b] = await Promise.all([loader(), loader()]);
    assert.equal(calls, 1);
    assert.deepEqual(a, [{ id: "c-1" }]);
    assert.deepEqual(b, [{ id: "c-1" }]);

    const c = await loader();
    assert.equal(calls, 2);
    assert.deepEqual(c, [{ id: "c-2" }]);
  });

  it("formats chart Y-axis ticks compactly without overflowing narrow gutters", () => {
    assert.equal(formatCurrencyAxisTick(0), "0 đ");
    assert.equal(formatCurrencyAxisTick(9_500_000), "9.5tr");
    assert.equal(formatCurrencyAxisTick(12_000_000), "12tr");
    assert.equal(formatCurrencyAxisTick(750_000), "750k");
  });

  it("distinguishes missing handover photos from non-pickup trip status", () => {
    const withPhotos = getHandoverState({
      handover: { photoPaths: ["/api/v1/trips/t1/handover/photos/0"] },
      tripStatus: "IN_TRANSIT",
    });
    assert.equal(withPhotos.canConfirm, false);
    assert.doesNotMatch(withPhotos.message, /chưa có ảnh hàng hóa/i);

    const withoutPhotos = getHandoverState({
      handover: { photoPaths: [] },
      tripStatus: "WAITING_PICKUP",
    });
    assert.equal(withoutPhotos.canConfirm, false);
    assert.match(withoutPhotos.message, /chưa có ảnh hàng hóa/i);
  });

  it("deduplicates consecutive repeated province names and translates carrier fleet metadata", () => {
    assert.equal(formatAddress("TP. Thuận An, Bình Dương, Bình Dương"), "TP. Thuận An, Bình Dương");
    assert.equal(formatAddress("Q. Hải Châu, Đà Nẵng, Đà Nẵng"), "Q. Hải Châu, Đà Nẵng");

    const mapped = mapCarrierProfile({
      company: { companyName: "Phúc An", verificationStatus: "VERIFIED" },
      vehicles: [{ id: "v1", licensePlate: "51C-468.25", vehicleType: "TRUCK_MEDIUM", bodyType: "Thùng kín", payloadCapacity: 8, status: "VERIFIED" }],
      drivers: [],
    });
    assert.equal(mapped.fleet[0].type, "Xe tải trung");
    assert.equal(mapped.fleet[0].status, "Đã duyệt");
  });

  it("localizes wallet transaction fields, shortens UUIDs, and reclassifies auction creation fee labels", () => {
    const auctionFeeTx = {
      id: "74b956f4-1111-2222-3333-444455556666",
      type: "PENALTY",
      status: "SUCCESS",
      paymentMethod: "INTERNAL_WALLET",
      referenceCode: "auction_creation_fee_e19a385f-aaaa-bbbb-cccc-ddddeeeeffff:forfeit",
      description: "Forfeit auction deposit hold 83685e5a-1111-2222-3333-444455556666",
    };
    assert.equal(formatTransactionShortId(auctionFeeTx.id), "#74B956F4");
    assert.equal(formatTransactionTypeLabel(auctionFeeTx), "Phí tạo phiên đấu giá");
    assert.equal(formatTransactionStatusLabel(auctionFeeTx.status), "Thành công");
    assert.equal(formatPaymentMethodLabel(auctionFeeTx.paymentMethod), "Ví nội bộ BackhaulBid");
    assert.equal(formatTransactionReference(auctionFeeTx.referenceCode), "Phiên #E19A385F");
    assert.equal(formatTransactionDescription(auctionFeeTx), "Thanh toán phí tạo phiên đấu giá #E19A385F");

    const withdrawHoldTx = {
      id: "12345678-1111-2222-3333-444455556666",
      type: "FREEZE",
      referenceCode: "WITHDRAWAL_HOLD:abcdef12-1111-2222-3333-444455556666",
      description: "Hold for withdrawal request abcdef12-1111-2222-3333-444455556666",
    };
    assert.equal(formatTransactionTypeLabel(withdrawHoldTx), "Tạm giữ yêu cầu rút tiền");
    assert.equal(formatTransactionReference(withdrawHoldTx.referenceCode), "Yêu cầu rút #ABCDEF12");
    assert.equal(formatTransactionDescription(withdrawHoldTx), "Tạm giữ số dư cho yêu cầu rút tiền #ABCDEF12");

    const withdrawReleaseTx = {
      type: "UNFREEZE",
      referenceCode: "WITHDRAWAL_RELEASE:abcdef12-1111-2222-3333-444455556666",
      description: "Hoàn tạm giữ do từ chối yêu cầu rút tiền #ABCDEF12",
    };
    assert.equal(formatTransactionTypeLabel(withdrawReleaseTx), "Hoàn tạm giữ yêu cầu rút tiền");
    assert.equal(formatTransactionStatusLabel("CANCELLED"), "Đã hủy");
  });

  it("translates registration duplicate phone/email and wallet conflict errors into Vietnamese", () => {
    const dupPhone = { response: { status: 400, data: { message: "Phone number already exists" } } };
    assert.equal(getApiErrorMessage(dupPhone), "Số điện thoại này đã được đăng ký.");

    const dupEmail = { response: { status: 400, data: { message: "Email already exists" } } };
    assert.equal(getApiErrorMessage(dupEmail), "Email này đã được sử dụng.");
  });

  it("requires complete and consistent pickup and delivery time windows when creating an auction", () => {
    const now = new Date("2026-11-24T10:00:00.000Z");
    const baseValid = {
      goodsName: "Hàng bách hóa",
      goodsCategory: "Hàng tiêu dùng nhanh (FMCG)",
      weight: 5,
      requiredVehicleType: "TRUCK_MEDIUM",
      valueDocuments: [],
      requireCarrierCoverage: false,
      fromPlace: { locationName: "Kho A", province: "TP. Hồ Chí Minh", address: "123 Lê Lợi" },
      toPlace: { locationName: "Kho B", province: "Đà Nẵng", address: "456 Nguyễn Văn Linh" },
      maxPrice: 10_000_000,
      priceStep: 100_000,
      isDepositRequired: true,
      depositAmount: 1_000_000,
      regStartTime: "2026-11-24T11:00:00.000Z",
      regEndTime: "2026-11-25T10:00:00.000Z",
      startTime: "2026-11-25T10:00:00.000Z",
      endTime: "2026-11-25T12:00:00.000Z",
      earliestPickup: "2026-11-26T14:00:00.000Z",
      latestPickup: "2026-11-26T18:00:00.000Z",
      earliestDelivery: "2026-11-27T08:00:00.000Z",
      latestDelivery: "2026-11-27T18:00:00.000Z",
    };

    assert.equal(validateCreateAuctionForm(baseValid, now), null);
    assert.match(
      validateCreateAuctionForm({ ...baseValid, earliestPickup: "", latestPickup: "" }, now),
      /nhận hàng/i,
    );
    assert.match(
      validateCreateAuctionForm({ ...baseValid, earliestDelivery: "", latestDelivery: "" }, now),
      /giao hàng/i,
    );
    assert.match(
      validateCreateAuctionForm({ ...baseValid, earliestPickup: "2026-11-25T11:00:00.000Z" }, now),
      /sau thời điểm kết thúc đấu giá/i,
    );
    assert.match(
      validateCreateAuctionForm(
        {
          ...baseValid,
          earliestDelivery: "2026-11-26T10:00:00.000Z",
          latestDelivery: "2026-11-26T12:00:00.000Z",
        },
        now,
      ),
      /không được trước thời gian nhận hàng/i,
    );
  });
});
