"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import { ResponsiveDialog } from "@/components/ui";
import AddressSearchInput from "./AddressSearchInput";
import ResolvedPlacePanel from "./ResolvedPlacePanel";
import { isAbortError } from "./nominatimClient";
import { toConfirmedPoint } from "./placeParser";
import { useGeolocation } from "./useGeolocation";
import { useReverseGeocode } from "./useReverseGeocode";

const MAP_HEIGHT = 380;
const FOCUS_ZOOM = 16;

const PointPickerMap = dynamic(() => import("@/components/map/PointPickerMap"), {
  ssr: false,
  loading: () => <Box sx={{ height: MAP_HEIGHT, bgcolor: "var(--color-surface-sunken)" }} />,
});

/**
 * Full map picker. Tap or drag the pin, search, or use the current position; each pin is turned into an address.
 * Nothing reaches the form until the user confirms. Mount it only while open so it starts from initialPlace.
 */
export default function MapPickerDialog({ open, onClose, onConfirm, initialPlace = null, title = "Chọn vị trí trên bản đồ" }) {
  const resolve = useReverseGeocode();
  const { locate, locating, error: locateError } = useGeolocation();
  const [draft, setDraft] = useState({ place: initialPlace, status: initialPlace ? "ready" : "idle" });

  const point = draft.place?.point ?? null;

  const pinAt = async ({ latitude, longitude }) => {
    const pinned = toConfirmedPoint(latitude, longitude);
    setDraft((old) => ({ place: { ...old.place, point: pinned }, status: "loading" }));
    try {
      const place = await resolve(pinned);
      // The pin stays exactly where the user put it; only the address comes from the lookup.
      setDraft(place ? { place: { ...place, point: pinned }, status: "ready" } : { place: { point: pinned }, status: "notFound" });
    } catch (error) {
      if (!isAbortError(error)) setDraft({ place: { point: pinned }, status: "error" });
    }
  };

  const pinCurrentPosition = () => locate().then(pinAt).catch(() => {});

  const selectSuggestion = (place) => setDraft({ place, status: "ready" });

  const canConfirm = draft.status === "ready" && Boolean(draft.place?.address);

  return (
    <ResponsiveDialog
      open={open}
      onClose={onClose}
      title={title}
      titleId="map-picker-dialog-title"
      maxWidth="md"
      actions={
        <>
          <Button onClick={onClose} variant="text">Huỷ</Button>
          <Button
            variant="contained"
            disabled={!canConfirm}
            onClick={() => onConfirm(draft.place)}
          >
            Xác nhận vị trí
          </Button>
        </>
      }
    >
      <Box className="space-y-3">
        <AddressSearchInput
          value={draft.status === "ready" ? draft.place : null}
          onSelect={selectSuggestion}
          onClear={() => {}}
          label="Tìm nhanh địa chỉ"
        />

        <Box sx={{ position: "relative", borderRadius: 3, overflow: "hidden", border: "1px solid var(--color-line)" }}>
          <PointPickerMap point={point} onPick={pinAt} height={MAP_HEIGHT} scrollWheelZoom focusZoom={FOCUS_ZOOM} />
          <Button
            size="small"
            variant="contained"
            onClick={pinCurrentPosition}
            disabled={locating}
            startIcon={locating ? <CircularProgress size={14} color="inherit" /> : <MyLocationIcon />}
            className="!absolute !bottom-3 !right-3 !z-[2] !bg-white !text-ink shadow-sm hover:!bg-surface-sunken"
          >
            {locating ? "Đang lấy vị trí…" : "Vị trí của tôi"}
          </Button>
        </Box>

        {locateError && <Alert severity="warning">{locateError}</Alert>}
        <ResolvedPlacePanel place={draft.place} status={draft.status} />
      </Box>
    </ResponsiveDialog>
  );
}
