"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import PageHeader from "@/components/common/PageHeader";
import { useGlobalNotification } from "@/components/common/NotificationPopup";
import { getApiErrorMessage } from "@/services/errorMessage";
import { carrierProfileApi } from "@/services/carrierProfileApi";
import { mapCarrierProfile } from "@/services/carrierProfileMapper";
import CarrierHeroBanner from "./CarrierHeroBanner";
import CarrierStatsGrid from "./CarrierStatsGrid";
import LegalRepresentativeCard from "./LegalRepresentativeCard";
import FleetOverviewCard from "./FleetOverviewCard";
import DriversRosterCard from "./DriversRosterCard";
import CarrierReviewsCard from "./CarrierReviewsCard";

export default function CarrierProfileScreen({ carrierId }) {
  const router = useRouter();
  const notify = useGlobalNotification();
  const [carrier, setCarrier] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let active = true;

    if (!carrierId) {
      setLoading(false);
      setLoadError("Không xác định được mã nhà xe. Vui lòng quay lại và chọn lại đối tác.");
      return undefined;
    }

    setLoading(true);
    setLoadError("");
    Promise.all([
      carrierProfileApi.getCompany(carrierId),
      carrierProfileApi.getVehicles(carrierId),
      carrierProfileApi.getDrivers(carrierId),
    ])
      .then(([company, vehicles, drivers]) => {
        if (active) setCarrier(mapCarrierProfile({ company, vehicles, drivers }));
      })
      .catch((error) => {
        if (!active) return;
        const message = getApiErrorMessage(
          error,
          "Không thể tải hồ sơ nhà xe. Vui lòng thử lại hoặc quay lại danh sách đối tác.",
        );
        setLoadError(message);
        notify.error(message, { title: "Không thể tải hồ sơ nhà xe" });
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [carrierId, notify]);

  if (loading) {
    return (
      <Box className="flex min-h-[50vh] items-center justify-center">
        <CircularProgress sx={{ color: "#1B4965" }} />
      </Box>
    );
  }

  if (loadError || !carrier) {
    return (
      <Box className="w-full min-h-screen">
        <PageHeader
          title="Hồ sơ năng lực nhà xe"
          subtitle="Không thể hiển thị dữ liệu nhà xe từ hệ thống."
          breadcrumbs={[{ label: "Trang chủ", path: "/shipper/dashboard" }, { label: "Nhà xe" }]}
        />
        <Box className="flex min-h-48 flex-col items-center justify-center gap-4 rounded-3xl border border-rose-100 bg-rose-50/60 p-6 text-center">
          <Typography className="!font-semibold text-rose-700">{loadError || "Không tìm thấy hồ sơ nhà xe."}</Typography>
          <Button onClick={() => router.back()} variant="outlined" className="!rounded-xl !font-bold !capitalize">
            Quay lại danh sách
          </Button>
        </Box>
      </Box>
    );
  }

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
