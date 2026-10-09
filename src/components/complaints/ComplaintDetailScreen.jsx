"use client";

import { toMediaViewUrl } from "@/lib/mediaUrl";
import { GATEWAY_URL } from "@/config/clientConfig";
import { useCallback, useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PageHeader from "@/components/common/PageHeader";
import { ErrorState, ForbiddenState, KeyValueList, ListSkeleton, Panel, StatusBadge } from "@/components/ui";
import useComplaintRealtime from "@/hooks/useComplaintRealtime";
import { complaintApi } from "@/services/complaintApi";
import { getApiErrorMessage } from "@/services/errorMessage";
import { shortId } from "@/lib/format";
import ComplaintConversation from "./ComplaintConversation";
import { ComplaintCategoryBadge } from "./ComplaintListScreen";
import {
  formatComplaintTime,
  getComplaintCategoryMeta,
  getComplaintDecisionLabel,
  getComplaintStatusMeta,
  isComplaintClosed,
} from "./complaintPresentation";

const BASE = { shipper: "/shipper", carrier: "/carrier" };
const VIEWER = { shipper: "SHIPPER", carrier: "CARRIER" };
const TRIP_HREF = { shipper: (id) => `/shipper/tracking?id=${encodeURIComponent(id)}`, carrier: (id) => `/carrier/transports/${encodeURIComponent(id)}` };

export default function ComplaintDetailScreen({ role, id }) {
  const base = BASE[role];
  const [complaint, setComplaint] = useState(null);
  const [state, setState] = useState("loading");
  const [error, setError] = useState("");
  const [sendError, setSendError] = useState("");
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setError("");
    try {
      setComplaint(await complaintApi.get(id));
      setState("ready");
    } catch (loadError) {
      const status = loadError?.response?.status;
      setState(status === 403 ? "forbidden" : status === 404 ? "missing" : "error");
      setError(getApiErrorMessage(loadError, "Không thể tải khiếu nại."));
    }
  }, [id]);

  useEffect(() => {
    setState("loading");
    void load();
  }, [load]);

  const handleRealtime = useCallback((next) => setComplaint(next), []);
  const realtime = useComplaintRealtime(complaint?.id, handleRealtime);

  const handleSend = async (content) => {
    if (sending || isComplaintClosed(complaint?.status)) return;
    setSending(true);
    setSendError("");
    try {
      setComplaint(await complaintApi.addMessage(id, content));
    } catch (sendFailure) {
      setSendError(getApiErrorMessage(sendFailure, "Chưa gửi được tin nhắn. Nội dung vẫn được giữ, vui lòng thử lại."));
      throw sendFailure;
    } finally {
      setSending(false);
    }
  };

  const breadcrumbs = [
    { label: "Trang chủ", path: `${base}/dashboard` },
    { label: "Khiếu nại", path: `${base}/complaints` },
    { label: complaint ? shortId(complaint.id) : "Chi tiết" },
  ];

  if (state === "loading") {
    return (
      <Box>
        <PageHeader title="Khiếu nại" breadcrumbs={breadcrumbs} />
        <ListSkeleton rows={3} height={120} label="Đang tải khiếu nại" />
      </Box>
    );
  }
  if (state === "forbidden") {
    return (
      <Box>
        <PageHeader title="Khiếu nại" breadcrumbs={breadcrumbs} />
        <ForbiddenState description="Chỉ hai bên của chuyến và quản trị viên được xem khiếu nại này." />
      </Box>
    );
  }
  if (state !== "ready" || !complaint) {
    return (
      <Box>
        <PageHeader title="Khiếu nại" breadcrumbs={breadcrumbs} />
        <ErrorState title={state === "missing" ? "Không tìm thấy khiếu nại" : undefined} description={error} onRetry={state === "missing" ? undefined : load} />
      </Box>
    );
  }

  const closed = isComplaintClosed(complaint.status);
  const categoryMeta = getComplaintCategoryMeta(complaint.category);

  return (
    <Box>
      <PageHeader
        title={complaint.title}
        breadcrumbs={breadcrumbs}
        meta={
          <>
            <StatusBadge meta={getComplaintStatusMeta(complaint.status)} />
            <ComplaintCategoryBadge category={complaint.category} size="md" />
          </>
        }
      />

      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1fr) 360px" }, alignItems: "start" }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
          {closed && (
            <Alert severity={complaint.status === "RESOLVED" ? "success" : "warning"}>
              <Typography sx={{ fontWeight: 700 }}>{getComplaintDecisionLabel(complaint.decision)}</Typography>
              {complaint.resolution && <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>{complaint.resolution}</Typography>}
            </Alert>
          )}

          <Panel title="Nội dung khiếu nại">
            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", color: "text.primary", maxWidth: "75ch" }}>
              {complaint.description}
            </Typography>
            {complaint.evidenceUrl && (
              <Button component="a" href={toMediaViewUrl(complaint.evidenceUrl, GATEWAY_URL)} target="_blank" rel="noreferrer" variant="outlined" startIcon={<OpenInNewIcon />} sx={{ mt: 2 }}>
                Mở tệp bằng chứng
              </Button>
            )}
          </Panel>

          <ComplaintConversation
            messages={complaint.messages}
            viewerRole={VIEWER[role]}
            onSend={handleSend}
            sending={sending}
            error={sendError}
            disabled={closed}
            realtimeStatus={realtime.status}
          />
        </Box>

        <Panel title="Thông tin hồ sơ" as="aside">
          <KeyValueList
            columns={1}
            items={[
              { label: "Loại vấn đề", value: categoryMeta.label },
              { label: "Mô tả loại", value: categoryMeta.description, hidden: !categoryMeta.description },
              { label: "Mã khiếu nại", value: shortId(complaint.id), numeric: true },
              { label: "Gửi lúc", value: formatComplaintTime(complaint.createdAt), numeric: true },
              { label: "Cập nhật lúc", value: formatComplaintTime(complaint.updatedAt), numeric: true },
            ]}
          />
          {complaint.tripId && (
            <Button href={TRIP_HREF[role](complaint.tripId)} variant="outlined" fullWidth sx={{ mt: 2 }}>
              Xem chuyến {shortId(complaint.tripId)}
            </Button>
          )}
        </Panel>
      </Box>
    </Box>
  );
}
