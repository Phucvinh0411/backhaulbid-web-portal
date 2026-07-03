"use client";

import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import GroupsOutlinedIcon from "@mui/icons-material/GroupsOutlined";
import { StatCard } from "@/components/common";
import {
  AdminPageHeader,
  AdminPageShell,
  AdminPrimaryButton,
  AdminSecondaryButton,
  AdminSectionCard,
  AdminStatusChip,
} from "@/components/admin/AdminUI";

const stats = [
  {
    title: "Tổng người dùng",
    value: "1,240",
    subtitle: "+5% so với tháng trước",
    icon: GroupsOutlinedIcon,
    color: "#1B4965",
  },
  {
    title: "Doanh thu nền tảng",
    value: "850Tr ₫",
    subtitle: "+12% tăng trưởng",
    icon: AccountBalanceWalletOutlinedIcon,
    color: "#2E7D32",
  },
  {
    title: "Đấu giá thành công",
    value: "3,560",
    subtitle: "+8% tỷ lệ chốt đơn",
    icon: GavelOutlinedIcon,
    color: "#62B6CB",
  },
];

const pendingReports = [
  {
    id: "#RP-1024",
    reportedUser: "Nguyễn Văn A",
    reason: "Phá giá đấu giá",
    date: "24/10/2026",
    status: "PENDING",
  },
  {
    id: "#RP-1023",
    reportedUser: "Công ty Vận tải X",
    reason: "Không thực hiện đơn hàng",
    date: "23/10/2026",
    status: "PENDING",
  },
  {
    id: "#RP-1022",
    reportedUser: "Trần Thị B",
    reason: "Thái độ không phù hợp",
    date: "22/10/2026",
    status: "PENDING",
  },
  {
    id: "#RP-1021",
    reportedUser: "Lê Văn C",
    reason: "Cung cấp thông tin giả",
    date: "21/10/2026",
    status: "RESOLVED",
  },
];

const getReportStatus = (status) => {
  if (status === "PENDING") {
    return <AdminStatusChip label="Chờ xử lý" tone="warning" />;
  }
  return <AdminStatusChip label="Đã xử lý" tone="success" />;
};

export default function AdminDashboardPage() {
  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Bảng điều khiển Admin"
        subtitle="Theo dõi sức khỏe vận hành, doanh thu và các tác vụ cần xử lý trên nền tảng."
        breadcrumbs={[
          { label: "Admin", path: "/admin" },
          { label: "Tổng quan" },
        ]}
        action={
          <AdminSecondaryButton startIcon={<FileDownloadOutlinedIcon />}>
            Xuất báo cáo
          </AdminSecondaryButton>
        }
      />

      <Grid container spacing={3}>
        {stats.map((stat) => (
          <Grid item xs={12} md={4} key={stat.title}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      <AdminSectionCard
        title="Báo cáo vi phạm cần xử lý"
        subtitle="Ưu tiên các hồ sơ mới phát sinh trong ngày."
        action={<AdminSecondaryButton size="small">Xem tất cả</AdminSecondaryButton>}
        sx={{ flex: 1 }}
      >
        <TableContainer>
          <Table aria-label="Báo cáo vi phạm">
            <TableHead sx={{ bgcolor: "rgba(27, 73, 101, 0.04)" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, color: "text.secondary" }}>ID báo cáo</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "text.secondary" }}>Người bị báo cáo</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "text.secondary" }}>Lý do</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "text.secondary" }}>Ngày gửi</TableCell>
                <TableCell sx={{ fontWeight: 600, color: "text.secondary" }}>Trạng thái</TableCell>
                <TableCell align="right" sx={{ fontWeight: 600, color: "text.secondary" }}>
                  Hành động
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingReports.map((row) => (
                <TableRow key={row.id} hover sx={{ "&:last-child td": { borderBottom: 0 } }}>
                  <TableCell sx={{ fontWeight: 700, color: "text.primary" }}>{row.id}</TableCell>
                  <TableCell sx={{ fontWeight: 600, color: "primary.main" }}>{row.reportedUser}</TableCell>
                  <TableCell sx={{ color: "text.secondary" }}>{row.reason}</TableCell>
                  <TableCell sx={{ color: "text.secondary" }}>{row.date}</TableCell>
                  <TableCell>{getReportStatus(row.status)}</TableCell>
                  <TableCell align="right">
                    {row.status === "PENDING" ? (
                      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                        <AdminSecondaryButton size="small">Từ chối</AdminSecondaryButton>
                        <AdminPrimaryButton size="small">Duyệt</AdminPrimaryButton>
                      </Box>
                    ) : (
                      <Typography variant="body2" sx={{ color: "text.disabled", fontStyle: "italic" }}>
                        Đã hoàn tất
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </AdminSectionCard>
    </AdminPageShell>
  );
}
