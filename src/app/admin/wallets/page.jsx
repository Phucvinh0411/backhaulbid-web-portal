"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Alert from "@mui/material/Alert";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import {
  AdminDialog,
  AdminPageHeader,
  AdminMetricCard,
  AdminPageShell,
  AdminPrimaryButton,
  AdminSearchField,
  AdminSecondaryButton,
  AdminSectionCard,
  AdminStatusChip,
  AdminTableContainer,
  AdminToolbar,
} from "@/components/admin/AdminUI";
import { walletApi } from "@/services/walletApi";
import { getPageItems, getPageMeta, toWithdrawalApiStatus } from "@/services/responseData";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(Number(amount) || 0);

const formatDate = (dateStr) =>
  dateStr ? new Date(dateStr).toLocaleString("vi-VN") : "---";

export default function AdminWalletsPage() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [filterStatus, setFilterStatus] = useState("PENDING");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // Dialog actions
  const [selectedItem, setSelectedItem] = useState(null);
  const [openApproveDialog, setOpenApproveDialog] = useState(false);
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [summaryRes, withdrawalsRes] = await Promise.all([
        walletApi.getAdminSummary().catch(() => null),
        walletApi.getAdminWithdrawals({
          status: toWithdrawalApiStatus(filterStatus),
          page: page + 1,
          pageSize,
        }),
      ]);

      if (summaryRes) setSummary(summaryRes);
      if (withdrawalsRes) {
        setWithdrawals(getPageItems(withdrawalsRes));
        setTotalItems(getPageMeta(withdrawalsRes).totalItems);
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Không thể tải danh sách yêu cầu rút tiền.");
    } finally {
      setLoading(false);
    }
  }, [filterStatus, page, pageSize]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return withdrawals;
    const q = searchQuery.toLowerCase();
    return withdrawals.filter(
      (item) =>
        (item.accountHolderName && item.accountHolderName.toLowerCase().includes(q)) ||
        (item.maskedBankAccountNumber && item.maskedBankAccountNumber.toLowerCase().includes(q)) ||
        (item.bankName && item.bankName.toLowerCase().includes(q)) ||
        (item.id && item.id.toLowerCase().includes(q))
    );
  }, [withdrawals, searchQuery]);

  const handleOpenApprove = (item) => {
    setSelectedItem(item);
    setOpenApproveDialog(true);
  };

  const handleConfirmApprove = async () => {
    if (!selectedItem) return;
    setActionLoading(true);
    setError("");
    try {
      await walletApi.approveAdminWithdrawal(selectedItem.id);
      setSuccessMsg(`Đã phê duyệt yêu cầu rút tiền ${formatCurrency(selectedItem.amount)} thành công!`);
      setOpenApproveDialog(false);
      setSelectedItem(null);
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || "Không thể duyệt yêu cầu rút tiền.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenReject = (item) => {
    setSelectedItem(item);
    setRejectionReason("");
    setOpenRejectDialog(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedItem) return;
    if (!rejectionReason.trim()) {
      setError("Vui lòng nhập lý do từ chối yêu cầu rút tiền.");
      return;
    }
    setActionLoading(true);
    setError("");
    try {
      await walletApi.rejectAdminWithdrawal(selectedItem.id, rejectionReason.trim());
      setSuccessMsg(`Đã từ chối yêu cầu rút tiền. Số tiền đã được hoàn lại ví của người dùng.`);
      setOpenRejectDialog(false);
      setSelectedItem(null);
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || "Không thể từ chối yêu cầu rút tiền.");
    } finally {
      setActionLoading(false);
    }
  };

  const renderStatus = (status) => {
    switch (status) {
      case "PENDING":
        return <AdminStatusChip label="Chờ xử lý" tone="warning" />;
      case "APPROVED":
      case "COMPLETED":
        return <AdminStatusChip label="Đã hoàn thành" tone="success" />;
      case "REJECTED":
        return <AdminStatusChip label="Đã từ chối" tone="danger" />;
      default:
        return <AdminStatusChip label={status} tone="neutral" />;
    }
  };

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Quản lý rút tiền ví"
        subtitle="Xét duyệt và quản lý yêu cầu rút tiền về tài khoản ngân hàng của nhà xe và chủ hàng."
        breadcrumbs={[{ label: "Admin", path: "/admin" }, { label: "Vận hành" }, { label: "Rút tiền ví" }]}
      />

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <AdminMetricCard
            title="Phí sàn đã thu"
            value={formatCurrency(summary?.auctionFees ?? summary?.totalFeesCollected)}
            helper="Từ giao dịch đấu giá"
            icon={PaidOutlinedIcon}
            tone="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <AdminMetricCard
            title="Yêu cầu chờ duyệt"
            value={filterStatus === "PENDING" ? totalItems : summary?.pendingWithdrawalsCount ?? "—"}
            helper="Cần kiểm tra thủ công"
            icon={HourglassEmptyIcon}
            tone="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={4}>
          <AdminMetricCard
            title="Đã chi trả"
            value={formatCurrency(summary?.withdrawals)}
            helper="Qua SePay Gateway"
            icon={AccountBalanceWalletIcon}
            tone="info"
          />
        </Grid>
      </Grid>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          onClose={() => setError("")}
          action={<AdminSecondaryButton size="small" onClick={loadData}>Thử tải lại</AdminSecondaryButton>}
        >
          {error}
        </Alert>
      )}
      {successMsg && <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccessMsg("")}>{successMsg}</Alert>}

      <AdminSectionCard>
        <AdminToolbar title="Yêu cầu rút tiền" subtitle="Kiểm tra thông tin ngân hàng trước khi phê duyệt giao dịch.">
          <Tabs
            value={filterStatus}
            onChange={(e, val) => {
              setFilterStatus(val);
              setPage(0);
            }}
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab value="PENDING" label="Chờ xử lý (PENDING)" sx={{ fontWeight: 600 }} />
            <Tab value="COMPLETED" label="Đã hoàn thành" sx={{ fontWeight: 600 }} />
            <Tab value="REJECTED" label="Đã từ chối" sx={{ fontWeight: 600 }} />
            <Tab value="ALL" label="Tất cả" sx={{ fontWeight: 600 }} />
          </Tabs>

          <AdminSearchField
            placeholder="Tìm theo tên chủ TK, STK, ngân hàng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ width: { xs: "100%", md: 320 } }}
          />
        </AdminToolbar>

        <AdminTableContainer minWidth={900}>
          <Table sx={{ minWidth: 900 }} aria-label="Danh sách yêu cầu rút tiền" aria-busy={loading}>
            <TableHead sx={{ bgcolor: "#F8FAFC" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Thời gian</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Chủ tài khoản</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Ngân hàng thụ hưởng</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Số tài khoản</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Số tiền rút</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#475569" }}>Trạng thái</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: "#475569" }}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6, color: "#94A3B8" }}>
                    {loading ? "Đang tải dữ liệu yêu cầu rút tiền..." : searchQuery ? "Không tìm thấy yêu cầu phù hợp." : "Không có yêu cầu rút tiền nào trong danh sách."}
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>{formatDate(item.createdAt)}</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: "#1E293B" }}>{item.accountHolderName || "---"}</TableCell>
                    <TableCell>{item.bankName || "---"}</TableCell>
                    <TableCell sx={{ fontFamily: "monospace", fontWeight: 700, color: "#1B4965" }}>
                      {item.maskedBankAccountNumber || "---"}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#0F172A" }}>{formatCurrency(item.amount)}</TableCell>
                    <TableCell>{renderStatus(item.status)}</TableCell>
                    <TableCell align="right">
                      {item.status === "PENDING" ? (
                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                          <AdminPrimaryButton
                            size="small"
                            startIcon={<CheckCircleOutlineIcon />}
                            onClick={() => handleOpenApprove(item)}
                          >
                            Duyệt
                          </AdminPrimaryButton>
                          <AdminSecondaryButton
                            size="small"
                            color="error"
                            startIcon={<CancelOutlinedIcon />}
                            onClick={() => handleOpenReject(item)}
                          >
                            Từ chối
                          </AdminSecondaryButton>
                        </Box>
                      ) : (
                        <Typography variant="caption" sx={{ color: "#64748B" }}>
                          {item.rejectionReason ? `Lý do: ${item.rejectionReason}` : "Đã xử lý"}
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </AdminTableContainer>

        <TablePagination
          component="div"
          count={totalItems}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={pageSize}
          onRowsPerPageChange={(e) => {
            setPageSize(parseInt(e.target.value, 10));
            setPage(0);
          }}
          labelRowsPerPage="Số dòng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} trên tổng ${count}`}
          sx={{ mt: 2 }}
        />
      </AdminSectionCard>

      {/* Dialog Xác nhận Duyệt rút tiền */}
      <AdminDialog open={openApproveDialog} onClose={() => !actionLoading && setOpenApproveDialog(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: "#1B4965" }}>Xác nhận Chuyển tiền Rút</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedItem && (
            <Box className="space-y-3">
              <Typography variant="body2" sx={{ color: "#475569" }}>
                Vui lòng kiểm tra đã chuyển khoản thành công trước khi bấm xác nhận hoàn tất:
              </Typography>
              <Box className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-sm space-y-1">
                <div><strong>Ngân hàng:</strong> {selectedItem.bankName}</div>
                <div><strong>Số tài khoản:</strong> {selectedItem.maskedBankAccountNumber || "---"}</div>
                <div><strong>Chủ tài khoản:</strong> {selectedItem.accountHolderName}</div>
                <div><strong>Số tiền chuyển:</strong> <span className="text-emerald-600 font-bold">{formatCurrency(selectedItem.amount)}</span></div>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <AdminSecondaryButton onClick={() => setOpenApproveDialog(false)} disabled={actionLoading}>
            Hủy bỏ
          </AdminSecondaryButton>
          <AdminPrimaryButton onClick={handleConfirmApprove} disabled={actionLoading}>
            {actionLoading ? "Đang xử lý..." : "Xác nhận Đã chuyển tiền"}
          </AdminPrimaryButton>
        </DialogActions>
      </AdminDialog>

      {/* Dialog Từ chối Rút tiền */}
      <AdminDialog open={openRejectDialog} onClose={() => !actionLoading && setOpenRejectDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: "#DC2626" }}>Từ chối Yêu cầu Rút tiền</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedItem && (
            <Box className="space-y-3">
              <Typography variant="body2" sx={{ color: "#475569" }}>
                Khi từ chối, số tiền <strong>{formatCurrency(selectedItem.amount)}</strong> sẽ tự động được hoàn trả vào số dư khả dụng của người dùng.
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Lý do từ chối"
                placeholder="VD: Số tài khoản ngân hàng không tồn tại hoặc tên chủ tài khoản không khớp..."
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                sx={{ mt: 1 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <AdminSecondaryButton onClick={() => setOpenRejectDialog(false)} disabled={actionLoading}>
            Hủy bỏ
          </AdminSecondaryButton>
          <AdminPrimaryButton
            color="error"
            onClick={handleConfirmReject}
            disabled={actionLoading || !rejectionReason.trim()}
            sx={{ bgcolor: "#DC2626", "&:hover": { bgcolor: "#B91C1C" } }}
          >
            {actionLoading ? "Đang xử lý..." : "Xác nhận Từ chối & Hoàn tiền"}
          </AdminPrimaryButton>
        </DialogActions>
      </AdminDialog>
    </AdminPageShell>
  );
}
