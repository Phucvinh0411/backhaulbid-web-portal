"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Alert, Box, TextField, Typography } from "@mui/material";
import { ActionButton } from "@/components/common";
import { ResponsiveDialog } from "@/components/ui";
import { apiService } from "@/services/apiService";
import { getApiErrorMessage } from "@/services/errorMessage";
import VerificationOverview from "./VerificationOverview";

const PATH = "/api/v1/representative-verifications/sessions";
const END = ["SUBMITTED", "CANCELLED", "EXPIRED"];
const QUIET = { skipGlobalNotification: true };

/** Ignores best-effort cancellation errors after a dialog has already closed. */
function ignoreCancellationError() {}

/** Coordinates QR pairing on web with the companion app's NFC capture session. */
export default function NfcEkycModal({ open = true, onClose, onComplete }) {
  const [session, setSession] = useState(null);
  const [qr, setQr] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [alreadyVerified, setAlreadyVerified] = useState("");
  const [busy, setBusy] = useState(false);
  const [remaining, setRemaining] = useState(0);
  const [generation, setGeneration] = useState(0);
  const active = useRef(null);

  useEffect(
    /** Creates, polls and cancels the server session for this modal lifetime. */
    () => {
    if (!open) return undefined;
    let live = true;
    let polling = false;
    let current = null;
    /** Requests a fresh QR pairing session from identity-service. */
    const create = async () => {
      setBusy(true); setError(""); setAlreadyVerified(""); setSession(null); setQr(""); setCode("");
      try {
        current = await apiService.post(PATH, undefined, QUIET);
        if (!live) { void apiService.post(`${PATH}/${current.sessionId}/cancel`, undefined, QUIET).catch(ignoreCancellationError); return; }
        active.current = current;
        setRemaining(Math.max(0, Math.ceil((Date.parse(current.expiresAt) - Date.now()) / 1000)));
        const image = await QRCode.toDataURL(current.qrPayload, { width: 256, margin: 2, errorCorrectionLevel: "M" });
        if (!live) return;
        setQr(image); setSession(current);
      } catch (e) {
        if (!live) return;
        const msg = getApiErrorMessage(e, "Không tạo được mã xác thực. Vui lòng thử lại.");
        if (e?.response?.status === 409) {
          setAlreadyVerified(msg);
        } else {
          setError(msg);
        }
      }
      finally { if (live) setBusy(false); }
    };
    /** Refreshes pairing and capture status while the session remains active. */
    const poll = async () => {
      if (!live || !current || polling || END.includes(current.state)) return;
      polling = true;
      try {
        const status = await apiService.get(`${PATH}/${current.sessionId}`, undefined, QUIET);
        if (!live) return;
        current = status; active.current = status; setSession(status);
        if (status.state !== "CREATED") setQr("");
      } catch { if (live) setError("Mất kết nối cập nhật trạng thái. Hệ thống sẽ thử lại."); }
      finally { polling = false; }
    };
    // Allow React's development effect replay to cancel before issuing a request.
    /** Updates the countdown and polls the latest server session state. */
    const updateSession = () => {
      if (current && live) setRemaining(Math.max(0, Math.ceil((Date.parse(current.expiresAt) - Date.now()) / 1000)));
      void poll();
    };
    const createTimer = setTimeout(create, 0);
    const timer = setInterval(updateSession, 2000);

    /** Cancels timers and revokes an unfinished session when the modal unmounts. */
    return function cancelSessionEffect() {
      live = false; clearTimeout(createTimer); clearInterval(timer); setQr("");
      if (current && !END.includes(current.state)) void apiService.post(`${PATH}/${current.sessionId}/cancel`, undefined, QUIET).catch(ignoreCancellationError);
      active.current = null;
    };
  }, [open, generation]);

  /** Confirms the pairing code displayed by the companion app. */
  const approve = async () => {
    setBusy(true); setError("");
    try { setSession(await apiService.post(`${PATH}/${session.sessionId}/approve`, { confirmationCode: code }, QUIET)); }
    catch { setError("Mã không khớp hoặc phiên đã kết thúc. Kiểm tra mã trên điện thoại của bạn."); }
    finally { setBusy(false); }
  };

  /** Cancels unfinished work and closes the dialog after a successful revoke. */
  const close = async () => {
    if (active.current && !END.includes(active.current.state)) {
      try { await apiService.post(`${PATH}/${active.current.sessionId}/cancel`, undefined, QUIET); }
      catch { setError("Chưa hủy được phiên trên máy chủ. Kiểm tra mạng rồi thử lại."); return; }
    }
    if (session?.state === "SUBMITTED") onComplete?.();
    onClose?.();
  };

  /** Restricts the pairing confirmation input to six numeric digits. */
  const updateConfirmationCode = (event) => {
    setCode(event.target.value.replace(/\D/g, "").slice(0, 6));
  };

  /** Starts a new pairing session after the previous one expires or is cancelled. */
  const restartSession = () => setGeneration((value) => value + 1);

  return (
    <ResponsiveDialog
      open={open}
      onClose={close}
      title="Xác thực người đại diện bằng NFC"
      titleId="nfc-ekyc-dialog-title"
      maxWidth="sm"
      busy={busy}
      actions={
        <>
          <ActionButton variant="secondary" onClick={close}>
            {session?.state === "SUBMITTED" || alreadyVerified ? "Đóng" : "Hủy xác thực"}
          </ActionButton>
          {((!session && !busy && !alreadyVerified) || ["CANCELLED", "EXPIRED"].includes(session?.state)) && (
            <ActionButton variant="primary" onClick={restartSession}>
              Tạo mã mới
            </ActionButton>
          )}
          {session?.state === "PAIRED" && (
            <ActionButton variant="primary" onClick={approve} disabled={busy || code.length !== 6}>
              Cho phép điện thoại này
            </ActionButton>
          )}
        </>
      }
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography variant="body2">
          Mở BackHaulBid trên điện thoại Android có NFC, đăng nhập cùng tài khoản rồi chọn “Quét QR xác thực người đại diện”.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Kết quả cập nhật theo từng bước kiểm tra. Sau khi hoàn tất, bạn có thể xem lại thông tin và ảnh hồ sơ.
        </Typography>
        {alreadyVerified && <Alert severity="info" role="status">{alreadyVerified}</Alert>}
        {error && <Alert severity="error" role="alert">{error}</Alert>}
        {busy && !session && <Alert severity="info" role="status">Đang tạo phiên xác thực…</Alert>}
        {qr && session?.state === "CREATED" && (
          <Box sx={{ alignSelf: "center", p: 2, borderRadius: 2, border: "1px solid", borderColor: "divider", bgcolor: "background.paper", maxWidth: "100%" }}>
            {/* Local rendering; pairing credentials are never sent to a third-party QR service. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qr} width={256} height={256} style={{ maxWidth: "100%", height: "auto", display: "block" }} alt="Mã QR ghép đôi phiên xác thực" />
          </Box>
        )}
        {session && !END.includes(session.state) && (
          <Typography variant="body2" color="text.secondary" className="tabular">
            Phiên còn {Math.floor(remaining / 60)} phút {remaining % 60} giây.
          </Typography>
        )}
        {session?.state === "PAIRED" && (
          <Box sx={{ p: 2, borderRadius: 2, border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5 }}>
              Nhập mã 6 số đang hiện trên điện thoại của bạn để cho phép xác thực.
            </Typography>
            <TextField
              fullWidth
              label="Mã xác nhận trên điện thoại (6 số)"
              placeholder="000000"
              value={code}
              onChange={updateConfirmationCode}
              helperText="Nhập đủ 6 chữ số hiển thị trên ứng dụng di động."
              inputProps={{
                inputMode: "numeric",
                maxLength: 6,
                autoComplete: "one-time-code",
                style: {
                  textAlign: "center",
                  fontSize: "1.25rem",
                  fontWeight: 600,
                  letterSpacing: "0.35em",
                  fontVariantNumeric: "tabular-nums",
                },
              }}
            />
          </Box>
        )}
        {["APPROVED", "CAPTURING"].includes(session?.state) && (
          <Alert severity="info" role="status">
            Tiếp tục chụp giấy tờ, đọc chip và thực hiện hướng dẫn khuôn mặt trên điện thoại.
          </Alert>
        )}
        {session?.state === "SUBMITTED" && (
          <VerificationOverview refreshKey={session.sessionId} fallback={{ captureConclusion: session.captureConclusion }} />
        )}
        {["CANCELLED", "EXPIRED"].includes(session?.state) && (
          <Alert severity="warning">Phiên đã kết thúc. Tạo mã mới để xác thực lại.</Alert>
        )}
      </Box>
    </ResponsiveDialog>
  );
}
