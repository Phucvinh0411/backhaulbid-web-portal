"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  DEFAULT_DURATION_MS,
  MAX_STACK_COUNT,
  MIN_DURATION_MS,
} from "./types";

let notificationCounter = 0;

/**
 * Custom hook managing a stack of notification popups with
 * auto-dismiss countdown, pause-on-hover, and manual close.
 */
export default function useNotificationPopup() {
  const [notifications, setNotifications] = useState([]);
  const timersRef = useRef(new Map());

  const removeNotification = useCallback((id) => {
    setNotifications((previous) =>
      previous.filter((item) => item.id !== id),
    );
    const timer = timersRef.current.get(id);
    if (timer) {
      clearInterval(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const notify = useCallback(
    ({
      type = "info",
      title = "",
      message = "",
      duration = DEFAULT_DURATION_MS,
      onClick,
    }) => {
      notificationCounter += 1;
      const id = `notification-${notificationCounter}`;
      const safeDuration = Math.max(duration, MIN_DURATION_MS);

      setNotifications((previous) => {
        const next = [
          ...previous,
          {
            id,
            type,
            title,
            message,
            duration: safeDuration,
            remaining: safeDuration,
            onClick,
            createdAt: Date.now(),
          },
        ];
        return next.slice(-MAX_STACK_COUNT);
      });

      return id;
    },
    [],
  );

  useEffect(() => {
    if (notifications.length === 0) return;

    const tick = 100;
    const interval = setInterval(() => {
      setNotifications((previous) => {
        if (previous.length === 0) return previous;
        const now = Date.now();
        return previous
          .map((item) => {
            if (item.paused) return item;
            const elapsed = now - (item.lastTick || item.createdAt);
            const remaining = item.remaining - elapsed;
            return { ...item, remaining: Math.max(remaining, 0), lastTick: now };
          })
          .filter((item) => {
            if (item.remaining <= 0) {
              const timer = timersRef.current.get(item.id);
              if (timer) {
                clearInterval(timer);
                timersRef.current.delete(item.id);
              }
              return false;
            }
            return true;
          });
      });
    }, tick);

    return () => clearInterval(interval);
  }, [notifications.length]);

  const pauseNotification = useCallback((id) => {
    setNotifications((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, paused: true } : item,
      ),
    );
  }, []);

  const resumeNotification = useCallback((id) => {
    setNotifications((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, paused: false, lastTick: Date.now() } : item,
      ),
    );
  }, []);

  const success = useCallback(
    (message, options = {}) => notify({ ...options, type: "success", message }),
    [notify],
  );

  const error = useCallback(
    (message, options = {}) => notify({ ...options, type: "error", message }),
    [notify],
  );

  const warning = useCallback(
    (message, options = {}) => notify({ ...options, type: "warning", message }),
    [notify],
  );

  const info = useCallback(
    (message, options = {}) => notify({ ...options, type: "info", message }),
    [notify],
  );

  return {
    notifications,
    notify,
    success,
    error,
    warning,
    info,
    removeNotification,
    pauseNotification,
    resumeNotification,
  };
}
