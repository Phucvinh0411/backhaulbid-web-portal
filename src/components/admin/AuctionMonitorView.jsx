"use client";

import { useEffect, useMemo, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import BlockIcon from "@mui/icons-material/Block";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import GavelIcon from "@mui/icons-material/Gavel";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AdminMetricCard,
  AdminPrimaryButton,
  AdminSearchField,
  AdminSecondaryButton,
  AdminSectionCard,
  AdminStatusChip,
  AdminToolbar,
} from "@/components/admin/AdminUI";

const FALLBACK_IMAGE = "/images/hero-truck.png";

const formatCurrency = (amount) =>
  amount == null || Number.isNaN(Number(amount))
    ? "Chưa có"
    : new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
      }).format(Number(amount));

const statusLabel = {
  OPEN: "Đang mở",
  PENDING: "Chờ mở",
  CANCELLED: "Đã hủy",
};

function AuctionImage({ src, alt, size = 56 }) {
  const [imageSrc, setImageSrc] = useState(src || FALLBACK_IMAGE);

  useEffect(() => {
    setImageSrc(src || FALLBACK_IMAGE);
  }, [src]);

  return (
    <Box
      component="img"
      src={imageSrc}
      alt={alt}
      onError={() => setImageSrc(FALLBACK_IMAGE)}
      sx={{
        width: size,
        height: size,
        objectFit: "cover",
        borderRadius: 2,
        border: "1px solid #E2E8F0",
        bgcolor: "#F1F5F9",
        display: "block",
      }}
    />
  );
}

function SessionStatus({ status, timeRemaining }) {
  if (status === "OPEN") {
    return <AdminStatusChip label={timeRemaining} tone="warning" icon={<AccessTimeIcon />} />;
  }

  return <AdminStatusChip label={statusLabel[status] || status} tone={status === "CANCELLED" ? "danger" : "neutral"} />;
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        p: 1.5,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        boxShadow: 2,
      }}
    >
      <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
        Thời gian: {label}
      </Typography>
      <Typography variant="body2" sx={{ color: "primary.main", fontWeight: 700 }}>
        Giá thầu: {formatCurrency(payload[0].value)}
      </Typography>
    </Box>
  );
}

function EmptyState({ filtered, query }) {
  return (
    <Box role="status" sx={{ py: 8, px: 3, textAlign: "center" }}>
      <InsightsOutlinedIcon sx={{ color: "#94A3B8", fontSize: 42, mb: 1 }} />
      <Typography variant="h6" sx={{ color: "#1E293B", fontWeight: 800 }}>
        {filtered ? "Không tìm thấy phiên phù hợp" : "Chưa có phiên đấu giá đang theo dõi"}
      </Typography>
      <Typography variant="body2" sx={{ color: "#64748B", mt: 0.75, maxWidth: 520, mx: "auto" }}>
        {filtered
          ? `Không có phiên nào khớp với “${query}”. Hãy thử từ khóa khác.`
          : "Khi bidding service có phiên OPEN hoặc PENDING, dữ liệu sẽ xuất hiện tại đây."}
      </Typography>
    </Box>
  );
}

export default function AuctionMonitorView({ sessions, onCancelAuction, onFlagAuction }) {
  const [selectedId, setSelectedId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [stopDialogOpen, setStopDialogOpen] = useState(false);
  const [flagDialogOpen, setFlagDialogOpen] = useState(false);
  const [flagReason, setFlagReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    if (!sessions.some((session) => session.id === selectedId)) {
      setSelectedId(sessions[0]?.id || "");
    }
  }, [selectedId, sessions]);

  const filteredSessions = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase("vi");
    return sessions.filter(
      (session) =>
        !query ||
        `${session.id} ${session.title} ${session.route} ${session.vehicleType}`
          .toLocaleLowerCase("vi")
          .includes(query),
    );
  }, [searchQuery, sessions]);

  const selectedSession =
    sessions.find((session) => session.id === selectedId) || filteredSessions[0] || null;
  const openCount = sessions.filter((session) => session.status === "OPEN").length;
  const bidCount = sessions.reduce((total, session) => total + session.bidHistory.length, 0);
  const bidderCount = sessions.reduce((total, session) => total + session.activeBidders, 0);
  const flaggedCount = sessions.filter((session) => session.fraudFlag).length;

  const runAction = async (action, close) => {
    setActionLoading(true);
    setActionError("");
    try {
      await action();
      close();
    } catch (error) {
      setActionError(error?.response?.data?.message || error?.message || "Không thể thực hiện thao tác.");
    } finally {
      setActionLoading(false);
    }
  };

  const confirmFlag = () => {
    if (!selectedSession || !flagReason.trim()) return;
    runAction(
      () => onFlagAuction(selectedSession.id, flagReason.trim()),
      () => {
        setFlagDialogOpen(false);
        setFlagReason("");
      },
    );
  };

  const confirmStop = () => {
    if (!selectedSession) return;
    runAction(() => onCancelAuction(selectedSession.id), () => setStopDialogOpen(false));
  };

  return (
    <>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <AdminMetricCard title="Tổng phiên theo dõi" value={sessions.length} helper="OPEN + PENDING" icon={GavelIcon} />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <AdminMetricCard title="Đang mở" value={openCount} helper="Có thể nhận báo giá" icon={AccessTimeIcon} tone="success" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <AdminMetricCard title="Lượt báo giá" value={bidCount} helper={`${bidderCount} nhà xe đang tham gia`} icon={GroupsOutlinedIcon} tone="info" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <AdminMetricCard title="Cần rà soát" value={flaggedCount} helper="Cờ gian lận" icon={FlagOutlinedIcon} tone={flaggedCount ? "danger" : "neutral"} />
        </Grid>
      </Grid>

      <AdminSectionCard>
        <AdminToolbar
          title="Danh sách phiên đấu giá"
          subtitle="Chọn một phiên để xem diễn biến giá và thao tác vận hành."
        >
          <AdminSearchField
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Tìm mã phiên, tuyến, loại xe..."
          />
        </AdminToolbar>

        {sessions.length === 0 || filteredSessions.length === 0 ? (
          <EmptyState filtered={sessions.length > 0} query={searchQuery.trim()} />
        ) : (
          <TableContainer sx={{ overflowX: "auto" }}>
            <Table sx={{ minWidth: 760 }} aria-label="Danh sách phiên đấu giá">
              <TableHead sx={{ bgcolor: "#F8FAFC" }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800, color: "#475569" }}>Phiên</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: "#475569" }}>Tuyến vận chuyển</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: "#475569" }}>Giá hiện tại</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: "#475569" }}>Tham gia</TableCell>
                  <TableCell sx={{ fontWeight: 800, color: "#475569" }}>Trạng thái</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSessions.map((session) => {
                  const selected = selectedSession?.id === session.id;
                  return (
                    <TableRow
                      key={session.id}
                      hover
                      selected={selected}
                      tabIndex={0}
                      aria-selected={selected}
                      onClick={() => setSelectedId(session.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setSelectedId(session.id);
                        }
                      }}
                      sx={{ cursor: "pointer", "&.Mui-selected": { bgcolor: "#EAF4F8" } }}
                    >
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
                          <AuctionImage src={session.image} alt={`Ảnh ${session.title}`} />
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" sx={{ color: "#1B4965", fontWeight: 800 }} noWrap>
                              {session.id}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#64748B" }} noWrap>
                              {session.vehicleType}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: "#1E293B", fontWeight: 700 }}>
                          {session.route}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#64748B" }}>
                          {session.title}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ color: "#1B4965", fontWeight: 800 }}>
                        {formatCurrency(session.currentBid)}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{session.activeBidders} nhà xe</Typography>
                        <Typography variant="caption" sx={{ color: "#64748B" }}>{session.bidHistory.length} báo giá</Typography>
                      </TableCell>
                      <TableCell><SessionStatus status={session.status} timeRemaining={session.timeRemaining} /></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </AdminSectionCard>

      {selectedSession && (
        <Grid container spacing={2}>
          <Grid item xs={12} lg={5}>
            <AdminSectionCard title="Thông tin phiên" subtitle={selectedSession.id} sx={{ height: "100%" }}>
              <Box sx={{ p: 2.5, display: "grid", gap: 2 }}>
                <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                  <AuctionImage src={selectedSession.image} alt={`Ảnh ${selectedSession.title}`} size={96} />
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="h6" sx={{ color: "#1E293B", fontWeight: 800 }}>{selectedSession.title}</Typography>
                    <Typography variant="body2" sx={{ color: "#64748B", mt: 0.5 }}>{selectedSession.route}</Typography>
                    <Box sx={{ mt: 1 }}><SessionStatus status={selectedSession.status} timeRemaining={selectedSession.timeRemaining} /></Box>
                  </Box>
                </Box>
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 1.5 }}>
                  <InfoItem label="Giá khởi điểm" value={formatCurrency(selectedSession.startPrice)} />
                  <InfoItem label="Giá hiện tại" value={formatCurrency(selectedSession.currentBid)} emphasize />
                  <InfoItem label="Loại xe" value={selectedSession.vehicleType} />
                  <InfoItem label="Nhà xe tham gia" value={`${selectedSession.activeBidders}`} />
                </Box>
                {selectedSession.fraudFlag && (
                  <Alert severity="warning" icon={<FlagOutlinedIcon />}>
                    Phiên đang được gắn cờ rà soát{selectedSession.fraudReason ? `: ${selectedSession.fraudReason}` : "."}
                  </Alert>
                )}
              </Box>
            </AdminSectionCard>
          </Grid>

          <Grid item xs={12} lg={7}>
            <AdminSectionCard
              title="Diễn biến giá"
              subtitle={`${selectedSession.bidHistory.length} báo giá · cập nhật từ bidding service`}
              action={<AdminStatusChip label={statusLabel[selectedSession.status] || selectedSession.status} tone={selectedSession.status === "OPEN" ? "success" : "neutral"} />}
              sx={{ height: "100%" }}
            >
              {selectedSession.bidError && <Alert severity="warning" sx={{ m: 2 }}>{selectedSession.bidError}</Alert>}
              <Box sx={{ height: 280, p: 2 }}>
                {selectedSession.bidHistory.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={selectedSession.bidHistory} margin={{ top: 12, right: 16, left: 4, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="time" axisLine={false} tickLine={false} />
                      <YAxis tickFormatter={(value) => `${Math.round(value / 1000)}k`} axisLine={false} tickLine={false} width={52} />
                      <RechartsTooltip content={<ChartTooltip />} />
                      <Line type="stepAfter" dataKey="bid" stroke="#1B4965" strokeWidth={3} dot={{ r: 4, fill: "#1B4965", strokeWidth: 2, stroke: "#FFFFFF" }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <Box role="status" sx={{ height: "100%", display: "grid", placeItems: "center", textAlign: "center", color: "#64748B" }}>
                    <Box><ImageOutlinedIcon sx={{ color: "#94A3B8", fontSize: 36 }} /><Typography variant="body2">Chưa có báo giá trong phiên này.</Typography></Box>
                  </Box>
                )}
              </Box>
            </AdminSectionCard>
          </Grid>
        </Grid>
      )}

      {selectedSession && (
        <AdminSectionCard title="Thao tác giám sát" subtitle="Các thao tác này tác động trực tiếp đến phiên đang chọn.">
          <Box sx={{ p: 2.5 }}>
            {actionError && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setActionError("")}>{actionError}</Alert>}
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
              <AdminSecondaryButton
                startIcon={<FlagOutlinedIcon />}
                onClick={() => setFlagDialogOpen(true)}
                disabled={actionLoading || selectedSession.fraudFlag}
              >
                {selectedSession.fraudFlag ? "Đã gắn cờ rà soát" : "Gắn cờ gian lận"}
              </AdminSecondaryButton>
              <AdminPrimaryButton
                startIcon={<BlockIcon />}
                onClick={() => setStopDialogOpen(true)}
                disabled={selectedSession.status !== "OPEN" || actionLoading}
                sx={{ bgcolor: "#BE123C", "&:hover": { bgcolor: "#9F1239" } }}
              >
                Dừng phiên khẩn cấp
              </AdminPrimaryButton>
            </Box>
          </Box>
        </AdminSectionCard>
      )}

      <Dialog open={stopDialogOpen} onClose={() => !actionLoading && setStopDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>Dừng phiên đấu giá?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">Phiên {selectedSession?.id} sẽ chuyển sang trạng thái đã hủy và không nhận thêm đăng ký hoặc báo giá.</Typography>
        </DialogContent>
        <DialogActions>
          <AdminSecondaryButton onClick={() => setStopDialogOpen(false)} disabled={actionLoading}>Hủy</AdminSecondaryButton>
          <AdminPrimaryButton onClick={confirmStop} disabled={actionLoading}>{actionLoading ? "Đang dừng..." : "Xác nhận dừng"}</AdminPrimaryButton>
        </DialogActions>
      </Dialog>

      <Dialog open={flagDialogOpen} onClose={() => !actionLoading && setFlagDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Gắn cờ gian lận</DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ mb: 2 }}>Lưu lý do rà soát phiên {selectedSession?.id}.</Typography>
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={3}
            label="Lý do"
            value={flagReason}
            onChange={(event) => setFlagReason(event.target.value)}
            inputProps={{ maxLength: 500 }}
          />
        </DialogContent>
        <DialogActions>
          <AdminSecondaryButton onClick={() => setFlagDialogOpen(false)} disabled={actionLoading}>Hủy</AdminSecondaryButton>
          <AdminPrimaryButton onClick={confirmFlag} disabled={actionLoading || !flagReason.trim()}>{actionLoading ? "Đang lưu..." : "Gắn cờ"}</AdminPrimaryButton>
        </DialogActions>
      </Dialog>
    </>
  );
}

function InfoItem({ label, value, emphasize = false }) {
  return (
    <Box sx={{ p: 1.5, border: "1px solid #E2E8F0", borderRadius: 2, bgcolor: "#F8FAFC" }}>
      <Typography variant="caption" sx={{ color: "#64748B", display: "block" }}>{label}</Typography>
      <Typography variant="body2" sx={{ color: emphasize ? "#1B4965" : "#1E293B", fontWeight: 800, mt: 0.35 }}>{value}</Typography>
    </Box>
  );
}
