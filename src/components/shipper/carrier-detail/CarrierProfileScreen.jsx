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
import CarrierReputationHistory from "./CarrierReputationHistory";

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
      carrierProfileApi.getReputation(carrierId).catch(() => null),
      // Review data is read with the same API as the winner-selection modal. A failure leaves the card in its
      // "not loaded" state; it never turns into a zero-review profile.
      carrierProfileApi.getReviewSummary(carrierId).catch(() => null),
      carrierProfileApi.getReviews(carrierId, { page: 1, pageSize: 10 }).catch(() => null),
    ])
      .then(([company, vehicles, drivers, reputation, reviewSummary, reviewPage]) => {
        if (active) setCarrier({
          ...mapCarrierProfile({ company, vehicles, drivers, reviewSummary, reviews: reviewPage?.items ?? [] }),
          reputationScore: reputation?.score ?? null,
          reputationHistory: reputation?.history ?? [],
        });
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
        <CircularProgress sx={{ color: "var(--color-brand)" }} />
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
        <Box className="flex min-h-48 flex-col items-center justify-center gap-4 rounded-xl border border-danger-soft bg-danger-soft/60 p-6 text-center">
          <Typography className="!font-semibold text-danger">{loadError || "Không tìm thấy hồ sơ nhà xe."}</Typography>
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

      <CarrierReputationHistory reputation={carrier.reputationScore == null ? null : { score: carrier.reputationScore, history: carrier.reputationHistory }} />

      {/* Section 1: Legal & Enterprise Details */}
      <LegalRepresentativeCard carrier={carrier} />

      {/* Section 2: Fleet Overview */}
      <FleetOverviewCard fleet={carrier.fleet} />

      {/* Section 3: Drivers Roster */}
      <DriversRosterCard drivers={carrier.drivers} />

      {/* Section 4: Reviews & Feedback */}
      <CarrierReviewsCard summary={carrier.reviewSummary} reviews={carrier.reviews} />
    </Box>
  );
}
