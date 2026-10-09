"use client";

import { useEffect, useState } from "react";

let cached = null;

/** Authenticated account (id + role) from the same-origin session route; shared across components. */
export default function useCurrentAccount() {
  const [account, setAccount] = useState(cached);

  useEffect(() => {
    if (cached) return undefined;
    let active = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        const data = payload?.data;
        if (!data) return;
        cached = { accountId: data.accountId || data.id, role: data.role, phone: data.phone, name: data.fullName || data.companyName || data.phone };
        if (active) setAccount(cached);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  return account;
}
