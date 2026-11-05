"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

// SVG Pin inspired by Shopee / Google Maps with a sharp pointer tip
const createShopeePin = (letter = "A", color = "#1B4965") =>
  L.divIcon({
    className: "shopee-map-pin",
    html: `
      <div style="position:relative;width:34px;height:44px;transform:translate(-50%,-100%);cursor:grab;">
        <svg width="34" height="44" viewBox="0 0 34 44" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="shadow-${letter}" x="-20%" y="-10%" width="140%" height="130%">
              <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="rgba(0,0,0,0.35)"/>
            </filter>
          </defs>
          <path d="M17 0C7.61 0 0 7.61 0 17C0 29.75 17 44 17 44C17 44 34 29.75 34 17C34 7.61 26.39 0 17 0Z" fill="${color}" filter="url(#shadow-${letter})"/>
          <circle cx="17" cy="16" r="9.5" fill="#FFFFFF"/>
          <text x="17" y="20.5" font-size="12" font-weight="900" font-family="system-ui, -apple-system, sans-serif" text-anchor="middle" fill="${color}">${letter}</text>
        </svg>
        <div style="width:12px;height:4px;background:rgba(0,0,0,0.25);border-radius:50%;position:absolute;bottom:-2px;left:50%;transform:translateX(-50%);"></div>
      </div>
    `,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });

function MapController({ lat, lng, onPick, disabled }) {
  const map = useMap();
  const lastCenter = useRef({ lat: null, lng: null });

  useMapEvents({
    click: (event) => {
      if (!disabled) {
        onPick({ latitude: event.latlng.lat, longitude: event.latlng.lng });
      }
    },
  });

  // Pan and zoom map when coords change
  useEffect(() => {
    if (lat != null && lng != null) {
      if (lastCenter.current.lat !== lat || lastCenter.current.lng !== lng) {
        map.setView([lat, lng], Math.max(map.getZoom(), 15), { animate: true });
        lastCenter.current = { lat, lng };
      }
    }
  }, [map, lat, lng]);

  // Handle container resize (e.g. stepping between wizard steps)
  useEffect(() => {
    const container = map.getContainer();
    if (!container) return;
    const observer = new window.ResizeObserver(() => {
      map.invalidateSize();
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, [map]);

  return null;
}

export default function ShopeePinMap({
  latitude,
  longitude,
  onPick,
  letter = "A",
  color = "#1B4965",
  disabled = false,
}) {
  const defaultCenter = [16.0471, 108.2068]; // Central Vietnam
  const hasPoint = Number.isFinite(latitude) && Number.isFinite(longitude);
  const center = hasPoint ? [latitude, longitude] : defaultCenter;
  const zoom = hasPoint ? 16 : 6;
  const pinIcon = createShopeePin(letter, color);

  return (
    <div className="relative w-full h-[280px] rounded-2xl overflow-hidden border border-line shadow-inner z-0">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%", zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapController
          lat={hasPoint ? latitude : null}
          lng={hasPoint ? longitude : null}
          onPick={onPick}
          disabled={disabled}
        />

        {hasPoint && (
          <Marker
            position={[latitude, longitude]}
            icon={pinIcon}
            draggable={!disabled}
            eventHandlers={{
              dragend: (event) => {
                const at = event.target.getLatLng();
                onPick({ latitude: at.lat, longitude: at.lng });
              },
            }}
          />
        )}
      </MapContainer>
    </div>
  );
}
