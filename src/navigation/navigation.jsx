"use client";

// ============================================
// Sidebar Role-Based Navigation Configuration
// ============================================

import shipperNavigation from "./shipperNavigation";
import carrierNavigation from "./carrierNavigation";
import adminNavigation from "./adminNavigation";

export const navigationByRole = {
  shipper: shipperNavigation,
  carrier: carrierNavigation,
  admin: adminNavigation,
};

// By default export the shipper navigation to prevent breaking current sidebar imports
const defaultNavigation = navigationByRole.shipper;
export default defaultNavigation;
