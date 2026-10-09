"use client";

import { useParams } from "next/navigation";
import Box from "@mui/material/Box";
import PageHeader from "@/components/common/PageHeader";
import TripTrackingView from "@/components/tracking/TripTrackingView";
import { shortId } from "@/lib/format";

export default function CarrierTripPage() {
  const { id } = useParams();
  return (
    <Box>
      <PageHeader
        title={`Chuyến #${shortId(id)}`}
        breadcrumbs={[
          { label: "Trang chủ", path: "/carrier/dashboard" },
          { label: "Chuyến vận chuyển", path: "/carrier/transports" },
          { label: `#${shortId(id)}` },
        ]}
      />
      <TripTrackingView tripId={id} role="carrier" />
    </Box>
  );
}
