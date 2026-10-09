"use client";

// Role-based navigation: sidebar groups for desktop, bottom items for phones.

import shipperNavigation, { shipperMobileNavigation } from "./shipperNavigation";
import carrierNavigation, { carrierMobileNavigation } from "./carrierNavigation";
import adminNavigation, { adminMobileNavigation } from "./adminNavigation";

export const navigationByRole = {
  shipper: shipperNavigation,
  carrier: carrierNavigation,
  admin: adminNavigation,
};

export const mobileNavigationByRole = {
  shipper: shipperMobileNavigation,
  carrier: carrierMobileNavigation,
  admin: adminMobileNavigation,
};

export const homePathByRole = {
  shipper: "/shipper/dashboard",
  carrier: "/carrier/dashboard",
  admin: "/admin",
};

export const settingsPathByRole = {
  shipper: "/shipper/settings",
  carrier: "/carrier/settings",
  admin: "/admin/settings",
};

/** Active when the pathname equals the path or sits below it (unless exact). */
export function isPathActive(pathname, path, { exact = false, match = [] } = {}) {
  if (!pathname || !path) return false;
  if (pathname === path) return true;
  if (exact) return false;
  return [path, ...match].some((prefix) => pathname.startsWith(`${prefix}/`) || pathname === prefix);
}

const defaultNavigation = navigationByRole.shipper;
export default defaultNavigation;
