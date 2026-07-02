"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Grid from "@mui/material/Grid";
import Avatar from "@mui/material/Avatar";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import { PageHeader } from "@/components/common";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import VisibilityIcon from "@mui/icons-material/Visibility";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import IconButton from "@mui/material/IconButton";

const mockUsers = [
  {
    id: "USR-001",
    name: "Công ty Vận tải ABC",
    type: "Doanh nghiệp",
    email: "contact@abc.vn",
    phone: "0901112223",
    registeredAt: "08/08/2026",
    status: "PENDING",
    avatar: "C",
  },
  {
    id: "USR-002",
    name: "Hộ kinh doanh Lê Văn Định",
    type: "Cá nhân",
    email: "dinh.le@gmail.com",
    phone: "0988777666",
    registeredAt: "05/08/2026",
    status: "VERIFIED",
    avatar: "L",
  },
  {
    id: "USR-003",
    name: "Vận tải Toàn Cầu",
    type: "Doanh nghiệp",
    email: "info@toancau.vn",
    phone: "0912223334",
    registeredAt: "01/08/2026",
    status: "REJECTED",
    avatar: "V",
  },
  {
    id: "USR-004",
    name: "Trần Thị Lan",
    type: "Cá nhân",
    email: "lan.tran@gmail.com",
    phone: "0934123456",
    registeredAt: "10/08/2026",
    status: "PENDING",
    avatar: "T",
  },
  {
    id: "USR-005",
    name: "Công ty Vận tải Hải Vân",
    type: "Doanh nghiệp",
    email: "contact@haivan.vn",
    phone: "0905123456",
    registeredAt: "12/08/2026",
    status: "VERIFIED",
    avatar: "C",
  },
  {
    id: "USR-006",
    name: "Hoàng Phát Logistics",
    type: "Doanh nghiệp",
    email: "info@hoangphat.vn",
    phone: "0987654321",
    registeredAt: "14/08/2026",
    status: "PENDING",
    avatar: "H",
  },
];

export default function AdminUsersPage() {
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDetails = (user) => {
    setSelectedUser(user);
    setOpenDialog(true);
  };

  const getStatusChip = (status) => {
    switch (status) {
      case "PENDING":
        return (
          <Chip 
            label="Chờ duyệt eKYC" 
            size="small" 
            sx={{ backgroundColor: "rgba(245, 158, 11, 0.1)", color: "#D97706", fontWeight: 600, border: "none" }} 
          />
        );
      case "VERIFIED":
        return (
          <Chip 
            label="Đã xác minh" 
            size="small" 
            sx={{ backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#059669", fontWeight: 600, border: "none" }} 
          />
        );
      case "REJECTED":
        return (
          <Chip 
            label="Từ chối" 
            size="small" 
            sx={{ backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#DC2626", fontWeight: 600, border: "none" }} 
          />
        );
      default:
        return <Chip label={status} size="small" />;
    }
  };

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          user.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || user.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <Box className="animate-fade-in-up">
      <PageHeader 
        title="Quản lý Người dùng & eKYC" 
        subtitle="Quản lý và xác minh hồ sơ eKYC của chủ xe và doanh nghiệp vận tải"
        breadcrumbs={[
          { label: "Admin", path: "/admin" },
          { label: "Vận hành", path: "/admin/operations" },
          { label: "Người dùng" },
        ]}
      />

      <Card 
        className="glass mt-6"
        sx={{
          borderRadius: "16px",
          boxShadow: "0 8px 32px 0 rgba(27, 73, 101, 0.02)",
        }}
      >
        <Box className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center bg-white/50 gap-4">
          <Typography variant="h6" className="!font-bold text-slate-700 leading-none mb-1 md:mb-0">
            Danh sách Người dùng
          </Typography>
          <Box className="flex gap-4 w-full md:w-auto">
            <TextField
              size="small"
              placeholder="Tìm kiếm mã, tên, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: "#94A3B8" }} />
                  </InputAdornment>
                ),
                className: "!rounded-xl bg-white",
              }}
              sx={{ minWidth: { xs: "100%", md: 280 } }}
            />
            <TextField
              select
              size="small"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              InputProps={{ className: "!rounded-xl bg-white" }}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="all">Tất cả loại hình</MenuItem>
              <MenuItem value="Cá nhân">Cá nhân</MenuItem>
              <MenuItem value="Doanh nghiệp">Doanh nghiệp</MenuItem>
            </TextField>
          </Box>
        </Box>

        <TableContainer>
          <Table aria-label="users table">
            <TableHead sx={{ backgroundColor: "rgba(241, 245, 249, 0.5)" }}>
              <TableRow>
                <TableCell className="!font-bold !text-slate-500 !py-4 pl-6">Người dùng</TableCell>
                <TableCell className="!font-bold !text-slate-500 !py-4">Liên hệ</TableCell>
                <TableCell className="!font-bold !text-slate-500 !py-4">Loại hình</TableCell>
                <TableCell className="!font-bold !text-slate-500 !py-4">Trạng thái eKYC</TableCell>
                <TableCell className="!font-bold !text-slate-500 !py-4">Ngày đăng ký</TableCell>
                <TableCell className="!font-bold !text-slate-500 !py-4 text-right pr-6">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => (
                <TableRow 
                  key={row.id} 
                  hover
                  sx={{ "&:last-child td, &:last-child th": { border: 0 }, transition: "all 0.2s" }}
                >
                  <TableCell className="pl-6">
                    <Box className="flex items-center gap-3">
                      <Avatar sx={{ bgcolor: "#1B4965", width: 40, height: 40, fontSize: "1rem", fontWeight: 600 }}>
                        {row.avatar}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" className="font-bold text-[#1B4965]">
                          {row.name}
                        </Typography>
                        <Typography variant="caption" className="text-slate-400">
                          {row.id}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" className="font-medium text-slate-700">{row.email}</Typography>
                    <Typography variant="caption" className="text-slate-500">{row.phone}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={row.type} 
                      size="small" 
                      variant="outlined" 
                      className="!text-slate-600 !border-slate-200 bg-white" 
                    />
                  </TableCell>
                  <TableCell>{getStatusChip(row.status)}</TableCell>
                  <TableCell>
                    <Typography variant="body2" className="text-slate-600">{row.registeredAt}</Typography>
                  </TableCell>
                  <TableCell align="right" className="pr-6">
                    {row.status === "PENDING" ? (
                      <Button 
                        size="small" 
                        variant="contained"
                        sx={{ backgroundColor: "#1B4965", "&:hover": { backgroundColor: "#12344D" }, borderRadius: "8px", textTransform: "none" }}
                        onClick={() => handleOpenDetails(row)}
                      >
                        Xét duyệt
                      </Button>
                    ) : (
                      <IconButton size="small" onClick={() => handleOpenDetails(row)} sx={{ color: "#94A3B8", "&:hover": { color: "#1B4965" } }}>
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    )}
                    <IconButton size="small" sx={{ ml: 1, color: "#94A3B8", "&:hover": { color: "#F43F5E" } }}>
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
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số dòng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} trên ${count}`}
          sx={{ borderTop: "1px solid rgba(226, 232, 240, 0.5)" }}
        />
      </Card>

      {/* eKYC Details Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth PaperProps={{ className: "rounded-2xl" }}>
        <DialogTitle className="text-[#1B4965] font-bold border-b border-slate-100 flex items-center gap-3 py-4">
          <Avatar sx={{ bgcolor: "rgba(27, 73, 101, 0.1)", color: "#1B4965", width: 40, height: 40 }}>
            {selectedUser?.avatar}
          </Avatar>
          Chi tiết hồ sơ: {selectedUser?.name}
        </DialogTitle>
        <DialogContent className="pt-6">
          <Grid container spacing={4}>
            <Grid item xs={12} md={5} className="space-y-4">
              <Typography variant="subtitle2" className="text-slate-500 uppercase tracking-wider font-bold">Thông tin chung</Typography>
              <Box className="bg-slate-50 p-4 rounded-xl space-y-3 border border-slate-100">
                <Box>
                  <Typography variant="caption" className="text-slate-400 block mb-0.5">Tên hiển thị</Typography>
                  <Typography variant="body2" className="font-semibold text-slate-800">{selectedUser?.name}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-slate-400 block mb-0.5">Loại hình</Typography>
                  <Typography variant="body2" className="text-slate-700">{selectedUser?.type}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-slate-400 block mb-0.5">Số điện thoại</Typography>
                  <Typography variant="body2" className="text-slate-700">{selectedUser?.phone}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-slate-400 block mb-0.5">Email</Typography>
                  <Typography variant="body2" className="text-slate-700">{selectedUser?.email}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" className="text-slate-400 block mb-1">Trạng thái hiện tại</Typography>
                  <Box>{getStatusChip(selectedUser?.status)}</Box>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={12} md={7} className="space-y-4">
              <Typography variant="subtitle2" className="text-slate-500 uppercase tracking-wider font-bold">Tài liệu đính kèm (eKYC)</Typography>
              
              <Box className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Box className="border border-slate-200 rounded-xl p-2 bg-slate-50 relative overflow-hidden group hover:border-[#1B4965] transition-colors cursor-pointer">
                  <Typography variant="caption" className="absolute top-3 left-3 font-semibold bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-md shadow-sm z-10 text-slate-700">
                    Mặt trước CCCD
                  </Typography>
                  <Box className="h-40 bg-slate-200 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-slate-300 transition-colors">
                    [Hình ảnh]
                  </Box>
                </Box>
                
                <Box className="border border-slate-200 rounded-xl p-2 bg-slate-50 relative overflow-hidden group hover:border-[#1B4965] transition-colors cursor-pointer">
                  <Typography variant="caption" className="absolute top-3 left-3 font-semibold bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-md shadow-sm z-10 text-slate-700">
                    Mặt sau CCCD
                  </Typography>
                  <Box className="h-40 bg-slate-200 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-slate-300 transition-colors">
                    [Hình ảnh]
                  </Box>
                </Box>

                {selectedUser?.type === "Doanh nghiệp" && (
                  <Box className="border border-slate-200 rounded-xl p-2 bg-slate-50 relative overflow-hidden group hover:border-[#1B4965] transition-colors cursor-pointer sm:col-span-2">
                    <Typography variant="caption" className="absolute top-3 left-3 font-semibold bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-md shadow-sm z-10 text-slate-700">
                      Giấy phép kinh doanh
                    </Typography>
                    <Box className="h-48 bg-slate-200 rounded-lg flex items-center justify-center text-slate-400 group-hover:bg-slate-300 transition-colors">
                      [Hình ảnh GPKD]
                    </Box>
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions className="p-5 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
          <Button onClick={() => setOpenDialog(false)} color="inherit" className="!text-slate-500 !font-semibold">Đóng</Button>
          {selectedUser?.status === "PENDING" && (
            <>
              <Button 
                variant="outlined" 
                color="error" 
                startIcon={<CancelIcon />}
                className="!font-semibold !rounded-lg"
              >
                Từ chối
              </Button>
              <Button 
                variant="contained" 
                startIcon={<CheckCircleIcon />} 
                sx={{ backgroundColor: "#10B981", "&:hover": { backgroundColor: "#059669" }, fontWeight: 600, borderRadius: "8px" }}
              >
                Duyệt hồ sơ
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
