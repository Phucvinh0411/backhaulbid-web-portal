"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import BlockIcon from "@mui/icons-material/Block";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import FilterListIcon from "@mui/icons-material/FilterList";
import GavelIcon from "@mui/icons-material/Gavel";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
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
  AdminPageHeader,
  AdminPageShell,
  AdminPrimaryButton,
  AdminSearchField,
  AdminSecondaryButton,
  AdminSectionCard,
  AdminStatusChip,
} from "@/components/admin/AdminUI";

const liveSessions = [
  {
    id: "BID-2454",
    route: "Hà Nội → Hải Phòng",
    vehicleType: "Thùng kín",
    timeRemaining: "04:12",
    currentBid: 1850000,
    activeBidders: 8,
    status: "ACTIVE",
  },
  {
    id: "BID-2455",
    route: "TP.HCM → Bình Dương",
    vehicleType: "Đông lạnh",
    timeRemaining: "12:45",
    currentBid: 2400000,
    activeBidders: 3,
    status: "ACTIVE",
  },
  {
    id: "BID-2456",
    route: "Đà Nẵng → Quảng Nam",
    vehicleType: "Mui bạt",
    timeRemaining: "28:18",
    currentBid: 3150000,
    activeBidders: 5,
    status: "ACTIVE",
  },
  {
    id: "BID-2457",
    route: "Hải Phòng → Quảng Ninh",
    vehicleType: "Thùng kín",
    lastBid: 1900000,
    status: "SUSPENDED",
  },
];

const mockBidHistory = [
  { time: "10:00", bid: 2500000 },
  { time: "10:05", bid: 2200000 },
  { time: "10:12", bid: 2200000 },
  { time: "10:15", bid: 2100000 },
  { time: "10:20", bid: 2100000 },
  { time: "10:22", bid: 1950000 },
  { time: "10:30", bid: 1950000 },
  { time: "10:35", bid: 1850000 },
];

const formatCurrency = (amount) => `${new Intl.NumberFormat("vi-VN").format(amount)} đ`;

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <Box sx={{ bgcolor: "background.paper", p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: "8px", boxShadow: 2 }}>
      <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mb: 0.5 }}>
        Thời gian: {label}
      </Typography>
      <Typography variant="body2" sx={{ color: "primary.main", fontWeight: 700 }}>
        Giá thầu: {formatCurrency(payload[0].value)}
      </Typography>
    </Box>
  );
}

function SessionStatus({ status, timeRemaining }) {
  if (status === "ACTIVE") {
    return <AdminStatusChip label={timeRemaining} tone="warning" icon={<AccessTimeIcon />} />;
  }
  return <AdminStatusChip label="Tạm dừng" tone="danger" />;
}

export default function AdminOperationsPage() {
  const [selectedSession, setSelectedSession] = useState(liveSessions[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [openStopDialog, setOpenStopDialog] = useState(false);

  const filteredSessions = liveSessions.filter((session) => {
    const query = searchQuery.trim().toLocaleLowerCase("vi");
    return query.length === 0 || session.id.toLocaleLowerCase("vi").includes(query) || session.route.toLocaleLowerCase("vi").includes(query);
  });

  const activeCount = liveSessions.filter((session) => session.status === "ACTIVE").length;
  const selectedBid = selectedSession.currentBid || selectedSession.lastBid;

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Giám sát đấu giá"
        subtitle="Theo dõi phiên đang diễn ra, diễn biến giá và các thao tác can thiệp của quản trị viên."
        breadcrumbs={[
          { label: "Admin", path: "/admin" },
          { label: "Vận hành", path: "/admin/operations" },
          { label: "Đấu giá" },
        ]}
        action={
          <Box sx={{ display: "flex", gap: 1.5, width: { xs: "100%", md: "auto" }, flexWrap: "wrap" }}>
            <AdminSearchField
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Tìm mã phiên, tuyến..."
            />
            <AdminSecondaryButton startIcon={<FilterListIcon />}>Lọc</AdminSecondaryButton>
          </Box>
        }
      />

      <Grid container spacing={2.5}>
        <Grid item xs={12} md={5} lg={4}>
          <AdminSectionCard
            title="Phiên đang theo dõi"
            subtitle={`${activeCount} phiên đang hoạt động`}
            sx={{ height: "100%" }}
          >
            <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
              {filteredSessions.map((session) => {
                const isSelected = selectedSession.id === session.id;
                const isActive = session.status === "ACTIVE";

                return (
                  <Box
                    key={session.id}
                    component="button"
                    type="button"
                    onClick={() => setSelectedSession(session)}
                    sx={{
                      width: "100%",
                      textAlign: "left",
                      cursor: "pointer",
                      border: "1px solid",
                      borderColor: isSelected ? "primary.main" : "divider",
                      bgcolor: isSelected ? "rgba(27, 73, 101, 0.08)" : "background.paper",
                      borderRadius: "10px",
                      p: 2,
                      transition: "all 0.2s ease",
                      "&:hover": { borderColor: "primary.main", bgcolor: isSelected ? "rgba(27, 73, 101, 0.08)" : "rgba(27, 73, 101, 0.04)" },
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1.5 }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: isSelected ? "primary.main" : "text.secondary", fontWeight: 700 }}>
                          {session.id}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 600, mt: 0.25 }}>
                          {session.route}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                          {session.vehicleType}
                        </Typography>
                      </Box>
                      <SessionStatus status={session.status} timeRemaining={session.timeRemaining} />
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", mt: 2 }}>
                      <Box>
                        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                          {isActive ? "Giá thấp nhất" : "Giá cuối cùng"}
                        </Typography>
                        <Typography variant="h6" sx={{ color: "primary.main", fontWeight: 800, lineHeight: 1.1 }}>
                          {formatCurrency(session.currentBid || session.lastBid)}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: "right" }}>
                        <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                          Tham gia
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 600 }}>
                          {isActive ? `${session.activeBidders} nhà xe` : "--"}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </AdminSectionCard>
        </Grid>

        <Grid item xs={12} md={7} lg={8}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, height: "100%" }}>
            <AdminSectionCard
              title="Biểu đồ giá thầu realtime"
              subtitle={`Phiên ${selectedSession.id} • Giá khởi điểm ${formatCurrency(2500000)}`}
              action={<AdminStatusChip label="-26% so với ban đầu" tone="success" />}
              sx={{ flex: 1, minHeight: 420 }}
            >
              <Box sx={{ p: 2.5, height: 360 }}>
                {selectedSession.status === "ACTIVE" ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockBidHistory} margin={{ top: 20, right: 24, left: 12, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: "#64748B", fontSize: 12 }} dy={10} />
                      <YAxis
                        domain={["dataMin - 100000", "dataMax + 100000"]}
                        tickFormatter={(value) => `${value / 1000}k`}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#64748B", fontSize: 12 }}
                        dx={-10}
                      />
                      <RechartsTooltip content={<ChartTooltip />} />
                      <Line
                        type="stepAfter"
                        dataKey="bid"
                        stroke="#1B4965"
                        strokeWidth={3}
                        dot={{ r: 4, fill: "#1B4965", strokeWidth: 2, stroke: "#FFFFFF" }}
                        activeDot={{ r: 6, fill: "#62B6CB", strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ height: "100%", display: "grid", placeItems: "center", textAlign: "center", color: "text.secondary" }}>
                    <Box>
                      <BlockIcon sx={{ fontSize: 46, color: "text.disabled", mb: 1 }} />
                      <Typography variant="body2">Phiên đấu giá đã bị tạm dừng, biểu đồ không khả dụng.</Typography>
                    </Box>
                  </Box>
                )}
              </Box>
            </AdminSectionCard>

            <AdminSectionCard title="Thao tác giám sát" subtitle={`Phiên hiện tại: ${selectedSession.id} • ${formatCurrency(selectedBid)}`}>
              <Box sx={{ p: 2.5 }}>
                <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, gap: 1.5 }}>
                  <AdminSecondaryButton startIcon={<GavelIcon />} sx={{ flex: 1, borderColor: "warning.main", color: "warning.dark" }}>
                    Cảnh báo gian lận
                  </AdminSecondaryButton>
                  <AdminPrimaryButton
                    startIcon={<BlockIcon />}
                    onClick={() => setOpenStopDialog(true)}
                    disabled={selectedSession.status !== "ACTIVE"}
                    sx={{ flex: 1, bgcolor: "error.main", "&:hover": { bgcolor: "error.dark" } }}
                  >
                    Dừng phiên khẩn cấp
                  </AdminPrimaryButton>
                </Box>

                <Box
                  sx={{
                    mt: 2,
                    p: 1.5,
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: "10px",
                    bgcolor: "rgba(27, 73, 101, 0.02)",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1,
                    color: "text.secondary",
                  }}
                >
                  <InfoOutlinedIcon fontSize="small" sx={{ mt: 0.2 }} />
                  <Typography variant="body2">
                    Dừng khẩn cấp sẽ tạm ngưng phiên và thông báo cho các nhà xe đang tham gia. Cảnh báo gian lận chỉ
                    đánh dấu phiên để kiểm tra sau khi kết thúc.
                  </Typography>
                </Box>
              </Box>
            </AdminSectionCard>
          </Box>
        </Grid>
      </Grid>

      <Dialog
        open={openStopDialog}
        onClose={() => setOpenStopDialog(false)}
        PaperProps={{ sx: { borderRadius: "12px", maxWidth: 460 } }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, color: "error.dark", fontWeight: 700 }}>
          <ErrorOutlineIcon color="error" /> Xác nhận dừng khẩn cấp
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Bạn có chắc chắn muốn dừng phiên đấu giá <strong>{selectedSession.id}</strong> không?
          </Typography>
          <Box sx={{ mt: 2, p: 1.5, border: "1px solid", borderColor: "error.light", borderRadius: "10px", bgcolor: "rgba(211, 47, 47, 0.04)" }}>
            <Typography variant="caption" sx={{ color: "error.dark", fontWeight: 600 }}>
              Hành động này sẽ hủy mọi kết quả đang diễn ra và gửi thông báo đến toàn bộ nhà xe đang tham gia.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <AdminSecondaryButton onClick={() => setOpenStopDialog(false)}>Hủy bỏ</AdminSecondaryButton>
          <AdminPrimaryButton
            onClick={() => {
              setOpenStopDialog(false);
              alert("Đã dừng phiên khẩn cấp.");
            }}
            sx={{ bgcolor: "error.main", "&:hover": { bgcolor: "error.dark" } }}
          >
            Đồng ý dừng
          </AdminPrimaryButton>
        </DialogActions>
      </Dialog>
    </AdminPageShell>
  );
}
