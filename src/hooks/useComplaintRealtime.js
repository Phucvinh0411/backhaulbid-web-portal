"use client";

import { useEffect, useRef, useState } from "react";
import { GATEWAY_URL } from "@/config/clientConfig";

export default function useComplaintRealtime(complaintId, onUpdate) {
  const onUpdateRef = useRef(onUpdate);
  const [status, setStatus] = useState(complaintId ? "connecting" : "idle");

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    if (!complaintId) {
      setStatus("idle");
      return undefined;
    }

    setStatus("connecting");
    const source = new window.EventSource(`${GATEWAY_URL}/api/v1/complaints/${complaintId}/events`, {
      withCredentials: true,
    });

    const handleUpdate = (event) => {
      try {
        onUpdateRef.current?.(JSON.parse(event.data));
        setStatus("connected");
      } catch {
        setStatus("reconnecting");
      }
    };

    source.onopen = () => setStatus("connected");
    source.onerror = () => setStatus("reconnecting");
    source.addEventListener("complaint.updated", handleUpdate);

    return () => {
      source.removeEventListener("complaint.updated", handleUpdate);
      source.close();
    };
  }, [complaintId]);

  return {
    status,
    connected: status === "connected",
  };
}
