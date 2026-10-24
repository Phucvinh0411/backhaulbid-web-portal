"use client";

import { useState } from "react";
import Button from "@mui/material/Button";
import MapIcon from "@mui/icons-material/MapOutlined";
import AddressSearchInput from "./AddressSearchInput";
import MapPickerDialog from "./MapPickerDialog";
import SelectedPlaceCard from "./SelectedPlaceCard";

/**
 * Shopee-style address field: one search box with suggestions, a "pick on map" button, and a card for the chosen place.
 * value and onChange use the Place shape { id, locationName, address, province, point }; null means nothing chosen.
 */
export default function AddressPickerField({
  value,
  onChange,
  label,
  placeholder,
  mapTitle,
  required = false,
  disabled = false,
  error = false,
  helperText,
}) {
  const [mapOpen, setMapOpen] = useState(false);

  const confirmFromMap = (place) => {
    onChange(place);
    setMapOpen(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
        <AddressSearchInput
          value={value}
          onSelect={onChange}
          onClear={() => onChange(null)}
          label={label}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          error={error}
          helperText={helperText}
        />
        <Button
          variant="outlined"
          onClick={() => setMapOpen(true)}
          disabled={disabled}
          startIcon={<MapIcon />}
          className="!h-14 !shrink-0 !rounded-2xl !px-4 !font-bold !normal-case"
        >
          Chọn trên bản đồ
        </Button>
      </div>

      {value && (
        <SelectedPlaceCard
          place={value}
          disabled={disabled}
          onEditOnMap={() => setMapOpen(true)}
          onProvinceChange={(province) => onChange({ ...value, province })}
        />
      )}

      {mapOpen && (
        <MapPickerDialog
          open
          title={mapTitle}
          initialPlace={value}
          onClose={() => setMapOpen(false)}
          onConfirm={confirmFromMap}
        />
      )}
    </div>
  );
}
