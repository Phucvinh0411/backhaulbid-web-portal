"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Box, Dialog, DialogContent, DialogTitle, TextField, Typography } from "@mui/material";
import { ActionButton } from "@/components/common";
import { apiService } from "@/services/apiService";
import VerificationOverview from "./VerificationOverview";

const PATH = "/api/v1/representative-verifications/sessions";
const END = ["SUBMITTED", "CANCELLED", "EXPIRED"];

/** Ignores best-effort cancellation errors after a dialog has already closed. */
function ignoreCancellationError() {}

/** Coordinates QR pairing on web with the companion app's NFC capture session. */
export default function NfcEkycModal({ open = true, onClose, onComplete }) {
  const [session, setSession] = useState(null);
  const [qr, setQr] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
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
      setBusy(true); setError(""); setSession(null); setQr(""); setCode("");
      try {
        current = await apiService.post(PATH);
        if (!live) { void apiService.post(`${PATH}/${current.sessionId}/cancel`).catch(ignoreCancellationError); return; }
        active.current = current;
        setRemaining(Math.max(0, Math.ceil((Date.parse(current.expiresAt) - Date.now()) / 1000)));
        const image = await QRCode.toDataURL(current.qrPayload, { width: 256, margin: 2, errorCorrectionLevel: "M" });
        if (!live) return;
        setQr(image); setSession(current);
      } catch (e) { if (live) setError(e?.response?.data?.message || "Không tạo được mã xác thực. Vui lòng thử lại."); }
      finally { if (live) setBusy(false); }
    };
    /** Refreshes pairing and capture status while the session remains active. */
    const poll = async () => {
      if (!live || !current || polling || END.includes(current.state)) return;
      polling = true;
      try {
        const status = await apiService.get(`${PATH}/${current.sessionId}`);
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
      if (current && !END.includes(current.state)) void apiService.post(`${PATH}/${current.sessionId}/cancel`).catch(ignoreCancellationError);
      active.current = null;
    };
  }, [open, generation]);

  /** Confirms the pairing code displayed by the companion app. */
  const approve = async () => {
    setBusy(true); setError("");
    try { setSession(await apiService.post(`${PATH}/${session.sessionId}/approve`, { confirmationCode: code })); }
    catch { setError("Mã không khớp hoặc phiên đã kết thúc. Kiểm tra mã trên điện thoại của bạn."); }
    finally { setBusy(false); }
  };

  /** Cancels unfinished work and closes the dialog after a successful revoke. */
  const close = async () => {
    if (active.current && !END.includes(active.current.state)) {
      try { await apiService.post(`${PATH}/${active.current.sessionId}/cancel`); }
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

  return <Dialog open={open} onClose={close} maxWidth="sm" fullWidth>
    <DialogTitle>Xác thực người đại diện bằng NFC</DialogTitle>
    <DialogContent>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, py: 1 }}>
        <Typography>Mở BackHaulBid trên điện thoại Android có NFC, đăng nhập cùng tài khoản rồi chọn “Quét QR xác thực người đại diện”.</Typography>
        <Typography variant="body2" color="text.secondary">Kết quả cập nhật theo từng bước kiểm tra. Sau khi hoàn tất, bạn có thể xem lại thông tin và ảnh hồ sơ.</Typography>
        {error && <Typography role="alert" color="error">{error}</Typography>}
        {busy && !session && <Typography role="status">Đang tạo phiên xác thực…</Typography>}
        {qr && session?.state === "CREATED" && <Box sx={{ alignSelf: "center", maxWidth: "100%" }}>
          {/* Local rendering; pairing credentials are never sent to a third-party QR service. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} width={256} height={256} style={{ maxWidth: "100%", height: "auto" }} alt="Mã QR ghép đôi phiên xác thực" />
        </Box>}
        {session && !END.includes(session.state) && <Typography variant="body2" color="text.secondary">Phiên còn {Math.floor(remaining / 60)} phút {remaining % 60} giây.</Typography>}
        {session?.state === "PAIRED" && <>
          <Typography>Nhập mã 6 số đang hiện trên điện thoại của bạn để cho phép xác thực.</Typography>
          <TextField label="Mã xác nhận trên điện thoại" value={code} onChange={updateConfirmationCode}
            inputProps={{ inputMode: "numeric", maxLength: 6, autoComplete: "off" }} />
          <ActionButton variant="primary" onClick={approve} disabled={busy || code.length !== 6}>Cho phép điện thoại này</ActionButton>
        </>}
        {["APPROVED", "CAPTURING"].includes(session?.state) && <Typography role="status">Tiếp tục chụp giấy tờ, đọc chip và thực hiện hướng dẫn khuôn mặt trên điện thoại.</Typography>}
        {session?.state === "SUBMITTED" && <VerificationOverview refreshKey={session.sessionId} fallback={{ captureConclusion: session.captureConclusion }} />}
        {["CANCELLED", "EXPIRED"].includes(session?.state) && <Typography>Phiên đã kết thúc. Tạo mã mới để xác thực lại.</Typography>}
        {(!session && !busy || ["CANCELLED", "EXPIRED"].includes(session?.state)) && <ActionButton variant="primary" onClick={restartSession}>Tạo mã mới</ActionButton>}
        <ActionButton variant="secondary" onClick={close}>{session?.state === "SUBMITTED" ? "Đóng" : "Hủy xác thực"}</ActionButton>
      </Box>
    </DialogContent>
  </Dialog>;
}
