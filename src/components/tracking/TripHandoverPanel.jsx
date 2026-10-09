"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { Panel } from "@/components/ui";
import { contractApi } from "@/services/contractApi";
import { getApiErrorMessage } from "@/services/errorMessage";
import { formatDateTime } from "@/lib/format";
import {
  HANDOVER_CONDITION_LABEL,
  HANDOVER_RECORDER_LABEL,
  getHandoverState,
  validateSignerName,
} from "./tripHandoverPresentation";

/**
 * Pickup handover of a trip, for its shipper and carrier. The driver records the load in the driver app; the
 * shipper confirms the handover here. Confirmation is blocked server-side until photos exist.
 */
export default function TripHandoverPanel({ trip, role }) {
  const [loadState, setLoadState] = useState({ loading: true, handover: null, error: "" });
  const [signerName, setSignerName] = useState("");
  const [nameError, setNameError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionError, setActionError] = useState("");
  const submittingRef = useRef(false);

  /** Loads the handover (zero or one). A failed load is shown as an error, never as "no handover". */
  const load = useCallback(async () => {
    setLoadState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const records = await contractApi.getTripHandover(trip.id);
      setLoadState({ loading: false, handover: records?.[0] ?? null, error: "" });
    } catch (error) {
      setLoadState({ loading: false, handover: null, error: getApiErrorMessage(error, "Chưa tải được biên bản bàn giao.") });
    }
  }, [trip.id]);

  useEffect(() => {
    void load();
  }, [load, trip.status]);

  const { handover, loading, error } = loadState;
  const view = getHandoverState({ handover, tripStatus: trip.status });
  const canConfirm = role === "shipper" && view.canConfirm;

  /** Sends the shipper's confirmation once; a double click while in flight is ignored. */
  const confirm = async () => {
    if (submittingRef.current) return;
    const problem = validateSignerName(signerName);
    if (problem) {
      setNameError(problem);
      return;
    }
    submittingRef.current = true;
    setSubmitting(true);
    setActionError("");
    try {
      await contractApi.confirmTripHandover(trip.id, { signerName: signerName.trim() });
      setSignerName("");
      await load();
    } catch (requestError) {
      setActionError(getApiErrorMessage(requestError, "Chưa xác nhận được bàn giao. Vui lòng thử lại."));
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <Panel title="Biên bản bàn giao lấy hàng">
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {loading ? (
          <Typography variant="body2" color="text.secondary">Đang tải biên bản bàn giao...</Typography>
        ) : error ? (
          <Alert severity="error" action={<Button color="inherit" size="small" onClick={load}>Thử lại</Button>}>{error}</Alert>
        ) : (
          <>
            <Typography variant="body2" color="text.secondary">{view.message}</Typography>

            {handover && (
              <Box sx={{ display: "grid", gap: 0.75, gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" } }}>
                <Typography variant="body2"><strong>Loại hàng:</strong> {handover.cargoCategory}</Typography>
                <Typography variant="body2"><strong>Khối lượng:</strong> {handover.grossWeightKg} kg</Typography>
                <Typography variant="body2"><strong>Số kiện:</strong> {handover.packageCount ?? "Không áp dụng"}</Typography>
                <Typography variant="body2"><strong>Tình trạng:</strong> {HANDOVER_CONDITION_LABEL[handover.conditionStatus] ?? handover.conditionStatus}</Typography>
                {handover.conditionNote && <Typography variant="body2"><strong>Ghi chú hư hỏng:</strong> {handover.conditionNote}</Typography>}
                <Typography variant="body2"><strong>Niêm phong:</strong> {handover.sealNumber || "Không có"}</Typography>
                {handover.placeNote && <Typography variant="body2"><strong>Vị trí:</strong> {handover.placeNote}</Typography>}
                <Typography variant="body2">
                  <strong>Ghi bởi:</strong> {HANDOVER_RECORDER_LABEL[handover.recordedByType] ?? "Không rõ"} · {formatDateTime(handover.recordedAt)}
                </Typography>
              </Box>
            )}

            {handover?.photoPaths?.length > 0 && (
              <Box sx={{ display: "grid", gap: 1, gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))" }}>
                {handover.photoPaths.map((_, index) => (
                  <HandoverPhoto key={`${trip.id}-${index}`} tripId={trip.id} index={index} />
                ))}
              </Box>
            )}

            {handover?.shipperConfirmedAt && (
              <Typography variant="body2" color="text.secondary">
                Người giao hàng: {handover.shipperSignerName} · xác nhận lúc {formatDateTime(handover.shipperConfirmedAt)}
              </Typography>
            )}

            {canConfirm && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
                {actionError && <Alert severity="error">{actionError}</Alert>}
                <TextField
                  label="Tên người giao hàng (ký xác nhận)"
                  value={signerName}
                  disabled={submitting}
                  onChange={(event) => {
                    setSignerName(event.target.value);
                    setNameError("");
                  }}
                  error={Boolean(nameError)}
                  helperText={nameError || "Người đã giao hàng cho tài xế tại kho lấy hàng."}
                  inputProps={{ maxLength: 120 }}
                />
                <Box>
                  <Button variant="contained" onClick={confirm} disabled={submitting}>
                    {submitting ? "Đang xác nhận..." : "Xác nhận đã giao hàng cho tài xế"}
                  </Button>
                </Box>
              </Box>
            )}
          </>
        )}
      </Box>
    </Panel>
  );
}

/**
 * One handover photo, read with the signed-in session as a blob through the trip check. The object URL is released
 * when the photo leaves the screen or its trip changes. A failed read shows a plain placeholder, never a broken link.
 */
function HandoverPhoto({ tripId, index }) {
  const [state, setState] = useState({ src: "", failed: false });

  useEffect(() => {
    let active = true;
    let objectUrl = "";
    setState({ src: "", failed: false });
    contractApi.getTripHandoverPhoto(tripId, index)
      .then((blob) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setState({ src: objectUrl, failed: false });
      })
      .catch(() => {
        if (active) setState({ src: "", failed: true });
      });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [tripId, index]);

  const frameSx = { width: "100%", aspectRatio: "1 / 1", borderRadius: 2, border: "1px solid", borderColor: "divider" };
  if (state.failed) {
    return (
      <Box role="img" aria-label={`Không tải được ảnh hàng hóa ${index + 1}`} sx={{ ...frameSx, display: "grid", placeItems: "center", bgcolor: "action.hover" }}>
        <Typography variant="caption" color="text.secondary">Không tải được ảnh</Typography>
      </Box>
    );
  }
  if (!state.src) {
    return <Box role="img" aria-label={`Đang tải ảnh hàng hóa ${index + 1}`} sx={{ ...frameSx, bgcolor: "action.hover" }} />;
  }
  return (
    <Box
      component="img"
      src={state.src}
      alt={`Ảnh hàng hóa lúc bàn giao ${index + 1}`}
      sx={{ ...frameSx, objectFit: "cover" }}
    />
  );
}
