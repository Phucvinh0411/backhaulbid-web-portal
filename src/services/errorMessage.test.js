import test from "node:test";
import assert from "node:assert/strict";
import { getApiErrorMessage } from "./errorMessage.js";

test("Given the standardized wallet conflict envelope, When extracting an API failure, Then the popup explains the problem and next step in Vietnamese", () => {
  const error = { response: { data: { error: { code: "WALLET_409", message: "Payment order has expired" } } } };

  assert.equal(
    getApiErrorMessage(error, "Không thể thực hiện yêu cầu."),
    "Đơn nạp hoặc giao dịch ví đang ở trạng thái không thể tiếp tục. Vui lòng kiểm tra số dư và trạng thái đơn rồi thử lại.",
  );
});

test("Given a legacy Vietnamese error payload, When extracting an API failure, Then the useful user message remains compatible", () => {
  const error = { response: { data: { message: "Số dư ví không đủ để thanh toán." } } };

  assert.equal(getApiErrorMessage(error, "Không thể thực hiện yêu cầu."), "Số dư ví không đủ để thanh toán.");
});

test("Given an auction schedule validation error, When extracting an API failure, Then the field and correction are explained in Vietnamese", () => {
  const error = {
    response: {
      data: {
        error: { code: "BIDDING_400", message: "registrationStartTime must be before registrationEndTime" },
      },
    },
  };

  assert.equal(
    getApiErrorMessage(error, "Không thể thực hiện yêu cầu."),
    "Thời điểm mở đăng ký phải trước thời điểm đóng đăng ký. Vui lòng kiểm tra lại khung thời gian.",
  );
});

test("Given a forbidden API response, When extracting an API failure, Then the popup explains the permission problem", () => {
  const error = { response: { status: 403, data: { message: "You do not have access to this resource" } } };

  assert.equal(
    getApiErrorMessage(error, "Không thể thực hiện yêu cầu."),
    "Tài khoản hiện tại không có quyền thực hiện thao tác này. Vui lòng kiểm tra đúng vai trò tài khoản.",
  );
});

test("Given an unmapped technical English error, When extracting an API failure, Then the raw technical text is not shown", () => {
  const error = { response: { data: { message: "NullPointerException at WalletController.java:42" } } };

  assert.equal(
    getApiErrorMessage(error, "Không thể tải dữ liệu ví. Vui lòng thử lại."),
    "Không thể tải dữ liệu ví. Vui lòng thử lại.",
  );
});

test("Given a wallet hold contract failure, When extracting an API failure, Then the popup explains the wallet problem", () => {
  const error = {
    response: {
      status: 500,
      data: { message: "Wallet did not return a creation fee hold" },
    },
  };

  assert.equal(
    getApiErrorMessage(error, "KhÃ´ng thá»ƒ táº¡o phiÃªn Ä‘áº¥u giÃ¡."),
    "Dá»‹ch vá»¥ vÃ­ chÆ°a tráº£ vá» mÃ£ giá»¯ phÃ­ táº¡o phiÃªn. Giao dá»‹ch chÆ°a hoÃ n táº¥t; vui lÃ²ng thá»­ láº¡i sau hoáº·c liÃªn há»‡ quáº£n trá»‹ viÃªn.",
  );
});
