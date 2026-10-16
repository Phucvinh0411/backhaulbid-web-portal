"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { contractApi } from "@/services/contractApi";
import { mediaApi } from "@/services/mediaApi";
import { getApiErrorMessage } from "@/services/errorMessage";
import { formatDateTime, formatMoney } from "@/lib/format";
import { validateValueDocumentFiles } from "../shipper/create-auction/valueDocumentValidation";
import {
  SELECTABLE_VALUE_DOCUMENT_KINDS,
  VALUE_DOCUMENT_KIND_LABEL,
} from "../shipper/create-auction/valueDocumentChecklist";
import { openBlobInNewTab } from "./claimFiles";

const SOURCE_LABEL = {
  AWARD_SNAPSHOT: "Từ phiên đấu giá",
  TRIP_SUPPLEMENT: "Bổ sung sau khi nhận chuyến",
};

/**
 * The shipper's goods-value documents for one trip: the copy taken when the trip was awarded, and any added later.
 * Trips created before those copies existed show that they have none, and the shipper can add the documents. Files are
 * private and open only through an authenticated request.
 */
export default function TripCargoDocumentsSection({ trip }) {
  const [state, setState] = useState({ loading: true, data: null, error: "" });
  const [kind, setKind] = useState("INVOICE");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const busyRef = useRef(false);

  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: "" }));
    try {
      const data = await contractApi.listTripCargoDocuments(trip.id);
      setState({ loading: false, data, error: "" });
    } catch (error) {
      setState({ loading: false, data: null, error: getApiErrorMessage(error, "Chưa tải được chứng từ giá trị hàng.") });
    }
  }, [trip.id]);

  useEffect(() => {
    void load();
  }, [load]);

  /** Uploads one file to the private folder, then records it on the trip with the chosen kind. */
  const attach = async (event) => {
    const picked = validateValueDocumentFiles(event.target.files, state.data?.documents?.length ?? 0);
    event.target.value = "";
    if (busyRef.current) return;
    if (!picked.valid) {
      setMessage(picked.message);
      return;
    }
    busyRef.current = true;
    setBusy(true);
    setMessage("");
    try {
      const key = await mediaApi.uploadPrivateFile(picked.files[0], "goods-value-docs");
      await contractApi.addTripCargoDocument(trip.id, { key, kind });
      await load();
    } catch (error) {
      setMessage(getApiErrorMessage(error, "Chưa thêm được chứng từ. Vui lòng thử lại."));
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  };

  const view = async (document) => {
    setMessage("");
    try {
      openBlobInNewTab(await contractApi.downloadTripCargoDocument(document.fileLink));
    } catch (error) {
      setMessage(getApiErrorMessage(error, "Chưa mở được chứng từ. Vui lòng thử lại."));
    }
  };

  if (state.loading) {
    return <Typography variant="body2" color="text.secondary">Đang tải chứng từ giá trị hàng...</Typography>;
  }
  if (state.error) {
    return (
      <Alert severity="error" action={<Button color="inherit" size="small" onClick={load}>Thử lại</Button>}>{state.error}</Alert>
    );
  }

  const documents = state.data?.documents ?? [];
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
      <Typography variant="subtitle2">Chứng từ giá trị hàng của chuyến</Typography>
      <Typography variant="body2">
        Giá trị hàng khai báo: {state.data?.declaredGoodsValue != null ? formatMoney(state.data.declaredGoodsValue) : "chưa khai báo"}
      </Typography>

      {!state.data?.snapshotRecorded && (
        <Alert severity="info">
          Chuyến này được tạo trước khi lưu chứng từ giá trị hàng. Hãy bổ sung chứng từ có loại rõ ràng để dùng trong hồ sơ bồi thường.
        </Alert>
      )}

      {documents.length === 0 ? (
        <Typography variant="body2" color="text.secondary">Chưa có chứng từ giá trị hàng.</Typography>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          {documents.map((document) => (
            <Box key={document.id} sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              <Typography variant="body2">
                {VALUE_DOCUMENT_KIND_LABEL[document.kind] ?? document.kind} · {SOURCE_LABEL[document.source] ?? ""} · {formatDateTime(document.uploadedAt)}
              </Typography>
              <Button size="small" onClick={() => view(document)}>Xem tệp</Button>
            </Box>
          ))}
        </Box>
      )}

      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
        <TextField select size="small" label="Loại chứng từ" value={kind} onChange={(event) => setKind(event.target.value)} sx={{ minWidth: 200 }} disabled={busy}>
          {SELECTABLE_VALUE_DOCUMENT_KINDS.map((value) => (
            <MenuItem key={value} value={value}>{VALUE_DOCUMENT_KIND_LABEL[value]}</MenuItem>
          ))}
        </TextField>
        <Button component="label" variant="outlined" disabled={busy}>
          {busy ? "Đang tải lên..." : "Thêm chứng từ"}
          <input hidden type="file" accept="application/pdf,image/png,image/jpeg,image/webp,image/gif" onChange={attach} />
        </Button>
      </Box>

      {message && <Alert severity="error">{message}</Alert>}
    </Box>
  );
}
