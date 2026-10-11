"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { tokens } from "@/theme/theme";
import { fetchRoadPreview } from "@/services/roadPreviewApi";
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
          border: 3px solid var(--color-surface);
          box-shadow: 0 4px 12px rgba(0,0,0,0.35);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <span style="
            transform: rotate(45deg);
            color: var(--color-surface);
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

/**
 * Road line between A and B. It draws the provider's road geometry once the backend has it; until then, or when no
 * road route exists, it draws a dashed straight line and reports the state through onChange.
 */
function RoadLine({ from, to, onChange }) {
  const [road, setRoad] = useState(null);

  useEffect(() => {
    let live = true;
    let timer = null;
    let attempts = 0;
    setRoad(null);
    onChange?.("Đang tính tuyến đường bộ…");

    const load = () => {
      fetchRoadPreview(from, to)
        .then((data) => {
          if (!live) return;
          if (data?.status === "READY" && Array.isArray(data?.geometry?.coordinates)) {
            setRoad(data.geometry.coordinates.map(([lng, lat]) => [lat, lng]));
            const km = data.distanceMeters ? (data.distanceMeters / 1000).toFixed(1) : null;
            onChange?.(km ? `Theo đường bộ khoảng ${km} km` : "Đã có tuyến đường bộ");
            return;
          }
          if (data?.status === "PENDING" && attempts < 10) {
            attempts += 1;
            timer = window.setTimeout(load, 1200);
            return;
          }
          onChange?.("Chưa có tuyến đường bộ, đang hiển thị đường thẳng");
        })
        .catch(() => {
          if (live) onChange?.("Chưa có tuyến đường bộ, đang hiển thị đường thẳng");
        });
    };

    load();
    return () => {
      live = false;
      if (timer) window.clearTimeout(timer);
    };
    // Only the coordinates restart the lookup; a new onChange identity must not refetch the road.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from.lat, from.lng, to.lat, to.lng]);

  if (road) {
    return <Polyline positions={road} pathOptions={{ color: tokens.brand, weight: 5, opacity: 0.9 }} />;
  }
  return (
    <Polyline
      positions={[
        [from.lat, from.lng],
        [to.lat, to.lng],
      ]}
      pathOptions={{ color: tokens.brand, weight: 4, dashArray: "6, 8", opacity: 0.85 }}
    />
  );
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

  const [roadInfo, setRoadInfo] = useState(null);
  const originIcon = useMemo(() => createMarkerIcon("var(--color-success)", "A"), []);
  const destIcon = useMemo(() => createMarkerIcon("var(--color-warning)", "B"), []);

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
        border: "1px solid var(--color-line)",
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
                <div style={{ fontWeight: 800, color: "var(--color-success)", fontSize: "13px" }}>
                  📍 Điểm xuất phát (A)
                </div>
                <div style={{ color: "var(--color-ink-muted)", fontSize: "12px", marginTop: "4px" }}>
                  {origin.label || "Vị trí đã ghim"}
                </div>
                <div style={{ color: "var(--color-ink-subtle)", fontSize: "11px", marginTop: "4px" }}>
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
                <div style={{ fontWeight: 800, color: "var(--color-warning)", fontSize: "13px" }}>
                  🏁 Điểm đến mong muốn (B)
                </div>
                <div style={{ color: "var(--color-ink-muted)", fontSize: "12px", marginTop: "4px" }}>
                  {dest.label || "Vị trí đã ghim"}
                </div>
                <div style={{ color: "var(--color-ink-subtle)", fontSize: "11px", marginTop: "4px" }}>
                  Kéo ghim để tinh chỉnh vị trí
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Tuyến đường bộ giữa A và B; đường thẳng chỉ là dự phòng khi chưa có tuyến */}
        {hasOrigin && hasDest && (
          <RoadLine
            from={{ lat: Number(origin.lat), lng: Number(origin.lng) }}
            to={{ lat: Number(dest.lat), lng: Number(dest.lng) }}
            onChange={setRoadInfo}
          />
        )}
      </MapContainer>

      {hasOrigin && hasDest && roadInfo && (
        <div
          style={{
            position: "absolute",
            left: 12,
            bottom: 12,
            zIndex: 500,
            background: "var(--color-surface)",
            border: "1px solid var(--color-line)",
            borderRadius: 8,
            padding: "6px 10px",
            fontSize: 12,
            color: "var(--color-ink-muted)",
          }}
        >
          {roadInfo}
        </div>
      )}

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
            backgroundColor: activeTarget === "ORIGIN" ? "var(--color-success)" : "var(--color-surface)",
            color: activeTarget === "ORIGIN" ? "var(--color-surface)" : "var(--color-success)",
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
            backgroundColor: activeTarget === "DESTINATION" ? "var(--color-warning)" : "var(--color-surface)",
            color: activeTarget === "DESTINATION" ? "var(--color-surface)" : "var(--color-warning)",
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
              color: "var(--color-surface)",
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
            <span style={{ color: "var(--color-success-soft)", fontFamily: "monospace", fontSize: "13px" }}>
              {distanceKm} km
            </span>
          </div>
        )}

        <div
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            color: "var(--color-ink-muted)",
            fontSize: "11px",
            fontWeight: 600,
            padding: "4px 10px",
            borderRadius: "8px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
            border: "1px solid var(--color-line)",
          }}
        >
          👉 Nhấp bản đồ hoặc kéo ghim để chọn vị trí {activeTarget === "ORIGIN" ? "Điểm đi (A)" : "Điểm đến (B)"}
        </div>
      </div>
    </div>
  );
}
