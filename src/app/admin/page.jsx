"use client";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Chip from "@mui/material/Chip";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { PageHeader, StatCard } from "@/components/common";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";

const stats = [
  {
    title: "Tổng người dùng",
    value: "1,240",
    subtitle: "+5% so với tháng trước",
    icon: LocalShippingOutlinedIcon,
    color: "#1B4965",
  },
  {
    title: "Doanh thu nền tảng",
    value: "850.000.000 ₫",
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
  { id: "#RP-1024", reportedUser: "Nguyễn Văn A", reason: "Phá giá đấu giá", date: "24/10/2026", status: "Chờ xử lý" },
  { id: "#RP-1023", reportedUser: "Công ty Vận tải X", reason: "Không thực hiện đơn hàng", date: "23/10/2026", status: "Chờ xử lý" },
  { id: "#RP-1022", reportedUser: "Trần Thị B", reason: "Thái độ không phù hợp", date: "22/10/2026", status: "Chờ xử lý" },
  { id: "#RP-1021", reportedUser: "Lê Văn C", reason: "Cung cấp thông tin giả", date: "21/10/2026", status: "Đã xử lý" },
];

export default function AdminDashboardPage() {
  return (
    <Box className="animate-fade-in-up">
      <PageHeader
        title="Bảng điều khiển Admin"
        subtitle="Tổng quan hoạt động và các tác vụ cần xử lý trên nền tảng"
        breadcrumbs={[
          { label: "Admin", path: "/admin" },
          { label: "Tổng quan" },
        ]}
        action={
          <Button
            variant="outlined"
            endIcon={<FileDownloadOutlinedIcon />}
            className="!rounded-xl"
            sx={{
              fontWeight: 600,
              fontSize: "0.82rem",
              py: 1,
              px: 2.5,
            }}
          >
            Xuất Báo Cáo
          </Button>
        }
      />

      {/* Stats Grid */}
      <Box className="flex flex-col gap-6 mb-6 mt-6">
        <Grid container spacing={3}>
          {stats.map((stat, index) => (
            <Grid item xs={12} md={4} key={index}>
              <StatCard {...stat} />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Reports Table Section */}
      <Card 
        className="glass"
        sx={{
          borderRadius: "16px",
          boxShadow: "0 8px 32px 0 rgba(27, 73, 101, 0.02)",
        }}
      >
        <CardContent className="!p-0">
          <Box className="p-6 border-b border-slate-100 flex justify-between items-center bg-white/50">
            <Typography variant="h6" className="!font-bold text-slate-800 leading-none">
              Báo cáo vi phạm cần xử lý
            </Typography>
            <Button size="small" sx={{ fontWeight: 600, color: "#1B4965" }}>
              Xem tất cả
            </Button>
          </Box>
          
          <TableContainer>
            <Table sx={{ minWidth: 800 }} aria-label="reports table">
              <TableHead className="bg-slate-50/50">
                <TableRow>
                  <TableCell className="!font-bold !text-slate-500 !py-4">ID Báo cáo</TableCell>
                  <TableCell className="!font-bold !text-slate-500 !py-4">Người bị báo cáo</TableCell>
                  <TableCell className="!font-bold !text-slate-500 !py-4">Lý do</TableCell>
                  <TableCell className="!font-bold !text-slate-500 !py-4">Ngày gửi</TableCell>
                  <TableCell className="!font-bold !text-slate-500 !py-4">Trạng thái</TableCell>
                  <TableCell align="right" className="!font-bold !text-slate-500 !py-4">Hành động</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pendingReports.map((row) => (
                  <TableRow
                    key={row.id}
                    hover
                    className="hover:bg-slate-50/50 transition-colors"
                    sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
                  >
                    <TableCell className="!font-semibold text-slate-700">{row.id}</TableCell>
                    <TableCell className="!font-medium text-[#1B4965]">{row.reportedUser}</TableCell>
                    <TableCell className="text-slate-600">{row.reason}</TableCell>
                    <TableCell className="text-slate-500">{row.date}</TableCell>
                    <TableCell>
                      <Chip 
                        label={row.status} 
                        color={row.status === "Chờ xử lý" ? "warning" : "success"} 
                        size="small" 
                        className="!font-semibold"
                        sx={{ 
                          backgroundColor: row.status === "Chờ xử lý" ? "rgba(245, 158, 11, 0.1)" : "rgba(16, 185, 129, 0.1)",
                          color: row.status === "Chờ xử lý" ? "#D97706" : "#059669",
                          border: "none"
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {row.status === "Chờ xử lý" ? (
                        <Box className="flex justify-end gap-2">
                          <Button 
                            size="small" 
                            variant="outlined" 
                            color="inherit" 
                            className="!border-slate-200 !text-slate-600 hover:!bg-slate-50"
                          >
                            Từ chối
                          </Button>
                          <Button 
                            size="small" 
                            variant="contained" 
                            sx={{ backgroundColor: "#1B4965", "&:hover": { backgroundColor: "#12344D" } }}
                          >
                            Duyệt
                          </Button>
                        </Box>
                      ) : (
                        <Typography variant="body2" className="text-slate-400 italic">
                          Đã hoàn tất
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
