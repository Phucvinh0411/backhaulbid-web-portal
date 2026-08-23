"use client";

import { useCallback, useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { use } from "react";

import PageHeader from "@/components/common/PageHeader";
import ComplaintConversation from "@/components/complaints/ComplaintConversation";
import ComplaintStatusChip from "@/components/complaints/ComplaintStatusChip";
import useComplaintRealtime from "@/hooks/useComplaintRealtime";
import { formatComplaintTime, getComplaintDecisionLabel, isComplaintClosed } from "@/components/complaints/complaintPresentation";
import { complaintApi } from "@/services/complaintApi";

export default function CarrierComplaintDetailPage({ params }) {
  const { id } = use(params);
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sendError, setSendError] = useState("");
  const [sending, setSending] = useState(false);

  const loadComplaint = useCallback(async () => {
    setError("");
    try {
      setComplaint(await complaintApi.get(id));
    } catch (loadError) {
      setError(loadError?.response?.data?.message || "Không thể tải khiếu nại.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    setLoading(true);
    void loadComplaint();
  }, [loadComplaint]);

  const handleRealtimeUpdate = useCallback((nextComplaint) => {
    setComplaint(nextComplaint);
  }, []);
  const realtime = useComplaintRealtime(complaint?.id, handleRealtimeUpdate);

  const handleSendMessage = async (content) => {
    if (!content.trim() || sending || isComplaintClosed(complaint?.status)) return;
    setSending(true);
    setSendError("");
    try {
      await complaintApi.addMessage(id, content.trim());
      await loadComplaint();
    } catch (sendErrorCatch) {
      setSendError(sendErrorCatch?.response?.data?.message || "Không thể gửi tin nhắn.");
      throw sendErrorCatch;
    } finally {
      setSending(false);
    }
  };

  if (loading) return <Box className="flex min-h-[50vh] items-center justify-center"><CircularProgress /></Box>;
  if (!complaint) return <Alert severity="error">{error || "Không tìm thấy khiếu nại."}</Alert>;

  const closed = isComplaintClosed(complaint.status);

  return (
    <Box className="w-full min-h-screen">
      <PageHeader
        title={complaint.title}
        subtitle={`Khiếu nại chuyến ${String(complaint.tripId).slice(0, 8)} · Gửi lúc ${formatComplaintTime(complaint.createdAt)}`}
        breadcrumbs={[{ label: "Trang chủ", path: "/carrier/dashboard" }, { label: "Khiếu nại", path: "/carrier/complaints" }, { label: String(complaint.id).slice(0, 8) }]}
        action={<ComplaintStatusChip status={complaint.status} />}
      />

      {error && <Alert severity="error" className="!mb-4 !rounded-2xl">{error}</Alert>}

      <Box className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <Typography className="!mb-1 !text-xs !font-bold uppercase tracking-wider text-slate-400">Nội dung khiếu nại</Typography>
        <Typography variant="body2" className="whitespace-pre-wrap text-slate-700">{complaint.description}</Typography>
        {complaint.evidenceUrl && <Button component={Link} href={complaint.evidenceUrl} target="_blank" rel="noreferrer" variant="outlined" size="small" className="!mt-4 !rounded-xl !font-bold !capitalize">Mở tệp bằng chứng</Button>}
      </Box>

      {closed && (
        <Alert severity={complaint.status === "RESOLVED" ? "success" : "warning"} className="!mb-6 !rounded-2xl">
          <Typography variant="body2" className="!font-bold">{getComplaintDecisionLabel(complaint.decision)}</Typography>
          {complaint.resolution && <Typography variant="body2">{complaint.resolution}</Typography>}
        </Alert>
      )}

      <ComplaintConversation
        messages={complaint.messages}
        viewerRole="CARRIER"
        onSend={handleSendMessage}
        sending={sending}
        error={sendError}
        disabled={closed}
        realtimeStatus={realtime.status}
      />
    </Box>
  );
}
