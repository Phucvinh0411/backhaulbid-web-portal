"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormHelperText from "@mui/material/FormHelperText";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { Panel, ResponsiveDialog } from "@/components/ui";
import { useGlobalNotification } from "@/components/common/NotificationPopup";
import { contractApi } from "@/services/contractApi";
import { mediaApi } from "@/services/mediaApi";
import { getApiErrorMessage } from "@/services/errorMessage";
import { getExecutorJourneySteps, isTripClosed } from "@/lib/statusMeta";
import AssignDriverDialog from "./AssignDriverDialog";

const MAX_PROOF_BYTES = 10 * 1024 * 1024;

function useSingleFlight() {
  const busyRef = useRef(false);
  const [busy, setBusy] = useState(false);
  const run = async (work) => {
    if (busyRef.current) return undefined;
    busyRef.current = true;
    setBusy(true);
    try {
      return await work();
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };
  return [busy, run];
}

/** Delivery proof: upload image -> POST delivery-proofs -> journey event DELIVERED. Retries resume at the failed step. */
function ProofDialog({ open, trip, onClose, onDone }) {
  const [file, setFile] = useState(null);
  const [note, setNote] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [error, setError] = useState("");
  const [savedProofUrl, setSavedProofUrl] = useState("");
  const [busy, run] = useSingleFlight();

  const submit = () =>
    run(async () => {
      setError("");
      if (!savedProofUrl && !file) {
        setFieldError("Chọn ảnh bằng chứng giao hàng.");
        return;
      }
      let proofUrl = savedProofUrl;
      try {
        if (!proofUrl) {
          const imageUrl = await mediaApi.uploadFile(file, "delivery-proofs");
          await contractApi.addDeliveryProof(trip.id, { imageUrl, note: note.trim() || undefined });
          proofUrl = imageUrl;
          setSavedProofUrl(imageUrl);
        }
        await contractApi.addJourneyEvent(trip.id, {
          eventType: "DELIVERY_PROOF_SUBMITTED",
          status: "DELIVERED",
          note: note.trim() || undefined,
          evidenceUrl: proofUrl,
        });
        onDone?.("Đã gửi bằng chứng. Chuyến chuyển sang “Đã giao, chờ xác nhận”.");
      } catch (requestError) {
        const base = getApiErrorMessage(requestError, "Chưa hoàn tất.");
        setError(proofUrl ? `Ảnh bằng chứng đã được lưu nhưng chưa cập nhật trạng thái chuyến. ${base} Bấm “Thử lại” để tiếp tục.` : base);
      }
    });

  return (
    <ResponsiveDialog
      open={open}
      onClose={onClose}
      busy={busy}
      title="Gửi bằng chứng giao hàng"
      titleId="proof-dialog-title"
      actions={
        <>
          <Button color="inherit" onClick={onClose} disabled={busy}>
            Hủy
          </Button>
          <Button variant="contained" onClick={submit} disabled={busy}>
            {busy ? "Đang gửi..." : savedProofUrl ? "Thử lại" : "Gửi và báo đã giao"}
          </Button>
        </>
      }
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {error && <Alert severity="error">{error}</Alert>}
        <Typography variant="body2">Chụp biên bản hoặc hàng tại điểm giao. Chủ hàng xem bằng chứng này trước khi xác nhận hoàn thành chuyến.</Typography>
        {!savedProofUrl && (
          <Box>
            <input
              id="proof-file"
              type="file"
              accept="image/*"
              capture="environment"
              aria-describedby="proof-file-help"
              onChange={(event) => {
                const next = event.target.files?.[0] || null;
                if (next && next.size > MAX_PROOF_BYTES) {
                  setFieldError("Ảnh tối đa 10 MB.");
                  setFile(null);
                  event.target.value = "";
                  return;
                }
                setFieldError("");
                setFile(next);
              }}
              className="min-h-[44px] w-full text-sm file:mr-3 file:min-h-[40px] file:rounded-md file:border file:border-line-strong file:bg-surface file:px-3 file:font-semibold"
            />
            <FormHelperText id="proof-file-help" error={Boolean(fieldError)}>
              {fieldError || "Ảnh JPG/PNG, tối đa 10 MB."}
            </FormHelperText>
          </Box>
        )}
        <TextField label="Ghi chú (không bắt buộc)" multiline minRows={2} value={note} onChange={(event) => setNote(event.target.value)} inputProps={{ maxLength: 500 }} />
      </Box>
    </ResponsiveDialog>
  );
}

function IncidentDialog({ open, trip, onClose, onDone }) {
  const [note, setNote] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [error, setError] = useState("");
  const [busy, run] = useSingleFlight();

  const submit = () =>
    run(async () => {
      if (!note.trim()) {
        setFieldError("Mô tả sự cố để chủ hàng và quản trị viên nắm được.");
        return;
      }
      setError("");
      try {
        await contractApi.addJourneyEvent(trip.id, { eventType: "INCIDENT_REPORTED", note: note.trim() });
        setNote("");
        onDone?.("Đã ghi nhận sự cố vào hành trình.");
      } catch (requestError) {
        setError(getApiErrorMessage(requestError, "Chưa gửi được báo cáo sự cố."));
      }
    });

  return (
    <ResponsiveDialog
      open={open}
      onClose={onClose}
      busy={busy}
      maxWidth="xs"
      title="Báo sự cố"
      titleId="incident-dialog-title"
      actions={
        <>
          <Button color="inherit" onClick={onClose} disabled={busy}>
            Hủy
          </Button>
          <Button variant="contained" color="warning" onClick={submit} disabled={busy}>
            {busy ? "Đang gửi..." : "Gửi báo cáo"}
          </Button>
        </>
      }
    >
      {error && <Alert severity="error" sx={{ mb: 1.5 }}>{error}</Alert>}
      <Typography variant="body2" sx={{ mb: 1.5 }}>Sự cố được ghi vào hành trình; trạng thái chuyến không thay đổi.</Typography>
      <TextField
        fullWidth
        multiline
        minRows={3}
        required
        label="Mô tả sự cố"
        value={note}
        onChange={(event) => {
          setNote(event.target.value);
          setFieldError("");
        }}
        error={Boolean(fieldError)}
        helperText={fieldError || `${note.length}/500`}
        inputProps={{ maxLength: 500 }}
      />
    </ResponsiveDialog>
  );
}

/**
 * Next actions for a trip, by role. Mirrors TripService permissions:
 *  - carrier records journey steps up to DELIVERED, uploads proof, reports incidents, assigns drivers;
 *  - shipper accepts the delivery (DELIVERY_ACCEPTED → COMPLETED) once it is DELIVERED.
 * Completion by the carrier and cancellation are intentionally not offered here.
 */
export default function TripActions({ trip, role, proofs = [], onChanged }) {
  const { notify } = useGlobalNotification();
  const [dialog, setDialog] = useState(null);
  const [error, setError] = useState("");
  const [busy, run] = useSingleFlight();
  const closed = isTripClosed(trip.status);
  const complaintHref = `/${role}/complaints?new=1&tripId=${encodeURIComponent(trip.id)}`;

  const done = async (message) => {
    setDialog(null);
    notify.success(message);
    await onChanged?.();
  };

  const recordStep = (step) =>
    run(async () => {
      setError("");
      try {
        await contractApi.addJourneyEvent(trip.id, { eventType: step.eventType, ...(step.status ? { status: step.status } : {}) });
        await done(`Đã ghi nhận: ${step.label}.`);
      } catch (requestError) {
        setError(getApiErrorMessage(requestError, "Chưa cập nhật được hành trình."));
        await onChanged?.();
      }
    });

  const acceptDelivery = () =>
    run(async () => {
      setError("");
      try {
        await contractApi.addJourneyEvent(trip.id, { eventType: "DELIVERY_ACCEPTED", status: "COMPLETED" });
        await done("Đã xác nhận nhận hàng. Chuyến hoàn thành.");
      } catch (requestError) {
        setError(getApiErrorMessage(requestError, "Chưa xác nhận được."));
        await onChanged?.();
      }
    });

  let body = null;
  if (role === "carrier" && !closed) {
    const steps = getExecutorJourneySteps(trip.status);
    body = (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {trip.status === "WAITING_PICKUP" && !trip.driverId && (
          <Alert severity="warning" action={<Button color="inherit" size="small" onClick={() => setDialog("assign")}>Phân công</Button>}>
            Chuyến chưa có tài xế.
          </Alert>
        )}
        {trip.status === "WAITING_PICKUP" && trip.driverId && !trip.driverConnected && (
          <Alert severity="info">Chờ tài xế nhập mã nhận chuyến trong app. Nếu mã hết hạn hoặc thất lạc, cấp lại mã.</Alert>
        )}
        {trip.status === "DELIVERED" && <Typography variant="body2">Đã giao. Đang chờ chủ hàng xác nhận để hoàn thành chuyến.</Typography>}
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", "& > *": { flex: { xs: "1 1 100%", sm: "0 0 auto" } } }}>
          {steps.map((step) =>
            step.requiresProof ? (
              <Button key={step.eventType} variant={step.primary ? "contained" : "outlined"} onClick={() => setDialog("proof")} disabled={busy}>
                {step.label}
              </Button>
            ) : (
              <Button key={step.eventType} variant={step.primary ? "contained" : "outlined"} onClick={() => recordStep(step)} disabled={busy}>
                {step.label}
              </Button>
            ),
          )}
          {trip.status === "WAITING_PICKUP" && trip.driverId && (
            <Button variant="outlined" color="inherit" onClick={() => setDialog("assign")} disabled={busy}>
              Đổi tài xế
            </Button>
          )}
          {trip.driverId && ["WAITING_PICKUP", "PICKED_UP", "IN_TRANSIT"].includes(trip.status) && (
            <Button variant="outlined" color="inherit" onClick={() => setDialog("reissue")} disabled={busy}>
              Cấp lại mã nhận chuyến
            </Button>
          )}
          <Button variant="outlined" color="warning" onClick={() => setDialog("incident")} disabled={busy}>
            Báo sự cố
          </Button>
        </Box>
      </Box>
    );
  } else if (role === "shipper" && trip.status === "DELIVERED") {
    body = (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Typography variant="body2">
          Nhà xe đã báo giao hàng{proofs.length ? ` kèm ${proofs.length} bằng chứng` : ""}. Kiểm tra hàng và bằng chứng trước khi xác nhận; sau khi xác nhận, chuyến hoàn thành và không thể đổi lại.
        </Typography>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", "& > *": { flex: { xs: "1 1 100%", sm: "0 0 auto" } } }}>
          <Button variant="contained" onClick={() => setDialog("accept")} disabled={busy}>
            Xác nhận đã nhận hàng
          </Button>
          <Button variant="outlined" component={Link} href={complaintHref}>
            Hàng có vấn đề? Gửi khiếu nại
          </Button>
        </Box>
      </Box>
    );
  } else if (role === "shipper" && !closed) {
    body = <Typography variant="body2">Chuyến đang được nhà xe thực hiện. Bạn sẽ xác nhận nhận hàng sau khi nhà xe báo đã giao.</Typography>;
  }

  return (
    <>
      <Panel
        title="Việc tiếp theo"
        actions={
          <Button size="small" component={Link} href={complaintHref} color="inherit">
            Gửi khiếu nại
          </Button>
        }
      >
        {error && <Alert severity="error" sx={{ mb: 1.5 }}>{error}</Alert>}
        {body || (
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {trip.status === "COMPLETED" ? "Chuyến đã hoàn thành." : trip.status === "CANCELLED" ? "Chuyến đã hủy." : "Không có thao tác nào cho vai trò của bạn ở bước này."}
          </Typography>
        )}
      </Panel>

      {role === "carrier" && (
        <>
          <ProofDialog open={dialog === "proof"} trip={trip} onClose={() => setDialog(null)} onDone={done} />
          <IncidentDialog open={dialog === "incident"} trip={trip} onClose={() => setDialog(null)} onDone={done} />
          <AssignDriverDialog open={dialog === "assign"} trip={trip} onClose={() => { setDialog(null); void onChanged?.(); }} />
          <AssignDriverDialog open={dialog === "reissue"} mode="reissue" trip={trip} onClose={() => { setDialog(null); void onChanged?.(); }} />
        </>
      )}
      {role === "shipper" && (
        <ResponsiveDialog
          open={dialog === "accept"}
          onClose={() => setDialog(null)}
          busy={busy}
          maxWidth="xs"
          title="Xác nhận đã nhận hàng?"
          titleId="accept-delivery-title"
          actions={
            <>
              <Button color="inherit" onClick={() => setDialog(null)} disabled={busy}>
                Kiểm tra lại
              </Button>
              <Button variant="contained" onClick={acceptDelivery} disabled={busy}>
                {busy ? "Đang xác nhận..." : "Xác nhận"}
              </Button>
            </>
          }
        >
          <Typography variant="body2">Chuyến sẽ chuyển sang “Hoàn thành”. Nếu hàng có vấn đề, hãy gửi khiếu nại thay vì xác nhận.</Typography>
        </ResponsiveDialog>
      )}
    </>
  );
}
