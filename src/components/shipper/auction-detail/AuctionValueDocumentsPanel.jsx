"use client";

import { useCallback, useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { Panel } from "@/components/ui";
import { getApiErrorMessage } from "@/services/errorMessage";
import { listAuctionValueDocuments, downloadAuctionValueDocument } from "@/services/biddingApi";
import { formatDateTime } from "@/lib/format";
import {
  CHECKLIST_NOTE,
  VALUE_DOCUMENT_KIND_LABEL,
} from "../create-auction/valueDocumentChecklist";
import { openBlobInNewTab } from "../../tracking/claimFiles";

/**
 * The owner's goods-value documents for one auction, with the carrier-coverage checklist. Only the shipper who created
 * the auction (or an admin) gets them; for anyone else the server refuses and this panel shows nothing. Files open
 * through an authenticated request and are never linked publicly.
 */
export default function AuctionValueDocumentsPanel({ auctionId, requireCarrierCoverage }) {
  const [state, setState] = useState({ loading: true, data: [], checklist: null, error: "", hidden: false });

  const load = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: "", hidden: false }));
    try {
      const response = await listAuctionValueDocuments(auctionId);
      setState({ loading: false, data: response?.data ?? [], checklist: response?.checklist ?? null, error: "", hidden: false });
    } catch (error) {
      const forbidden = error?.response?.status === 403;
      setState({
        loading: false,
        data: [],
        checklist: null,
        error: forbidden ? "" : getApiErrorMessage(error, "Chưa tải được chứng từ giá trị hàng."),
        hidden: forbidden,
      });
    }
  }, [auctionId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (state.hidden) return null;

  const open = async (document) => {
    try {
      openBlobInNewTab(await downloadAuctionValueDocument(document.fileLink));
    } catch (error) {
      setState((current) => ({ ...current, error: getApiErrorMessage(error, "Chưa mở được chứng từ. Vui lòng thử lại.") }));
    }
  };

  return (
    <Panel title="Chứng từ giá trị hàng (riêng tư)" subtitle="Chỉ chủ phiên và quản trị viên xem được.">
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {state.loading ? (
          <Typography variant="body2" color="text.secondary">Đang tải chứng từ...</Typography>
        ) : state.error ? (
          <Alert severity="error" action={<Button color="inherit" size="small" onClick={load}>Thử lại</Button>}>{state.error}</Alert>
        ) : state.data.length === 0 ? (
          <Typography variant="body2" color="text.secondary">Phiên này chưa có chứng từ giá trị hàng.</Typography>
        ) : (
          state.data.map((document) => (
            <Box key={document.documentId} sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              <Typography variant="body2">
                {VALUE_DOCUMENT_KIND_LABEL[document.kind] ?? document.kind} · {formatDateTime(document.uploadedAt)}
              </Typography>
              <Button size="small" onClick={() => open(document)}>Xem tệp</Button>
            </Box>
          ))
        )}

        {requireCarrierCoverage && state.checklist?.required && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 700 }}>
              {state.checklist.satisfied ? "Checklist chuẩn bị đã đủ" : "Checklist chuẩn bị còn thiếu"}
            </Typography>
            {!state.checklist.satisfied && state.checklist.missingItems.map((item) => (
              <Typography key={item} variant="caption" color="text.secondary">• {item}</Typography>
            ))}
            <Typography variant="caption" color="text.secondary">{CHECKLIST_NOTE}</Typography>
          </Box>
        )}
      </Box>
    </Panel>
  );
}
