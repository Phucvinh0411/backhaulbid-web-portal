"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ─── Tạo Custom Colored Div Icon an toàn ───
const createMarkerIcon = (colorHex, letter) => {
  if (typeof window === "undefined") return null;
  return L.divIcon({
    className: "custom-route-marker",
    html: `
      <div style="
        position: relative;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          width: 32px;
          height: 32px;
          background-color: ${colorHex};
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid #ffffff;
          box-shadow: 0 4px 12px rgba(0,0,0,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <span style="
            transform: rotate(45deg);
            color: #ffffff;
            font-weight: 900;
            font-size: 13px;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
          ">${letter}</span>
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

const DEFAULT_CENTER = [16.0544, 108.2022]; // Đà Nẵng (Trung tâm Việt Nam)

// ─── Tự động resize map khi mở modal hoặc thay đổi kích thước ───
function MapInvalidator({ activeTarget }) {
  const map = useMap();

  useEffect(() => {
    const invalidate = () => {
      try {
        map.invalidateSize();
      } catch {
        // Safe ignore
      }
    };

    invalidate();
    const t1 = setTimeout(invalidate, 100);
    const t2 = setTimeout(invalidate, 300);
    const t3 = setTimeout(invalidate, 600);
    const t4 = setTimeout(invalidate, 1200);

    window.addEventListener("resize", invalidate);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      window.removeEventListener("resize", invalidate);
    };
  }, [map, activeTarget]);

  return null;
}

// ─── Bắt sự kiện Click trên bản đồ ───
function MapEventsHandler({ onMapClick, activeTarget }) {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick(activeTarget || "ORIGIN", {
          lat: Number(e.latlng.lat.toFixed(6)),
          lng: Number(e.latlng.lng.toFixed(6)),
        });
      }
    },
  });
  return null;
}

// ─── Tự động điều chỉnh góc nhìn bản đồ theo tọa độ ───
function AutoFitBounds({ origin, dest, activeTarget }) {
  const map = useMap();
  const lastTargetRef = useRef(null);

  useEffect(() => {
    const hasOrigin =
      origin && Number.isFinite(Number(origin.lat)) && Number.isFinite(Number(origin.lng));
    const hasDest =
      dest && Number.isFinite(Number(dest.lat)) && Number.isFinite(Number(dest.lng));

    if (hasOrigin && hasDest) {
      map.fitBounds(
        [
          [Number(origin.lat), Number(origin.lng)],
          [Number(dest.lat), Number(dest.lng)],
        ],
        { padding: [50, 50], maxZoom: 13, animate: true }
      );
    } else if (activeTarget === "DESTINATION" && hasDest) {
      map.setView([Number(dest.lat), Number(dest.lng)], 12, { animate: true });
    } else if (hasOrigin) {
      map.setView([Number(origin.lat), Number(origin.lng)], 12, { animate: true });
    } else if (hasDest) {
      map.setView([Number(dest.lat), Number(dest.lng)], 12, { animate: true });
    }
    lastTargetRef.current = activeTarget;
  }, [map, origin?.lat, origin?.lng, dest?.lat, dest?.lng, activeTarget]);

  return null;
}

export default function RoutePickerMap({
  origin,
  dest,
  onMapClick,
  onTargetChange,
  activeTarget = "ORIGIN",
}) {
  const hasOrigin =
    origin && Number.isFinite(Number(origin.lat)) && Number.isFinite(Number(origin.lng));
  const hasDest =
    dest && Number.isFinite(Number(dest.lat)) && Number.isFinite(Number(dest.lng));

  const originIcon = useMemo(() => createMarkerIcon("#10B981", "A"), []);
  const destIcon = useMemo(() => createMarkerIcon("#F59E0B", "B"), []);

  const center = useMemo(() => {
    if (activeTarget === "DESTINATION" && hasDest) return [Number(dest.lat), Number(dest.lng)];
    if (hasOrigin) return [Number(origin.lat), Number(origin.lng)];
    if (hasDest) return [Number(dest.lat), Number(dest.lng)];
    return DEFAULT_CENTER;
  }, [hasOrigin, hasDest, origin?.lat, origin?.lng, dest?.lat, dest?.lng, activeTarget]);

  // Khoảng cách ước tính giữa 2 điểm
  const distanceKm = useMemo(() => {
    if (!hasOrigin || !hasDest) return null;
    const lat1 = Number(origin.lat);
    const lon1 = Number(origin.lng);
    const lat2 = Number(dest.lat);
    const lon2 = Number(dest.lng);
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  }, [hasOrigin, hasDest, origin?.lat, origin?.lng, dest?.lat, dest?.lng]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "320px",
        minHeight: "320px",
        borderRadius: "16px",
        overflow: "hidden",
        border: "1px solid #E2E8F0",
        boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
        zIndex: 1,
      }}
    >
      <MapContainer
        center={center}
        zoom={6}
        scrollWheelZoom={false}
        zoomControl={true}
        style={{ height: "100%", width: "100%", zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapInvalidator activeTarget={activeTarget} />
        <MapEventsHandler onMapClick={onMapClick} activeTarget={activeTarget} />
        <AutoFitBounds origin={hasOrigin ? origin : null} dest={hasDest ? dest : null} activeTarget={activeTarget} />

        {/* Điểm đi (A) */}
        {hasOrigin && originIcon && (
          <Marker
            position={[Number(origin.lat), Number(origin.lng)]}
            icon={originIcon}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target;
                const position = marker.getLatLng();
                if (onMapClick) {
                  onMapClick("ORIGIN", {
                    lat: Number(position.lat.toFixed(6)),
                    lng: Number(position.lng.toFixed(6)),
                  });
                }
              },
            }}
          >
            <Popup>
              <div style={{ padding: "4px", minWidth: "160px" }}>
                <div style={{ fontWeight: 800, color: "#10B981", fontSize: "13px" }}>
                  📍 Điểm xuất phát (A)
                </div>
                <div style={{ color: "#334155", fontSize: "12px", marginTop: "4px" }}>
                  {origin.label || "Vị trí đã ghim"}
                </div>
                <div style={{ color: "#94A3B8", fontSize: "11px", marginTop: "4px" }}>
                  Kéo ghim để tinh chỉnh vị trí
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Điểm đến (B) */}
        {hasDest && destIcon && (
          <Marker
            position={[Number(dest.lat), Number(dest.lng)]}
            icon={destIcon}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const marker = e.target;
                const position = marker.getLatLng();
                if (onMapClick) {
                  onMapClick("DESTINATION", {
                    lat: Number(position.lat.toFixed(6)),
                    lng: Number(position.lng.toFixed(6)),
                  });
                }
              },
            }}
          >
            <Popup>
              <div style={{ padding: "4px", minWidth: "160px" }}>
                <div style={{ fontWeight: 800, color: "#D97706", fontSize: "13px" }}>
                  🏁 Điểm đến mong muốn (B)
                </div>
                <div style={{ color: "#334155", fontSize: "12px", marginTop: "4px" }}>
                  {dest.label || "Vị trí đã ghim"}
                </div>
                <div style={{ color: "#94A3B8", fontSize: "11px", marginTop: "4px" }}>
                  Kéo ghim để tinh chỉnh vị trí
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Đường nối giữa A và B */}
        {hasOrigin && hasDest && (
          <Polyline
            positions={[
              [Number(origin.lat), Number(origin.lng)],
              [Number(dest.lat), Number(dest.lng)],
            ]}
            pathOptions={{
              color: "#1B4965",
              weight: 4,
              dashArray: "6, 8",
              opacity: 0.85,
            }}
          />
        )}
      </MapContainer>

      {/* ─── Thanh điều khiển & Hướng dẫn phủ trên bản đồ (Floating Overlays) ─── */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          zIndex: 400,
          display: "flex",
          gap: "6px",
          alignItems: "center",
        }}
      >
        <button
          type="button"
          onClick={() => onTargetChange && onTargetChange("ORIGIN")}
          style={{
            padding: "6px 12px",
            borderRadius: "10px",
            fontSize: "12px",
            fontWeight: 800,
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "5px",
            transition: "all 0.15s ease",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            backgroundColor: activeTarget === "ORIGIN" ? "#10B981" : "#FFFFFF",
            color: activeTarget === "ORIGIN" ? "#FFFFFF" : "#065F46",
          }}
        >
          <span>📍</span>
          <span>Ghim Điểm đi (A)</span>
        </button>

        <button
          type="button"
          onClick={() => onTargetChange && onTargetChange("DESTINATION")}
          style={{
            padding: "6px 12px",
            borderRadius: "10px",
            fontSize: "12px",
            fontWeight: 800,
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "5px",
            transition: "all 0.15s ease",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            backgroundColor: activeTarget === "DESTINATION" ? "#F59E0B" : "#FFFFFF",
            color: activeTarget === "DESTINATION" ? "#FFFFFF" : "#92400E",
          }}
        >
          <span>🏁</span>
          <span>Ghim Điểm đến (B)</span>
        </button>
      </div>

      {/* Floating Info Right */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          zIndex: 400,
          display: "flex",
          flexDirection: "column",
          gap: "6px",
          alignItems: "flex-end",
          pointerEvents: "none",
        }}
      >
        {distanceKm !== null && (
          <div
            style={{
              backgroundColor: "rgba(15, 23, 42, 0.88)",
              color: "#FFFFFF",
              fontSize: "12px",
              fontWeight: 800,
              padding: "5px 12px",
              borderRadius: "10px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>Khoảng cách:</span>
            <span style={{ color: "#34D399", fontFamily: "monospace", fontSize: "13px" }}>
              {distanceKm} km
            </span>
          </div>
        )}

        <div
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            color: "#334155",
            fontSize: "11px",
            fontWeight: 600,
            padding: "4px 10px",
            borderRadius: "8px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
            border: "1px solid #E2E8F0",
          }}
        >
          👉 Nhấp bản đồ hoặc kéo ghim để chọn vị trí {activeTarget === "ORIGIN" ? "Điểm đi (A)" : "Điểm đến (B)"}
        </div>
      </div>
    </div>
  );
}
