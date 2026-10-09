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
import {
  CLAIM_EVIDENCE_KIND_LABEL,
  CLAIM_GUIDANCE_TEXT,
  CLAIM_INCIDENT_LABEL,
  CLAIM_STATUS_LABEL,
  getClaimNotice,
  validateClaimDraft,
  validateEvidenceFile,
} from "./claimPresentation";

// Claim drafts can only be prepared once the goods have left the pickup point.
const CLAIM_TRIP_STATUSES = ["PICKED_UP", "IN_TRANSIT", "DELIVERED", "COMPLETED"];

/**
 * Shipper-only preparation of an insurance claim for a trip. It collects the trip reference, the incident,
 * the value proof and the evidence; it does not send anything to a provider. Evidence files are private and
 * open only through an authenticated download.
 */
export default function TripClaimPanel({ trip }) {
  const [state, setState] = useState({ loading: true, claims: [], error: "" });
  const [createOpen, setCreateOpen] = useState(false);
  const eligible = CLAIM_TRIP_STATUSES.includes(trip.status);

  /** Loads the trip's claim drafts. A failed load is shown as an error, never as "no claims". */
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

        {state.loading ? (
          <Typography variant="body2" color="text.secondary">Đang tải hồ sơ...</Typography>
        ) : state.error ? (
          <Alert severity="error" action={<Button color="inherit" size="small" onClick={load}>Thử lại</Button>}>{state.error}</Alert>
        ) : state.claims.length === 0 ? (
          <Typography variant="body2" color="text.secondary">Chưa có hồ sơ bồi thường cho chuyến này.</Typography>
        ) : (
          state.claims.map((claim) => <ClaimCard key={claim.id} claim={claim} onChanged={load} />)
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

function ClaimCard({ claim, onChanged }) {
  const [kind, setKind] = useState("PHOTO");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const busyRef = useRef(false);
  const editable = claim.status === "DRAFT" || claim.status === "NEEDS_EVIDENCE";

  /** Uploads one evidence file to the private claim-evidence folder, then attaches its reference. */
  const attach = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (busyRef.current) return;
    const problem = validateEvidenceFile(file);
    if (problem) {
      setError(problem);
      return;
    }
    busyRef.current = true;
    setBusy(true);
    setError("");
    try {
      const uploaded = await mediaApi.uploadFile(file, "claim-evidence");
      const fileUrl = uploaded?.url ?? uploaded?.data?.url;
      if (!fileUrl) throw new Error("Máy chủ không trả về đường dẫn tệp.");
      await contractApi.addClaimEvidence(claim.id, { kind, fileUrl });
      await onChanged();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Chưa đính kèm được tệp. Vui lòng thử lại."));
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  /** Checks the checklist. The server only marks the draft ready; it never sends it. */
  const checkReady = async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError("");
    try {
      await contractApi.markClaimReady(claim.id);
      await onChanged();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Chưa kiểm tra được hồ sơ. Vui lòng thử lại."));
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  /** Opens one evidence file through an authenticated request; the file is never linked publicly. */
  const openEvidence = async (link) => {
    setError("");
    try {
      const blob = await contractApi.downloadClaimEvidence(link);
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener");
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Chưa mở được tệp. Vui lòng thử lại."));
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
      <Typography variant="subtitle2">
        {CLAIM_INCIDENT_LABEL[claim.incidentType] ?? claim.incidentType} · {formatDateTime(claim.occurredAt)}
      </Typography>
      <Typography variant="body2">{claim.description}</Typography>
      {claim.claimedAmount != null && <Typography variant="body2">Số tiền yêu cầu: {formatMoney(claim.claimedAmount)}</Typography>}
      <Typography variant="body2" sx={{ fontWeight: 700 }}>{CLAIM_STATUS_LABEL[claim.status] ?? claim.status}</Typography>
      <Typography variant="body2" color="text.secondary">{getClaimNotice(claim)}</Typography>

      {claim.evidence?.length > 0 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          {claim.evidence.map((item) => (
            <Box key={item.id} sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              <Typography variant="body2">{CLAIM_EVIDENCE_KIND_LABEL[item.kind] ?? item.kind} · {formatDateTime(item.uploadedAt)}</Typography>
              <Button size="small" onClick={() => openEvidence(item.fileLink)}>Xem tệp</Button>
            </Box>
          ))}
        </Box>
      )}

      {editable && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
            <TextField select size="small" label="Loại chứng cứ" value={kind} onChange={(event) => setKind(event.target.value)} sx={{ minWidth: 220 }} disabled={busy}>
              {Object.entries(CLAIM_EVIDENCE_KIND_LABEL).map(([value, label]) => (
                <MenuItem key={value} value={value}>{label}</MenuItem>
              ))}
            </TextField>
            <Button component="label" variant="outlined" disabled={busy}>
              {busy ? "Đang tải lên..." : "Chọn tệp chứng cứ"}
              <input hidden type="file" accept="image/jpeg,image/png,image/webp,image/gif,application/pdf" onChange={attach} />
            </Button>
          </Box>
          <Box>
            <Button variant="contained" onClick={checkReady} disabled={busy}>Kiểm tra hồ sơ</Button>
          </Box>
        </Box>
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
