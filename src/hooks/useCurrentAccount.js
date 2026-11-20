"use client";

import { useEffect, useState } from "react";

const ACCOUNT_SESSION_EVENT = "account-session-changed";
let cached = null;

export function clearCurrentAccountCache() {
  cached = null;
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(ACCOUNT_SESSION_EVENT));
  }
}

/** Authenticated account (id + role) from the same-origin session route; shared across components. */
export default function useCurrentAccount() {
  const [account, setAccount] = useState(cached);
  const [sessionTick, setSessionTick] = useState(0);

  useEffect(() => {
    const handleSessionChange = () => {
      setAccount(cached);
      setSessionTick((tick) => tick + 1);
    };
    window.addEventListener(ACCOUNT_SESSION_EVENT, handleSessionChange);
    return () => {
      window.removeEventListener(ACCOUNT_SESSION_EVENT, handleSessionChange);
    };
  }, []);

  useEffect(() => {
    if (cached) {
      setAccount(cached);
      return undefined;
    }
    let active = true;
    (async () => {
      try {
        let response = await fetch("/api/auth/me", { cache: "no-store" });
        if (response.status === 401) {
          const refreshRes = await fetch("/api/auth/refresh", { method: "POST" }).catch(() => null);
          if (refreshRes?.ok) {
            response = await fetch("/api/auth/me", { cache: "no-store" });
          }
        }
        const payload = response.ok ? await response.json() : null;
        const data = payload?.data;
        if (!data) {
          if (active) setAccount(null);
          return;
        }
        cached = {
          accountId: data.accountId || data.id,
          role: data.role,
          phone: data.phone,
          name: data.fullName || data.companyName || data.phone,
        };
        if (active) setAccount(cached);
      } catch {
        // Ignore background account fetch error
      }
    })();
    return () => {
      active = false;
    };
  }, [sessionTick]);

  return account;
}
