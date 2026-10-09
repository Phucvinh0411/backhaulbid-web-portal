"use client";

import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import NfcEkycModal from "./NfcEkycModal";
import { apiService } from "@/services/apiService";

const NFC_CAPABILITIES_PATH = "/api/v1/representative-verifications/sessions/capabilities";

/**
 * Asks the identity service whether the QR + NFC identity flow is enabled. Resolves true only when the server
 * says `enabled: true`; a missing or malformed answer counts as disabled. Network or server errors are thrown
 * so the caller can show "unavailable" instead of "disabled".
 */
async function fetchNfcCapability() {
  const capabilities = await apiService.get(NFC_CAPABILITIES_PATH);
  return capabilities?.enabled === true;
}

/**
 * Identity verification entry point for the representative. When the server enables NFC it renders the NFC
 * flow (NfcEkycModal). When NFC is disabled or its status cannot be read it shows that state; it never falls
 * back to the retired VNPT flow, which has been removed.
 *
 * @param {object} props
 * @param {boolean} [props.open=true] Whether the modal is shown; nothing renders when false.
 * @param {() => void} [props.onClose] Called when the user leaves the flow.
 * @param {(result: unknown) => void} [props.onComplete] Called after the NFC flow finishes successfully.
 */
export default function EkycModal({ open = true, onClose, onComplete }) {
  const [capability, setCapability] = useState("checking");

  useEffect(
    /** Resolves NFC availability while guarding against updates after unmount. */
    function loadNfcCapability() {
      let mounted = true;

      /** Stores the server's NFC capability or the unavailable state. */
      async function resolveCapability() {
        try {
          const enabled = await fetchNfcCapability();
          if (mounted) setCapability(enabled ? "enabled" : "disabled");
        } catch {
          if (mounted) setCapability("unavailable");
        }
      }

      void resolveCapability();

      /** Stops this effect from updating component state after it is removed. */
      return function cancelCapabilityCheck() {
        mounted = false;
      };
    },
    [],
  );

  if (!open) return null;
  if (capability === "enabled") {
    return <NfcEkycModal open={open} onClose={onClose} onComplete={onComplete} />;
  }

  const message = capability === "checking"
    ? "Đang kiểm tra khả năng xác thực NFC…"
    : capability === "disabled"
      ? "Xác thực NFC hiện chưa được bật trên máy chủ."
      : "Không thể kết nối để kiểm tra xác thực NFC. Hãy thử tải lại trang.";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Xác thực người đại diện bằng NFC</DialogTitle>
      <DialogContent>
        <Alert severity={capability === "checking" ? "info" : "error"}>
          {message}
        </Alert>
      </DialogContent>
    </Dialog>
  );
}
