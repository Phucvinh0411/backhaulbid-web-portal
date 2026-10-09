"use client";

import { use } from "react";
import ComplaintDetailScreen from "@/components/complaints/ComplaintDetailScreen";

export default function ShipperComplaintDetailPage({ params }) {
  const { id } = use(params);
  return <ComplaintDetailScreen role="shipper" id={id} />;
}
