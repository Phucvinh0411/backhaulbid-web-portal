"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Circle,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { fetchRoadPreview } from "@/services/roadPreviewApi";

// ─── Kiểm tra tọa độ hợp lệ ───
const isValidCoord = (val) =>
  val !== null &&
  val !== undefined &&
  val !== "" &&
  !isNaN(Number(val)) &&
  Number.isFinite(Number(val)) &&
  Math.abs(Number(val)) > 0.0001;

// ─── Custom Colored Pin Icons ───
const createMarkerIcon = (colorHex, letter) => {
  if (typeof window === "undefined" || !L || !L.divIcon) return null;
  return L.divIcon({
    className: "custom-detail-map-marker",
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
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <span style="
            transform: rotate(45deg);
            color: white;
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

const DEFAULT_CENTER = [10.8231, 106.6297]; // TP.HCM

// ─── Tự động resize map khi mở modal hoặc kích thước thay đổi (Fix gray tile bug) ───
function MapInvalidator() {
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
    const timers = [100, 250, 500, 800, 1200].map((ms) => setTimeout(invalidate, ms));

    let resizeObserver = null;
    const container = map.getContainer();
    if (typeof ResizeObserver !== "undefined" && container) {
      resizeObserver = new ResizeObserver(() => invalidate());
      resizeObserver.observe(container);
    }

    window.addEventListener("resize", invalidate);
    return () => {
      timers.forEach(clearTimeout);
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener("resize", invalidate);
    };
  }, [map]);

  return null;
}

// ─── Tự động điều chỉnh góc nhìn vừa khít cả điểm A, B và bán kính quét ───
function AutoFitBounds({ hasOrigin, hasDest, origin, dest }) {
  const map = useMap();

  useEffect(() => {
    if (hasOrigin && hasDest) {
      try {
        const bounds = L.latLngBounds(
          [Number(origin.lat), Number(origin.lng)],
          [Number(dest.lat), Number(dest.lng)]
        );
        map.fitBounds(bounds, { padding: [45, 45], maxZoom: 14, animate: false });
      } catch (err) {
        console.warn("AutoFitBounds error:", err);
      }
    } else if (hasOrigin) {
      map.setView([Number(origin.lat), Number(origin.lng)], 13, { animate: false });
    } else if (hasDest) {
      map.setView([Number(dest.lat), Number(dest.lng)], 13, { animate: false });
    }
  }, [map, hasOrigin, hasDest, origin?.lat, origin?.lng, dest?.lat, dest?.lng]);

  return null;
}

// ─── Đường đi thực tế theo đường bộ hoặc đường chim bay ───
function RoadPolyline({ origin, dest, onDistanceReady }) {
  const [roadCoordinates, setRoadCoordinates] = useState(null);

  useEffect(() => {
    let active = true;
    let timer = null;
    let attempts = 0;
    setRoadCoordinates(null);

    const hasOrigin = origin && isValidCoord(origin.lat) && isValidCoord(origin.lng);
    const hasDest = dest && isValidCoord(dest.lat) && isValidCoord(dest.lng);

    if (!hasOrigin || !hasDest) return;

    const loadRoad = () => {
      fetchRoadPreview(
        { lat: Number(origin.lat), lng: Number(origin.lng) },
        { lat: Number(dest.lat), lng: Number(dest.lng) }
      )
        .then((data) => {
          if (!active) return;
          if (data?.status === "READY" && Array.isArray(data?.geometry?.coordinates)) {
            setRoadCoordinates(data.geometry.coordinates.map(([lng, lat]) => [lat, lng]));
            const km = data.distanceMeters ? (data.distanceMeters / 1000).toFixed(1) : null;
            if (km && onDistanceReady) onDistanceReady(Number(km));
            return;
          }
          if (data?.status === "PENDING" && attempts < 8) {
            attempts += 1;
            timer = setTimeout(loadRoad, 1200);
            return;
          }
        })
        .catch(() => {
          // Fallback to straight dashed line
        });
    };

    loadRoad();

    return () => {
      active = false;
      if (timer) clearTimeout(timer);
    };
  }, [origin?.lat, origin?.lng, dest?.lat, dest?.lng, onDistanceReady]);

  if (roadCoordinates && roadCoordinates.length > 0) {
    return (
      <Polyline
        positions={roadCoordinates}
        pathOptions={{
          color: "var(--color-brand)",
          weight: 5,
          opacity: 0.9,
          lineJoin: "round",
        }}
      />
    );
  }

  // Đường thẳng nét đứt nếu chưa lấy được geometry đường bộ
  return (
    <Polyline
      positions={[
        [Number(origin.lat), Number(origin.lng)],
        [Number(dest.lat), Number(dest.lng)],
      ]}
      pathOptions={{
        color: "var(--color-brand)",
        weight: 3.5,
        dashArray: "6, 8",
        opacity: 0.85,
      }}
    />
  );
}

export default function RouteDetailMap({ origin, dest, searchRadius = 50 }) {
  const [roadKm, setRoadKm] = useState(null);
  const [originIcon, setOriginIcon] = useState(null);
  const [destIcon, setDestIcon] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOriginIcon(createMarkerIcon("#1B4965", "A"));
      setDestIcon(createMarkerIcon("#2E7D32", "B"));
    }
  }, []);

  const hasOrigin = Boolean(origin && isValidCoord(origin.lat) && isValidCoord(origin.lng));
  const hasDest = Boolean(dest && isValidCoord(dest.lat) && isValidCoord(dest.lng));

  const center = useMemo(() => {
    if (hasOrigin) return [Number(origin.lat), Number(origin.lng)];
    if (hasDest) return [Number(dest.lat), Number(dest.lng)];
    return DEFAULT_CENTER;
  }, [hasOrigin, hasDest, origin?.lat, origin?.lng, dest?.lat, dest?.lng]);

  // Tính khoảng cách ước lượng (chim bay) nếu chưa có đường bộ
  const crowDistanceKm = useMemo(() => {
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

  const displayDistance = roadKm ?? crowDistanceKm;

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "360px",
        minHeight: "360px",
        borderRadius: "16px",
        overflow: "hidden",
        border: "1px solid var(--color-line)",
        zIndex: 1,
      }}
    >
      {/* Badge tóm tắt thông số lộ trình nổi trên bản đồ */}
      <div
        style={{
          position: "absolute",
          top: "12px",
          left: "12px",
          zIndex: 1000,
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(6px)",
          padding: "6px 14px",
          borderRadius: "12px",
          border: "1px solid var(--color-line)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontSize: "12px",
          fontWeight: 700,
        }}
      >
        {displayDistance && (
          <span style={{ color: "var(--color-brand)" }}>
            📍 Lộ trình: <strong>~{displayDistance} km</strong>
            {roadKm ? " (đường bộ)" : ""}
          </span>
        )}
        {searchRadius && (
          <span style={{ color: "var(--color-warning)" }}>
            📡 Vùng quét: <strong>{searchRadius} km</strong>
          </span>
        )}
      </div>

      <MapContainer
        center={center}
        zoom={10}
        scrollWheelZoom={true}
        zoomControl={true}
        style={{ height: "360px", width: "100%", zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapInvalidator />
        <AutoFitBounds
          hasOrigin={hasOrigin}
          hasDest={hasDest}
          origin={origin}
          dest={dest}
        />

        {/* Vòng tròn bán kính quét xung quanh Điểm xuất phát A */}
        {hasOrigin && searchRadius > 0 && (
          <Circle
            center={[Number(origin.lat), Number(origin.lng)]}
            radius={searchRadius * 1000}
            pathOptions={{
              color: "#FFA000",
              fillColor: "#FFD54F",
              fillOpacity: 0.15,
              weight: 1.5,
              dashArray: "6, 6",
            }}
          />
        )}

        {/* Điểm xuất phát (A) */}
        {hasOrigin && originIcon && (
          <Marker position={[Number(origin.lat), Number(origin.lng)]} icon={originIcon}>
            <Popup>
              <div style={{ padding: "4px", minWidth: "180px" }}>
                <div style={{ fontWeight: 800, color: "#1B4965", fontSize: "13px" }}>
                  📍 Điểm xe rỗng hàng (A)
                </div>
                <div style={{ color: "var(--color-ink)", fontSize: "12px", marginTop: "4px", fontWeight: 600 }}>
                  {origin.label || "Vị trí khởi hành"}
                </div>
                <div style={{ color: "var(--color-ink-subtle)", fontSize: "11px", marginTop: "4px", fontFamily: "monospace" }}>
                  {Number(origin.lat).toFixed(4)}, {Number(origin.lng).toFixed(4)}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Điểm đến mong muốn (B) */}
        {hasDest && destIcon && (
          <Marker position={[Number(dest.lat), Number(dest.lng)]} icon={destIcon}>
            <Popup>
              <div style={{ padding: "4px", minWidth: "180px" }}>
                <div style={{ fontWeight: 800, color: "#2E7D32", fontSize: "13px" }}>
                  🏁 Điểm đến mong muốn (B)
                </div>
                <div style={{ color: "var(--color-ink)", fontSize: "12px", marginTop: "4px", fontWeight: 600 }}>
                  {dest.label || "Vị trí kết thúc"}
                </div>
                <div style={{ color: "var(--color-ink-subtle)", fontSize: "11px", marginTop: "4px", fontFamily: "monospace" }}>
                  {Number(dest.lat).toFixed(4)}, {Number(dest.lng).toFixed(4)}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Tuyến đường nối A ➔ B */}
        {hasOrigin && hasDest && (
          <RoadPolyline origin={origin} dest={dest} onDistanceReady={setRoadKm} />
        )}
      </MapContainer>
    </div>
  );
}
