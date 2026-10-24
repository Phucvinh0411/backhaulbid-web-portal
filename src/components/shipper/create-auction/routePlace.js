// Pure conversions between the route Place kept in the form, the address book, and the auction payload.
import { coordinate } from "../../tracking/trackingPresentation.js";

const text = (value) => (typeof value === "string" ? value.trim() : "");

/** A place the backend accepts: it needs a name, a province and an address. The pin is optional. */
export function isCompletePlace(place) {
  return Boolean(text(place?.locationName) && text(place?.province) && text(place?.address));
}

/** Place from a saved address book entry. The saved pin is kept only when it is a valid coordinate. */
export function placeFromAddressBookEntry(entry) {
  const position = coordinate(entry);
  return {
    id: `address-book-${entry.id}`,
    locationName: text(entry.label),
    address: text(entry.detail),
    province: text(entry.province),
    point: position
      ? {
          latitude: position[0],
          longitude: position[1],
          coordinateSource: entry.coordinateSource,
          coordinateConfirmedAt: entry.coordinateConfirmedAt,
        }
      : null,
  };
}

/** Body for addressBookApi.create matching backend AddressRequest validations. */
export function addressBookPayloadFromPlace(place, { contactName, contactPhone } = {}) {
  const position = coordinate(place?.point);
  const coordinatesPayload = position
    ? {
        latitude: position[0],
        longitude: position[1],
        coordinateSource: "USER_CONFIRMED",
        coordinateConfirmedAt: place?.point?.coordinateConfirmedAt || new Date().toISOString(),
      }
    : {};

  return {
    ...coordinatesPayload,
    label: text(place?.locationName).slice(0, 120),
    province: text(place?.province).slice(0, 120),
    detail: text(place?.address).slice(0, 500),
    contactName: text(contactName).slice(0, 150) || "Người đại diện kho",
    contactPhone: text(contactPhone),
  };
}

/** Location fields of the auction payload. Coordinates are sent only for a valid, user-confirmed pin. */
export function locationPayloadFromPlace(place) {
  const position = coordinate(place?.point);
  return {
    ...(position
      ? {
          latitude: position[0],
          longitude: position[1],
          coordinateSource: "USER_CONFIRMED",
          coordinateConfirmedAt: place.point.coordinateConfirmedAt,
        }
      : {}),
    locationName: text(place?.locationName),
    province: text(place?.province),
    address: text(place?.address),
  };
}
