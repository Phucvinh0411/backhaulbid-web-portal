"use client";

import { useEffect, useMemo, useState } from "react";
import Avatar from "@mui/material/Avatar";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import SendIcon from "@mui/icons-material/Send";
import {
  AdminPageHeader,
  AdminPageShell,
  AdminPrimaryButton,
  AdminSearchField,
  AdminSecondaryButton,
  AdminSectionCard,
  AdminStatusChip,
} from "@/components/admin/AdminUI";
import { complaintApi } from "@/services/complaintApi";

const decisionLabels = {
  SHIPPER_WIN: "Shipper nhận bồi thường",
  CARRIER_WIN: "Bác bỏ khiếu nại",
  BOTH: "Phạt cả hai bên",
};

const statusLabel = { PENDING: "Chờ xử lý", PROCESSING: "Đang xử lý", RESOLVED: "Đã giải quyết", REJECTED: "Đã từ chối" };
const statusTone = { PENDING: "warning", PROCESSING: "info", RESOLVED: "success", REJECTED: "danger" };
const formatDate = (value) => value ? new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "Chưa cập nhật";

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [decision, setDecision] = useState("SHIPPER_WIN");
  const [resolution, setResolution] = useState("");
  const [message, setMessage] = useState("");
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const loadComplaints = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await complaintApi.list();
      setComplaints(result || []);
      setSelectedId((current) => current || result?.[0]?.id || "");
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Không thể tải danh sách khiếu nại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadComplaints(); }, []);

  useEffect(() => {
    if (!selectedId) {
      setSelectedComplaint(null);
      return;
    }
    let active = true;
    setDetailLoading(true);
    complaintApi.get(selectedId)
      .then((result) => {
        if (!active) return;
        setSelectedComplaint(result);
        setDecision(result.decision || "SHIPPER_WIN");
        setResolution(result.resolution || "");
      })
      .catch((requestError) => { if (active) setError(requestError?.response?.data?.message || "Không thể tải chi tiết khiếu nại."); })
      .finally(() => { if (active) setDetailLoading(false); });
    return () => { active = false; };
  }, [selectedId]);

  const filteredComplaints = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase("vi");
    return complaints.filter((complaint) => !query || `${complaint.id} ${complaint.title} ${complaint.description}`.toLocaleLowerCase("vi").includes(query));
  }, [complaints, searchQuery]);

  const sendMessage = async () => {
    if (!selectedComplaint || !message.trim()) return;
    setActionLoading(true);
    setError("");
    try {
      const result = await complaintApi.addMessage(selectedComplaint.id, message.trim());
      setSelectedComplaint(result);
      setComplaints((current) => current.map((item) => item.id === result.id ? result : item));
      setMessage("");
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Không thể gửi trao đổi.");
    } finally {
      setActionLoading(false);
    }
  };

  const resolveComplaint = async () => {
    if (!selectedComplaint || !resolution.trim()) return;
    setActionLoading(true);
    setError("");
    try {
      const result = await complaintApi.resolve(selectedComplaint.id, { decision, resolution: resolution.trim() });
      setSelectedComplaint(result);
      setComplaints((current) => current.map((item) => item.id === result.id ? result : item));
      setOpenConfirmDialog(false);
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Không thể chốt quyết định khiếu nại.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <AdminPageShell><Box className="flex min-h-[320px] items-center justify-center gap-2 text-slate-500"><CircularProgress size={24} /> Đang tải khiếu nại...</Box></AdminPageShell>;

  return (
    <AdminPageShell>
      <AdminPageHeader title="Giải quyết khiếu nại" subtitle="Xử lý tranh chấp bằng hồ sơ, trao đổi và quyết định lưu trực tiếp trong contract service." breadcrumbs={[{ label: "Admin", path: "/admin" }, { label: "Vận hành", path: "/admin/complaints" }, { label: "Khiếu nại" }]} />
      {error && <Alert severity="error">{error}</Alert>}
      <Grid container spacing={2.5}>
        <Grid item xs={12} md={4}>
          <AdminSectionCard title="Danh sách khiếu nại" subtitle={`${filteredComplaints.length} hồ sơ`} sx={{ height: "100%" }}>
            <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}><AdminSearchField value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Tìm mã, tiêu đề..." /></Box>
            <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
              {filteredComplaints.length === 0 ? <Typography className="p-5 text-center text-slate-500">Chưa có khiếu nại trong dữ liệu thật.</Typography> : filteredComplaints.map((item) => <Box key={item.id} component="button" type="button" onClick={() => setSelectedId(item.id)} sx={{ width: "100%", textAlign: "left", border: "1px solid", borderColor: selectedId === item.id ? "primary.main" : "divider", bgcolor: selectedId === item.id ? "rgba(27, 73, 101, 0.08)" : "background.paper", borderRadius: "10px", p: 2, cursor: "pointer" }}><Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, mb: 0.5 }}><Typography variant="body2" sx={{ color: "primary.main", fontWeight: 700 }}>#{String(item.id).slice(0, 12)}</Typography><Typography variant="caption" sx={{ color: "text.disabled", fontWeight: 600 }}>{formatDate(item.createdAt)}</Typography></Box><Typography variant="body2" sx={{ color: "text.primary", fontWeight: 700, mb: 1.25 }}>{item.title}</Typography><AdminStatusChip label={statusLabel[item.status] || item.status} tone={statusTone[item.status] || "neutral"} /></Box>)}
            </Box>
          </AdminSectionCard>
        </Grid>

        <Grid item xs={12} md={8}>
          <AdminSectionCard title={selectedComplaint ? <Box component="span">Chi tiết khiếu nại <Box component="span" sx={{ color: "primary.main" }}>#{String(selectedComplaint.id).slice(0, 12)}</Box></Box> : "Chi tiết khiếu nại"} subtitle={selectedComplaint ? `Mở lúc ${formatDate(selectedComplaint.createdAt)}` : "Chọn một hồ sơ để xem chi tiết."} sx={{ minHeight: 640, height: "100%", display: "flex", flexDirection: "column" }}>
            {detailLoading ? <Box className="flex min-h-[420px] items-center justify-center"><CircularProgress /></Box> : !selectedComplaint ? <Box className="p-10 text-center text-slate-500">Chưa có hồ sơ để hiển thị.</Box> : <>
              <Box sx={{ p: 2.5, flex: 1, overflowY: "auto" }}>
                <Box sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: "10px", bgcolor: "rgba(27, 73, 101, 0.02)" }}><Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}><Typography variant="body2" sx={{ fontWeight: 700 }}>Chuyến: {selectedComplaint.tripId || "Không gắn chuyến"}</Typography><AdminStatusChip label={statusLabel[selectedComplaint.status] || selectedComplaint.status} tone={statusTone[selectedComplaint.status] || "neutral"} /></Box><Typography variant="h6" sx={{ mt: 2, fontWeight: 800 }}>{selectedComplaint.title}</Typography><Typography variant="body2" sx={{ mt: 1, color: "text.secondary", whiteSpace: "pre-wrap" }}>{selectedComplaint.description}</Typography><Typography variant="caption" sx={{ mt: 2, display: "block", color: "text.secondary" }}>Người báo: {selectedComplaint.reporterId} · Bên liên quan: {selectedComplaint.respondentId}</Typography></Box>
                <Box sx={{ mt: 3 }}><Typography sx={{ color: "text.primary", fontWeight: 700, display: "flex", alignItems: "center", gap: 1, mb: 2 }}><ChatBubbleOutlineIcon fontSize="small" /> Nhật ký trao đổi</Typography><Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>{(selectedComplaint.messages || []).length === 0 ? <Typography variant="body2" className="text-slate-500">Chưa có trao đổi.</Typography> : selectedComplaint.messages.map((item) => <Box key={item.id} sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}><Avatar sx={{ bgcolor: item.senderRole === "ADMIN" ? "primary.main" : "info.main", width: 34, height: 34, fontWeight: 700 }}>{item.senderRole?.[0] || "U"}</Avatar><Box sx={{ maxWidth: "85%" }}><Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 700 }}>{item.senderRole} · {formatDate(item.createdAt)}</Typography><Box sx={{ mt: 0.5, p: 1.5, borderRadius: "10px", bgcolor: item.senderRole === "ADMIN" ? "primary.main" : "background.paper", color: item.senderRole === "ADMIN" ? "primary.contrastText" : "text.primary", border: "1px solid", borderColor: item.senderRole === "ADMIN" ? "primary.main" : "divider" }}><Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>{item.message}</Typography></Box></Box></Box>)}</Box></Box>
                <Box sx={{ mt: 3 }}><Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Gửi trao đổi</Typography><Box sx={{ display: "flex", gap: 1 }}><TextField value={message} onChange={(event) => setMessage(event.target.value)} fullWidth size="small" placeholder="Nhập nội dung trao đổi..." multiline maxRows={3} /><Button onClick={sendMessage} disabled={actionLoading || !message.trim()} variant="outlined" startIcon={<SendIcon />} sx={{ minWidth: 130 }}>Gửi</Button></Box></Box>
                <Box sx={{ mt: 3, p: 2, border: "1px dashed", borderColor: "divider", borderRadius: "10px" }}><Typography variant="body2" className="text-slate-500">Tệp bằng chứng: chưa có API upload/evidence trong contract service, nên giao diện không dựng tệp giả.</Typography></Box>
              </Box>
              <Box sx={{ p: 2, borderTop: "1px solid", borderColor: "divider", bgcolor: "rgba(27, 73, 101, 0.02)" }}><Typography variant="subtitle2" sx={{ color: "text.primary", fontWeight: 700, mb: 1 }}>Kết luận & xử lý</Typography><Box sx={{ display: "flex", flexDirection: { xs: "column", lg: "row" }, gap: 1.5 }}><TextField value={resolution} onChange={(event) => setResolution(event.target.value)} placeholder="Nhập tóm tắt kết luận và căn cứ..." size="small" fullWidth disabled={selectedComplaint.status === "RESOLVED"} /><FormControl size="small" sx={{ minWidth: 220 }}><Select value={decision} onChange={(event) => setDecision(event.target.value)} disabled={selectedComplaint.status === "RESOLVED"}><MenuItem value="SHIPPER_WIN">{decisionLabels.SHIPPER_WIN}</MenuItem><MenuItem value="CARRIER_WIN">{decisionLabels.CARRIER_WIN}</MenuItem><MenuItem value="BOTH">{decisionLabels.BOTH}</MenuItem></Select></FormControl><AdminPrimaryButton disabled={actionLoading || selectedComplaint.status === "RESOLVED" || !resolution.trim()} onClick={() => setOpenConfirmDialog(true)}>Chốt phương án</AdminPrimaryButton></Box></Box>
            </>}
          </AdminSectionCard>
        </Grid>
      </Grid>

      <Dialog open={openConfirmDialog} onClose={() => setOpenConfirmDialog(false)}><DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}><ErrorOutlineIcon color="warning" /> Xác nhận chốt khiếu nại</DialogTitle><DialogContent><Typography variant="body2" className="text-slate-600">Quyết định “{decisionLabels[decision]}” sẽ được lưu và chuyển hồ sơ sang Đã giải quyết.</Typography></DialogContent><DialogActions><AdminSecondaryButton onClick={() => setOpenConfirmDialog(false)}>Xem lại</AdminSecondaryButton><AdminPrimaryButton disabled={actionLoading} onClick={resolveComplaint}>{actionLoading ? "Đang lưu..." : "Xác nhận"}</AdminPrimaryButton></DialogActions></Dialog>
    </AdminPageShell>
  );
}
