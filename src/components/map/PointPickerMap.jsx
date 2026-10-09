"use client";
import { useEffect } from "react";
import L from "leaflet";
import { CircleMarker, MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// A plain dot, so the app does not need to ship a marker image.
const PIN = L.divIcon({
  className: "",
  html: '<span style="display:block;width:18px;height:18px;border-radius:50%;background:#1B4965;border:3px solid #fff;box-shadow:0 0 0 2px #1B4965"></span>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function PickEvents({ lat, lng, hintLat, hintLng, onPick, disabled }) {
  const map = useMap();
  useMapEvents({ click: (event) => { if (!disabled) onPick({ latitude: event.latlng.lat, longitude: event.latlng.lng }); } });
  useEffect(() => { if (lat != null && lng != null) map.panTo([lat, lng]); }, [map, lat, lng]);
  // With no saved pin, the map moves to the address hint so the shipper sees the area at once.
  useEffect(() => { if (lat == null && hintLat != null && hintLng != null) map.setView([hintLat, hintLng], 16); }, [map, lat, lng, hintLat, hintLng]);
  useEffect(() => { const resize = new window.ResizeObserver(() => map.invalidateSize()); resize.observe(map.getContainer()); return () => resize.disconnect(); }, [map]);
  return null;
}

/**
 * Map with one saved, draggable pin, and an optional dashed hint where the typed address was found.
 * A click or a drag reports the new point through onPick. The hint is never saved.
 */
export default function PointPickerMap({ point, hint, onPick, disabled = false }) {
  const lat = point ? point.latitude : null;
  const lng = point ? point.longitude : null;
  const hintLat = hint ? hint.latitude : null;
  const hintLng = hint ? hint.longitude : null;
  return <MapContainer center={lat != null ? [lat, lng] : [16.0471, 108.2068]} zoom={lat != null ? 15 : 5} scrollWheelZoom={false} style={{ height: 260, width: "100%", zIndex: 1 }}>
    <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
    <PickEvents lat={lat} lng={lng} hintLat={hintLat} hintLng={hintLng} onPick={onPick} disabled={disabled} />
    {lat == null && hintLat != null && <CircleMarker center={[hintLat, hintLng]} radius={12} interactive={false} pathOptions={{ color: "#1B4965", weight: 2, dashArray: "4 4", fillColor: "#1B4965", fillOpacity: 0.12 }} />}
    {lat != null && <Marker position={[lat, lng]} icon={PIN} draggable={!disabled} eventHandlers={{ dragend: (event) => { const at = event.target.getLatLng(); onPick({ latitude: at.lat, longitude: at.lng }); } }} />}
  </MapContainer>;
}
