"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const DEFAULT_CENTER = [21.028511, 105.804817];
const toPoint = (value) => {
  if (Array.isArray(value)) return value.length >= 2 ? [Number(value[0]), Number(value[1])] : null;
  if (value && Number.isFinite(Number(value.latitude)) && Number.isFinite(Number(value.longitude))) return [Number(value.latitude), Number(value.longitude)];
  return null;
};
const toLabel = (value, fallback) => Array.isArray(value) ? fallback : value?.label || fallback;

function FitRoute({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points.length > 1) map.fitBounds(points, { padding: [32, 32], maxZoom: 13 });
    else if (points.length === 1) map.setView(points[0], 13);
  }, [map, points]);
  return null;
}

export default function Map({ routePoints = [], currentPos = null }) {
  const points = useMemo(() => routePoints.map(toPoint).filter(Boolean), [routePoints]);
  const currentPoint = toPoint(currentPos);
  const center = currentPoint || points[points.length - 1] || DEFAULT_CENTER;
  const currentLabel = toLabel(currentPos, "Vị trí hiện tại");

  return <div className="relative h-full w-full" style={{ minHeight: 280, zIndex: 1 }}>
    <MapContainer center={center} zoom={10} scrollWheelZoom={false} zoomControl style={{ height: "100%", width: "100%", zIndex: 1 }}>
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <FitRoute points={points} />
      {points.length > 1 && <Polyline positions={points} pathOptions={{ color: "#1B4965", weight: 5, opacity: 0.78 }} />}
      {points.length > 0 && <Marker position={points[0]}><Popup>Điểm cập nhật đầu tiên</Popup></Marker>}
      {points.length > 1 && <Marker position={points[points.length - 1]}><Popup>Checkpoint gần nhất</Popup></Marker>}
      {currentPoint && <Marker position={currentPoint}><Popup>{currentLabel}</Popup></Marker>}
    </MapContainer>
    {!points.length && <div className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center"><div className="rounded-xl bg-white/95 px-4 py-3 text-center shadow-md"><p className="text-sm font-semibold text-slate-700">Chưa có vị trí tài xế</p><p className="mt-1 text-xs text-slate-500">Bản đồ sẽ cập nhật sau lần xác nhận đầu tiên.</p></div></div>}
  </div>;
}
