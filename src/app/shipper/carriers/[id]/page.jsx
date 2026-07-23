"use client";

import { use } from "react";
import CarrierProfileScreen from "@/components/shipper/carrier-detail/CarrierProfileScreen";

export default function ShipperCarrierDetailPage({ params }) {
  const carrierId = typeof params?.then === "function" ? use(params)?.id : params?.id;
  return <CarrierProfileScreen carrierId={carrierId} />;
}
