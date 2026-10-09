"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { ResponsiveDialog } from "@/components/ui";
import { contractApi } from "@/services/contractApi";
import { getMyDrivers } from "@/services/fleetApi";
import { getApiErrorMessage } from "@/services/errorMessage";

const formatExpiry = (value) => new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(new Date(value));

/**
 * Assign a verified fleet driver (PATCH /trips/{id}/assignment) or reissue a code for the same driver on
 * an active trip (POST /trips/{id}/driver-access/reissue). The backend returns one "mã nhận chuyến"; it is
 * shown once with a QR code, kept only in this dialog's memory and never put in a URL.
 */
export default function AssignDriverDialog({ open, trip, mode = "assign", onClose, onAssigned }) {
  const reissue = mode === "reissue";
  const [drivers, setDrivers] = useState([]);
  const [driversState, setDriversState] = useState("idle");
  const [driverId, setDriverId] = useState("");
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [issued, setIssued] = useState(null);
  const [qr, setQr] = useState("");
  const [copyNotice, setCopyNotice] = useState("");
  const submittingRef = useRef(false);

  useEffect(() => {
    if (!open) return undefined;
    let active = true;
    setDrivers([]);
    setDriverId("");
    setError("");
    setFieldError("");
    setIssued(null);
    setQr("");
    setCopyNotice("");
    if (reissue) {
      setDriversState("ready");
      return undefined;
    }
    setDriversState("loading");
    getMyDrivers()
      .then((list) => {
        if (!active) return;
        const verified = list.filter((driver) => driver.status === "VERIFIED");
        setDrivers(verified);
        setDriverId(verified.some((driver) => driver.id === trip?.driverId) ? trip.driverId : "");
        setDriversState("ready");
      })
      .catch(() => active && setDriversState("error"));
    return () => {
      active = false;
    };
  }, [open, reissue, trip?.driverId]);

  useEffect(() => {
    if (!issued?.code) return undefined;
    let active = true;
    QRCode.toDataURL(issued.code, { errorCorrectionLevel: "M", margin: 2, width: 240 })
      .then((url) => active && setQr(url))
      .catch(() => active && setQr(""));
    return () => {
      active = false;
    };
  }, [issued?.code]);

  // Forget the code when the dialog closes.
  const close = () => {
    setIssued(null);
    setQr("");
    onClose?.();
  };

  const submit = async () => {
    if (submittingRef.current) return;
    if (!reissue && !driverId) {
      setFieldError("Chọn tài xế.");
      return;
    }
    submittingRef.current = true;
    setSubmitting(true);
    setError("");
    try {
      const result = reissue ? await contractApi.reissueDriverAccess(trip.id) : await contractApi.assignDriver(trip.id, { driverId });
      setIssued(result);
      onAssigned?.({ tripId: result?.tripId, driverProfileId: result?.driverProfileId });
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, reissue ? "Chưa cấp lại được mã. Vui lòng thử lại." : "Chưa phân công được tài xế. Vui lòng thử lại."));
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const shareMessage = issued ? `BackHaulBid - Mã nhận chuyến\n${issued.code}\nMở app BackHaulBid, chọn "Nhập mã nhận chuyến" rồi dán mã hoặc quét QR.\nHết hạn: ${formatExpiry(issued.expiresAt)}` : "";

  return (
    <ResponsiveDialog
      open={open}
      onClose={close}
      busy={submitting}
      maxWidth="xs"
      title={issued ? "Gửi mã nhận chuyến cho tài xế" : reissue ? "Cấp lại mã nhận chuyến" : "Phân công tài xế"}
      titleId="assign-driver-title"
      actions={
        issued ? (
          <Button variant="contained" onClick={close}>
            Đã gửi mã
          </Button>
        ) : (
          <>
            <Button color="inherit" onClick={close} disabled={submitting}>
              Hủy
            </Button>
            <Button variant="contained" onClick={submit} disabled={submitting || driversState !== "ready"}>
              {submitting ? "Đang xử lý..." : reissue ? "Cấp mã mới" : "Phân công"}
            </Button>
          </>
        )
      }
    >
      {issued ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Typography variant="body2">
            Gửi mã này cho đúng tài xế. Tài xế mở app, chọn &quot;Nhập mã nhận chuyến&quot; rồi quét QR hoặc dán mã; không cần tài khoản. Mã chỉ hiển thị lần này và dùng một lần.
          </Typography>
          {qr ? (
            // A data: URL generated in the browser; the code never leaves this dialog through a link.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qr} alt="Mã QR nhận chuyến" width={240} height={240} style={{ alignSelf: "center", borderRadius: 8 }} />
          ) : null}
          <TextField label="Mã nhận chuyến" value={issued.code} multiline InputProps={{ readOnly: true }} onFocus={(event) => event.target.select()} />
          <Typography variant="body2" className="tabular">Hết hạn: {formatExpiry(issued.expiresAt)}</Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Button variant="outlined" onClick={async () => {
              try {
                await navigator.clipboard.writeText(issued.code);
                setCopyNotice("Đã sao chép mã nhận chuyến.");
              } catch {
                setCopyNotice("Không sao chép tự động được. Hãy chọn mã trong ô và sao chép.");
              }
            }}>Sao chép mã</Button>
            {typeof navigator !== "undefined" && navigator.share ? (
              <Button variant="outlined" onClick={() => navigator.share({ text: shareMessage }).catch(() => {})}>Chia sẻ</Button>
            ) : null}
          </Box>
          {copyNotice && <Typography role="status" variant="body2">{copyNotice}</Typography>}
          <Typography variant="caption" color="text.secondary">Mã cũ và phiên đăng nhập cũ của chuyến này đã bị thu hồi.</Typography>
        </Box>
      ) : reissue ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <Typography variant="body2">
            Dùng khi tài xế mất điện thoại hoặc phiên đăng nhập. Chuyến giữ nguyên trạng thái, hành trình và vị trí đã ghi; mã cũ và phiên cũ ngừng hoạt động ngay.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {error && <Alert severity="error">{error}</Alert>}
          {trip?.driverId && <Alert severity="warning">Phân công lại sẽ cấp mã mới; mã và phiên của tài xế trước bị thu hồi.</Alert>}
          <TextField
            select
            label="Tài xế đã xác minh"
            disabled={driversState !== "ready" || submitting}
            value={driverId}
            onChange={(event) => {
              setDriverId(event.target.value);
              setFieldError("");
            }}
            error={Boolean(fieldError) || driversState === "error"}
            helperText={
              fieldError ||
              (driversState === "loading"
                ? "Đang tải tài xế..."
                : driversState === "error"
                  ? "Không tải được danh sách tài xế."
                  : drivers.length === 0
                    ? "Chưa có tài xế nào được xác minh. Thêm tài xế ở mục Đội xe."
                    : "Chỉ tài xế đã được duyệt mới có trong danh sách.")
            }
          >
            {drivers.map((driver) => (
              <MenuItem key={driver.id} value={driver.id}>
                {driver.fullName} · {driver.phone}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      )}
    </ResponsiveDialog>
  );
}
