"use client";

import dynamic from "next/dynamic";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import EditLocationIcon from "@mui/icons-material/EditLocationAltOutlined";
import PlaceIcon from "@mui/icons-material/Place";
import { coordinate } from "@/components/tracking/trackingPresentation";
import { VIETNAM_PROVINCES } from "@/utils/provinces";

const PREVIEW_HEIGHT = 132;
const PROVINCE_NAMES = VIETNAM_PROVINCES.map((province) => province.name);

const PointPickerMap = dynamic(() => import("@/components/map/PointPickerMap"), {
  ssr: false,
  loading: () => <Box sx={{ height: PREVIEW_HEIGHT, bgcolor: "var(--color-surface-sunken)" }} />,
});

/**
 * The chosen place: name, full address, province and a small map. Tapping the map opens the full picker.
 * If the province could not be read from the address, the user picks it here instead of guessing from the pin.
 */
export default function SelectedPlaceCard({ place, onEditOnMap, onProvinceChange, disabled = false }) {
  const position = coordinate(place.point);
  const point = position ? { latitude: position[0], longitude: position[1] } : null;

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white">
      <div className="flex items-start gap-3 p-3">
        <PlaceIcon className="mt-0.5 shrink-0 text-danger" />
        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="text-sm font-bold text-ink">{place.locationName}</p>
          <p className="text-xs font-medium text-ink-muted">{place.address}</p>
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            {place.province && <Chip size="small" label={place.province} className="!font-semibold" />}
            <Chip
              size="small"
              variant="outlined"
              color={point ? "success" : "warning"}
              label={point ? `Đã ghim · ${position[0].toFixed(5)}, ${position[1].toFixed(5)}` : "Chưa ghim trên bản đồ"}
              className="!font-semibold tabular"
            />
          </div>
        </div>
      </div>

      {!place.province && (
        <div className="px-3 pb-3">
          <Autocomplete
            options={PROVINCE_NAMES}
            value={null}
            onChange={(_event, province) => province && onProvinceChange(province)}
            disabled={disabled}
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                required
                label="Tỉnh / Thành phố"
                helperText="Không đọc được tỉnh/thành từ địa chỉ này, vui lòng chọn."
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px" } }}
              />
            )}
          />
        </div>
      )}

      <button
        type="button"
        onClick={onEditOnMap}
        disabled={disabled}
        aria-label="Chỉnh vị trí trên bản đồ"
        className="group relative block w-full border-t border-line text-left"
      >
        {point ? (
          <div className="pointer-events-none">
            <PointPickerMap point={point} onPick={() => {}} disabled height={PREVIEW_HEIGHT} focusZoom={15} />
          </div>
        ) : (
          <div className="flex items-center justify-center bg-surface-sunken" style={{ height: PREVIEW_HEIGHT }}>
            <span className="text-xs font-medium text-ink-muted">Chưa có ghim — chạm để đặt vị trí chính xác</span>
          </div>
        )}
        <span className="absolute bottom-2 right-2 z-[2] flex items-center gap-1 rounded-lg bg-white/95 px-2.5 py-1 text-xs font-bold text-ink shadow-sm transition group-hover:bg-white">
          <EditLocationIcon className="!text-[0.95rem]" />
          {point ? "Chỉnh ghim" : "Đặt ghim"}
        </span>
      </button>
    </div>
  );
}
