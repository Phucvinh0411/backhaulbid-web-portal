"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { Panel } from "@/components/ui";
import { contractApi } from "@/services/contractApi";
import { getApiErrorMessage } from "@/services/errorMessage";
import { formatDateTime, formatMoney } from "@/lib/format";
import { VALUE_DOCUMENT_KIND_LABEL } from "../shipper/create-auction/valueDocumentChecklist";
import {
  CLAIM_EVIDENCE_KIND_LABEL,
  CLAIM_INCIDENT_LABEL,
  CLAIM_STATUS_LABEL,
  getCarrierClaimNotice,
} from "./claimPresentation";
import { saveBlob } from "./claimFiles";
import { HANDOVER_CONDITION_LABEL } from "./tripHandoverPresentation";

/**
 * Carrier-side view of the claims the shipper shared for this trip. Nothing appears before a share. The carrier downloads
 * the claim pack and confirms receipt; the confirmation records only that the pack was received.
 */
export default function CarrierSharedClaimsPanel({ trip }) {
  const [state, setState] = useState({ loading: true, claims: [], error: "" });

  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const all = await contractApi.listSharedClaims();
      const forTrip = (Array.isArray(all) ? all : []).filter((claim) => claim.tripId === trip.id);
      setState({ loading: false, claims: forTrip, error: "" });
    } catch (error) {
      setState({ loading: false, claims: [], error: getApiErrorMessage(error, "Chưa tải được hồ sơ được chia sẻ.") });
    }
  }, [trip.id]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Panel title="Hồ sơ bồi thường được chủ hàng chia sẻ">
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {state.loading ? (
          <Typography variant="body2" color="text.secondary">Đang tải hồ sơ...</Typography>
        ) : state.error ? (
          <Alert severity="error" action={<Button color="inherit" size="small" onClick={load}>Thử lại</Button>}>{state.error}</Alert>
        ) : state.claims.length === 0 ? (
          <Typography variant="body2" color="text.secondary">Chưa có hồ sơ bồi thường nào được chủ hàng chia sẻ cho chuyến này.</Typography>
        ) : (
          state.claims.map((claim) => <SharedClaimCard key={claim.id} claim={claim} onChanged={load} />)
        )}
      </Box>
    </Panel>
  );
}

function SharedClaimCard({ claim, onChanged }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const busyRef = useRef(false);

  /** Downloads the pack for the shared revision. The file is saved to this device, not linked publicly. */
  const downloadPackage = async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError("");
    try {
      saveBlob(await contractApi.downloadClaimPackage(claim.id), `ho-so-boi-thuong-${claim.id.slice(0, 8)}.zip`);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Chưa tải được gói hồ sơ. Vui lòng thử lại."));
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  const acknowledge = async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setError("");
    try {
      await contractApi.acknowledgeSharedClaim(claim.id);
      await onChanged();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Chưa xác nhận được. Vui lòng thử lại."));
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  const handover = claim.handover;
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1, p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
      <Typography variant="subtitle2">
        {CLAIM_INCIDENT_LABEL[claim.incidentType] ?? claim.incidentType} · {formatDateTime(claim.occurredAt)}
      </Typography>
      <Typography variant="body2">{claim.description}</Typography>
      {claim.claimedAmount != null && <Typography variant="body2">Số tiền yêu cầu: {formatMoney(claim.claimedAmount)}</Typography>}
      <Typography variant="body2" sx={{ fontWeight: 700 }}>{CLAIM_STATUS_LABEL[claim.status] ?? claim.status}</Typography>
      <Typography variant="body2" color="text.secondary">{getCarrierClaimNotice(claim)}</Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        <Typography variant="caption" sx={{ fontWeight: 700 }}>Chứng từ đơn hàng</Typography>
        {claim.cargoDocuments?.length ? (
          claim.cargoDocuments.map((document, index) => (
            <Typography key={index} variant="body2">
              {VALUE_DOCUMENT_KIND_LABEL[document.kind] ?? document.kind} · {formatDateTime(document.uploadedAt)}
            </Typography>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">Không có chứng từ đơn hàng trong bản chia sẻ này.</Typography>
        )}
      </Box>

      {handover && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 700 }}>Biên bản bàn giao lúc nhận hàng (bối cảnh)</Typography>
          <Typography variant="body2">
            {handover.cargoCategory} · {handover.packageCount ?? "—"} kiện · {handover.grossWeightKg ?? "—"} kg ·{" "}
            {HANDOVER_CONDITION_LABEL[handover.conditionStatus] ?? handover.conditionStatus} · {handover.photoCount} ảnh
          </Typography>
        </Box>
      )}

      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        <Typography variant="caption" sx={{ fontWeight: 700 }}>Chứng cứ sự cố</Typography>
        {claim.evidence?.length ? (
          claim.evidence.map((item, index) => (
            <Typography key={index} variant="body2">
              {CLAIM_EVIDENCE_KIND_LABEL[item.kind] ?? item.kind} · {formatDateTime(item.uploadedAt)}
            </Typography>
          ))
        ) : (
          <Typography variant="body2" color="text.secondary">Chưa có chứng cứ sự cố trong bản chia sẻ này.</Typography>
        )}
      </Box>

      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        <Button variant="outlined" onClick={downloadPackage} disabled={busy}>Tải gói hồ sơ</Button>
        {!claim.acknowledged && (
          <Button variant="contained" onClick={acknowledge} disabled={busy}>Xác nhận đã nhận hồ sơ</Button>
        )}
      </Box>

      {error && <Alert severity="error">{error}</Alert>}
    </Box>
  );
}
