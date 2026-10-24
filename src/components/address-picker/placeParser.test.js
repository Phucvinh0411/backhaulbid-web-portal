import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  normalizeKey,
  addressSegments,
  resolveProvince,
  pickLocationName,
  toConfirmedPoint,
  parsePlace,
  secondaryText,
} from "./placeParser.js";
import {
  isCompletePlace,
  placeFromAddressBookEntry,
  addressBookPayloadFromPlace,
  locationPayloadFromPlace,
} from "../shipper/create-auction/routePlace.js";
import { formatDuration } from "../shipper/create-auction/steps/route/routeFormat.js";

describe("placeParser", () => {
  it("normalizes keys across accents, spaces and prefixes", () => {
    assert.equal(normalizeKey("Thành phố Hồ Chí Minh"), "hochiminh");
    assert.equal(normalizeKey("Tỉnh Thái Nguyên"), "thainguyen");
    assert.equal(normalizeKey("Hòa Bình"), "hoabinh");
    assert.equal(normalizeKey("Hoà Bình"), "hoabinh");
  });

  it("resolves province with pre-merger names and aliases", () => {
    assert.equal(resolveProvince({ state: "Tỉnh Thái Nguyên" }), "Thái Nguyên");
    // Pre-merger mapping: Bình Dương -> Hồ Chí Minh
    assert.equal(resolveProvince({ state: "Bình Dương" }), "Hồ Chí Minh");
    // Fallback from displayName segments
    assert.equal(
      resolveProvince(null, "KCN Yên Bình, Phổ Yên, Thái Nguyên, Việt Nam"),
      "Thái Nguyên"
    );
  });

  it("extracts display segments dropping Vietnam country and postcodes", () => {
    const segments = addressSegments(
      "KCN Yên Bình, Phổ Yên, Thái Nguyên, 250000, Việt Nam"
    );
    assert.deepEqual(segments, ["KCN Yên Bình", "Phổ Yên", "Thái Nguyên"]);
  });

  it("picks a human location name", () => {
    assert.equal(
      pickLocationName("Kho SamSung", ["Số 10", "Đường 3/2", "Thái Nguyên"]),
      "Kho SamSung"
    );
    assert.equal(
      pickLocationName("", ["10", "Đường 3/2", "Thái Nguyên"]),
      "10 Đường 3/2"
    );
    assert.equal(
      pickLocationName("", ["Cảng Đình Vũ", "Hải Phòng"]),
      "Cảng Đình Vũ"
    );
  });

  it("parses valid Nominatim item into Place", () => {
    const raw = {
      place_id: 123456,
      name: "Kho Samsung Yên Bình",
      lat: "21.43424",
      lon: "105.89621",
      display_name: "Kho Samsung Yên Bình, Phổ Yên, Thái Nguyên, Việt Nam",
      address: {
        state: "Thái Nguyên",
        country_code: "vn",
      },
    };
    const place = parsePlace(raw);
    assert.ok(place);
    assert.equal(place.id, "123456");
    assert.equal(place.locationName, "Kho Samsung Yên Bình");
    assert.equal(place.province, "Thái Nguyên");
    assert.equal(place.point.latitude, 21.43424);
    assert.equal(place.point.longitude, 105.89621);
    assert.equal(place.point.coordinateSource, "USER_CONFIRMED");
  });

  it("computes secondaryText cleanly", () => {
    const place = {
      locationName: "Kho Samsung",
      address: "Kho Samsung, KCN Yên Bình, Phổ Yên, Thái Nguyên",
    };
    assert.equal(
      secondaryText(place),
      "KCN Yên Bình, Phổ Yên, Thái Nguyên"
    );
  });
});

describe("routePlace", () => {
  it("validates isCompletePlace", () => {
    assert.equal(
      isCompletePlace({ locationName: "Kho A", province: "Hà Nội", address: "123 Phố Huế" }),
      true
    );
    assert.equal(
      isCompletePlace({ locationName: "", province: "Hà Nội", address: "123 Phố Huế" }),
      false
    );
  });

  it("converts address book entry to Place", () => {
    const entry = {
      id: "abc-1",
      label: "Kho Hà Nội",
      province: "Hà Nội",
      detail: "123 Phố Huế",
      latitude: 21.0285,
      longitude: 105.8542,
    };
    const place = placeFromAddressBookEntry(entry);
    assert.equal(place.id, "address-book-abc-1");
    assert.equal(place.locationName, "Kho Hà Nội");
    assert.equal(place.province, "Hà Nội");
    assert.equal(place.address, "123 Phố Huế");
    assert.equal(place.point.latitude, 21.0285);
  });

  it("creates valid location payload from Place", () => {
    const place = {
      locationName: "Cảng Đình Vũ",
      province: "Hải Phòng",
      address: "Đông Hải 2, Hải An, Hải Phòng",
      point: toConfirmedPoint(20.8449, 106.6881),
    };
    const payload = locationPayloadFromPlace(place);
    assert.equal(payload.locationName, "Cảng Đình Vũ");
    assert.equal(payload.province, "Hải Phòng");
    assert.equal(payload.address, "Đông Hải 2, Hải An, Hải Phòng");
    assert.equal(payload.latitude, 20.8449);
    assert.equal(payload.longitude, 106.6881);
    assert.equal(payload.coordinateSource, "USER_CONFIRMED");
  });

  it("creates valid address book payload from Place", () => {
    const place = {
      locationName: "Kho Hà Nội",
      province: "Hà Nội",
      address: "123 Phố Huế",
      point: { latitude: 21.0285, longitude: 105.8542 },
    };
    const payload = addressBookPayloadFromPlace(place, {
      contactName: "Nguyễn Văn A",
      contactPhone: "0912345678",
    });
    assert.equal(payload.label, "Kho Hà Nội");
    assert.equal(payload.province, "Hà Nội");
    assert.equal(payload.detail, "123 Phố Huế");
    assert.equal(payload.contactName, "Nguyễn Văn A");
    assert.equal(payload.contactPhone, "0912345678");
  });

  it("formats road trip duration accurately", () => {
    assert.equal(formatDuration(2700), "~45 phút");
    assert.equal(formatDuration(7200), "~2 giờ");
    assert.equal(formatDuration(8100), "~2 giờ 15 phút");
  });
});
