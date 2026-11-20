"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { apiService } from "@/services/apiService";
import { getRepresentativeVerificationStatus } from "@/services/representativeVerificationApi";
import { BUSINESS_VERIFICATION_STATUS_PATH } from "@/components/businessVerification/businessVerificationApi";

const AccountVerificationContext = createContext(null);
const ACCOUNT_VERIFICATION_UPDATED_EVENT = "account-verification-updated";

export function notifyAccountVerificationUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(ACCOUNT_VERIFICATION_UPDATED_EVENT));
  }
}

const UNLOCKED_STATE = {
  loading: false,
  ekycVerified: true,
  businessVerified: true,
  fullyVerified: true,
  refresh: () => {},
};

export function AccountVerificationProvider({ value, children }) {
  return (
    <AccountVerificationContext.Provider value={value}>
      {children}
    </AccountVerificationContext.Provider>
  );
}

/**
 * Fetches representative eKYC and business verification status for carrier/shipper portals.
 * Reuses the layout's verification state when mounted inside DashboardLayout.
 */
export default function useAccountVerification(enabled = true) {
  const provided = useContext(AccountVerificationContext);
  const shouldFetch = Boolean(enabled) && !provided;

  const [refreshKey, setRefreshKey] = useState(0);
  const [state, setState] = useState({
    loading: shouldFetch,
    ekycVerified: false,
    businessVerified: false,
  });

  const refresh = useCallback(() => {
    setRefreshKey((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!shouldFetch) {
      return undefined;
    }

    const triggerRefresh = () => {
      setRefreshKey((value) => value + 1);
    };
    window.addEventListener("focus", triggerRefresh);
    window.addEventListener(ACCOUNT_VERIFICATION_UPDATED_EVENT, triggerRefresh);
    return () => {
      window.removeEventListener("focus", triggerRefresh);
      window.removeEventListener(ACCOUNT_VERIFICATION_UPDATED_EVENT, triggerRefresh);
    };
  }, [shouldFetch]);

  useEffect(() => {
    if (!shouldFetch) {
      return undefined;
    }

    let active = true;
    Promise.allSettled([
      getRepresentativeVerificationStatus({ skipGlobalNotification: true }),
      apiService.get(BUSINESS_VERIFICATION_STATUS_PATH, undefined, { skipGlobalNotification: true }),
    ]).then(([ekycResult, businessResult]) => {
      if (!active) return;
      const ekycStatus =
        ekycResult.status === "fulfilled" ? ekycResult.value?.status : null;
      const businessStatus =
        businessResult.status === "fulfilled"
          ? (businessResult.value?.status ?? businessResult.value?.verificationStatus)
          : null;
      setState({
        loading: false,
        ekycVerified: ekycStatus === "VERIFIED",
        businessVerified: businessStatus === "VERIFIED",
      });
    });

    return () => {
      active = false;
    };
  }, [shouldFetch, refreshKey]);

  if (!enabled) {
    return UNLOCKED_STATE;
  }
  if (provided) {
    return provided;
  }

  return {
    loading: state.loading,
    ekycVerified: state.ekycVerified,
    businessVerified: state.businessVerified,
    fullyVerified: state.ekycVerified && state.businessVerified,
    refresh,
  };
}
