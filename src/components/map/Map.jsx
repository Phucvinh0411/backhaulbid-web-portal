"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, useMap } from "react-leaflet";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
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

function createVehicleRadarPin(heading) {
  const hasHeading = heading != null && Number.isFinite(Number(heading));
  const rotationStyle = hasHeading ? `transform:rotate(${Number(heading)}deg);transition:transform 0.35s ease-out;` : "";
  const innerGlyph = hasHeading
    ? `<span style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-bottom:13px solid white;transform:translateY(-1px);"></span>`
    : `<span style="font-size:17px;line-height:1;">🚚</span>`;
  return L.divIcon({
    className: "trip-map-vehicle-radar",
    html: `<div style="position:relative;width:48px;height:48px;display:grid;place-items:center;">
      <span style="position:absolute;inset:0;border-radius:50%;background:#0284c7;opacity:0.35;animation:radarPulse 2s cubic-bezier(0,0.2,0.8,1) infinite;"></span>
      <span style="position:relative;display:grid;place-items:center;width:36px;height:36px;background:#0284c7;border:3px solid white;border-radius:50%;box-shadow:0 2px 10px rgba(2,132,199,0.5);${rotationStyle}">${innerGlyph}</span>
    </div>`,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });
}

const icons = {
  pickup: pin("A", tokens.brand),
  delivery: pin("B", tokens.success),
  manual: pin("VT", tokens.inkMuted, true),
};

function AnimatedVehicleMarker({ position, currentPos, heading }) {
  const markerRef = useRef(null);
  const initialPosRef = useRef(position);
  const icon = useMemo(
    () => (currentPos?.source === "MANUAL" ? icons.manual : createVehicleRadarPin(heading)),
    [currentPos?.source, heading],
  );

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker || !position) return undefined;
    const start = marker.getLatLng();
    const dLat = position[0] - start.lat;
    const dLng = position[1] - start.lng;
    const delta = Math.abs(dLat) + Math.abs(dLng);
    if (delta < 0.00001 || delta > 0.2) {
      marker.setLatLng(position);
      return undefined;
    }
    let frameId = null;
    const t0 = performance.now();
    const duration = 800;
    const step = (now) => {
      const progress = Math.min(1, (now - t0) / duration);
      const ease = 1 - Math.pow(1 - progress, 3);
      marker.setLatLng([start.lat + dLat * ease, start.lng + dLng * ease]);
      if (progress < 1) {
        frameId = window.requestAnimationFrame(step);
      }
    };
    frameId = window.requestAnimationFrame(step);
    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, [position]);

  return (
    <Marker ref={markerRef} position={initialPosRef.current} icon={icon} zIndexOffset={900}>
      <Popup>
        <strong>{locationSourceLabel(currentPos?.source)}</strong>
        {currentPos?.speedKmh != null && (
          <>
            <br />
            Tốc độ: {currentPos.speedKmh} km/h
          </>
        )}
        {currentPos?.label && (
          <>
            <br />
            {currentPos.label}
          </>
        )}
        {currentPos?.timeLabel && (
          <>
            <br />
            {currentPos.timeLabel}
          </>
        )}
      </Popup>
    </Marker>
  );
}

/**
 * Fits once when a valid anchor pair (or the planned route) first appears or changes. GPS refreshes
 * never refit, and a route arriving after the user panned or zoomed does not move the map.
 */
function MapControls({ points, fitKey, routeKey, currentPoint, following, onToggleFollow }) {
  const map = useMap();
  const fitted = useRef({ anchors: null, route: null });
  const touched = useRef(false);
  useEffect(() => {
    const mark = () => { touched.current = true; };
    const container = map.getContainer();
    ["mousedown", "touchstart", "wheel"].forEach((name) => container.addEventListener(name, mark, { passive: true }));
    return () => ["mousedown", "touchstart", "wheel"].forEach((name) => container.removeEventListener(name, mark));
  }, [map]);
  const fit = () => {
    if (!points.length) return;
    if (points.length === 1) map.setView(points[0], 14);
    else map.fitBounds(points, { padding: [44, 44], maxZoom: 15 });
  };
  useEffect(() => {
    const anchorsChanged = fitKey !== fitted.current.anchors;
    const routeArrived = routeKey !== fitted.current.route && !touched.current;
    if (!anchorsChanged && !routeArrived) return;
    if (anchorsChanged) touched.current = false;
    fit();
    fitted.current = { anchors: fitKey, route: routeKey };
  }, [map, points, fitKey, routeKey]);
  useEffect(() => {
    if (following && currentPoint) {
      map.panTo(currentPoint, { animate: true, duration: 0.8 });
    }
  }, [map, currentPoint, following]);
  useEffect(() => {
    const observer = new window.ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());
    return () => observer.disconnect();
  }, [map]);
  return <Box sx={{ position: "absolute", right: 12, top: 12, zIndex: 1000, display: "flex", flexDirection: "column", gap: 1 }}>
    <Button
      size="small"
      variant="contained"
      color="inherit"
      startIcon={<CropFreeIcon />}
      onClick={() => {
        onToggleFollow?.(false);
        fit();
      }}
      disabled={!points.length}
      sx={{ bgcolor: "white", minHeight: 40, boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}
    >
      Toàn tuyến
    </Button>
    <Button
      size="small"
      variant="contained"
      color={following ? "primary" : "inherit"}
      startIcon={<MyLocationIcon />}
      disabled={!currentPoint}
      onClick={() => {
        if (currentPoint) {
          map.setView(currentPoint, 16);
          onToggleFollow?.(!following);
        }
      }}
      sx={{ bgcolor: following ? "primary.main" : "white", color: following ? "white" : "inherit", minHeight: 40, boxShadow: "0 2px 8px rgba(0,0,0,0.12)" }}
    >
      {following ? "Đang bám theo xe" : "Bám theo xe"}
    </Button>
  </Box>;
}

/** Warehouse pins, traveled GPS trace, remaining road route, and animated live vehicle marker. */
export default function Map({
  tripId = "",
  pickupPoint,
  deliveryPoint,
  traceSegments = [],
  routePassed = [],
  routeRemaining = [],
  currentPos = null,
  heading = null,
  routeGeometry = null,
  emptyHint = "",
}) {
  const [following, setFollowing] = useState(false);
  const pickup = coordinate(pickupPoint), delivery = coordinate(deliveryPoint), current = coordinate(currentPos);
  const route = plannedRoute(pickupPoint, deliveryPoint, routeGeometry);
  const remainingPoints = routeRemaining.length > 1 ? routeRemaining : route.points;
  const hasGpsSegments = traceSegments.some((seg) => seg.length > 1);
  // Anchors and the planned route decide the view; a far vehicle outlier is reached with its own button.
  const bounds = routeBounds({ pickup, delivery, road: route.points, fallback: [current, ...traceSegments.flat()] });
  const boundsKey = JSON.stringify(bounds);
  // Stable bounds keep live refresh from resetting the user's map position.
  const points = useMemo(() => JSON.parse(boundsKey), [boundsKey]);
  const hasRoute = pickup || delivery;
  return <Box sx={{ position: "relative", height: "100%", width: "100%", minHeight: 280, zIndex: 1 }}>
    <style>{`
      @keyframes radarPulse {
        0% { transform: scale(0.6); opacity: 0.85; }
        50% { opacity: 0.45; }
        100% { transform: scale(2.2); opacity: 0; }
      }
    `}</style>
    {current && (
      <Box sx={{ position: "absolute", left: 12, top: 12, zIndex: 1000, bgcolor: "rgba(255,255,255,0.95)", backdropFilter: "blur(4px)", px: 1.5, py: 0.75, borderRadius: 2, border: "1px solid", borderColor: "divider", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", gap: 1 }}>
        <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "success.main", boxShadow: "0 0 0 3px rgba(34,197,94,0.3)" }} />
        <Typography variant="caption" sx={{ fontWeight: 700, color: "text.primary" }}>
          Theo dõi trực tiếp (Realtime)
        </Typography>
      </Box>
    )}
    <MapContainer center={pickup || current || delivery || DEFAULT_CENTER} zoom={hasRoute || current ? 12 : 5} scrollWheelZoom={false} style={{ height: "100%", width: "100%", zIndex: 1 }}>
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <MapControls points={points} currentPoint={current} following={following} onToggleFollow={setFollowing} fitKey={`${tripId}:${JSON.stringify([pickup, delivery])}`} routeKey={`${route.kind}:${route.points.length}`} />
      {/* Remaining road route: dashed slate line on a white casing */}
      {route.kind === "ROAD" && remainingPoints.length > 1 && <>
        <Polyline positions={remainingPoints} pathOptions={{ color: tokens.surface, weight: 8, opacity: 0.9 }} interactive={false} />
        <Polyline positions={remainingPoints} pathOptions={{ color: tokens.inkMuted, weight: 4, opacity: 0.75, dashArray: "8 8" }}><Popup>Quãng đường dự kiến còn lại</Popup></Polyline>
      </>}
      {/* Traveled route along road when GPS history is sparse, or actual GPS segments */}
      {!hasGpsSegments && routePassed.length > 1 && <>
        <Polyline positions={routePassed} pathOptions={{ color: tokens.surface, weight: 9, opacity: 0.95 }} interactive={false} />
        <Polyline positions={routePassed} pathOptions={{ color: tokens.info, weight: 5, opacity: 0.95 }}><Popup>Đoạn đường xe đã đi qua</Popup></Polyline>
      </>}
      {traceSegments.map((segment, index) => (
        <Polyline key={index} positions={segment} pathOptions={{ color: tokens.info, weight: 5, opacity: 0.95 }}>
          <Popup>Đoạn đường xe đã đi qua (GPS)</Popup>
        </Polyline>
      ))}
      {pickup && <Marker position={pickup} icon={icons.pickup}><Tooltip permanent direction="top" offset={[0, -16]}>A · Lấy hàng</Tooltip><Popup><strong>A · Lấy hàng</strong><br />{pickupPoint?.label || pickupPoint?.address}</Popup></Marker>}
      {delivery && <Marker position={delivery} icon={icons.delivery}><Tooltip permanent direction="top" offset={[0, -16]}>B · Giao hàng</Tooltip><Popup><strong>B · Giao hàng</strong><br />{deliveryPoint?.label || deliveryPoint?.address}</Popup></Marker>}
      {current && <AnimatedVehicleMarker position={current} currentPos={currentPos} heading={heading} />}
    </MapContainer>
    {route.kind === "NONE" && <Box role="status" sx={{ position: "absolute", bottom: 16, left: 16, right: 16, zIndex: 1000, p: 1.5, bgcolor: "background.paper", border: "1px solid", borderColor: "divider", borderRadius: 2, boxShadow: "var(--shadow-level-2)", pointerEvents: "none", fontSize: "0.875rem" }}>
      <strong>Chưa vẽ được tuyến A → B.</strong> {route.missing.length === 2 ? "Hai kho" : route.missing[0] === "pickup" ? "Kho lấy hàng" : "Kho giao hàng"} chưa được ghim trên bản đồ{emptyHint ? `. ${emptyHint}` : "."}
    </Box>}
  </Box>;
}
