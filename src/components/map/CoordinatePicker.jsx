"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import LocationOnIcon from "@mui/icons-material/LocationOnOutlined";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import { coordinate } from "../tracking/trackingPresentation";

const PickerMap = dynamic(() => import("./PointPickerMap"), { ssr: false, loading: () => <Box sx={{ height: 260, borderRadius: 2, bgcolor: "var(--color-surface-sunken)" }} /> });

const NO_HINT = { point: null, status: "idle" };
const HINT_CAPTION = {
  idle: "Chạm vào bản đồ để đặt ghim. Có thể kéo ghim để chỉnh.",
  loading: "Đang tìm vị trí theo địa chỉ…",
  found: "Vị trí gần đúng theo địa chỉ, chưa lưu. Chạm hoặc kéo ghim đến đúng cổng kho.",
  notFound: "Không tìm thấy vị trí theo địa chỉ này. Chạm vào bản đồ để đặt ghim.",
  error: "Chưa tìm được vị trí theo địa chỉ. Chạm vào bản đồ để đặt ghim.",
};

const confirmedPoint = (latitude, longitude) => ({ latitude, longitude, coordinateSource: "USER_CONFIRMED", coordinateConfirmedAt: new Date().toISOString() });

/**
 * Warehouse pin with an always-visible map. A click or a drag sets the saved pin at once. When the typed address is
 * found, the map moves there and shows a hint; the hint is never saved. The typed address is kept either way.
 */
export default function CoordinatePicker({ value, onChange, label = "Vị trí kho", disabled = false, hint = NO_HINT }) {
  const selected = coordinate(value);
  const lat = selected ? selected[0] : null;
  const lng = selected ? selected[1] : null;
  const hintPoint = selected ? null : hint.point;
  const [draft, setDraft] = useState({ latitude: "", longitude: "" });
  const [error, setError] = useState("");
  const [locating, setLocating] = useState(false);

  // The text fields follow the pin whenever the pin moves (map click, drag, locate, clear). A field that already holds
  // the pin's value keeps what was typed, so "10." or "106.60" is not rewritten while the shipper types.
  useEffect(() => {
    const textFor = (text, value) => {
      if (value == null) return "";
      return text !== "" && Number(text) === value ? text : String(value);
    };
    setDraft((old) => ({ latitude: textFor(old.latitude, lat), longitude: textFor(old.longitude, lng) }));
  }, [lat, lng]);

  const pick = ({ latitude, longitude }) => {
    setError("");
    onChange(confirmedPoint(latitude, longitude));
  };

  // A typed pair becomes the pin as soon as both numbers are valid.
  const editField = (field) => (event) => {
    const next = { ...draft, [field]: event.target.value };
    setDraft(next);
    const latitude = Number(next.latitude);
    const longitude = Number(next.longitude);
    const valid = next.latitude !== "" && next.longitude !== "" && Number.isFinite(latitude) && Number.isFinite(longitude)
      && Math.abs(latitude) <= 90 && Math.abs(longitude) <= 180;
    if (valid) pick({ latitude, longitude });
  };

  const locate = () => {
    if (!navigator.geolocation) {
      setError("Trình duyệt không hỗ trợ vị trí. Chạm vào bản đồ hoặc nhập tọa độ.");
      return;
    }
    setLocating(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        pick({ latitude: position.coords.latitude, longitude: position.coords.longitude });
      },
      () => {
        setLocating(false);
        setError("Không lấy được vị trí. Bạn có thể chạm vào bản đồ hoặc nhập tọa độ.");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const caption = selected ? `Đã đặt ghim · ${lat.toFixed(5)}, ${lng.toFixed(5)}` : HINT_CAPTION[hint.status] || HINT_CAPTION.idle;

  return <Box sx={{ p: 1.5, bgcolor: "var(--color-surface-sunken)", borderRadius: 2, display: "grid", gap: 1.25 }}>
    <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
      <LocationOnIcon sx={{ color: selected ? "primary.main" : "text.secondary" }} />
      <Box sx={{ flex: 1, minWidth: 150 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>{label}</Typography>
        <Typography variant="caption" className="tabular" sx={{ color: "text.secondary" }}>{caption}</Typography>
      </Box>
      <Button size="small" startIcon={<MyLocationIcon />} disabled={disabled || locating} onClick={locate} sx={{ minHeight: 44 }}>
        {locating ? "Đang lấy vị trí…" : "Vị trí của tôi"}
      </Button>
      {selected && <Button color="inherit" size="small" disabled={disabled} onClick={() => onChange(null)}>Bỏ pin</Button>}
    </Box>
    {error && <Alert severity="warning">{error}</Alert>}
    <Box sx={{ borderRadius: 2, overflow: "hidden" }}>
      <PickerMap point={selected ? { latitude: lat, longitude: lng } : null} hint={hintPoint} onPick={pick} disabled={disabled} />
    </Box>
    <Box sx={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: 1.5 }}>
      <TextField size="small" label="Vĩ độ" value={draft.latitude} disabled={disabled} inputProps={{ inputMode: "decimal" }} onChange={editField("latitude")} />
      <TextField size="small" label="Kinh độ" value={draft.longitude} disabled={disabled} inputProps={{ inputMode: "decimal" }} onChange={editField("longitude")} />
    </Box>
  </Box>;
}
