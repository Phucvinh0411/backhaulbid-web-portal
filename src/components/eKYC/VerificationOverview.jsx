"use client";

import { useEffect, useState } from "react";
import { Alert, Box, Button, Typography } from "@mui/material";
import { apiService } from "@/services/apiService";
import { nfcResultPresentation, NFC_CHECK_LABELS, NFC_CHECK_STATUS, ownerHasMaskedField, ownerIdentityRows, ownerStatusPresentation } from "@/services/nfcResultPresentation";

/** Loads a private evidence image with the caller's authenticated API session. */
export function EvidenceImage({ path, title }) {
  const [url, setUrl] = useState(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    let live = true, objectUrl;
    setUrl(null); setError(false);
    apiService.get(path, undefined, { responseType: "blob", skipGlobalNotification: true })
      .then(blob => { if (live) { objectUrl = URL.createObjectURL(blob); setUrl(objectUrl); } })
      .catch(() => { if (live) setError(true); });
    return () => { live = false; if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [path]);
  return <Box><Typography variant="body2">{title}</Typography>
    {error ? <Typography color="text.secondary">Ảnh không còn sẵn sàng hoặc đã hết hạn.</Typography> : url ?
      /* Private authenticated blob; never place bearer credentials in an image URL. */
      /* eslint-disable-next-line @next/next/no-img-element */
      <img src={url} alt={title} style={{ width: "100%", maxHeight: 260, objectFit: "contain" }} /> : <Typography>Đang tải ảnh…</Typography>}
  </Box>;
}

/** Admin review report: checks, method and evidence. Owners see `OwnerIdentitySummary` instead. */
export function VerificationDetails({ report, admin = false, reveal = false }) {
  const identity = report.identity;
  const values = [
    ["Họ tên", identity.fullName],
    ["Số giấy tờ (DG1/MRZ)", reveal ? identity.documentNumber : `•••••${identity.documentNumber.slice(-4)}`],
    ["Ngày sinh", reveal ? identity.dateOfBirth : "••/••/••••"],
    ["Giới tính", identity.sex], ["Quốc tịch", identity.nationality], ["Hạn dùng", identity.dateOfExpiry],
  ];
  const base = admin ? `/api/v1/admin/representative-verifications/${report.id}/evidence` : `/api/v1/representative-verifications/me/evidence/${report.id}`;
  return <Box sx={{ display: "grid", gap: 2 }}>
    <Box component="dl" sx={{ m: 0 }}>{values.map(([label, value]) => <Box key={label} sx={{ display: "flex", flexWrap: "wrap", gap: 1, py: .5 }}>
      <Typography component="dt" sx={{ minWidth: 180, color: "text.secondary" }}>{label}</Typography><Typography component="dd" sx={{ m: 0, overflowWrap: "anywhere" }}>{value || "—"}</Typography>
    </Box>)}</Box>
    <Typography variant="body2" color="text.secondary">Thông tin đọc từ DG1. Số giấy tờ trong MRZ không mặc định là toàn bộ số định danh cá nhân.</Typography>
    <Typography variant="subtitle2">Kết quả trên thiết bị</Typography>
    {Object.entries(report.sdkChecks || {}).map(([key, status]) => <Typography key={key} variant="body2">{NFC_CHECK_LABELS[key] || key}: {NFC_CHECK_STATUS[status] || status}</Typography>)}
    <Typography variant="subtitle2">Kiểm chứng phía máy chủ</Typography>
    {Object.entries(report.checks || {}).map(([key, check]) => <Box key={key}>
      <Typography variant="body2">{NFC_CHECK_LABELS[key] || key}: {NFC_CHECK_STATUS[check.status] || check.status}</Typography>
      <Typography variant="caption" color="text.secondary">{check.source} · {check.reasonCode}</Typography>
    </Box>)}
    <Typography variant="body2">Phương thức: {report.verificationMethod === "MANUAL_DOCUMENT_REVIEW" ? "Duyệt hồ sơ bởi quản trị viên" : report.verificationMethod === "LOCAL_NFC_DEVELOPMENT" ? "Kiểm tra NFC theo chính sách phát triển" : "Kết quả tự động và báo cáo kiểm chứng"}</Typography>
    {report.reviewReason && <Typography variant="body2">Lý do xử lý: {report.reviewReason}</Typography>}
    {report.evidenceAvailable ? <>
      <Typography variant="body2" color="text.secondary">Ảnh bằng chứng tự hết hạn. Chỉ người có quyền được xem.</Typography>
      {[['front','Mặt trước giấy tờ'],['back','Mặt sau giấy tờ'],['selfie','Ảnh khuôn mặt']].map(([part,title]) => <EvidenceImage key={part} title={title} path={`${base}/${part}`} />)}
    </> : <Typography color="text.secondary">Ảnh đã hết thời hạn lưu. Thông tin tổng quan vẫn được giữ.</Typography>}
  </Box>;
}

/** The owner's result: status and five identity rows, nothing technical. */
export function OwnerIdentitySummary({ summary }) {
  return <Box component="dl" sx={{ m: 0, display: "grid", gap: 0.5 }}>
    {ownerIdentityRows(summary).map(([label, value]) => <Box key={label} sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "160px minmax(0,1fr)" }, gap: { xs: 0, sm: 2 }, py: 0.75, borderBottom: "1px solid", borderColor: "divider" }}>
      <Typography component="dt" variant="body2" sx={{ color: "text.secondary" }}>{label}</Typography>
      <Typography component="dd" sx={{ m: 0, fontWeight: value === "Chưa có thông tin" ? 400 : 600, color: value === "Chưa có thông tin" ? "text.secondary" : "text.primary", overflowWrap: "anywhere" }} className="tabular">{value}</Typography>
    </Box>)}
  </Box>;
}

/** Shows the current NFC result summary and refresh/retry actions for its owner. */
export default function VerificationOverview({ refreshKey = 0, fallback, onRetry, verificationMethod }) {
  const [summary, setSummary] = useState(null);
  const [reveal, setReveal] = useState(false);
  const [error, setError] = useState("");
  const [generation, setGeneration] = useState(0);
  useEffect(() => {
    let live = true;
    setError("");
    apiService.get("/api/v1/representative-verifications/me/overview", { reveal }, { skipGlobalNotification: true })
      .then(value => { if (live) setSummary(value); })
      .catch(e => { if (live && e?.response?.status !== 404) setError("Chưa tải được hồ sơ. Kiểm tra kết nối rồi cập nhật lại."); });
    return () => { live = false; };
  }, [refreshKey, reveal, generation]);
  if (!summary && !fallback && !error) return null;
  // Before the server summary exists, the capture result only says what was just read, not "verified".
  const status = summary ? ownerStatusPresentation(summary, verificationMethod) : { ...nfcResultPresentation(fallback), action: "refresh" };
  return <Box sx={{ display: "grid", gap: 2, my: 2 }}>
    <Alert severity={{ success: "success", warning: "warning", danger: "error", neutral: "info" }[status.tone]}>
      <Typography fontWeight={700}>{status.title}</Typography>{status.message}
    </Alert>
    {error && <Alert severity="error">{error}</Alert>}
    {summary?.status === "VERIFIED" && <OwnerIdentitySummary summary={summary} />}
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
      {summary?.status === "VERIFIED" && ownerHasMaskedField(summary) && <Button variant="outlined" onClick={() => setReveal(true)}>Hiện ngày sinh</Button>}
      {summary?.status === "VERIFIED" && reveal && <Button variant="outlined" onClick={() => setReveal(false)}>Ẩn ngày sinh</Button>}
      {status.action === "refresh" && <Button variant="outlined" onClick={() => setGeneration(v => v + 1)}>Cập nhật kết quả</Button>}
      {status.action === "retry" && onRetry && <Button variant="contained" onClick={onRetry}>Thực hiện lại</Button>}
    </Box>
  </Box>;
}
