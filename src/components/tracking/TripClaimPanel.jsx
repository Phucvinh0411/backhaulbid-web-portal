"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { Panel, ResponsiveDialog } from "@/components/ui";
import { contractApi } from "@/services/contractApi";
import { mediaApi } from "@/services/mediaApi";
import { getApiErrorMessage } from "@/services/errorMessage";
import { formatDateTime, formatMoney } from "@/lib/format";
import { VALUE_DOCUMENT_KIND_LABEL } from "../shipper/create-auction/valueDocumentChecklist";
import {
  CLAIM_EVIDENCE_KIND_LABEL,
  CLAIM_GUIDANCE_TEXT,
  CLAIM_INCIDENT_LABEL,
  CLAIM_SHARE_CONFIRM_TEXT,
  CLAIM_STATUS_LABEL,
  claimAcceptsEvidence,
  claimCanBeChecked,
  claimCanBeShared,
  claimIsShared,
  getClaimNotice,
  validateClaimDraft,
  validateEvidenceFile,
} from "./claimPresentation";
import { openBlobInNewTab, saveBlob } from "./claimFiles";
import TripCargoDocumentsSection from "./TripCargoDocumentsSection";
import { HANDOVER_CONDITION_LABEL } from "./tripHandoverPresentation";

// Claim drafts can only be prepared once the goods have left the pickup point.
const CLAIM_TRIP_STATUSES = ["PICKED_UP", "IN_TRANSIT", "DELIVERED", "COMPLETED"];

/**
 * Shipper-only preparation and sharing of an insurance claim for a trip. The panel collects the order documents, the
 * pickup record as context, the incident evidence and the checklist; it can hand a complete claim to the trip's carrier.
 * It never sends anything to an insurer. Files are private and open only through an authenticated request.
 */
export default function TripClaimPanel({ trip }) {
  const [state, setState] = useState({ loading: true, claims: [], error: "" });
  const [createOpen, setCreateOpen] = useState(false);
  const eligible = CLAIM_TRIP_STATUSES.includes(trip.status);

  /** Loads the trip's claims. A failed load is shown as an error, never as "no claims". */
  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const claims = await contractApi.listTripClaims(trip.id);
      setState({ loading: false, claims: Array.isArray(claims) ? claims : [], error: "" });
    } catch (error) {
      setState({ loading: false, claims: [], error: getApiErrorMessage(error, "Chưa tải được hồ sơ bồi thường.") });
    }
  }, [trip.id]);

  useEffect(() => {
    if (eligible) void load();
  }, [eligible, load]);

  if (!eligible) return null;

  return (
    <Panel title="Hồ sơ bồi thường (chuẩn bị)">
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography variant="body2" color="text.secondary">{CLAIM_GUIDANCE_TEXT}</Typography>

        <TripCargoDocumentsSection trip={trip} />

        {state.loading ? (
          <Typography variant="body2" color="text.secondary">Đang tải hồ sơ...</Typography>
        ) : state.error ? (
          <Alert severity="error" action={<Button color="inherit" size="small" onClick={load}>Thử lại</Button>}>{state.error}</Alert>
        ) : state.claims.length === 0 ? (
          <Typography variant="body2" color="text.secondary">Chưa có hồ sơ bồi thường cho chuyến này.</Typography>
        ) : (
          state.claims.map((claim) => <ClaimCard key={claim.id} claim={claim} tripId={trip.id} onChanged={load} />)
        )}

        <Box>
          <Button variant="outlined" onClick={() => setCreateOpen(true)}>Mở hồ sơ bồi thường</Button>
        </Box>
      </Box>

      <CreateClaimDialog
        open={createOpen}
        tripId={trip.id}
        onClose={() => setCreateOpen(false)}
        onCreated={async () => {
          setCreateOpen(false);
          await load();
        }}
      />
    </Panel>
  );
}

function ClaimCard({ claim, tripId, onChanged }) {
  const [kind, setKind] = useState("PHOTO");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [confirmShare, setConfirmShare] = useState(false);
  const busyRef = useRef(false);
  const shared = claimIsShared(claim);

  /** Runs one request at a time for this claim and reloads the list when it succeeds. */
  const run = async (action, fallbackMessage) => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError("");
    try {
      await action();
      await onChanged();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, fallbackMessage));
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  /** Uploads one evidence file to the private claim-evidence folder by key, then attaches it to the claim. */
  const attach = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    const problem = validateEvidenceFile(file);
    if (problem) {
      setError(problem);
      return;
    }
    await run(async () => {
      const key = await mediaApi.uploadPrivateFile(file, "claim-evidence");
      await contractApi.addClaimEvidence(claim.id, { kind, fileUrl: key });
    }, "Chưa đính kèm được tệp. Vui lòng thử lại.");
  };

  const checkReady = () => run(() => contractApi.markClaimReady(claim.id), "Chưa kiểm tra được hồ sơ. Vui lòng thử lại.");

  const share = () => {
    setConfirmShare(false);
    return run(() => contractApi.shareTripClaim(claim.id), "Chưa chia sẻ được hồ sơ. Vui lòng thử lại.");
  };

  /** Opens one private file through an authenticated request; it is never linked publicly. */
  const openFile = async (fileLink) => {
    setError("");
    try {
      openBlobInNewTab(await contractApi.downloadClaimEvidence(fileLink));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Chưa mở được tệp. Vui lòng thử lại."));
    }
  };

  const openHandoverPhoto = async (index) => {
    setError("");
    try {
      openBlobInNewTab(await contractApi.getTripHandoverPhoto(tripId, index));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Chưa mở được ảnh bàn giao. Vui lòng thử lại."));
    }
  };

  const downloadPackage = async () => {
    setError("");
    try {
      saveBlob(await contractApi.downloadClaimPackage(claim.id), `ho-so-boi-thuong-${claim.id.slice(0, 8)}.zip`);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Chưa tải được gói hồ sơ. Vui lòng thử lại."));
    }
  };

  const handover = claim.handover;
  const missing = Array.isArray(claim.missingItems) ? claim.missingItems : [];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
      <Typography variant="subtitle2">
        {CLAIM_INCIDENT_LABEL[claim.incidentType] ?? claim.incidentType} · {formatDateTime(claim.occurredAt)}
      </Typography>
      <Typography variant="body2">{claim.description}</Typography>
      {claim.claimedAmount != null && <Typography variant="body2">Số tiền yêu cầu: {formatMoney(claim.claimedAmount)}</Typography>}
      <Typography variant="body2" sx={{ fontWeight: 700 }}>{CLAIM_STATUS_LABEL[claim.status] ?? claim.status}</Typography>
      <Typography variant="body2" color="text.secondary">{getClaimNotice(claim)}</Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        <Typography variant="caption" sx={{ fontWeight: 700 }}>Chứng từ đơn hàng</Typography>
        {(claim.cargoDocuments ?? []).length === 0 ? (
          <Typography variant="body2" color="text.secondary">Chưa có chứng từ giá trị hàng (xem mục phía trên).</Typography>
        ) : (
          <Typography variant="body2">
            {claim.cargoDocuments.map((document) => VALUE_DOCUMENT_KIND_LABEL[document.kind] ?? document.kind).join(", ")}
          </Typography>
        )}
      </Box>

      {handover && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 700 }}>
            Biên bản bàn giao lúc nhận hàng (bối cảnh trước vận chuyển, không phải chứng cứ hư hỏng phát sinh sau đó)
          </Typography>
          <Typography variant="body2">
            {handover.cargoCategory} · {handover.packageCount ?? "—"} kiện · {handover.grossWeightKg ?? "—"} kg ·{" "}
            {HANDOVER_CONDITION_LABEL[handover.conditionStatus] ?? handover.conditionStatus}
          </Typography>
          {handover.photoLinks?.length > 0 && (
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {handover.photoLinks.map((_, index) => (
                <Button key={index} size="small" onClick={() => openHandoverPhoto(index)}>Ảnh {index + 1}</Button>
              ))}
            </Box>
          )}
        </Box>
      )}

      {claim.evidence?.length > 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 700 }}>Chứng cứ sự cố</Typography>
          {claim.evidence.map((item) => (
            <Box key={item.id} sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              <Typography variant="body2">{CLAIM_EVIDENCE_KIND_LABEL[item.kind] ?? item.kind} · {formatDateTime(item.uploadedAt)}</Typography>
              <Button size="small" onClick={() => openFile(item.fileLink)}>Xem tệp</Button>
            </Box>
          ))}
        </Box>
      )}

      {missing.length > 0 && claim.status !== "SHARED_WITH_CARRIER" && claim.status !== "CARRIER_ACKNOWLEDGED" && (
        <Typography variant="caption" color="text.secondary">Checklist còn thiếu: {missing.join("; ")}.</Typography>
      )}

      {claimAcceptsEvidence(claim) && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          {shared && (
            <Typography variant="caption" color="text.secondary">
              Bổ sung chứng cứ sau khi chia sẻ tạo phiên bản mới và cần chia sẻ lại. Phiên bản đã chia sẻ không bị thay đổi.
            </Typography>
          )}
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
            <TextField select size="small" label="Loại chứng cứ" value={kind} onChange={(event) => setKind(event.target.value)} sx={{ minWidth: 220 }} disabled={busy}>
              {Object.entries(CLAIM_EVIDENCE_KIND_LABEL).map(([value, label]) => (
                <MenuItem key={value} value={value}>{label}</MenuItem>
              ))}
            </TextField>
            <Button component="label" variant="outlined" disabled={busy}>
              {busy ? "Đang xử lý..." : "Chọn tệp chứng cứ"}
              <input hidden type="file" accept="image/jpeg,image/png,image/webp,image/gif,application/pdf" onChange={attach} />
            </Button>
          </Box>
        </Box>
      )}

      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        {claimCanBeChecked(claim) && (
          <Button variant="outlined" onClick={checkReady} disabled={busy}>Kiểm tra hồ sơ</Button>
        )}
        {claimCanBeShared(claim) && !confirmShare && (
          <Button variant="contained" onClick={() => setConfirmShare(true)} disabled={busy}>Chia sẻ hồ sơ với nhà xe</Button>
        )}
        {(shared || claim.status === "READY_TO_SHARE") && (
          <Button variant="text" onClick={downloadPackage} disabled={busy}>Tải gói hồ sơ</Button>
        )}
      </Box>

      {confirmShare && (
        <Alert
          severity="info"
          action={(
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button color="inherit" size="small" onClick={() => setConfirmShare(false)} disabled={busy}>Hủy</Button>
              <Button color="inherit" size="small" onClick={share} disabled={busy}>Xác nhận chia sẻ</Button>
            </Box>
          )}
        >
          {CLAIM_SHARE_CONFIRM_TEXT}
        </Alert>
      )}

      {error && <Alert severity="error">{error}</Alert>}
    </Box>
  );
}

function CreateClaimDialog({ open, tripId, onClose, onCreated }) {
  const [form, setForm] = useState({ incidentType: "DAMAGE", occurredAt: "", description: "", claimedAmount: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

  const update = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }));
    setError("");
  };

  const close = () => {
    if (submittingRef.current) return;
    setForm({ incidentType: "DAMAGE", occurredAt: "", description: "", claimedAmount: "" });
    setError("");
    onClose?.();
  };

  /** Creates the draft only; nothing is sent to a provider from here. */
  const submit = async () => {
    if (submittingRef.current) return;
    const problem = validateClaimDraft(form);
    if (problem) {
      setError(problem);
      return;
    }
    submittingRef.current = true;
    setSubmitting(true);
    try {
      await contractApi.createTripClaim(tripId, {
        incidentType: form.incidentType,
        occurredAt: new Date(form.occurredAt).toISOString(),
        description: form.description.trim(),
        claimedAmount: form.claimedAmount.trim() || null,
      });
      setForm({ incidentType: "DAMAGE", occurredAt: "", description: "", claimedAmount: "" });
      await onCreated?.();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Chưa mở được hồ sơ. Vui lòng thử lại."));
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  return (
    <ResponsiveDialog
      open={open}
      onClose={close}
      busy={submitting}
      maxWidth="sm"
      title="Mở hồ sơ bồi thường"
      titleId="trip-claim-title"
      actions={
        <>
          <Button color="inherit" onClick={close} disabled={submitting}>Hủy</Button>
          <Button variant="contained" onClick={submit} disabled={submitting}>{submitting ? "Đang lưu..." : "Lưu nháp"}</Button>
        </>
      }
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField select label="Loại sự cố" value={form.incidentType} onChange={update("incidentType")} disabled={submitting}>
          {Object.entries(CLAIM_INCIDENT_LABEL).map(([value, label]) => (
            <MenuItem key={value} value={value}>{label}</MenuItem>
          ))}
        </TextField>
        <TextField
          label="Thời điểm xảy ra sự cố"
          type="datetime-local"
          value={form.occurredAt}
          onChange={update("occurredAt")}
          InputLabelProps={{ shrink: true }}
          disabled={submitting}
        />
        <TextField
          label="Mô tả sự cố"
          multiline
          minRows={3}
          value={form.description}
          onChange={update("description")}
          helperText={`${form.description.length}/1000. Mô tả tình trạng hàng và nơi xảy ra sự cố.`}
          inputProps={{ maxLength: 1000 }}
          disabled={submitting}
        />
        <TextField
          label="Số tiền yêu cầu (đ, không bắt buộc)"
          inputMode="decimal"
          value={form.claimedAmount}
          onChange={update("claimedAmount")}
          disabled={submitting}
        />
      </Box>
    </ResponsiveDialog>
  );
}
