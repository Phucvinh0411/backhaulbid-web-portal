"use client";

import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import PageHeader from "@/components/common/PageHeader";
import CarrierHeroBanner from "./CarrierHeroBanner";
import CarrierStatsGrid from "./CarrierStatsGrid";
import LegalRepresentativeCard from "./LegalRepresentativeCard";
import FleetOverviewCard from "./FleetOverviewCard";
import DriversRosterCard from "./DriversRosterCard";
import CarrierReviewsCard from "./CarrierReviewsCard";
import { getCarrierByCode } from "./mockData";

export default function CarrierProfileScreen({ carrierId }) {
  const router = useRouter();
  const carrier = getCarrierByCode(carrierId);

  return (
    <Box className="w-full min-h-screen">
      {/* Page Header with Breadcrumbs */}
      <PageHeader
        title="Hồ Sơ Năng Lực Nhà Xe"
        subtitle="Thông tin pháp lý doanh nghiệp, năng lực đội xe, tài xế và uy tín của đối tác vận tải."
        breadcrumbs={[
          { label: "Trang chủ", path: "/shipper/dashboard" },
          { label: "Đấu giá vận tải", path: "/shipper/bidding/sessions" },
          { label: "Danh sách nhà xe", path: "/shipper/bidding/sessions" },
          { label: carrier.carrierName },
        ]}
      />

      {/* Hero Banner with Contact CTA */}
      <CarrierHeroBanner carrier={carrier} onBack={() => router.back()} />

      {/* Stats Grid */}
      <CarrierStatsGrid carrier={carrier} />

      {/* Section 1: Legal & Enterprise Details */}
      <LegalRepresentativeCard carrier={carrier} />

      {/* Section 2: Fleet Overview */}
      <FleetOverviewCard fleet={carrier.fleet} />

      {/* Section 3: Drivers Roster */}
      <DriversRosterCard drivers={carrier.drivers} />

      {/* Section 4: Reviews & Feedback */}
      <CarrierReviewsCard reviews={carrier.reviews} />
    </Box>
  );
}
