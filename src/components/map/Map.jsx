"use client";

import { useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, useMap } from "react-leaflet";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import CropFreeIcon from "@mui/icons-material/CropFree";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { coordinate, plannedRoute, routeBounds, locationSourceLabel } from "../tracking/trackingPresentation";
import { tokens } from "@/theme/theme";

const DEFAULT_CENTER = [16.0471, 108.2068];
const pin = (text, color, vehicle = false) => L.divIcon({
  className: "trip-map-pin",
  html: `<span style="display:grid;place-items:center;width:${vehicle ? 40 : 30}px;height:${vehicle ? 40 : 30}px;background:${color};border:3px solid white;border-radius:50%;color:white;font:700 12px var(--font-be-vietnam),system-ui,sans-serif;box-shadow:0 2px 8px rgba(15,30,46,.28)">${String(text).replace(/[^A-Za-z0-9•]/g, "")}</span>`,
  iconSize: vehicle ? [40, 40] : [30, 30], iconAnchor: vehicle ? [20, 20] : [15, 15],
});
const icons = { pickup: pin("A", tokens.brand), delivery: pin("B", tokens.success), vehicle: pin("Xe", tokens.info, true), checkIn: pin("CI", tokens.success, true), manual: pin("VT", tokens.inkMuted, true) };

/**
 * Fits once when a valid anchor pair (or the planned route) first appears or changes. GPS refreshes
 * never refit, and a route arriving after the user panned or zoomed does not move the map.
 */
function MapControls({ points, fitKey, routeKey, currentPoint, currentSource }) {
  const map = useMap();
  const fitted = useRef({ anchors: null, route: null });
  const touched = useRef(false);
  const fit = () => {
    if (points.length > 1) map.fitBounds(points, { padding: [40, 40], maxZoom: 15 });
    else if (points.length === 1) map.setView(points[0], 14);
  };
  useEffect(() => {
    const onUser = () => { touched.current = true; };
    map.on("dragstart", onUser);
    map.on("zoomstart", (event) => { if (event?.originalEvent) onUser(); });
    map.getContainer().addEventListener("wheel", onUser, { passive: true });
    return () => { map.off("dragstart", onUser); map.getContainer().removeEventListener("wheel", onUser); };
  }, [map]);
  useEffect(() => {
    if (!points.length) return;
    const anchorsChanged = fitted.current.anchors !== fitKey;
    const routeArrived = fitted.current.route !== routeKey && !touched.current;
    if (!anchorsChanged && !routeArrived) return;
    if (anchorsChanged) touched.current = false;
    fit();
    fitted.current = { anchors: fitKey, route: routeKey };
  }, [map, points, fitKey, routeKey]);
  useEffect(() => {
    const observer = new window.ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  return <Box sx={{ position: "absolute", right: 12, top: 12, zIndex: 1000, display: "flex", flexDirection: "column", gap: 1 }}>
    <Button size="small" variant="contained" color="inherit" startIcon={<CropFreeIcon />} onClick={fit} disabled={!points.length} sx={{ bgcolor: "white", minHeight: 44 }}>Toàn tuyến</Button>
    <Button size="small" variant="contained" color="inherit" startIcon={<MyLocationIcon />} disabled={!currentPoint} onClick={() => map.setView(currentPoint, 15)} sx={{ bgcolor: "white", minHeight: 44 }}>{currentSource === "CHECK_IN" ? "Điểm check-in" : currentSource === "MANUAL" ? "Vị trí đã ghi" : "Vị trí xe"}</Button>
  </Box>;
}

/** Warehouse pins, checkpoints and observed GPS are distinct map layers. */
export default function Map({ tripId = "", pickupPoint, deliveryPoint, milestones = [], traceSegments = [], currentPos = null, routeGeometry = null, emptyHint = "" }) {
  const pickup = coordinate(pickupPoint), delivery = coordinate(deliveryPoint), current = coordinate(currentPos);
  const route = plannedRoute(pickupPoint, deliveryPoint, routeGeometry);
  const checkpointPoints = milestones.map((milestone) => ({ ...milestone, position: coordinate({ latitude: milestone.targetLat, longitude: milestone.targetLng }) })).filter((milestone) => milestone.position);
  // Anchors and the planned route decide the view; a far vehicle outlier is reached with its own button.
  const bounds = routeBounds({ pickup, delivery, road: route.points, fallback: [current, ...checkpointPoints.map((point) => point.position), ...traceSegments.flat()] });
  const boundsKey = JSON.stringify(bounds);
  // Stable bounds keep live refresh from resetting the user's map position.
  const points = useMemo(() => JSON.parse(boundsKey), [boundsKey]);
  const hasRoute = pickup || delivery;
  return <Box sx={{ position: "relative", height: "100%", width: "100%", minHeight: 280, zIndex: 1 }}>
    <MapContainer center={pickup || current || delivery || DEFAULT_CENTER} zoom={hasRoute || current ? 12 : 5} scrollWheelZoom={false} style={{ height: "100%", width: "100%", zIndex: 1 }}>
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MapControls points={points} currentPoint={current} currentSource={currentPos?.source} fitKey={`${tripId}:${JSON.stringify([pickup, delivery])}`} routeKey={`${route.kind}:${route.points.length}`} />
      {/* Planned road route: navy line on a white casing so it reads over any tile colour. */}
      {route.kind === "ROAD" && <>
        <Polyline positions={route.points} pathOptions={{ color: tokens.surface, weight: 9, opacity: 0.95 }} interactive={false} />
        <Polyline positions={route.points} pathOptions={{ color: tokens.brand, weight: 5, opacity: 0.9 }}><Popup>Tuyến đường bộ dự kiến từ A đến B</Popup></Polyline>
      </>}
      {traceSegments.map((segment, index) => <Polyline key={index} positions={segment} pathOptions={{ color: tokens.info, weight: 5, opacity: 0.9 }} />)}
      {pickup && <Marker position={pickup} icon={icons.pickup}><Tooltip permanent direction="top" offset={[0, -16]}>A · Lấy hàng</Tooltip><Popup><strong>A · Lấy hàng</strong><br />{pickupPoint?.label || pickupPoint?.address}</Popup></Marker>}
      {delivery && <Marker position={delivery} icon={icons.delivery}><Tooltip permanent direction="top" offset={[0, -16]}>B · Giao hàng</Tooltip><Popup><strong>B · Giao hàng</strong><br />{deliveryPoint?.label || deliveryPoint?.address}</Popup></Marker>}
      {checkpointPoints.map((milestone) => <Marker key={milestone.id} position={milestone.position} icon={pin(String(milestone.sequenceOrder || "•"), milestone.status === "REACHED" ? tokens.success : tokens.inkMuted)}><Popup>{milestone.milestoneName}<br />{milestone.status === "REACHED" ? "Đã check-in" : "Điểm dừng dự kiến"}</Popup></Marker>)}
      {current && <Marker position={current} icon={currentPos?.source === "CHECK_IN" ? icons.checkIn : currentPos?.source === "MANUAL" ? icons.manual : icons.vehicle}><Popup><strong>{locationSourceLabel(currentPos?.source)}</strong>{currentPos?.label && <><br />{currentPos.label}</>}{currentPos?.timeLabel && <><br />{currentPos.timeLabel}</>}</Popup></Marker>}
    </MapContainer>
    {route.kind === "NONE" && <Box role="status" sx={{ position: "absolute", bottom: 16, left: 16, right: 16, zIndex: 1000, p: 1.5, bgcolor: "background.paper", border: "1px solid", borderColor: "divider", borderRadius: 2, boxShadow: "var(--shadow-level-2)", pointerEvents: "none", fontSize: "0.875rem" }}>
      <strong>Chưa vẽ được tuyến A → B.</strong> {route.missing.length === 2 ? "Hai kho" : route.missing[0] === "pickup" ? "Kho lấy hàng" : "Kho giao hàng"} chưa được ghim trên bản đồ{emptyHint ? `. ${emptyHint}` : "."}
    </Box>}
  </Box>;
}
