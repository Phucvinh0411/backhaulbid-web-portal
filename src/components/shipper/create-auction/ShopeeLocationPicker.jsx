"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { VIETNAM_PROVINCES } from "@/utils/provinces";

// Dynamic import to prevent SSR errors with Leaflet
const ShopeePinMap = dynamic(() => import("./ShopeePinMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[280px] rounded-2xl bg-surface-sunken animate-pulse flex flex-col items-center justify-center text-xs text-ink-muted border border-line gap-2">
      <CircularProgress size={24} sx={{ color: "var(--color-ink-muted)" }} />
      <span>Đang tải bản đồ...</span>
    </div>
  ),
});

/**
 * Extracts a matching Vietnamese province from address details or raw text
 */
export function extractProvince(addressObj, rawText = "") {
  if (addressObj) {
    const raw =
      addressObj.state || addressObj.city || addressObj.province || "";
    const clean = raw
      .replace(/^(Tỉnh|Thành phố|Thành Phố|TP\.)\s+/i, "")
      .trim();
    if (clean) {
      const match = VIETNAM_PROVINCES.find(
        (p) =>
          p.name.toLowerCase() === clean.toLowerCase() ||
          clean.toLowerCase().includes(p.name.toLowerCase()) ||
          p.name.toLowerCase().includes(clean.toLowerCase()),
      );
      if (match) return match.name;
      return clean;
    }
  }

  if (rawText) {
    for (const p of VIETNAM_PROVINCES) {
      if (rawText.toLowerCase().includes(p.name.toLowerCase())) {
        return p.name;
      }
    }
  }

  return "Hồ Chí Minh";
}

/**
 * Extracts a concise location name (warehouse/building/street)
 */
export function extractLocationName(name, fullAddress = "") {
  if (name && name.trim()) return name.trim().slice(0, 120);
  if (fullAddress) {
    const parts = fullAddress.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length > 0) return parts[0].slice(0, 120);
  }
  return "Địa điểm kho";
}

export default function ShopeeLocationPicker({
  point,
  address,
  locationName,
  onChange,
  letter = "A",
  color = "#1B4965",
  label = "Vị trí lấy hàng",
  placeholder = "Nhập địa chỉ hoặc tìm kiếm địa điểm trên bản đồ...",
  disabled = false,
}) {
  const [query, setQuery] = useState(address || locationName || "");
  const [suggestions, setSuggestions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [locating, setLocating] = useState(false);
  const [reverseLoading, setReverseLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const searchTimer = useRef(null);
  const dropdownRef = useRef(null);

  // Sync query when parent address changes externally (e.g. from Address Book)
  useEffect(() => {
    if (address || locationName) {
      const display = address || locationName || "";
      setQuery(display);
    }
  }, [address, locationName]);

  // Click outside listener to close autocomplete dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Forward Geocoding: Search places with Nominatim
  const handleQueryChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setStatusMessage("");

    if (!value.trim() || value.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    if (searchTimer.current) clearTimeout(searchTimer.current);

    searchTimer.current = setTimeout(async () => {
      setSearching(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&countrycodes=vn&addressdetails=1&limit=6&q=${encodeURIComponent(
          value.trim(),
        )}`;
        const res = await fetch(url, {
          headers: { Accept: "application/json" },
        });
        if (res.ok) {
          const data = await res.json();
          setSuggestions(Array.isArray(data) ? data : []);
          setShowDropdown(Array.isArray(data) && data.length > 0);
        }
      } catch (err) {
        console.warn("Geocoding search failed:", err);
      } finally {
        setSearching(false);
      }
    }, 450);
  };

  // Reverse Geocoding: Fetch address when marker is dragged or map clicked
  const reverseGeocode = useCallback(
    async (lat, lng) => {
      setReverseLoading(true);
      try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`;
        const res = await fetch(url, {
          headers: { Accept: "application/json" },
        });
        if (res.ok) {
          const data = await res.json();
          const displayAddress = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
          const extractedName = extractLocationName(data.name, displayAddress);
          const extractedProv = extractProvince(data.address, displayAddress);

          setQuery(displayAddress);
          setStatusMessage("Đã cập nhật vị trí theo ghim trên bản đồ");

          onChange({
            point: {
              latitude: lat,
              longitude: lng,
              coordinateSource: "USER_CONFIRMED",
              coordinateConfirmedAt: new Date().toISOString(),
            },
            address: displayAddress,
            locationName: extractedName,
            province: extractedProv,
          });
          return;
        }
      } catch (err) {
        console.warn("Reverse geocode failed:", err);
      } finally {
        setReverseLoading(false);
      }

      // Fallback if reverse geocode fails: still update coords
      onChange({
        point: {
          latitude: lat,
          longitude: lng,
          coordinateSource: "USER_CONFIRMED",
          coordinateConfirmedAt: new Date().toISOString(),
        },
        address: query || `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
        locationName: locationName || "Điểm ghim bản đồ",
        province: extractProvince(null, query),
      });
    },
    [locationName, onChange, query],
  );

  // When a suggestion from the dropdown is clicked
  const handleSelectSuggestion = (item) => {
    const lat = Number(item.lat);
    const lng = Number(item.lon);
    const displayAddress = item.display_name || "";
    const extractedName = extractLocationName(item.name, displayAddress);
    const extractedProv = extractProvince(item.address, displayAddress);

    setQuery(displayAddress);
    setSuggestions([]);
    setShowDropdown(false);
    setStatusMessage("Đã ghim vị trí chính xác trên bản đồ");

    onChange({
      point: {
        latitude: lat,
        longitude: lng,
        coordinateSource: "USER_CONFIRMED",
        coordinateConfirmedAt: new Date().toISOString(),
      },
      address: displayAddress,
      locationName: extractedName,
      province: extractedProv,
    });
  };

  // Map click / pin drag handler
  const handlePinPicked = ({ latitude, longitude }) => {
    reverseGeocode(latitude, longitude);
  };

  // GPS My Location
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      setStatusMessage("Trình duyệt không hỗ trợ định vị GPS.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        reverseGeocode(lat, lng);
      },
      (err) => {
        setLocating(false);
        setStatusMessage("Không lấy được vị trí GPS. Hãy nhập địa chỉ hoặc chạm vào bản đồ.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    setShowDropdown(false);
    setStatusMessage("");
    onChange({
      point: null,
      address: "",
      locationName: "",
      province: "",
    });
  };

  const lat = point?.latitude;
  const lng = point?.longitude;
  const isPinned = Number.isFinite(lat) && Number.isFinite(lng);

  return (
    <div className="space-y-3 relative" ref={dropdownRef}>
      {/* 1 Single Search Input Box */}
      <div className="relative">
        <TextField
          fullWidth
          disabled={disabled}
          label={label}
          placeholder={placeholder}
          value={query}
          onChange={handleQueryChange}
          onFocus={() => {
            if (suggestions.length > 0) setShowDropdown(true);
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <LocationOnIcon style={{ color }} className="!text-[1.25rem]" />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                {searching || reverseLoading ? (
                  <CircularProgress size={18} style={{ color }} />
                ) : query ? (
                  <IconButton size="small" onClick={handleClear} edge="end">
                    <ClearIcon className="!text-[1rem] text-ink-muted hover:text-ink" />
                  </IconButton>
                ) : (
                  <SearchIcon className="!text-[1.1rem] text-ink-muted" />
                )}
              </InputAdornment>
            ),
          }}
          sx={{
            "& .MuiOutlinedInput-root": {
              borderRadius: "16px",
              backgroundColor: "#ffffff",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              "&:hover": {
                borderColor: color,
              },
              "&.Mui-focused": {
                borderColor: color,
                boxShadow: `0 0 0 3px ${color}20`,
              },
            },
          }}
        />

        {/* Shopee-style Autocomplete Suggestions Dropdown */}
        {showDropdown && suggestions.length > 0 && (
          <Paper
            elevation={4}
            className="absolute top-[calc(100%+6px)] left-0 right-0 z-50 rounded-2xl overflow-hidden border border-line bg-white divide-y divide-line/60 shadow-xl max-h-[320px] overflow-y-auto animate-in fade-in duration-150"
          >
            {suggestions.map((item, index) => {
              const primaryName = item.name || item.display_name?.split(",")[0] || "";
              const fullDisplay = item.display_name || "";
              const secondary = fullDisplay.replace(primaryName, "").replace(/^,\s*/, "");

              return (
                <div
                  key={item.place_id || index}
                  onClick={() => handleSelectSuggestion(item)}
                  className="p-3.5 hover:bg-surface-sunken/80 transition-colors cursor-pointer flex items-start gap-3 group"
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                    style={{ backgroundColor: `${color}15`, color }}
                  >
                    <LocationOnIcon className="!text-[1.1rem]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Typography className="!font-bold text-ink !text-sm group-hover:text-primary transition-colors truncate">
                      {primaryName}
                    </Typography>
                    {secondary && (
                      <Typography className="!text-[0.75rem] text-ink-muted line-clamp-2 leading-relaxed">
                        {secondary}
                      </Typography>
                    )}
                  </div>
                </div>
              );
            })}
          </Paper>
        )}
      </div>

      {/* Shopee-style Map with Draggable Pin */}
      <div className="relative group rounded-2xl overflow-hidden">
        <ShopeePinMap
          latitude={lat}
          longitude={lng}
          onPick={handlePinPicked}
          letter={letter}
          color={color}
          disabled={disabled}
        />

        {/* GPS Button floating on map */}
        <div className="absolute top-3 right-3 z-10">
          <Tooltip title="Lấy vị trí GPS hiện tại của tôi" placement="left">
            <Button
              variant="contained"
              size="small"
              onClick={handleLocateMe}
              disabled={disabled || locating}
              startIcon={
                locating ? (
                  <CircularProgress size={14} color="inherit" />
                ) : (
                  <MyLocationIcon className="!text-[1rem]" />
                )
              }
              className="!rounded-xl !text-xs !font-bold !capitalize !bg-white hover:!bg-surface-sunken !text-ink !shadow-md !border !border-line !px-3 !py-1.5 backdrop-blur-xs"
            >
              {locating ? "Đang định vị..." : "Vị trí của tôi"}
            </Button>
          </Tooltip>
        </div>

        {/* Tip overlay on bottom of map */}
        <div className="absolute bottom-2.5 left-3 right-3 z-10 pointer-events-none flex items-center justify-between">
          <span className="bg-ink/80 text-white text-[0.7rem] font-medium px-2.5 py-1 rounded-lg backdrop-blur-xs shadow-xs">
            💡 Chạm vào bản đồ hoặc kéo ghim để chỉnh đúng cổng kho
          </span>
        </div>
      </div>

      {/* Pinned status bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-1.5 text-xs">
          {isPinned ? (
            <>
              <CheckCircleIcon className="!text-[1rem] text-success" />
              <span className="font-semibold text-ink">
                Đã ghim vị trí:
              </span>
              <span className="text-ink-muted font-mono bg-surface-sunken px-2 py-0.5 rounded-md text-[0.7rem]">
                {lat.toFixed(5)}, {lng.toFixed(5)}
              </span>
            </>
          ) : (
            <span className="text-ink-subtle">
              Chưa ghim vị trí trên bản đồ. Nhập tìm kiếm ở trên hoặc chạm vào bản đồ.
            </span>
          )}
        </div>

        {statusMessage && (
          <span className="text-[0.72rem] text-info font-medium italic">
            {statusMessage}
          </span>
        )}
      </div>
    </div>
  );
}
