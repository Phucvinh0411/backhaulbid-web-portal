"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import {
  AdminPageHeader,
  AdminPageShell,
  AdminSecondaryButton,
  AdminSectionCard,
  AdminStatusChip,
} from "@/components/admin/AdminUI";
import { identityApi } from "@/services/identityApi";
import { getAdminDriverReviews, getAdminVehicleReviews } from "@/services/fleetApi";
import { listAuctions } from "@/services/biddingApi";
import { walletApi } from "@/services/walletApi";
import { unwrapListData } from "@/services/responseData";

const reviewTone = (status) => status === "PENDING" ? "warning" : status === "VERIFIED" ? "success" : "danger";

export default function AdminDashboardPage() {
  const [data, setData] = useState({ accounts: [], openAuctions: [], pendingAuctions: [], vehicles: [], drivers: [], walletSummary: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([
      identityApi.listAdminAccounts(),
      listAuctions({ status: "OPEN", page: 1, pageSize: 100 }),
      listAuctions({ status: "PENDING", page: 1, pageSize: 100 }),
      getAdminVehicleReviews("PENDING"),
      getAdminDriverReviews("PENDING"),
      walletApi.getAdminSummary(),
    ])
      .then(([accounts, openAuctions, pendingAuctions, vehicles, drivers, walletSummary]) => {
        if (!active) return;
        setData({ accounts: accounts || [], openAuctions: unwrapListData(openAuctions), pendingAuctions: unwrapListData(pendingAuctions), vehicles: vehicles || [], drivers: drivers || [], walletSummary });
      })
      .catch((requestError) => {
        if (active) setError(requestError?.response?.data?.message || "Không thể tải dữ liệu tổng quan admin.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const reviewRows = useMemo(() => [
    ...data.vehicles.map((vehicle) => ({ id: vehicle.id, type: "Xe", subject: vehicle.licensePlate || "Chưa có biển số", owner: vehicle.carrierId || "Chưa cập nhật", status: vehicle.status || vehicle.verificationStatus })),
    ...data.drivers.map((driver) => ({ id: driver.id, type: "Tài xế", subject: driver.fullName || "Chưa có tên", owner: driver.phone || "Chưa cập nhật", status: driver.status })),
  ], [data.drivers, data.vehicles]);

  if (loading) return <AdminPageShell><Box className="flex min-h-[320px] items-center justify-center gap-2 text-slate-500"><CircularProgress size={24} /> Đang tải tổng quan admin...</Box></AdminPageShell>;
  if (error) return <AdminPageShell><Alert severity="error">{error}</Alert></AdminPageShell>;

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Bảng điều khiển Admin"
        subtitle="Theo dõi dữ liệu tài khoản, đấu giá và các hồ sơ cần duyệt từ các service thật."
        breadcrumbs={[{ label: "Admin", path: "/admin" }, { label: "Tổng quan" }]}
        action={<AdminSecondaryButton component={Link} href="/admin/fleet-verifications">Mở duyệt đội xe</AdminSecondaryButton>}
      />

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}><Stat title="Tổng người dùng" value={data.accounts.length} subtitle="Tài khoản identity service" icon={GroupsOutlinedIcon} tone="primary" /></Grid>
        <Grid item xs={12} md={3}><Stat title="Phiên đang mở" value={data.openAuctions.length} subtitle={`${data.pendingAuctions.length} phiên đang chờ mở`} icon={GavelOutlinedIcon} tone="info" /></Grid>
        <Grid item xs={12} md={3}><Stat title="Hồ sơ chờ duyệt" value={reviewRows.length} subtitle={`${data.vehicles.length} xe · ${data.drivers.length} tài xế`} icon={VerifiedUserOutlinedIcon} tone="warning" /></Grid>
        <Grid item xs={12} md={3}><Stat title="Phí đấu giá" value={formatCurrency(data.walletSummary?.auctionFees)} subtitle={`${data.walletSummary?.successfulTransactions || 0} giao dịch thành công`} icon={AccountBalanceOutlinedIcon} tone="neutral" /></Grid>
      </Grid>

      <AdminSectionCard
        title="Hồ sơ đội xe cần xử lý"
        subtitle={reviewRows.length ? `${reviewRows.length} hồ sơ đang ở trạng thái PENDING` : "Không có hồ sơ PENDING trong dữ liệu hiện tại."}
        action={<AdminSecondaryButton component={Link} href="/admin/fleet-verifications" size="small">Xem tất cả</AdminSecondaryButton>}
      >
        {reviewRows.length === 0 ? <Box className="p-10 text-center text-slate-500">Không có tác vụ cần xử lý.</Box> : <TableContainer><Table aria-label="Hồ sơ đội xe cần xử lý"><TableHead sx={{ bgcolor: "rgba(27, 73, 101, 0.04)" }}><TableRow><TableCell sx={{ fontWeight: 700 }}>Loại hồ sơ</TableCell><TableCell sx={{ fontWeight: 700 }}>Đối tượng</TableCell><TableCell sx={{ fontWeight: 700 }}>Chủ hồ sơ / liên hệ</TableCell><TableCell sx={{ fontWeight: 700 }}>Trạng thái</TableCell><TableCell align="right" sx={{ fontWeight: 700 }}>Thao tác</TableCell></TableRow></TableHead><TableBody>{reviewRows.slice(0, 10).map((row) => <TableRow key={`${row.type}-${row.id}`} hover><TableCell>{row.type}</TableCell><TableCell sx={{ fontWeight: 700, color: "primary.main" }}>{row.subject}</TableCell><TableCell sx={{ color: "text.secondary" }}>{row.owner}</TableCell><TableCell><AdminStatusChip label={row.status || "PENDING"} tone={reviewTone(row.status)} /></TableCell><TableCell align="right"><AdminSecondaryButton component={Link} href="/admin/fleet-verifications" size="small">Mở duyệt</AdminSecondaryButton></TableCell></TableRow>)}</TableBody></Table></TableContainer>}
      </AdminSectionCard>

      <Box className="rounded-xl border border-slate-200 bg-slate-50 p-4"><Typography variant="body2" className="text-slate-600"><strong>Wallet sandbox:</strong> số liệu lấy từ giao dịch SUCCESS; việc chuyển tiền ra ngân hàng vẫn là quy trình duyệt thủ công.</Typography></Box>
    </AdminPageShell>
  );
}

function formatCurrency(value) {
  if (value == null) return "Chưa có";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(Number(value) || 0);
}

function Stat({ title, value, subtitle, icon: Icon, tone }) {
  const styles = {
    primary: { bg: "#EAF4F8", color: "#1B4965" },
    info: { bg: "#EFF6FF", color: "#1D4ED8" },
    warning: { bg: "#FFFBEB", color: "#B45309" },
    neutral: { bg: "#F8FAFC", color: "#475569" },
  };
  const style = styles[tone] || styles.primary;
  return <Box className="rounded-2xl border border-slate-200 bg-white/85 p-5 shadow-sm"><Box className="flex items-start justify-between gap-2"><Box><Typography variant="body2" className="font-bold text-slate-500">{title}</Typography><Typography variant="h4" className="mt-2 font-extrabold text-slate-800">{value}</Typography><Typography variant="caption" sx={{ color: style.color }} className="mt-2 block font-bold">{subtitle}</Typography></Box><Box className="flex h-11 w-11 items-center justify-center rounded-xl" sx={{ bgcolor: style.bg, color: style.color }}><Icon fontSize="small" /></Box></Box></Box>;
}
