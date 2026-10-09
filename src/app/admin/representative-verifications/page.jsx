"use client";

import { useEffect, useState } from "react";
import { Alert, Box, Button, Checkbox, Dialog, DialogContent, DialogTitle, FormControlLabel, MenuItem, TextField, Typography } from "@mui/material";
import { apiService } from "@/services/apiService";
import { VerificationDetails } from "@/components/eKYC/VerificationOverview";
import { nfcResultPresentation } from "@/services/nfcResultPresentation";
import PageHeader from "@/components/common/PageHeader";

const PATH = "/api/v1/admin/representative-verifications";
const STATUS = { PENDING: "Cần xử lý", VERIFIED: "Đã chấp nhận", REJECTED: "Đã từ chối", SUPERSEDED: "Đã có hồ sơ mới" };

export default function RepresentativeVerificationsPage() {
  const [status, setStatus] = useState("PENDING"), [page, setPage] = useState(0);
  const [queue, setQueue] = useState(null), [report, setReport] = useState(null);
  const [reason, setReason] = useState(""), [name, setName] = useState("");
  const [documentCompared, setDocumentCompared] = useState(false), [faceCompared, setFaceCompared] = useState(false);
  const [error, setError] = useState(""), [busy, setBusy] = useState(false), [generation, setGeneration] = useState(0);
  useEffect(() => {
    let live = true;
    setQueue(null); setError("");
    apiService.get(PATH, { status, page, pageSize: 20 }, { skipGlobalNotification: true })
      .then(data => { if (live) setQueue(data); })
      .catch(() => { if (live) setError("Không tải được danh sách hồ sơ. Kiểm tra quyền truy cập và kết nối."); });
    return () => { live = false; };
  }, [status, page, generation]);
  async function open(id) {
    setBusy(true); setError(""); setDocumentCompared(false); setFaceCompared(false); setReason("");
    try { const data = await apiService.get(`${PATH}/${id}`); setReport(data); setName(data.identity.fullName); }
    catch { setError("Không mở được hồ sơ."); } finally { setBusy(false); }
  }
  async function decide(decision) {
    setBusy(true); setError("");
    try {
      const updated = await apiService.patch(`${PATH}/${report.id}`, { version: report.version, decision, reason: reason.trim(), documentCompared, faceCompared, fullName: name.trim() });
      setReport(updated); setGeneration(v => v + 1);
    } catch (e) {
      setError(e?.response?.status === 409 ? "Hồ sơ đã thay đổi hoặc ảnh không còn đủ điều kiện duyệt. Đóng và mở lại hồ sơ." : "Chưa lưu được quyết định. Kiểm tra lý do và kết nối.");
    } finally { setBusy(false); }
  }
  const result = report && nfcResultPresentation(report);
  return <Box sx={{ display: "grid", gap: 2 }}>
    <PageHeader title="Hồ sơ người đại diện" subtitle="Xem kết quả NFC và xử lý hồ sơ cần đánh giá thêm." />
    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
      <TextField select label="Trạng thái hồ sơ" value={status} onChange={e => { setStatus(e.target.value); setPage(0); }} sx={{ minWidth: 220 }}>
        {Object.entries(STATUS).map(([value,label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
      </TextField><Button onClick={() => setGeneration(v => v + 1)}>Cập nhật</Button>
    </Box>
    {error && !report && <Alert severity="error">{error}</Alert>}
    {!queue && !error && <Typography role="status">Đang tải hồ sơ…</Typography>}
    {queue?.content?.length === 0 && <Typography>Chưa có hồ sơ trong trạng thái này.</Typography>}
    {queue?.content?.map(row => <Box key={row.id} sx={{ bgcolor: "background.paper", border: "1px solid", borderColor: "divider", borderRadius: 2, p: 2, display: "flex", flexWrap: "wrap", gap: 2, alignItems: "center" }}>
      <Box sx={{ flex: 1, minWidth: 200, overflowWrap: "anywhere" }}>
        <Typography fontWeight={600}>Tài khoản {row.accountId}</Typography>
        <Typography variant="body2" color="text.secondary">{new Date(row.submittedAt).toLocaleString("vi-VN")} · {row.evidenceAvailable ? "Có ảnh bằng chứng" : "Ảnh đã hết hạn"}</Typography>
      </Box><Button onClick={() => open(row.id)} disabled={busy}>Xem hồ sơ</Button>
    </Box>)}
    {queue && <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}><Button disabled={page === 0} onClick={() => setPage(v => v - 1)}>Trang trước</Button><Typography>Trang {page + 1}</Typography><Button disabled={page + 1 >= queue.totalPages} onClick={() => setPage(v => v + 1)}>Trang sau</Button></Box>}
    <Dialog open={Boolean(report)} onClose={() => { if (!busy) { setReport(null); setError(""); } }} maxWidth="md" fullWidth>
      <DialogTitle>Hồ sơ người đại diện</DialogTitle>
      <DialogContent sx={{ display: "grid", gap: 2 }}>
        {report && <>
          <Alert severity={report.status === "REJECTED" ? "error" : report.status === "VERIFIED" ? "success" : "info"}>{result.title} · {result.message}</Alert>
          <VerificationDetails key={report.id} report={report} admin reveal />
          {error && <Alert severity="error">{error}</Alert>}
          {report.status === "PENDING" && <>
            <Alert severity="info">Duyệt thủ công ghi nhận phương thức riêng. Quyết định này không biến kiểm tra nguồn cấp hoặc người thật chưa sẵn sàng thành kết quả đạt.</Alert>
            <TextField label="Họ tên người đại diện theo giấy tờ" value={name} onChange={e => setName(e.target.value)} inputProps={{ maxLength: 255 }} />
            <FormControlLabel control={<Checkbox checked={documentCompared} onChange={e => setDocumentCompared(e.target.checked)} />} label="Đã đối chiếu ảnh giấy tờ với thông tin trong chip" />
            <FormControlLabel control={<Checkbox checked={faceCompared} onChange={e => setFaceCompared(e.target.checked)} />} label="Đã đối chiếu ảnh khuôn mặt và ảnh giấy tờ" />
            <TextField multiline minRows={2} label="Lý do quyết định" value={reason} onChange={e => setReason(e.target.value)} inputProps={{ maxLength: 500 }} />
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
              <Button variant="contained" disabled={busy || !reason.trim() || !name.trim() || !documentCompared || !faceCompared || !report.evidenceAvailable} onClick={() => decide("APPROVE")}>Chấp nhận hồ sơ</Button>
              <Button color="error" disabled={busy || !reason.trim()} onClick={() => decide("REJECT")}>Từ chối, yêu cầu làm lại</Button>
            </Box>
          </>}
          <Button disabled={busy} onClick={() => { setReport(null); setError(""); }}>Đóng hồ sơ</Button>
        </>}
      </DialogContent>
    </Dialog>
  </Box>;
}
