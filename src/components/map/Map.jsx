"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet's default icon path issues in Next.js
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

export default function Map({ routePoints = [], currentPos = null }) {
  // Center map between points or just on the current pos
  const center = currentPos || (routePoints.length > 0 ? routePoints[0] : [21.028511, 105.804817]);

  return (
    <div style={{ height: "100%", width: "100%", position: "relative", zIndex: 1 }}>
      <MapContainer 
        center={center} 
        zoom={10} 
        scrollWheelZoom={false} 
        style={{ height: "100%", width: "100%", zIndex: 1 }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {routePoints.length > 0 && (
          <Polyline positions={routePoints} color="#1B4965" weight={4} opacity={0.7} />
        )}
        
        {/* Origin Marker */}
        {routePoints.length > 0 && (
          <Marker position={routePoints[0]}>
            <Popup>Điểm xuất phát</Popup>
          </Marker>
        )}

        {/* Destination Marker */}
        {routePoints.length > 1 && (
          <Marker position={routePoints[routePoints.length - 1]}>
            <Popup>Điểm đến</Popup>
          </Marker>
        )}

        {/* Current Location Marker */}
        {currentPos && (
          <Marker position={currentPos}>
            <Popup>Vị trí hiện tại</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
}
