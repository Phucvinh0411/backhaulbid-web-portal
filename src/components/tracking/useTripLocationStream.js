"use client";

import { useEffect, useRef } from "react";
import { io } from "socket.io-client";
import { GATEWAY_URL } from "@/config/clientConfig";

/**
 * Connects to /notification-socket and streams realtime `trip_location_updated` events for `tripId`.
 */
export default function useTripLocationStream(tripId, onUpdate) {
  const callbackRef = useRef(onUpdate);
  callbackRef.current = onUpdate;

  useEffect(() => {
    if (!tripId) return undefined;

    const socket = io(GATEWAY_URL, {
      path: "/notification-socket",
      transports: ["polling", "websocket"],
      withCredentials: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socket.on("connect", () => {
      socket.emit("identify", {});
    });

    socket.on("trip_location_updated", (payload) => {
      if (!payload || String(payload.tripId).toLowerCase() !== String(tripId).toLowerCase()) {
        return;
      }
      callbackRef.current?.(payload);
    });

    const handlePageHide = () => socket.disconnect();
    const handlePageShow = (event) => {
      if (event.persisted) socket.connect();
    };
    window.addEventListener("pagehide", handlePageHide);
    window.addEventListener("pageshow", handlePageShow);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      window.removeEventListener("pageshow", handlePageShow);
      socket.disconnect();
    };
  }, [tripId]);
}

