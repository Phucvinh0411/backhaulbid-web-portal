import assert from "node:assert/strict";
import test from "node:test";
import {
  getPageItems,
  getPageMeta,
  toWithdrawalApiStatus,
  unwrapListData,
} from "./responseData.js";

test("unwrapListData_reads_nested_paged_response", () => {
  assert.deepEqual(
    unwrapListData({ data: { data: [{ id: "auction-1" }], totalElements: 1 } }),
    [{ id: "auction-1" }],
  );
});

test("unwrapListData_preserves_direct_arrays_and_empty_fallback", () => {
  assert.deepEqual(unwrapListData([{ id: "auction-1" }]), [{ id: "auction-1" }]);
  assert.deepEqual(unwrapListData({ data: { items: [{ id: "auction-2" }] } }), [{ id: "auction-2" }]);
  assert.deepEqual(unwrapListData({ data: null }), []);
});

test("getPageItems_reads_the_wallet_data_field_from_a_paged_response", () => {
  const response = {
    data: [{ id: "withdrawal-1" }],
    page: 1,
    pageSize: 10,
    totalItems: 3,
    totalPages: 1,
  };

  assert.deepEqual(getPageItems(response), [{ id: "withdrawal-1" }]);
  assert.deepEqual(getPageMeta(response), {
    page: 1,
    pageSize: 10,
    totalItems: 3,
    totalPages: 1,
  });
});

test("getPageItems_supports_nested_service_wrappers", () => {
  assert.deepEqual(
    getPageItems({ data: { data: [{ id: "withdrawal-2" }], pagination: { totalItems: 1 } } }),
    [{ id: "withdrawal-2" }],
  );
});

test("toWithdrawalApiStatus_maps_the_completed_ui_tab_to_approved", () => {
  assert.equal(toWithdrawalApiStatus("COMPLETED"), "APPROVED");
  assert.equal(toWithdrawalApiStatus("PENDING"), "PENDING");
  assert.equal(toWithdrawalApiStatus("ALL"), undefined);
});
