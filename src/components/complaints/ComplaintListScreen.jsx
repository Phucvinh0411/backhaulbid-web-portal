"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import PageHeader from "@/components/common/PageHeader";
import { EmptyState, ErrorState, ListSkeleton, StatusBadge } from "@/components/ui";
import { complaintApi } from "@/services/complaintApi";
import { getApiErrorMessage } from "@/services/errorMessage";
import { shortId } from "@/lib/format";
import ComplaintCreateDialog from "./ComplaintCreateDialog";
import {
  COMPLAINT_CATEGORIES,
  COMPLAINT_STATUS_META,
  UNCATEGORIZED,
  formatComplaintTime,
  getComplaintCategoryMeta,
  getComplaintStatusMeta,
  normalizeComplaintCollection,
} from "./complaintPresentation";

const BASE = { shipper: "/shipper", carrier: "/carrier" };
const ROLE_CODE = { shipper: "SHIPPER", carrier: "CARRIER" };

export function ComplaintCategoryBadge({ category, size = "sm" }) {
  const meta = getComplaintCategoryMeta(category);
  return <StatusBadge size={size} tone={category ? "brand" : "neutral"} icon="label" label={meta.label} />;
}

/** Complaint list for a trip party (shipper or carrier). */
export default function ComplaintListScreen({ role }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const base = BASE[role];
  const [complaints, setComplaints] = useState([]);
  const [state, setState] = useState("loading");
  const [error, setError] = useState("");
  const [category, setCategory] = useState(searchParams?.get("category") || "");
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(searchParams?.get("new") === "1");
  const [createdMessage, setCreatedMessage] = useState("");
  const initialTripId = searchParams?.get("tripId") || "";

  const load = useCallback(async () => {
    setState("loading");
    setError("");
    try {
      setComplaints(normalizeComplaintCollection(await complaintApi.list({ category: category || undefined })));
      setState("ready");
    } catch (loadError) {
      setError(getApiErrorMessage(loadError, "Không thể tải danh sách khiếu nại."));
      setState("error");
    }
  }, [category]);

  useEffect(() => {
    void load();
  }, [load]);

  const visible = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("vi");
    return complaints.filter((complaint) => {
      if (status && complaint.status !== status) return false;
      if (!needle) return true;
      return `${complaint.title} ${complaint.description} ${complaint.tripId} ${complaint.id}`.toLocaleLowerCase("vi").includes(needle);
    });
  }, [complaints, query, status]);

  const openCount = complaints.filter((complaint) => !getComplaintStatusMeta(complaint.status).closed).length;

  const handleCreated = (created) => {
    setDialogOpen(false);
    setCreatedMessage("Đã gửi khiếu nại. Bên còn lại và quản trị viên có thể xem và trao đổi trong hồ sơ.");
    if (created?.id) {
      router.push(`${base}/complaints/${created.id}`);
      return;
    }
    void load();
  };

  return (
    <Box>
      <PageHeader
        title="Khiếu nại"
        subtitle="Khiếu nại gắn với một chuyến vận chuyển của bạn. Quản trị viên xem xét và đưa ra kết luận."
        breadcrumbs={[{ label: "Trang chủ", path: `${base}/dashboard` }, { label: "Khiếu nại" }]}
        action={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
            Gửi khiếu nại
          </Button>
        }
      />

      {createdMessage && (
        <Alert severity="success" onClose={() => setCreatedMessage("")} sx={{ mb: 2 }}>
          {createdMessage}
        </Alert>
      )}

      <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "2fr 1fr 1fr" }, mb: 1.5 }}>
        <TextField
          label="Tìm theo tiêu đề, nội dung, mã chuyến"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
        />
        <TextField select label="Loại vấn đề" value={category} onChange={(event) => setCategory(event.target.value)}>
          <MenuItem value="">Tất cả loại</MenuItem>
          {COMPLAINT_CATEGORIES.filter((item) => item.roles.includes(ROLE_CODE[role])).map((item) => (
            <MenuItem key={item.code} value={item.code}>
              {item.label}
            </MenuItem>
          ))}
          <MenuItem value={UNCATEGORIZED}>Chưa phân loại (khiếu nại cũ)</MenuItem>
        </TextField>
        <TextField select label="Trạng thái xử lý" value={status} onChange={(event) => setStatus(event.target.value)}>
          <MenuItem value="">Tất cả trạng thái</MenuItem>
          {Object.entries(COMPLAINT_STATUS_META).map(([code, meta]) => (
            <MenuItem key={code} value={code}>
              {meta.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {state === "ready" && (
        <Typography component="div" variant="body2" role="status" sx={{ color: "text.secondary", mb: 1.5 }}>
          {visible.length} khiếu nại{category || status || query ? " khớp bộ lọc" : ""} · {openCount} đang mở
          {category && <Chip size="small" label="Xóa lọc loại" onDelete={() => setCategory("")} sx={{ ml: 1 }} />}
        </Typography>
      )}

      {state === "loading" && <ListSkeleton rows={4} label="Đang tải khiếu nại" />}
      {state === "error" && <ErrorState description={error} onRetry={load} />}
      {state === "ready" && visible.length === 0 && (
        <EmptyState
          title={complaints.length === 0 ? "Chưa có khiếu nại" : "Không có khiếu nại khớp bộ lọc"}
          description={complaints.length === 0 ? "Khi có vấn đề với một chuyến, bạn có thể gửi khiếu nại kèm bằng chứng tại đây." : "Thử bỏ bớt điều kiện lọc."}
        />
      )}

      {state === "ready" && visible.length > 0 && (
        <Box component="ul" sx={{ m: 0, p: 0, display: "flex", flexDirection: "column", gap: 1.25 }}>
          {visible.map((complaint) => {
            const statusMeta = getComplaintStatusMeta(complaint.status);
            return (
              <Box component="li" key={complaint.id} sx={{ listStyle: "none" }}>
                <Box
                  component={Link}
                  href={`${base}/complaints/${complaint.id}`}
                  sx={{
                    display: "block",
                    p: 2,
                    bgcolor: "background.paper",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 3,
                    textDecoration: "none",
                    color: "inherit",
                    "&:hover": { borderColor: "var(--color-line-strong)" },
                    "&:focus-visible": { outline: "2px solid var(--color-focus)" },
                  }}
                >
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 1 }}>
                    <StatusBadge size="sm" meta={statusMeta} />
                    <ComplaintCategoryBadge category={complaint.category} />
                  </Box>
                  <Typography component="h2" sx={{ fontWeight: 700, fontSize: "0.9375rem", overflowWrap: "anywhere" }}>
                    {complaint.title}
                  </Typography>
                  <Typography variant="body2" className="line-clamp-2" sx={{ color: "text.secondary", mt: 0.5 }}>
                    {complaint.description}
                  </Typography>
                  <Typography variant="caption" className="tabular" sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, color: "text.secondary", mt: 1 }}>
                    <span>Chuyến {shortId(complaint.tripId)}</span>
                    <span>{formatComplaintTime(complaint.createdAt)}</span>
                    <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                      <ChatBubbleOutlineIcon aria-hidden sx={{ fontSize: 14 }} />
                      {(complaint.messages || []).length} trao đổi
                    </Box>
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}

      <ComplaintCreateDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onCreated={handleCreated} role={ROLE_CODE[role]} initialTripId={initialTripId} />
    </Box>
  );
}
