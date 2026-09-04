"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import Link from "next/link";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import {
  AdminPageHeader,
  AdminPageShell,
  AdminPrimaryButton,
  AdminSearchField,
  AdminSecondaryButton,
  AdminSectionCard,
} from "@/components/admin/AdminUI";
import ComplaintConversation from "@/components/complaints/ComplaintConversation";
import ComplaintStatusChip from "@/components/complaints/ComplaintStatusChip";
import useComplaintRealtime from "@/hooks/useComplaintRealtime";
import {
  COMPLAINT_DECISION_LABELS,
  formatComplaintTime,
  getComplaintStatusMeta,
  isComplaintClosed,
  normalizeComplaintCollection,
} from "@/components/complaints/complaintPresentation";
import { complaintApi } from "@/services/complaintApi";

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [decision, setDecision] = useState("SHIPPER_WIN");
  const [resolution, setResolution] = useState("");
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  const loadComplaints = async () => {
    setLoading(true);
    setError("");
    try {
      const result = normalizeComplaintCollection(await complaintApi.list());
      setComplaints(result);
      setSelectedId((current) => current || result[0]?.id || "");
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
      return undefined;
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
      .catch((requestError) => {
        if (active) setError(requestError?.response?.data?.message || "Không thể tải chi tiết khiếu nại.");
      })
      .finally(() => { if (active) setDetailLoading(false); });
    return () => { active = false; };
  }, [selectedId]);

  const handleRealtimeUpdate = useCallback((nextComplaint) => {
    setSelectedComplaint(nextComplaint);
    setComplaints((current) => current.map((item) => item.id === nextComplaint.id ? nextComplaint : item));
  }, []);
  const realtime = useComplaintRealtime(selectedComplaint?.id, handleRealtimeUpdate);

  const filteredComplaints = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase("vi");
    return complaints.filter((complaint) => !query || `${complaint.id} ${complaint.title} ${complaint.description}`.toLocaleLowerCase("vi").includes(query));
  }, [complaints, searchQuery]);

  const sendMessage = async (content) => {
    if (!selectedComplaint || !content.trim() || isComplaintClosed(selectedComplaint.status)) return;
    setActionLoading(true);
    setError("");
    try {
      const result = await complaintApi.addMessage(selectedComplaint.id, content.trim());
      setSelectedComplaint(result);
      setComplaints((current) => current.map((item) => item.id === result.id ? result : item));
    } catch (requestError) {
      setError(requestError?.response?.data?.message || "Không thể gửi trao đổi.");
      throw requestError;
    } finally {
      setActionLoading(false);
    }
  };

  const resolveComplaint = async () => {
    if (!selectedComplaint || !resolution.trim() || isComplaintClosed(selectedComplaint.status)) return;
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

  if (loading) {
    return <AdminPageShell><Box className="flex min-h-[320px] items-center justify-center gap-2 text-slate-500"><CircularProgress size={24} /> Đang tải khiếu nại...</Box></AdminPageShell>;
  }

  const selectedClosed = isComplaintClosed(selectedComplaint?.status);
  const selectedStatus = selectedComplaint ? getComplaintStatusMeta(selectedComplaint.status) : null;

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Giải quyết khiếu nại"
        subtitle="Theo dõi hồ sơ, trao đổi với các bên và lưu quyết định trực tiếp trong contract service."
        breadcrumbs={[{ label: "Admin", path: "/admin" }, { label: "Vận hành", path: "/admin/complaints" }, { label: "Khiếu nại" }]}
      />
      {error && <Alert severity="error">{error}</Alert>}
      <Grid container spacing={2.5}>
        <Grid item xs={12} md={4}>
          <AdminSectionCard title="Danh sách khiếu nại" subtitle={`${filteredComplaints.length} hồ sơ`} sx={{ height: "100%" }}>
            <Box sx={{ p: 2, borderBottom: "1px solid", borderColor: "divider" }}>
              <AdminSearchField value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Tìm mã, tiêu đề..." />
            </Box>
            <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
              {filteredComplaints.length === 0 ? (
                <Typography className="p-5 text-center text-slate-500">Chưa có khiếu nại phù hợp.</Typography>
              ) : filteredComplaints.map((item) => (
                <Box
                  key={item.id}
                  component="button"
                  type="button"
                  aria-pressed={selectedId === item.id}
                  onClick={() => setSelectedId(item.id)}
                  sx={{ width: "100%", textAlign: "left", border: "1px solid", borderColor: selectedId === item.id ? "primary.main" : "divider", bgcolor: selectedId === item.id ? "rgba(27, 73, 101, 0.08)" : "background.paper", borderRadius: 2, p: 2, cursor: "pointer" }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, mb: 0.5 }}>
                    <Typography variant="body2" sx={{ color: "primary.main", fontWeight: 700 }}>#{String(item.id).slice(0, 12)}</Typography>
                    <Typography variant="caption" sx={{ color: "text.disabled", fontWeight: 600 }}>{formatComplaintTime(item.createdAt)}</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 700, mb: 1.25 }}>{item.title}</Typography>
                  <ComplaintStatusChip status={item.status} />
                </Box>
              ))}
            </Box>
          </AdminSectionCard>
        </Grid>

        <Grid item xs={12} md={8}>
          <AdminSectionCard
            title={selectedComplaint ? <>Chi tiết khiếu nại <Box component="span" sx={{ color: "primary.main" }}>#{String(selectedComplaint.id).slice(0, 12)}</Box></> : "Chi tiết khiếu nại"}
            subtitle={selectedComplaint ? `Mở lúc ${formatComplaintTime(selectedComplaint.createdAt)}` : "Chọn một hồ sơ để xem chi tiết."}
            sx={{ minHeight: 640, height: "100%", display: "flex", flexDirection: "column" }}
          >
            {detailLoading ? <Box className="flex min-h-[420px] items-center justify-center"><CircularProgress /></Box> : !selectedComplaint ? <Box className="p-10 text-center text-slate-500">Chưa có hồ sơ để hiển thị.</Box> : (
              <>
                <Box sx={{ p: { xs: 2, sm: 2.5 }, display: "flex", flexDirection: "column", gap: 2.5 }}>
                  <Box sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2, bgcolor: "rgba(27, 73, 101, 0.02)" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>Chuyến: {selectedComplaint.tripId || "Không gắn chuyến"}</Typography>
                      <ComplaintStatusChip status={selectedComplaint.status} />
                    </Box>
                    <Typography variant="h6" sx={{ mt: 2, fontWeight: 800 }}>{selectedComplaint.title}</Typography>
                    <Typography variant="body2" sx={{ mt: 1, color: "text.secondary", whiteSpace: "pre-wrap" }}>{selectedComplaint.description}</Typography>
                    <Typography variant="caption" sx={{ mt: 2, display: "block", color: "text.secondary" }}>Người báo: {selectedComplaint.reporterId} · Bên liên quan: {selectedComplaint.respondentId}</Typography>
                  </Box>

                  <ComplaintConversation
                    messages={selectedComplaint.messages}
                    viewerRole="ADMIN"
                    onSend={sendMessage}
                    sending={actionLoading}
                    disabled={selectedClosed}
                    realtimeStatus={realtime.status}
                  />

                  <Box sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Tệp bằng chứng</Typography>
                    {selectedComplaint.evidenceUrl ? <Button component={Link} href={selectedComplaint.evidenceUrl} target="_blank" rel="noreferrer" variant="outlined" size="small">Mở tệp bằng chứng</Button> : <Typography variant="body2" className="text-slate-500">Hồ sơ chưa đính kèm tệp.</Typography>}
                  </Box>
                </Box>

                <Box sx={{ mt: "auto", p: { xs: 2, sm: 2.5 }, borderTop: "1px solid", borderColor: "divider", bgcolor: "rgba(27, 73, 101, 0.02)" }}>
                  <Typography variant="subtitle2" sx={{ color: "text.primary", fontWeight: 700, mb: 1 }}>Kết luận & xử lý</Typography>
                  {selectedClosed && selectedComplaint.resolution && <Typography variant="body2" sx={{ color: "text.secondary", mb: 1.5 }}>{selectedStatus?.label}: {selectedComplaint.resolution}</Typography>}
                  <Box sx={{ display: "flex", flexDirection: { xs: "column", lg: "row" }, gap: 1.5 }}>
                    <TextField value={resolution} onChange={(event) => setResolution(event.target.value)} placeholder="Nhập tóm tắt kết luận và căn cứ..." size="small" fullWidth disabled={selectedClosed} />
                    <FormControl size="small" sx={{ minWidth: { xs: "100%", lg: 220 } }}>
                      <Select value={decision} onChange={(event) => setDecision(event.target.value)} disabled={selectedClosed} aria-label="Kết quả khiếu nại">
                        {Object.entries(COMPLAINT_DECISION_LABELS).map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
                      </Select>
                    </FormControl>
                    <AdminPrimaryButton disabled={actionLoading || selectedClosed || !resolution.trim()} onClick={() => setOpenConfirmDialog(true)}>Chốt phương án</AdminPrimaryButton>
                  </Box>
                </Box>
              </>
            )}
          </AdminSectionCard>
        </Grid>
      </Grid>

      <Dialog open={openConfirmDialog} onClose={() => setOpenConfirmDialog(false)}>
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}><ErrorOutlineIcon color="warning" /> Xác nhận chốt khiếu nại</DialogTitle>
        <DialogContent><Typography variant="body2">Quyết định “{COMPLAINT_DECISION_LABELS[decision]}” sẽ được lưu và chuyển hồ sơ sang Đã giải quyết.</Typography></DialogContent>
        <DialogActions><AdminSecondaryButton onClick={() => setOpenConfirmDialog(false)}>Xem lại</AdminSecondaryButton><AdminPrimaryButton disabled={actionLoading} onClick={resolveComplaint}>{actionLoading ? "Đang lưu..." : "Xác nhận"}</AdminPrimaryButton></DialogActions>
      </Dialog>
    </AdminPageShell>
  );
}
