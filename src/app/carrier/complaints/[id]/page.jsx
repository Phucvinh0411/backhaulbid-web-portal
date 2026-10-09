"use client";

import { use } from "react";
import ComplaintDetailScreen from "@/components/complaints/ComplaintDetailScreen";

export default function CarrierComplaintDetailPage({ params }) {
  const { id } = use(params);
  return <ComplaintDetailScreen role="carrier" id={id} />;
}
