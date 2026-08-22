"use client";

import { useEffect, useMemo, useState } from "react";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Typography from "@mui/material/Typography";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {
  AdminDialog,
  AdminLoadingState,
  AdminTableContainer,
  AdminPageHeader,
  AdminPageShell,
  AdminPrimaryButton,
  AdminSearchField,
  AdminSecondaryButton,
  AdminSectionCard,
  AdminSelectField,
  AdminStatusChip,
  AdminToolbar,
} from "@/components/admin/AdminUI";
import { identityApi } from "@/services/identityApi";

const typeOptions = [
  { value: "all", label: "Tất cả" },
  { value: "CARRIER", label: "Chủ xe" },
  { value: "SHIPPER", label: "Chủ hàng" },
  { value: "DRIVER", label: "Tài xế" },
  { value: "ADMIN", label: "Admin" },
];

const typeLabels = Object.fromEntries(typeOptions.map((item) => [item.value, item.label]));

const formatDate = (value) => (value ? new Date(value).toLocaleDateString("vi-VN") : "Chưa cập nhật");

const getDisplayStatus = (user) => user.verificationStatus || user.status;

function StatusChip({ user }) {
  const status = getDisplayStatus(user);
  const designs = {
    PENDING: ["Chờ duyệt", "warning"],
    VERIFIED: ["Đã xác minh", "success"],
    REJECTED: ["Từ chối", "danger"],
    ACTIVE: ["Đang hoạt động", "success"],
    INACTIVE: ["Chưa kích hoạt", "warning"],
    BLOCKED: ["Đã khóa", "danger"],
  };
  const [label, tone] = designs[status] || [status || "Chưa rõ", "neutral"];
  return <AdminStatusChip label={label} tone={tone} />;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [actionError, setActionError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("displayName");

  useEffect(() => {
    let active = true;
    identityApi
      .listAdminAccounts()
      .then((items) => {
        if (active) setUsers(Array.isArray(items) ? items : []);
      })
      .catch((error) => {
        if (active) setLoadError(error?.response?.data?.message || "Không thể tải danh sách người dùng.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLocaleLowerCase("vi");
    return users.filter((user) => {
      const matchesType = filterType === "all" || user.role === filterType;
      const haystack = [user.displayName, user.email, user.phone, user.id]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("vi");
      return matchesType && (!query || haystack.includes(query));
    });
  }, [filterType, searchQuery, users]);

  const sortedUsers = useMemo(() => {
    return [...filteredUsers].sort((a, b) => {
      const comparison = String(a[orderBy] || "").localeCompare(String(b[orderBy] || ""), "vi");
      return order === "desc" ? -comparison : comparison;
    });
  }, [filteredUsers, order, orderBy]);

  const paginatedUsers = sortedUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const openUserDialog = (user) => {
    setSelectedUser(user);
    setActionError("");
    setOpenDialog(true);
  };

  const handleStatusChange = async (status) => {
    if (!selectedUser) return;
    setActionLoading(true);
    setActionError("");
    try {
      const updated = await identityApi.updateAdminAccountStatus(selectedUser.id, status);
      setUsers((current) => current.map((user) => (user.id === updated.id ? updated : user)));
      setSelectedUser(updated);
    } catch (error) {
      setActionError(error?.response?.data?.message || "Không thể cập nhật trạng thái tài khoản.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <AdminPageShell><AdminLoadingState label="Đang tải người dùng..." /></AdminPageShell>;
  }

  if (loadError) {
    return <AdminPageShell><Alert severity="error">{loadError}</Alert></AdminPageShell>;
  }

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Quản lý người dùng & eKYC"
        subtitle="Theo dõi tài khoản chủ hàng, chủ xe và tài xế từ identity service."
        breadcrumbs={[{ label: "Admin", path: "/admin" }, { label: "Người dùng" }]}
      />
      <AdminSectionCard sx={{ flex: 1 }}>
        <AdminToolbar title="Danh sách người dùng" subtitle={`${filteredUsers.length} hồ sơ phù hợp`}>
          <AdminSearchField value={searchQuery} onChange={(event) => { setSearchQuery(event.target.value); setPage(0); }} placeholder="Tìm tên, email, mã hồ sơ..." />
          <AdminSelectField value={filterType} onChange={(event) => { setFilterType(event.target.value); setPage(0); }} options={typeOptions} />
        </AdminToolbar>
        <AdminTableContainer minWidth={960}>
          <Table aria-label="Danh sách người dùng">
            <TableHead sx={{ bgcolor: "rgba(27, 73, 101, 0.04)" }}>
              <TableRow>
                {[{ id: "displayName", label: "Người dùng" }, { id: "email", label: "Liên hệ" }, { id: "role", label: "Vai trò" }, { id: "registeredAt", label: "Ngày đăng ký" }, { id: "status", label: "Trạng thái" }].map((column) => (
                  <TableCell key={column.id} sx={{ fontWeight: 600, color: "text.secondary" }}>
                    <TableSortLabel active={orderBy === column.id} direction={orderBy === column.id ? order : "asc"} onClick={() => handleRequestSort(column.id)}>{column.label}</TableSortLabel>
                  </TableCell>
                ))}
                <TableCell align="right" sx={{ fontWeight: 600, color: "text.secondary" }}>Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedUsers.map((row) => (
                <TableRow key={row.id} hover>
                  <TableCell><Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}><Avatar sx={{ bgcolor: "primary.main", width: 38, height: 38, fontWeight: 700 }}>{row.displayName?.[0] || "?"}</Avatar><Box><Typography variant="body2" sx={{ color: "primary.main", fontWeight: 700 }}>{row.displayName}</Typography><Typography variant="caption" sx={{ color: "text.disabled", fontWeight: 600 }}>{row.id}</Typography></Box></Box></TableCell>
                  <TableCell><Typography variant="body2" sx={{ fontWeight: 600 }}>{row.email || "Chưa có email"}</Typography><Typography variant="caption" sx={{ color: "text.secondary" }}>{row.phone}</Typography></TableCell>
                  <TableCell><AdminStatusChip label={typeLabels[row.role] || row.role} tone="neutral" /></TableCell>
                  <TableCell sx={{ color: "text.secondary" }}>{formatDate(row.registeredAt)}</TableCell>
                  <TableCell><StatusChip user={row} /></TableCell>
                  <TableCell align="right"><IconButton size="small" onClick={() => openUserDialog(row)} aria-label={`Xem ${row.displayName}`}><VisibilityOutlinedIcon fontSize="small" /></IconButton><IconButton size="small" sx={{ color: "text.disabled", ml: 0.5 }} aria-label="Tùy chọn"><MoreVertIcon fontSize="small" /></IconButton></TableCell>
                </TableRow>
              ))}
              {paginatedUsers.length === 0 && <TableRow><TableCell colSpan={6} align="center" sx={{ py: 6, color: "text.secondary" }}>Không có hồ sơ phù hợp.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </AdminTableContainer>
        <TablePagination rowsPerPageOptions={[5, 10, 25]} component="div" count={filteredUsers.length} rowsPerPage={rowsPerPage} page={page} onPageChange={(_, nextPage) => setPage(nextPage)} onRowsPerPageChange={(event) => { setRowsPerPage(parseInt(event.target.value, 10)); setPage(0); }} />
      </AdminSectionCard>

      <AdminDialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ borderBottom: "1px solid", borderColor: "divider", py: 2 }}><Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}><Avatar sx={{ bgcolor: "rgba(27, 73, 101, 0.08)", color: "primary.main", fontWeight: 700 }}>{selectedUser?.displayName?.[0] || "?"}</Avatar><Box><Typography variant="h6" sx={{ fontWeight: 700 }}>Chi tiết tài khoản</Typography><Typography variant="body2" sx={{ color: "text.secondary" }}>{selectedUser?.displayName}</Typography></Box></Box></DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          {actionError && <Alert severity="error" sx={{ mb: 2 }}>{actionError}</Alert>}
          {selectedUser && <Grid container spacing={3}><Grid item xs={12} md={6}><Typography variant="subtitle2" sx={{ color: "text.secondary", fontWeight: 700, mb: 1.5 }}>Thông tin tài khoản</Typography><Box sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: "10px" }}>{[["Tên hiển thị", selectedUser.displayName], ["Email", selectedUser.email || "Chưa có"], ["Số điện thoại", selectedUser.phone], ["Vai trò", typeLabels[selectedUser.role] || selectedUser.role], ["Ngày đăng ký", formatDate(selectedUser.registeredAt)]].map(([label, value]) => <Box key={label} sx={{ py: 1, borderBottom: "1px solid", borderColor: "divider" }}><Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>{label}</Typography><Typography variant="body2" sx={{ fontWeight: 600 }}>{value}</Typography></Box>)}<Box sx={{ pt: 1.25 }}><Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, display: "block", mb: 0.75 }}>Trạng thái xác minh/tài khoản</Typography><StatusChip user={selectedUser} /></Box></Box></Grid><Grid item xs={12} md={6}><Typography variant="subtitle2" sx={{ color: "text.secondary", fontWeight: 700, mb: 1.5 }}>Dữ liệu xác minh</Typography><Box sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: "10px" }}><Typography variant="body2">Trạng thái eKYC/doanh nghiệp: <strong>{selectedUser.verificationStatus || "Chưa có dữ liệu"}</strong></Typography><Typography variant="body2" sx={{ mt: 1 }}>Doanh nghiệp: <strong>{selectedUser.companyName || "Cá nhân hoặc chưa khai báo"}</strong></Typography></Box></Grid></Grid>}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}><AdminSecondaryButton onClick={() => setOpenDialog(false)}>Đóng</AdminSecondaryButton>{selectedUser && selectedUser.status !== "ACTIVE" && <AdminPrimaryButton disabled={actionLoading} onClick={() => handleStatusChange("ACTIVE")}>{actionLoading ? "Đang cập nhật..." : "Kích hoạt tài khoản"}</AdminPrimaryButton>}{selectedUser && selectedUser.status === "ACTIVE" && <AdminPrimaryButton disabled={actionLoading} onClick={() => handleStatusChange("BLOCKED")} sx={{ bgcolor: "error.main", "&:hover": { bgcolor: "error.dark" } }}>{actionLoading ? "Đang cập nhật..." : "Khóa tài khoản"}</AdminPrimaryButton>}</DialogActions>
      </AdminDialog>
    </AdminPageShell>
  );
}
