"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Avatar from "@mui/material/Avatar";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { Add as AddIcon, Person as PersonIcon, Settings as SettingsIcon, FileUpload as FileUploadIcon } from "@mui/icons-material";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { PageHeader, ViewModeToggle, DetailDrawer } from "@/components/common";

const mockDrivers = [
  { id: "D1", name: "Nguyễn Văn Hùng", phone: "0901234567", licenseClass: "Hạng C", active: true, verification: "VERIFIED" },
  { id: "D2", name: "Trần Tuấn Anh", phone: "0987654321", licenseClass: "Hạng FC", active: true, verification: "VERIFIED" },
  { id: "D3", name: "Lê Hoàng Phúc", phone: "0912233445", licenseClass: "Hạng C", active: false, verification: "PENDING" }
];

export default function DriversPage() {
  const [drivers, setDrivers] = useState(mockDrivers);
  const [filter, setFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState("CARD");
  const [openModal, setOpenModal] = useState(false);
  const [openImportModal, setOpenImportModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);

  const filteredDrivers = drivers.filter(d => {
    if (filter === "VERIFIED") return d.verification === "VERIFIED";
    if (filter === "PENDING") return d.verification === "PENDING";
    if (filter === "REJECTED") return d.verification === "REJECTED";
    return true;
  });

  const handleOpen = () => setOpenModal(true);
  const handleClose = () => setOpenModal(false);

  const handleOpenImport = () => setOpenImportModal(true);
  const handleCloseImport = () => setOpenImportModal(false);

  const handleOpenDetails = (driver) => setSelectedDriver(driver);
  const handleCloseDetails = () => setSelectedDriver(null);

  const getVerificationChip = (status) => {
    switch(status) {
      case 'VERIFIED':
        return <Chip label="Đã duyệt" size="small" color="success" className="font-semibold" />;
      case 'PENDING':
        return <Chip label="Chờ duyệt" size="small" color="warning" className="font-semibold text-amber-700 bg-amber-100" />;
      case 'REJECTED':
        return <Chip label="Bị từ chối" size="small" color="error" className="font-semibold" />;
      default:
        return null;
    }
  };

  return (
    <Box className="animate-fade-in-up">
      <PageHeader 
        title="Quản lý Tài xế" 
        subtitle="Danh sách nhân sự lái xe và kiểm soát bằng lái"
        breadcrumbs={[
          { label: "Trang chủ", path: "/carrier/dashboard" },
          { label: "Vận hành", path: "#" },
          { label: "Tài xế", path: "/carrier/drivers" }
        ]}
        action={
          <Box className="flex gap-2">
            <Button 
              variant="outlined" 
              startIcon={<FileUploadIcon />} 
              onClick={handleOpenImport}
              sx={{ borderColor: "#1B4965", color: "#1B4965", "&:hover": { backgroundColor: "rgba(27,73,101,0.05)", borderColor: "#0d2b3e" }, borderRadius: "8px", px: 2 }}
            >
              Import hàng loạt
            </Button>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />} 
              onClick={handleOpen}
              sx={{ backgroundColor: "#1B4965", "&:hover": { backgroundColor: "#0d2b3e" }, borderRadius: "8px", px: 3 }}
            >
              Thêm tài xế mới
            </Button>
          </Box>
        }
      />

      <Box sx={{ mb: 3, borderBottom: 1, borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
        <Tabs 
          value={filter} 
          onChange={(e, v) => setFilter(v)}
          textColor="primary"
          indicatorColor="primary"
          sx={{
            "& .MuiTab-root": { textTransform: 'none', fontWeight: 600, fontSize: '0.95rem' }
          }}
        >
          <Tab value="ALL" label="Tất cả" />
          <Tab value="VERIFIED" label="Đã duyệt" />
          <Tab value="PENDING" label="Chờ duyệt" />
          <Tab value="REJECTED" label="Bị từ chối" />
        </Tabs>

        <ViewModeToggle 
          viewMode={viewMode}
          onChange={setViewMode}
          sx={{ mb: { xs: 2, sm: 0 } }}
        />
      </Box>

      {filteredDrivers.length === 0 && (
        <Box className="text-center p-10 bg-white/50 backdrop-blur-md rounded-2xl border border-slate-200 mb-4">
          <Typography variant="h6" className="text-slate-400">Không có tài xế nào</Typography>
        </Box>
      )}

      {viewMode === "CARD" ? (
        <Grid container spacing={3}>
          {filteredDrivers.map((d) => (
            <Grid item xs={12} sm={6} md={4} key={d.id}>
              <Card variant="outlined" className={`hover:shadow-md transition-shadow rounded-2xl h-full flex flex-col ${d.verification === 'PENDING' ? 'border-amber-200' : 'border-slate-200'}`}>
                <CardContent className="flex-1">
                  <Box className="flex justify-between items-start mb-3">
                    <Box className="flex items-center gap-3">
                      <Avatar sx={{ bgcolor: "#1B4965", width: 40, height: 40 }}>
                        <PersonIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" className="font-bold text-slate-800 text-base">{d.name}</Typography>
                        <Typography variant="body2" className="text-slate-500 font-mono">{d.id}</Typography>
                      </Box>
                    </Box>
                    {getVerificationChip(d.verification)}
                  </Box>
                  
                  <Box className="space-y-2 mb-4 mt-4">
                    <Box className="flex justify-between">
                      <Typography variant="body2" className="text-slate-500">SĐT:</Typography>
                      <Typography variant="body2" className="font-semibold text-slate-800">{d.phone}</Typography>
                    </Box>
                    <Box className="flex justify-between">
                      <Typography variant="body2" className="text-slate-500">Hạng GPLX:</Typography>
                      <Typography variant="body2" className="font-semibold text-[#1B4965] bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{d.licenseClass}</Typography>
                    </Box>
                    <Box className="flex justify-between">
                      <Typography variant="body2" className="text-slate-500">Trạng thái:</Typography>
                      <Typography variant="body2" className={`font-semibold ${d.active ? 'text-emerald-600' : 'text-slate-500'}`}>
                        {d.active ? 'Đang làm việc' : 'Nghỉ phép'}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
                <Box className="p-3 pt-0 border-t border-slate-100 flex gap-2 justify-end">
                  <Button size="small" variant="text" color="primary" startIcon={<SettingsIcon />} onClick={() => handleOpenDetails(d)}>
                    Xem chi tiết
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <TableContainer component={Paper} className="rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
          <Table sx={{ minWidth: 650 }}>
            <TableHead className="bg-slate-50">
              <TableRow>
                <TableCell className="font-bold text-slate-600">Tài xế</TableCell>
                <TableCell className="font-bold text-slate-600">Số điện thoại</TableCell>
                <TableCell className="font-bold text-slate-600">Hạng GPLX</TableCell>
                <TableCell className="font-bold text-slate-600">Kiểm duyệt</TableCell>
                <TableCell className="font-bold text-slate-600">Trạng thái</TableCell>
                <TableCell align="right" className="font-bold text-slate-600">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDrivers.map((d) => (
                <TableRow key={d.id} hover className="transition-colors">
                  <TableCell>
                    <Box className="flex items-center gap-3">
                      <Avatar sx={{ bgcolor: "#1B4965", width: 32, height: 32 }}>
                        <PersonIcon sx={{ fontSize: 18 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" className="font-bold text-slate-800">{d.name}</Typography>
                        <Typography variant="caption" className="text-slate-500 font-mono">{d.id}</Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell><Typography variant="body2" className="text-slate-800">{d.phone}</Typography></TableCell>
                  <TableCell>
                    <Typography variant="body2" className="font-semibold text-[#1B4965] inline-block bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {d.licenseClass}
                    </Typography>
                  </TableCell>
                  <TableCell>{getVerificationChip(d.verification)}</TableCell>
                  <TableCell>
                    <Typography variant="body2" className={`font-medium ${d.active ? 'text-emerald-600' : 'text-slate-500'}`}>
                      {d.active ? 'Đang làm việc' : 'Nghỉ phép'}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Button 
                      size="small" 
                      variant="outlined" 
                      color="primary" 
                      startIcon={<SettingsIcon />} 
                      onClick={() => handleOpenDetails(d)}
                      sx={{ borderRadius: "6px" }}
                    >
                      Xem chi tiết
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Modal Thêm tài xế mới */}
      <Dialog open={openModal} onClose={handleClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: "12px" } }}>
        <DialogTitle className="font-bold text-[#1B4965] border-b border-slate-100 pb-3">
          Khai báo tài xế mới
        </DialogTitle>
        <DialogContent className="pt-5">
          <Grid container spacing={4}>
            {/* Cột trái: Thông tin */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" className="font-bold text-slate-800 mb-4 uppercase tracking-wider">
                1. Thông tin cá nhân
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField fullWidth label="Họ và tên" placeholder="VD: Nguyễn Văn A" required />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Số điện thoại" required />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Số CCCD" required />
                </Grid>
                <Grid item xs={12}>
                  <TextField select fullWidth label="Hạng bằng lái" defaultValue="C" required>
                    <MenuItem value="B2">Hạng B2</MenuItem>
                    <MenuItem value="C">Hạng C</MenuItem>
                    <MenuItem value="FC">Hạng FC (Xe container)</MenuItem>
                    <MenuItem value="E">Hạng E</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField type="date" fullWidth label="Ngày hết hạn bằng lái" InputLabelProps={{ shrink: true }} required />
                </Grid>
              </Grid>
            </Grid>

            {/* Cột phải: Xác minh */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" className="font-bold text-slate-800 mb-4 uppercase tracking-wider">
                2. Tải lên Giấy tờ xác minh
              </Typography>
              <Box className="space-y-4">
                <Box>
                  <Typography variant="body2" className="font-medium text-slate-700 mb-1">
                    Giấy phép lái xe (Mặt trước & Sau) <span className="text-red-500">*</span>
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Card variant="outlined" className="border-dashed border-2 hover:border-[#1B4965] transition-colors cursor-pointer bg-slate-50">
                        <CardContent className="text-center py-4 flex flex-col items-center gap-1">
                          <CloudUploadIcon sx={{ fontSize: 24, color: "#94A3B8" }} />
                          <Typography variant="caption" className="text-slate-600 font-medium">Mặt trước</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={6}>
                      <Card variant="outlined" className="border-dashed border-2 hover:border-[#1B4965] transition-colors cursor-pointer bg-slate-50">
                        <CardContent className="text-center py-4 flex flex-col items-center gap-1">
                          <CloudUploadIcon sx={{ fontSize: 24, color: "#94A3B8" }} />
                          <Typography variant="caption" className="text-slate-600 font-medium">Mặt sau</Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>
                </Box>

                <Box>
                  <Typography variant="body2" className="font-medium text-slate-700 mb-1">
                    Căn cước công dân (Mặt trước) <span className="text-red-500">*</span>
                  </Typography>
                  <Card variant="outlined" className="border-dashed border-2 hover:border-[#1B4965] transition-colors cursor-pointer bg-slate-50">
                    <CardContent className="text-center py-4 flex flex-col items-center gap-1">
                      <CloudUploadIcon sx={{ fontSize: 28, color: "#94A3B8" }} />
                      <Typography variant="body2" className="text-slate-600">Tải lên Ảnh chụp</Typography>
                    </CardContent>
                  </Card>
                </Box>
              </Box>
            </Grid>
          </Grid>
          
          <Box className="mt-6 p-3 bg-blue-50 text-blue-800 rounded-lg text-sm border border-blue-100">
            <strong>Lưu ý:</strong> Tài xế mới cần Admin kiểm tra bằng lái trước khi được phép nhận chuyến trên hệ thống.
          </Box>
        </DialogContent>
        <DialogActions className="px-6 pb-6 pt-3 border-t border-slate-100">
          <Button onClick={handleClose} color="inherit" sx={{ borderRadius: "8px", fontWeight: 600 }}>Hủy bỏ</Button>
          <Button onClick={handleClose} variant="contained" sx={{ borderRadius: "8px", backgroundColor: "#1B4965", fontWeight: 600 }}>
            Gửi yêu cầu xét duyệt
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Import hàng loạt */}
      <Dialog open={openImportModal} onClose={handleCloseImport} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: "12px" } }}>
        <DialogTitle className="font-bold text-[#1B4965] border-b border-slate-100 pb-3">
          Import Danh sách Tài xế
        </DialogTitle>
        <DialogContent className="pt-5">
          <Typography variant="body2" className="text-slate-600 mb-4">
            Để thêm hàng nghìn tài xế nhanh chóng, vui lòng tải biểu mẫu Excel của chúng tôi, điền đầy đủ thông tin và tải lên lại hệ thống.
          </Typography>
          
          <Box className="mb-6">
            <Button 
              variant="text" 
              color="primary" 
              startIcon={<FileDownloadIcon />}
              sx={{ fontWeight: 600 }}
            >
              Tải xuống Biểu mẫu (Template.xlsx)
            </Button>
          </Box>

          <Card variant="outlined" className="border-dashed border-2 hover:border-[#1B4965] transition-colors cursor-pointer bg-slate-50">
            <CardContent className="text-center py-10 flex flex-col items-center gap-2">
              <FileUploadIcon sx={{ fontSize: 40, color: "#1B4965" }} />
              <Typography variant="subtitle1" className="font-semibold text-slate-700 mt-2">
                Kéo thả file Excel/CSV vào đây
              </Typography>
              <Typography variant="body2" className="text-slate-500">
                hoặc <strong>Bấm để chọn file</strong> từ máy tính của bạn
              </Typography>
              <Typography variant="caption" className="text-slate-400 mt-1 block">Hỗ trợ: .xlsx, .csv, .zip (Tối đa 50MB)</Typography>
            </CardContent>
          </Card>
          
          <Box className="mt-4 p-4 bg-emerald-50 text-emerald-900 rounded-xl text-sm border border-emerald-100">
            <Typography variant="subtitle2" className="font-bold mb-2 flex items-center gap-1 text-emerald-800">
              <span className="text-lg">💡</span> Hướng dẫn import kèm hình ảnh (File .ZIP):
            </Typography>
            <ul className="list-disc pl-5 space-y-1.5 opacity-90">
              <li>Nén file <strong>Excel</strong> và <strong>Toàn bộ ảnh</strong> vào chung một file <strong>.ZIP</strong>.</li>
              <li><strong>Quy tắc đặt tên ảnh:</strong> Đặt theo số CCCD (Chỉ ghi số).<br/>
                - Bằng lái: <code>[SoCCCD]_BangLai_Truoc.jpg</code> và <code>[SoCCCD]_BangLai_Sau.jpg</code><br/>
                - CCCD: <code>[SoCCCD]_CCCD_Truoc.jpg</code>
              </li>
              <li>Hệ thống sẽ tự động phân tích và gán ảnh vào đúng tài xế cho bạn!</li>
            </ul>
          </Box>
        </DialogContent>
        <DialogActions className="px-6 pb-6 pt-3 border-t border-slate-100">
          <Button onClick={handleCloseImport} color="inherit" sx={{ borderRadius: "8px", fontWeight: 600 }}>Hủy bỏ</Button>
          <Button onClick={handleCloseImport} variant="contained" sx={{ borderRadius: "8px", backgroundColor: "#1B4965", fontWeight: 600 }}>
            Tiến hành Import
          </Button>
        </DialogActions>
      </Dialog>

      {/* Drawer Chi tiết Tài xế */}
      <DetailDrawer 
        open={!!selectedDriver} 
        onClose={handleCloseDetails} 
        title={
          <Box className="flex items-center justify-between w-full pr-4">
            <span>Chi tiết Tài xế</span>
            {selectedDriver && getVerificationChip(selectedDriver.verification)}
          </Box>
        }
      >
        {selectedDriver && (
          <Box className="space-y-6">
            <Box className="flex items-center gap-4">
              <Avatar sx={{ bgcolor: selectedDriver.active ? "#1B4965" : "#94A3B8", width: 64, height: 64 }}>
                <PersonIcon fontSize="large" />
              </Avatar>
              <Box>
                <Typography variant="h5" className="font-bold text-slate-800">{selectedDriver.name}</Typography>
                <Typography variant="body1" className="text-slate-500">{selectedDriver.phone}</Typography>
              </Box>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" className="text-slate-500">Hạng bằng lái</Typography>
                <Typography variant="body1" className="font-medium text-[#1B4965]">{selectedDriver.licenseClass}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" className="text-slate-500">Số CCCD</Typography>
                <Typography variant="body1" className="font-medium">0123456789</Typography>
              </Grid>
            </Grid>

            <Divider className="my-2" />

            <Typography variant="subtitle2" className="font-bold text-slate-800">Giấy tờ kèm theo</Typography>
            
            <Typography variant="body2" className="text-slate-500 mb-1 mt-2">Bằng lái xe (Mặt trước & Mặt sau)</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box className="w-full h-24 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center relative overflow-hidden group">
                  <img src="https://placehold.co/400x250/e2e8f0/64748b?text=Bang+Lai+Truoc" alt="Bằng lái trước" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box className="w-full h-24 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center relative overflow-hidden group">
                  <img src="https://placehold.co/400x250/e2e8f0/64748b?text=Bang+Lai+Sau" alt="Bằng lái sau" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                </Box>
              </Grid>
            </Grid>

            <Typography variant="body2" className="text-slate-500 mb-1 mt-4">Căn cước công dân (Mặt trước)</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box className="w-full h-24 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center relative overflow-hidden group">
                  <img src="https://placehold.co/400x250/e2e8f0/64748b?text=CCCD+Truoc" alt="CCCD trước" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                </Box>
              </Grid>
            </Grid>

            <Box className="flex flex-col gap-3 mt-6">
              <Button onClick={handleCloseDetails} variant="contained" fullWidth sx={{ borderRadius: "8px", backgroundColor: "#1B4965", fontWeight: 600 }}>
                Cập nhật thông tin
              </Button>
              <Button color="error" variant="outlined" fullWidth sx={{ borderRadius: "8px" }}>Xóa tài xế</Button>
            </Box>
          </Box>
        )}
      </DetailDrawer>
    </Box>
  );
}
