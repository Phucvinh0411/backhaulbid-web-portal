"use client";

import { createContext, useContext, useEffect, useMemo } from "react";
import useNotificationPopup from "./useNotificationPopup";
import NotificationPopup from "./NotificationPopup";
import { GLOBAL_NOTIFICATION_EVENT } from "./notificationEvents";

const GlobalNotificationContext = createContext(null);

export function useGlobalNotification() {
  const context = useContext(GlobalNotificationContext);
  if (!context) {
    throw new Error(
      "useGlobalNotification must be used within GlobalNotificationProvider",
    );
  }
  return context;
}

export default function GlobalNotificationProvider({ children }) {
  const {
    notifications,
    success,
    error,
    warning,
    info,
    removeNotification,
    pauseNotification,
    resumeNotification,
  } = useNotificationPopup();

  const value = useMemo(
    () => ({ success, error, warning, info, notify: { success, error, warning, info } }),
    [success, error, warning, info],
  );

  useEffect(() => {
    const handleGlobalNotification = (event) => {
      const detail = event.detail || {};
      const notifyByType = { success, error, warning, info };
      const notify = notifyByType[detail.type] || info;
      if (detail.message) {
        notify(detail.message, {
          title: detail.title,
          duration: detail.duration,
        });
      }
    };

    window.addEventListener(GLOBAL_NOTIFICATION_EVENT, handleGlobalNotification);
    return () => window.removeEventListener(GLOBAL_NOTIFICATION_EVENT, handleGlobalNotification);
  }, [success, error, warning, info]);

  return (
    <GlobalNotificationContext.Provider value={value}>
      {children}
      <NotificationPopup
        notifications={notifications}
        onClose={removeNotification}
        onPause={pauseNotification}
        onResume={resumeNotification}
      />
    </GlobalNotificationContext.Provider>
  );
}
