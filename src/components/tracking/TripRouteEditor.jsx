"use client";
import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CoordinatePicker from "@/components/map/CoordinatePicker";
import { ResponsiveDialog } from "@/components/ui";
import { contractApi } from "@/services/contractApi";
import { getApiErrorMessage } from "@/services/errorMessage";
import { coordinate } from "./trackingPresentation";

export default function TripRouteEditor({ trip, onChanged }) {
  const [open, setOpen] = useState(false), [pickup, setPickup] = useState(null), [delivery, setDelivery] = useState(null), [saving, setSaving] = useState(false), [error, setError] = useState("");
  const save = async () => {
    if (saving || !coordinate(pickup) || !coordinate(delivery)) return;
    setSaving(true); setError("");
    try {
      const point = (value) => ({ latitude: Number(value.latitude), longitude: Number(value.longitude), source: "USER_CONFIRMED" });
      await contractApi.updateRoutePoints(trip.id, { version: trip.routeVersion ?? 0, pickupPoint: point(pickup), deliveryPoint: point(delivery) });
      setOpen(false); await onChanged();
    } catch (failure) { setError(getApiErrorMessage(failure, "Không thể lưu vị trí kho. Làm mới chuyến nếu thông tin đã thay đổi.")); }
    finally { setSaving(false); }
  };
  return <><Button size="small" variant="outlined" onClick={() => { setPickup(trip.pickupPoint); setDelivery(trip.deliveryPoint); setError(""); setOpen(true); }}>Xác nhận vị trí kho</Button>
    <ResponsiveDialog open={open} onClose={() => setOpen(false)} busy={saving} title="Vị trí lấy và giao hàng" titleId="trip-route-edit-title" maxWidth="sm" actions={<><Button color="inherit" disabled={saving} onClick={() => setOpen(false)}>Quay lại</Button><Button variant="contained" disabled={saving || !coordinate(pickup) || !coordinate(delivery)} onClick={save}>{saving ? "Đang lưu…" : "Lưu vị trí"}</Button></>}>
      {error && <Alert severity="error" sx={{ mb: 1.5 }}>{error}</Alert>}
      <Box sx={{ display: "grid", gap: 2 }}><CoordinatePicker label="A · Kho lấy hàng" value={pickup} onChange={setPickup} disabled={saving} /><CoordinatePicker label="B · Kho giao hàng" value={delivery} onChange={setDelivery} disabled={saving} /></Box>
    </ResponsiveDialog>
  </>;
}
