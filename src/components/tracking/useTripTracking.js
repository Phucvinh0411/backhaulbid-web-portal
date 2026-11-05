"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { contractApi } from "@/services/contractApi";
import { getApiErrorMessage } from "@/services/errorMessage";
import { isTripClosed } from "@/lib/statusMeta";
import { mergeTrackingHistory } from "./trackingPresentation";
import useTripLocationStream from "./useTripLocationStream";

const QUIET = { skipGlobalNotification: true };
const list = (value) => Array.isArray(value) ? value : value?.data || [];
const EMPTY = { trip: null, tracking: null, locations: [], historySampled: false, historyTotalPoints: 0, events: [], proofs: [], delaySettlements: [], state: "loading", error: "" };

/** Required tracking data fails visibly; stale trip responses cannot leak into a new detail. */
export default function useTripTracking(tripId) {
  const [data, setData] = useState(EMPTY);
  const scope = useRef({ id: null, generation: 0, loading: false, cursor: null, closed: false });

  const load = useCallback(async () => {
    const context = scope.current;
    if (!tripId || context.id !== tripId || context.loading) return;
    context.loading = true;
    try {
      const [trip, tracking, history, events, proofs, settlements] = await Promise.all([
        contractApi.getTrip(tripId, QUIET),
        contractApi.getTracking(tripId, QUIET),
        contractApi.listLocationHistory(tripId, { limit: 1000, ...(context.cursor ? { cursor: context.cursor } : {}) }, QUIET),
        contractApi.listJourneyEvents(tripId, QUIET),
        contractApi.listDeliveryProofs(tripId, QUIET),
        contractApi.listTripDelaySettlements(tripId, QUIET),
      ]);
      if (scope.current !== context) return;
      if (history.nextCursor) context.cursor = history.nextCursor;
      context.closed = isTripClosed(trip.status);
      setData((previous) => ({
        trip,
        tracking,
        ...mergeTrackingHistory(previous, history),
        events: list(events).slice().sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt)),
        proofs: list(proofs),
        delaySettlements: list(settlements),
        state: "ready",
        error: "",
      }));
    } catch (error) {
      if (scope.current !== context) return;
      if ([403, 404].includes(error?.response?.status)) {
        setData({ ...EMPTY, error: getApiErrorMessage(error, "Không thể truy cập chuyến này."), state: error.response.status === 403 ? "forbidden" : "error" });
        return;
      }
      setData((previous) => ({ ...previous, error: getApiErrorMessage(error, "Không thể tải dữ liệu theo dõi chuyến."), state: previous.trip ? "ready" : error?.response?.status === 403 ? "forbidden" : "error" }));
    } finally {
      context.loading = false;
    }
  }, [tripId]);

  // Reset state only when switching to a different tripId
  useEffect(() => {
    const context = { id: tripId, generation: scope.current.generation + 1, loading: false, cursor: null, closed: false };
    scope.current = context;
    setData(EMPTY);
    void load();
    return () => {
      if (scope.current === context) scope.current = { ...context, id: null };
    };
  }, [load, tripId]);

  const isRealtime =
    data.trip?.status === "WAITING_PICKUP" ||
    data.trip?.status === "PICKED_UP" ||
    data.trip?.status === "IN_TRANSIT" ||
    data.tracking?.trackingSession?.status === "ACTIVE";

  // Polling timer adjusts interval without resetting existing tracking state
  useEffect(() => {
    if (!tripId) return undefined;
    const refreshVisible = () => {
      if (document.visibilityState === "visible" && document.hasFocus() && !scope.current.closed) {
        void load();
      }
    };
    const intervalMs = isRealtime ? 5000 : 15000;
    const interval = window.setInterval(refreshVisible, intervalMs);
    document.addEventListener("visibilitychange", refreshVisible);
    window.addEventListener("focus", refreshVisible);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refreshVisible);
      window.removeEventListener("focus", refreshVisible);
    };
  }, [load, tripId, isRealtime]);

  // Realtime socket push from RabbitMQ -> notification-service
  useTripLocationStream(tripId, (payload) => {
    if (!payload?.point || scope.current.id !== tripId) return;
    const incomingPoint = {
      ...payload.point,
      source: payload.point.source || "GPS",
      heading: payload.heading ?? null,
      speedKmh: payload.speedKmh ?? null,
    };
    setData((previous) => {
      if (!previous.trip || previous.trip.id !== tripId) return previous;
      const merged = mergeTrackingHistory(previous, {
        points: [incomingPoint],
        sampled: previous.historySampled,
        totalPoints: (previous.historyTotalPoints || 0) + 1,
      });
      return {
        ...previous,
        ...merged,
        tracking: {
          ...(previous.tracking || { tripId }),
          latestLocation: incomingPoint,
          freshness: "FRESH",
        },
      };
    });
  });

  return { ...(data.trip && data.trip.id !== tripId ? EMPTY : data), loadTracking: load };
}
