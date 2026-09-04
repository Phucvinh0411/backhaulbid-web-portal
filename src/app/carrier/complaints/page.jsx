"use client";

import { useCallback, useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import Link from "next/link";

import PageHeader from "@/components/common/PageHeader";
import ComplaintStatusChip from "@/components/complaints/ComplaintStatusChip";
import { formatComplaintTime, normalizeComplaintCollection } from "@/components/complaints/complaintPresentation";
import { complaintApi } from "@/services/complaintApi";
import { contractApi } from "@/services/contractApi";
import { mediaApi } from "@/services/mediaApi";

export default function CarrierComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [trips, setTrips] = useState([]);
  const [tripId, setTripId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState("");
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const loadComplaints = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setComplaints(normalizeComplaintCollection(await complaintApi.list()));
    } catch (loadError) {
      setError(loadError?.response?.data?.message || "Không thể tải danh sách khiếu nại.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadComplaints(); }, [loadComplaints]);

  const handleOpenDialog = async () => {
    setOpenDialog(true);
    setFormError("");
    setTripId("");
    setTitle("");
    setDescription("");
    setEvidenceFile(null);
    try {
      setTrips(normalizeComplaintCollection(await contractApi.listTrips()));
    } catch {
      setFormError("Không thể tải danh sách chuyến để tạo khiếu nại.");
    }
  };

  const handleSubmit = async () => {
    if (!tripId) return setFormError("Vui lòng chọn chuyến vận chuyển.");
    if (!title.trim() || title.trim().length > 200) return setFormError("Tiêu đề bắt buộc và tối đa 200 ký tự.");
    if (!description.trim() || description.trim().length > 5000) return setFormError("Nội dung bắt buộc và tối đa 5000 ký tự.");
    setSubmitting(true);
    setFormError("");
    try {
      const evidenceUrl = evidenceFile ? await mediaApi.uploadFile(evidenceFile, "complaints") : null;
      await complaintApi.create({ tripId, title: title.trim(), description: description.trim(), evidenceUrl });
      setOpenDialog(false);
      setMessage("Đã gửi khiếu nại. Hệ thống sẽ xem xét và phản hồi.");
      await loadComplaints();
    } catch (submitError) {
      const apiMessage = submitError?.response?.data?.error || submitError?.response?.data?.message;
      setFormError(Array.isArray(apiMessage) ? apiMessage.join(", ") : apiMessage || "Không thể gửi khiếu nại.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box className="w-full min-h-screen">
      <PageHeader
        title="Khiếu nại & Phản ánh"
        subtitle="Gửi và theo dõi khiếu nại liên quan đến chuyến vận chuyển của bạn."
        breadcrumbs={[{ label: "Trang chủ", path: "/carrier/dashboard" }, { label: "Khiếu nại" }]}
        action={<Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenDialog} className="!rounded-xl !font-bold !capitalize">Gửi khiếu nại</Button>}
      />

      {error && <Alert severity="error" className="!mb-4 !rounded-2xl">{error}</Alert>}
      {message && <Alert severity="success" className="!mb-4 !rounded-2xl" onClose={() => setMessage("")}>{message}</Alert>}

      {loading ? <Box className="flex min-h-[40vh] items-center justify-center"><CircularProgress /></Box> : complaints.length === 0 ? <Alert severity="info" className="!rounded-2xl">Bạn chưa có khiếu nại nào.</Alert> : (
        <Box className="flex flex-col gap-3">
          {complaints.map((complaint) => (
            <Link key={complaint.id} href={`/carrier/complaints/${complaint.id}`} className="no-underline">
              <Box className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-[#1B4965]/40 hover:shadow-md">
                <Box className="flex flex-wrap items-center justify-between gap-3">
                  <Box>
                    <Typography className="!font-bold text-slate-800">{complaint.title}</Typography>
                    <Typography variant="caption" className="text-slate-500">Chuyến {String(complaint.tripId).slice(0, 8)} · Gửi lúc {formatComplaintTime(complaint.createdAt)} · {(complaint.messages || []).length} phản hồi</Typography>
                  </Box>
                  <ComplaintStatusChip status={complaint.status} />
                </Box>
                <Typography variant="body2" className="mt-2 text-slate-600" sx={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{complaint.description}</Typography>
              </Box>
            </Link>
          ))}
        </Box>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
        <DialogTitle className="!font-bold text-slate-800">Gửi khiếu nại mới</DialogTitle>
        <DialogContent className="flex flex-col gap-4 !pt-4">
          {formError && <Alert severity="error">{formError}</Alert>}
          <TextField select fullWidth size="small" label="Chuyến vận chuyển" value={tripId} onChange={(event) => setTripId(event.target.value)}>
            {trips.map((trip) => <MenuItem key={trip.id} value={trip.id}>{String(trip.id).slice(0, 8)} · {trip.pickupLocation || "?"} → {trip.deliveryLocation || "?"}</MenuItem>)}
          </TextField>
          <TextField fullWidth size="small" label="Tiêu đề" value={title} onChange={(event) => setTitle(event.target.value)} inputProps={{ maxLength: 200 }} />
          <TextField fullWidth multiline minRows={4} label="Nội dung khiếu nại" value={description} onChange={(event) => setDescription(event.target.value)} inputProps={{ maxLength: 5000 }} />
          <Box>
            <Typography variant="body2" className="mb-2 font-semibold">Tệp bằng chứng (tuỳ chọn)</Typography>
            <input type="file" accept="image/*,.pdf" onChange={(event) => setEvidenceFile(event.target.files?.[0] || null)} className="w-full text-sm text-slate-500 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100" />
          </Box>
        </DialogContent>
        <DialogActions className="!px-6 !pb-5"><Button onClick={() => setOpenDialog(false)} color="inherit">Hủy</Button><Button onClick={handleSubmit} variant="contained" disabled={submitting} className="!rounded-xl !font-bold !capitalize">{submitting ? "Đang gửi..." : "Gửi khiếu nại"}</Button></DialogActions>
      </Dialog>
    </Box>
  );
}
