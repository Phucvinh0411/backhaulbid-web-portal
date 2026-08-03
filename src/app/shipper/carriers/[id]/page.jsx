"use client";

import { use } from "react";
import CarrierProfileScreen from "@/components/shipper/carrier-detail/CarrierProfileScreen";

export default function ShipperCarrierDetailPage({ params }) {
  const { id } = use(params);
  return <CarrierProfileScreen carrierId={id} />;
}
