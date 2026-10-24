"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

// ─── Tạo Marker Icon tròn cao cấp A/B ───
const createPointIcon = (colorHex, letter) => {
  if (typeof window === "undefined") return null;
  return L.divIcon({
    className: "custom-route-point-marker",
    html: `
      <div style="
        position: relative;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 30px;
          height: 30px;
          background: ${colorHex};
          border-radius: 50%;
          border: 3px solid #ffffff;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          font-weight: 900;
          font-size: 13px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        ">
          ${letter}
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
  });
};

const ICON_A = createPointIcon("#0284C7", "A"); // Sky/Info Blue
const ICON_B = createPointIcon("#16A34A", "B"); // Green/Success

// ─── Tự động căn chỉnh bao quát tuyến đường ───
function AutoFitRoute({ fromCoord, toCoord, coordinates }) {
  const map = useMap();
  const lastKeyRef = useRef(null);

  useEffect(() => {
    if (!fromCoord || !toCoord) return;
    const key = `${fromCoord[0]},${fromCoord[1]}-${toCoord[0]},${toCoord[1]}-${coordinates?.length || 0}`;
    if (lastKeyRef.current === key) return;
    lastKeyRef.current = key;

    try {
      const boundsPoints =
        coordinates && coordinates.length > 0
          ? coordinates
          : [fromCoord, toCoord];

      map.fitBounds(boundsPoints, {
        padding: [45, 45],
        maxZoom: 14,
        animate: true,
      });
    } catch {
      // Safe ignore
    }
  }, [map, fromCoord, toCoord, coordinates]);

  return null;
}

// ─── Tự động refresh kích thước khi render ───
function MapInvalidator() {
  const map = useMap();
  useEffect(() => {
    const invalidate = () => map.invalidateSize();
    invalidate();
    const t = setTimeout(invalidate, 300);
    return () => clearTimeout(t);
  }, [map]);
  return null;
}

export default function RouteRoadMap({
  fromCoord,
  toCoord,
  fromLabel,
  toLabel,
  coordinates = [],
  isRoad = true,
  height = 320,
}) {
  const center = fromCoord || toCoord || [16.0544, 108.2022];

  return (
    <div style={{ height, width: "100%", borderRadius: "16px", overflow: "hidden", position: "relative" }}>
      <MapContainer
        center={center}
        zoom={6}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%", zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapInvalidator />
        <AutoFitRoute
          fromCoord={fromCoord}
          toCoord={toCoord}
          coordinates={coordinates}
        />

        {/* Lộ trình đường bộ: Đường viền bóng ngoài + Đường chính màu xanh biển */}
        {coordinates.length > 1 && (
          <>
            {/* Casing / Shadow đường đi */}
            <Polyline
              positions={coordinates}
              pathOptions={{
                color: "#0F172A",
                weight: 6,
                opacity: 0.25,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
            {/* Lộ trình chính */}
            <Polyline
              positions={coordinates}
              pathOptions={{
                color: isRoad ? "#0284C7" : "#64748B",
                weight: 4,
                opacity: 0.95,
                dashArray: isRoad ? undefined : "6, 8",
                lineCap: "round",
                lineJoin: "round",
              }}
            />
          </>
        )}

        {/* Marker Điểm A */}
        {fromCoord && (
          <Marker position={fromCoord} icon={ICON_A}>
            <Popup>
              <div className="p-1">
                <span className="text-xs font-black text-sky-600 uppercase block">Điểm Lấy Hàng (A)</span>
                <p className="text-sm font-bold text-slate-800">{fromLabel || "Điểm A"}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Marker Điểm B */}
        {toCoord && (
          <Marker position={toCoord} icon={ICON_B}>
            <Popup>
              <div className="p-1">
                <span className="text-xs font-black text-emerald-600 uppercase block">Điểm Giao Hàng (B)</span>
                <p className="text-sm font-bold text-slate-800">{toLabel || "Điểm B"}</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
