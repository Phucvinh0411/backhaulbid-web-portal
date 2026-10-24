"use client";

import dynamic from "next/dynamic";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import AltRouteIcon from "@mui/icons-material/AltRouteOutlined";
import StraightenIcon from "@mui/icons-material/StraightenOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTimeOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForwardOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import { useRoutePreview } from "./useRoutePreview";

const RouteRoadMap = dynamic(() => import("./RouteRoadMap"), {
  ssr: false,
  loading: () => (
    <Box
      sx={{
        height: 320,
        borderRadius: "16px",
        bgcolor: "var(--color-surface-sunken)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <CircularProgress size={28} />
    </Box>
  ),
});

/**
 * Displays the road route and distance between pickup (A) and delivery (B).
 */
export default function RouteRoadPreviewCard({ form }) {
  const fromPlace = form.fromPlace;
  const toPlace = form.toPlace;
  const { routeData, loading, hasBothPoints, fromCoord, toCoord } = useRoutePreview(
    fromPlace,
    toPlace
  );

  return (
    <section className="space-y-4 rounded-xl border border-line/80 bg-white p-6 shadow-xs transition-all">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-info-soft text-info shadow-xs">
            <AltRouteIcon className="!text-[1.2rem]" />
          </div>
          <div>
            <Typography className="!text-sm !font-black text-ink">
              Lộ Trình & Khoảng Cách Vận Chuyển
            </Typography>
            <span className="text-[0.7rem] font-medium text-ink-subtle">
              Tuyến đường bộ tối ưu giữa Điểm Lấy (A) và Điểm Giao (B)
            </span>
          </div>
        </div>

        {/* Distance & Time Badges */}
        {routeData && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 shadow-xs">
              <StraightenIcon className="!text-[1.1rem] text-emerald-700" />
              <span className="text-sm font-black text-emerald-800">
                {routeData.distanceKm} km
              </span>
              <span className="text-[0.7rem] font-bold text-emerald-600">
                (Đường bộ)
              </span>
            </div>

            {routeData.durationText && (
              <div className="flex items-center gap-1.5 rounded-xl border border-line bg-surface-sunken px-3 py-1.5">
                <AccessTimeIcon className="!text-[1rem] text-ink-muted" />
                <span className="text-xs font-bold text-ink">
                  {routeData.durationText}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content Area */}
      {!hasBothPoints ? (
        <div className="flex flex-col items-center justify-center gap-2.5 rounded-2xl border border-dashed border-line bg-surface-sunken/60 py-10 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-xs text-ink-muted">
            <AltRouteIcon className="!text-[1.6rem]" />
          </div>
          <div className="max-w-md px-4">
            <p className="text-sm font-bold text-ink">Chưa có lộ trình</p>
            <p className="mt-1 text-xs text-ink-muted">
              Vui lòng chọn cả <strong>Điểm Nhận Hàng (A)</strong> và <strong>Điểm Giao Hàng (B)</strong> ở trên để hệ thống tự động vẽ đường đi và tính số km thực tế.
            </p>
          </div>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-line bg-surface-sunken/40 py-12 text-center">
          <CircularProgress size={30} sx={{ color: "var(--color-info)" }} />
          <p className="text-xs font-bold text-ink">Đang tìm tuyến đường bộ tối ưu giữa Điểm A và Điểm B…</p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Map */}
          <RouteRoadMap
            fromCoord={fromCoord}
            toCoord={toCoord}
            fromLabel={fromPlace?.locationName}
            toLabel={toPlace?.locationName}
            coordinates={routeData?.coordinates || []}
            isRoad={routeData?.isRoad}
            height={340}
          />

          {/* Quick Route Strip */}
          <div className="flex flex-col gap-2 rounded-xl border border-line bg-surface-sunken/60 p-3 sm:flex-row sm:items-center sm:justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-info font-black text-white text-[0.7rem]">
                A
              </span>
              <span className="truncate font-bold text-ink">
                {fromPlace?.locationName || fromPlace?.province}
              </span>
              <ArrowForwardIcon className="!text-[0.9rem] text-ink-muted shrink-0" />
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-success font-black text-white text-[0.7rem]">
                B
              </span>
              <span className="truncate font-bold text-ink">
                {toPlace?.locationName || toPlace?.province}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Chip
                size="small"
                variant="outlined"
                color={routeData?.isRoad ? "success" : "warning"}
                label={routeData?.isRoad ? "Đường bộ tối ưu" : "Đường thẳng (Ước tính)"}
                className="!font-bold !text-[0.7rem]"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[0.72rem] text-ink-subtle">
            <InfoOutlinedIcon className="!text-[0.85rem]" />
            <span>Khoảng cách được tính toán chính xác theo mạng lưới giao thông đường bộ Việt Nam.</span>
          </div>
        </div>
      )}
    </section>
  );
}
