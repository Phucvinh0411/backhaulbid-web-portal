"use client";

import { toMediaViewUrl } from "@/lib/mediaUrl";
import { GATEWAY_URL } from "@/config/clientConfig";
import { useCallback, useEffect, useMemo, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import SearchIcon from "@mui/icons-material/Search";
import PageHeader from "@/components/common/PageHeader";
import { EmptyState, ErrorState, KeyValueList, ListSkeleton, Panel, ResponsiveDialog, StatusBadge } from "@/components/ui";
import ComplaintConversation from "@/components/complaints/ComplaintConversation";
import { ComplaintCategoryBadge } from "@/components/complaints/ComplaintListScreen";
import useComplaintRealtime from "@/hooks/useComplaintRealtime";
import {
  COMPLAINT_CATEGORIES,
  COMPLAINT_DECISION_LABELS,
  COMPLAINT_STATUS_META,
  UNCATEGORIZED,
  formatComplaintTime,
  getComplaintCategoryMeta,
  getComplaintDecisionLabel,
  getComplaintStatusMeta,
  isComplaintClosed,
  normalizeComplaintCollection,
} from "@/components/complaints/complaintPresentation";
import { complaintApi } from "@/services/complaintApi";
import { getApiErrorMessage } from "@/services/errorMessage";
import { shortId } from "@/lib/format";

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [listState, setListState] = useState("loading");
  const [listError, setListError] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("OPEN");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [selected, setSelected] = useState(null);
  const [detailState, setDetailState] = useState("idle");
  const [detailError, setDetailError] = useState("");
  const [decision, setDecision] = useState("");
  const [resolution, setResolution] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [resolveError, setResolveError] = useState("");
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState("");

  const loadList = useCallback(async () => {
    setListState("loading");
    setListError("");
    try {
      setComplaints(normalizeComplaintCollection(await complaintApi.list({ category: category || undefined })));
      setListState("ready");
    } catch (error) {
      setListError(getApiErrorMessage(error, "Không thể tải danh sách khiếu nại."));
      setListState("error");
    }
  }, [category]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  useEffect(() => {
    if (!selectedId) {
      setSelected(null);
      setDetailState("idle");
      return undefined;
    }
    let active = true;
    setDetailState("loading");
    setDetailError("");
    setResolveError("");
    setFieldErrors({});
    complaintApi
      .get(selectedId)
      .then((result) => {
        if (!active) return;
        setSelected(result);
        setDecision(result.decision || "");
        setResolution(result.resolution || "");
        setDetailState("ready");
      })
      .catch((error) => {
        if (!active) return;
        setDetailError(getApiErrorMessage(error, "Không thể tải chi tiết khiếu nại."));
        setDetailState("error");
      });
    return () => {
      active = false;
    };
  }, [selectedId]);

  const applyUpdate = useCallback((next) => {
    setSelected(next);
    setComplaints((current) => current.map((item) => (item.id === next.id ? next : item)));
  }, []);
  const realtime = useComplaintRealtime(selected?.id, applyUpdate);

  const visible = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("vi");
    return complaints.filter((item) => {
      const closed = getComplaintStatusMeta(item.status).closed;
      if (status === "OPEN" && closed) return false;
      if (status && status !== "OPEN" && item.status !== status) return false;
      if (!needle) return true;
      return `${item.id} ${item.tripId} ${item.title} ${item.description}`.toLocaleLowerCase("vi").includes(needle);
    });
  }, [complaints, query, status]);

  const sendMessage = async (content) => {
    if (!selected || isComplaintClosed(selected.status)) return;
    setSending(true);
    setSendError("");
    try {
      applyUpdate(await complaintApi.addMessage(selected.id, content));
    } catch (error) {
      setSendError(getApiErrorMessage(error, "Chưa gửi được tin nhắn."));
      throw error;
    } finally {
      setSending(false);
    }
  };

  const requestResolve = () => {
    const errors = {};
    if (!decision) errors.decision = "Chọn kết luận.";
    if (!resolution.trim()) errors.resolution = "Nêu căn cứ và hướng xử lý.";
    setFieldErrors(errors);
    if (!Object.keys(errors).length) setConfirmOpen(true);
  };

  const resolve = async () => {
    if (!selected || resolving) return;
    setResolving(true);
    setResolveError("");
    try {
      applyUpdate(await complaintApi.resolve(selected.id, { decision, resolution: resolution.trim() }));
      setConfirmOpen(false);
    } catch (error) {
      setResolveError(getApiErrorMessage(error, "Chưa lưu được kết luận. Hồ sơ chưa thay đổi."));
    } finally {
      setResolving(false);
    }
  };

  const closed = isComplaintClosed(selected?.status);
  const showDetailOnPhone = Boolean(selectedId);

  return (
    <Box>
      <PageHeader
        title="Xử lý khiếu nại"
        subtitle="Xem hồ sơ, trao đổi với hai bên và chốt kết luận. Loại vấn đề do người gửi chọn khi tạo khiếu nại."
        breadcrumbs={[{ label: "Quản trị", path: "/admin" }, { label: "Khiếu nại" }]}
      />

      <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: { xs: "1fr", lg: "380px minmax(0, 1fr)" }, alignItems: "start" }}>
        <Box sx={{ display: { xs: showDetailOnPhone ? "none" : "block", lg: "block" }, minWidth: 0 }}>
          <Panel padded={false}>
            <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1.5, borderBottom: "1px solid", borderColor: "divider" }}>
              <TextField
                label="Tìm mã, chuyến, tiêu đề"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
              />
              <Box sx={{ display: "grid", gap: 1.5, gridTemplateColumns: "1fr 1fr" }}>
                <TextField select label="Loại vấn đề" value={category} onChange={(event) => setCategory(event.target.value)}>
                  <MenuItem value="">Tất cả loại</MenuItem>
                  {COMPLAINT_CATEGORIES.map((item) => (
                    <MenuItem key={item.code} value={item.code}>
                      {item.label}
                    </MenuItem>
                  ))}
                  <MenuItem value={UNCATEGORIZED}>Chưa phân loại</MenuItem>
                </TextField>
                <TextField select label="Trạng thái" value={status} onChange={(event) => setStatus(event.target.value)}>
                  <MenuItem value="OPEN">Đang mở</MenuItem>
                  <MenuItem value="">Tất cả</MenuItem>
                  {Object.entries(COMPLAINT_STATUS_META).map(([code, meta]) => (
                    <MenuItem key={code} value={code}>
                      {meta.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
              {listState === "ready" && (
                <Typography variant="body2" role="status" sx={{ color: "text.secondary" }}>
                  {visible.length} / {complaints.length} hồ sơ
                </Typography>
              )}
            </Box>
            <Box sx={{ p: 1.5, maxHeight: { lg: "calc(100dvh - 300px)" }, overflowY: { lg: "auto" } }}>
              {listState === "loading" && <ListSkeleton rows={5} height={84} label="Đang tải khiếu nại" />}
              {listState === "error" && <ErrorState description={listError} onRetry={loadList} />}
              {listState === "ready" && visible.length === 0 && <EmptyState title="Không có hồ sơ phù hợp" description="Thử đổi bộ lọc loại hoặc trạng thái." />}
              {listState === "ready" && visible.length > 0 && (
                <Box component="ul" sx={{ m: 0, p: 0, display: "flex", flexDirection: "column", gap: 1 }}>
                  {visible.map((item) => {
                    const active = item.id === selectedId;
                    return (
                      <Box component="li" key={item.id} sx={{ listStyle: "none" }}>
                        <ButtonBase
                          onClick={() => setSelectedId(item.id)}
                          aria-pressed={active}
                          sx={{
                            display: "block",
                            width: "100%",
                            textAlign: "left",
                            p: 1.5,
                            borderRadius: 2,
                            border: "1px solid",
                            borderColor: active ? "primary.main" : "divider",
                            bgcolor: active ? "var(--color-brand-soft)" : "background.paper",
                            "&.Mui-focusVisible": { outline: "2px solid var(--color-focus)" },
                          }}
                        >
                          <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", mb: 0.75 }}>
                            <StatusBadge size="sm" meta={getComplaintStatusMeta(item.status)} />
                            <ComplaintCategoryBadge category={item.category} />
                          </Box>
                          <Typography sx={{ fontWeight: 700, fontSize: "0.875rem", overflowWrap: "anywhere" }}>{item.title}</Typography>
                          <Typography variant="caption" className="tabular" sx={{ color: "text.secondary" }}>
                            {shortId(item.id)} · Chuyến {shortId(item.tripId)} · {formatComplaintTime(item.createdAt)}
                          </Typography>
                        </ButtonBase>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </Box>
          </Panel>
        </Box>

        <Box sx={{ display: { xs: showDetailOnPhone ? "block" : "none", lg: "block" }, minWidth: 0 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => setSelectedId("")} sx={{ display: { lg: "none" }, mb: 1 }}>
            Danh sách khiếu nại
          </Button>
          {detailState === "idle" && <EmptyState title="Chọn một hồ sơ" description="Chi tiết, trao đổi và kết luận hiển thị ở đây." />}
          {detailState === "loading" && <ListSkeleton rows={3} height={140} label="Đang tải hồ sơ" />}
          {detailState === "error" && <ErrorState description={detailError} />}
          {detailState === "ready" && selected && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Panel
                title={selected.title}
                subtitle={`Mã ${shortId(selected.id)} · gửi ${formatComplaintTime(selected.createdAt)}`}
                actions={
                  <>
                    <StatusBadge meta={getComplaintStatusMeta(selected.status)} />
                    <ComplaintCategoryBadge category={selected.category} size="md" />
                  </>
                }
              >
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", maxWidth: "75ch", mb: 2 }}>
                  {selected.description}
                </Typography>
                <KeyValueList
                  items={[
                    { label: "Loại vấn đề", value: getComplaintCategoryMeta(selected.category).label },
                    { label: "Chuyến", value: selected.tripId || "Không gắn chuyến", numeric: true },
                    { label: "Người gửi", value: selected.reporterId, numeric: true },
                    { label: "Bên bị khiếu nại", value: selected.respondentId, numeric: true },
                  ]}
                />
                {selected.evidenceUrl ? (
                  <Button component="a" href={toMediaViewUrl(selected.evidenceUrl, GATEWAY_URL)} target="_blank" rel="noreferrer" variant="outlined" startIcon={<OpenInNewIcon />} sx={{ mt: 2 }}>
                    Mở tệp bằng chứng
                  </Button>
                ) : (
                  <Typography variant="body2" sx={{ color: "text.secondary", mt: 2 }}>
                    Hồ sơ không có tệp bằng chứng.
                  </Typography>
                )}
              </Panel>

              <ComplaintConversation
                messages={selected.messages}
                viewerRole="ADMIN"
                onSend={sendMessage}
                sending={sending}
                error={sendError}
                disabled={closed}
                realtimeStatus={realtime.status}
              />

              <Panel title="Kết luận" subtitle={closed ? "Hồ sơ đã đóng." : "Kết luận được lưu vào hồ sơ và gửi vào trao đổi."}>
                {closed ? (
                  <Alert severity={selected.status === "RESOLVED" ? "success" : "warning"}>
                    <Typography sx={{ fontWeight: 700 }}>{getComplaintDecisionLabel(selected.decision)}</Typography>
                    {selected.resolution && <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>{selected.resolution}</Typography>}
                  </Alert>
                ) : (
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    <TextField
                      select
                      label="Kết luận"
                      value={decision}
                      onChange={(event) => {
                        setDecision(event.target.value);
                        setFieldErrors((current) => ({ ...current, decision: undefined }));
                      }}
                      error={Boolean(fieldErrors.decision)}
                      helperText={fieldErrors.decision}
                    >
                      {Object.entries(COMPLAINT_DECISION_LABELS).map(([value, label]) => (
                        <MenuItem key={value} value={value}>
                          {label}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      label="Căn cứ và hướng xử lý"
                      multiline
                      minRows={3}
                      value={resolution}
                      onChange={(event) => {
                        setResolution(event.target.value);
                        setFieldErrors((current) => ({ ...current, resolution: undefined }));
                      }}
                      error={Boolean(fieldErrors.resolution)}
                      helperText={fieldErrors.resolution}
                      inputProps={{ maxLength: 5000 }}
                    />
                    <Box>
                      <Button variant="contained" onClick={requestResolve}>
                        Chốt kết luận
                      </Button>
                    </Box>
                  </Box>
                )}
              </Panel>
            </Box>
          )}
        </Box>
      </Box>

      <ResponsiveDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        busy={resolving}
        title="Xác nhận chốt khiếu nại"
        titleId="resolve-confirm-title"
        maxWidth="xs"
        actions={
          <>
            <Button color="inherit" onClick={() => setConfirmOpen(false)} disabled={resolving}>
              Xem lại
            </Button>
            <Button variant="contained" onClick={resolve} disabled={resolving}>
              {resolving ? "Đang lưu..." : "Xác nhận"}
            </Button>
          </>
        }
      >
        {resolveError && (
          <Alert severity="error" sx={{ mb: 1.5 }}>
            {resolveError}
          </Alert>
        )}
        <Typography variant="body2">
          Kết luận “{COMPLAINT_DECISION_LABELS[decision]}” sẽ được lưu, hồ sơ chuyển sang “Đã giải quyết” và không thể trao đổi thêm.
        </Typography>
      </ResponsiveDialog>
    </Box>
  );
}
