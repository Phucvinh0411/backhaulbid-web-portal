"use client";

import React, { useState } from "react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Typography from "@mui/material/Typography";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {
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

const mockUsers = [
  {
    id: "USR-001",
    name: "Công ty Vận tải ABC",
    type: "Doanh nghiệp",
    email: "contact@abc.vn",
    phone: "0901112223",
    registeredAt: "08/08/2026",
    status: "PENDING",
    avatar: "A",
  },
  {
    id: "USR-002",
    name: "Hộ kinh doanh Lê Văn Định",
    type: "Cá nhân",
    email: "dinh.le@gmail.com",
    phone: "0988777666",
    registeredAt: "05/08/2026",
    status: "VERIFIED",
    avatar: "Đ",
  },
  {
    id: "USR-003",
    name: "Vận tải Toàn Cầu",
    type: "Doanh nghiệp",
    email: "info@toancau.vn",
    phone: "0912223334",
    registeredAt: "01/08/2026",
    status: "REJECTED",
    avatar: "T",
  },
  {
    id: "USR-004",
    name: "Trần Thị Lan",
    type: "Cá nhân",
    email: "lan.tran@gmail.com",
    phone: "0934123456",
    registeredAt: "10/08/2026",
    status: "PENDING",
    avatar: "L",
  },
  {
    id: "USR-005",
    name: "Công ty Vận tải Hải Vân",
    type: "Doanh nghiệp",
    email: "contact@haivan.vn",
    phone: "0905123456",
    registeredAt: "12/08/2026",
    status: "VERIFIED",
    avatar: "H",
  },
  {
    id: "USR-006",
    name: "Hoàng Phát Logistics",
    type: "Doanh nghiệp",
    email: "info@hoangphat.vn",
    phone: "0987654321",
    registeredAt: "14/08/2026",
    status: "PENDING",
    avatar: "P",
  },
];

const typeOptions = [
  { value: "all", label: "Tất cả" },
  { value: "Cá nhân", label: "Cá nhân" },
  { value: "Doanh nghiệp", label: "Doanh nghiệp" },
];

function StatusChip({ status }) {
  switch (status) {
    case "PENDING":
      return <AdminStatusChip label="Chờ duyệt eKYC" tone="warning" />;
    case "VERIFIED":
      return <AdminStatusChip label="Đã xác minh" tone="success" />;
    case "REJECTED":
      return <AdminStatusChip label="Từ chối" tone="danger" />;
    default:
      return <AdminStatusChip label={status || "Không rõ"} />;
  }
}

export default function AdminUsersPage() {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  const filteredUsers = mockUsers.filter((user) => {
    const query = searchQuery.trim().toLocaleLowerCase("vi");
    const matchesType = filterType === "all" || user.type === filterType;
    const matchesSearch =
      query.length === 0 ||
      user.name.toLocaleLowerCase("vi").includes(query) ||
      user.email.toLocaleLowerCase("vi").includes(query) ||
      user.id.toLocaleLowerCase("vi").includes(query);

    return matchesType && matchesSearch;
  });

  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("name");

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const sortedUsers = React.useMemo(() => {
    let result = [...filteredUsers];
    result.sort((a, b) => {
      let comparison = String(a[orderBy] || "").localeCompare(String(b[orderBy] || ""));
      return order === "desc" ? -comparison : comparison;
    });
    return result;
  }, [filteredUsers, order, orderBy]);

  const paginatedUsers = sortedUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const openUserDialog = (user) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Quản lý người dùng & eKYC"
        subtitle="Theo dõi hồ sơ xác minh của chủ hàng, nhà xe và doanh nghiệp vận tải."
        breadcrumbs={[
          { label: "Admin", path: "/admin" },
          { label: "Người dùng" },
        ]}
      />

      <AdminSectionCard sx={{ flex: 1 }}>
        <AdminToolbar title="Danh sách người dùng" subtitle={`${filteredUsers.length} hồ sơ phù hợp`}>
          <AdminSearchField
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setPage(0);
            }}
            placeholder="Tìm tên, email, mã hồ sơ..."
          />
          <AdminSelectField
            value={filterType}
            onChange={(event) => {
              setFilterType(event.target.value);
              setPage(0);
            }}
            options={typeOptions}
          />
        </AdminToolbar>

        <TableContainer>
          <Table aria-label="Danh sách người dùng">
            <TableHead sx={{ bgcolor: "rgba(27, 73, 101, 0.04)" }}>
              <TableRow>
                {[{id: 'name', label: 'Người dùng'}, {id: 'email', label: 'Liên hệ'}, {id: 'type', label: 'Loại hình'}, {id: 'registeredAt', label: 'Ngày đăng ký'}, {id: 'status', label: 'Trạng thái'}, {id: 'actions', label: 'Hành động', align: 'right', sortable: false}].map(col => (
                  <TableCell key={col.id} align={col.align || 'left'} sx={{ fontWeight: 600, color: "text.secondary" }}>
                    {col.sortable !== false ? (
                      <TableSortLabel
                        active={orderBy === col.id}
                        direction={orderBy === col.id ? order : "asc"}
                        onClick={() => handleRequestSort(col.id)}
                      >
                        {col.label}
                      </TableSortLabel>
                    ) : col.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedUsers.map((row) => (
                <TableRow key={row.id} hover sx={{ "&:last-child td": { borderBottom: 0 } }}>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <Avatar sx={{ bgcolor: "primary.main", width: 38, height: 38, fontWeight: 700 }}>
                        {row.avatar}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ color: "primary.main", fontWeight: 700 }}>
                          {row.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "text.disabled", fontWeight: 600 }}>
                          {row.id}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 600 }}>
                      {row.email}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                      {row.phone}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <AdminStatusChip label={row.type} tone="neutral" />
                  </TableCell>
                  <TableCell sx={{ color: "text.secondary" }}>{row.registeredAt}</TableCell>
                  <TableCell>
                    <StatusChip status={row.status} />
                  </TableCell>
                  <TableCell align="right">
                    {row.status === "PENDING" ? (
                      <AdminPrimaryButton size="small" onClick={() => openUserDialog(row)}>
                        Xét duyệt
                      </AdminPrimaryButton>
                    ) : (
                      <IconButton size="small" onClick={() => openUserDialog(row)} sx={{ color: "text.secondary" }}>
                        <VisibilityOutlinedIcon fontSize="small" />
                      </IconButton>
                    )}
                    <IconButton size="small" sx={{ color: "text.disabled", ml: 0.5 }}>
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredUsers.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, nextPage) => setPage(nextPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          sx={{ borderTop: "1px solid", borderColor: "divider", bgcolor: "rgba(27, 73, 101, 0.02)" }}
        />
      </AdminSectionCard>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: "12px" } }}
      >
        <DialogTitle sx={{ borderBottom: "1px solid", borderColor: "divider", py: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Avatar sx={{ bgcolor: "rgba(27, 73, 101, 0.08)", color: "primary.main", fontWeight: 700 }}>
              {selectedUser?.avatar}
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ color: "text.primary", fontWeight: 700 }}>
                Chi tiết hồ sơ eKYC
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                {selectedUser?.name}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={5}>
              <Typography variant="subtitle2" sx={{ color: "text.secondary", fontWeight: 700, mb: 1.5 }}>
                Thông tin chung
              </Typography>
              <Box sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: "10px", bgcolor: "rgba(27, 73, 101, 0.02)" }}>
                {[
                  ["Tên hiển thị", selectedUser?.name],
                  ["Email", selectedUser?.email],
                  ["Số điện thoại", selectedUser?.phone],
                  ["Loại hình", selectedUser?.type],
                ].map(([label, value]) => (
                  <Box key={label} sx={{ py: 1, borderBottom: label === "Loại hình" ? "none" : "1px solid", borderColor: "divider" }}>
                    <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                      {label}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.primary", fontWeight: 600 }}>
                      {value}
                    </Typography>
                  </Box>
                ))}
                <Box sx={{ pt: 1.25 }}>
                  <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600, display: "block", mb: 0.75 }}>
                    Trạng thái
                  </Typography>
                  <StatusChip status={selectedUser?.status} />
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={7}>
              <Typography variant="subtitle2" sx={{ color: "text.secondary", fontWeight: 700, mb: 1.5 }}>
                Tài liệu eKYC
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                {["CCCD mặt trước", "CCCD mặt sau"].map((label) => (
                  <Box
                    key={label}
                    sx={{
                      height: 140,
                      border: "1px dashed",
                      borderColor: "divider",
                      borderRadius: "10px",
                      bgcolor: "background.paper",
                      display: "grid",
                      placeItems: "center",
                      color: "text.secondary",
                      fontWeight: 600,
                    }}
                  >
                    {label}
                  </Box>
                ))}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid", borderColor: "divider", bgcolor: "rgba(27, 73, 101, 0.02)" }}>
          <AdminSecondaryButton onClick={() => setOpenDialog(false)}>Đóng</AdminSecondaryButton>
          {selectedUser?.status === "PENDING" && (
            <AdminPrimaryButton onClick={() => setOpenDialog(false)}>Phê duyệt</AdminPrimaryButton>
          )}
        </DialogActions>
      </Dialog>
    </AdminPageShell>
  );
}
