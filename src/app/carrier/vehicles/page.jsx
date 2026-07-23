"use client";

import React, { useState } from "react";
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
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { Add as AddIcon, DirectionsCar as DirectionsCarIcon, Settings as SettingsIcon, FileUpload as FileUploadIcon } from "@mui/icons-material";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import TableSortLabel from "@mui/material/TableSortLabel";
import { PageHeader, ViewModeToggle, DetailDrawer } from "@/components/common";
import CarrierVehicleItem from "@/components/carrier/CarrierVehicleItem";

const mockVehicles = [
  { id: "V1", plate: "29H-123.45", capacity: "15 Tấn", type: "Xe tải thùng kín", active: true, verification: "VERIFIED" },
  { id: "V2", plate: "30F-987.65", capacity: "10 Tấn", type: "Xe tải mui bạt", active: true, verification: "VERIFIED" },
  { id: "V3", plate: "51C-456.78", capacity: "8 Tấn", type: "Xe đông lạnh", active: false, verification: "PENDING" }
];

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState(mockVehicles);
  const [filter, setFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState("CARD");
  const [openModal, setOpenModal] = useState(false);
  const [openImportModal, setOpenImportModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  const [columnsList, setColumnsList] = useState([
    { id: 'plate', label: 'Biển số xe' },
    { id: 'capacity', label: 'Tải trọng' },
    { id: 'type', label: 'Loại xe' },
    { id: 'verification', label: 'Kiểm duyệt' },
    { id: 'active', label: 'Trạng thái xe' },
    { id: 'actions', label: 'Thao tác', align: 'right', sortable: false }
  ]);

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData("colIndex", index.toString());
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, index) => {
    const dragIndex = Number(e.dataTransfer.getData("colIndex"));
    if (isNaN(dragIndex) || dragIndex === index) return;
    const updated = [...columnsList];
    const [removed] = updated.splice(dragIndex, 1);
    updated.splice(index, 0, removed);
    setColumnsList(updated);
  };

  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("plate");

  const handleRequestSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const filteredVehicles = React.useMemo(() => {
    return vehicles.filter(v => {
      if (filter === "VERIFIED") return v.verification === "VERIFIED";
      if (filter === "PENDING") return v.verification === "PENDING";
      if (filter === "REJECTED") return v.verification === "REJECTED";
      return true;
    });
  }, [vehicles, filter]);

  const sortedVehicles = React.useMemo(() => {
    let result = [...filteredVehicles];
    result.sort((a, b) => {
      let comparison = String(a[orderBy] || "").localeCompare(String(b[orderBy] || ""));
      return order === "desc" ? -comparison : comparison;
    });
    return result;
  }, [filteredVehicles, order, orderBy]);

  const handleOpen = () => setOpenModal(true);
  const handleClose = () => setOpenModal(false);

  const handleOpenImport = () => setOpenImportModal(true);
  const handleCloseImport = () => setOpenImportModal(false);

  const handleOpenDetails = (vehicle) => setSelectedVehicle(vehicle);
  const handleCloseDetails = () => setSelectedVehicle(null);

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
        title="Quản lý Phương tiện" 
        subtitle="Quản lý danh sách xe tải, thông số kỹ thuật và giấy tờ kiểm định"
        breadcrumbs={[
          { label: "Trang chủ", path: "/carrier/dashboard" },
          { label: "Vận hành", path: "#" },
          { label: "Đội xe", path: "/carrier/vehicles" }
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
              Thêm xe mới
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

      {filteredVehicles.length === 0 && (
        <Box className="text-center p-10 bg-white/50 backdrop-blur-md rounded-2xl border border-slate-200 mb-4">
          <Typography variant="h6" className="text-slate-400">Không có phương tiện nào</Typography>
        </Box>
      )}

      {viewMode === "CARD" ? (
        <Grid container spacing={3}>
          {sortedVehicles.map((v) => (
            <Grid item xs={12} sm={6} md={4} key={v.id}>
              <CarrierVehicleItem
                vehicle={v}
                onViewDetail={handleOpenDetails}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <TableContainer component={Paper} className="rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
          <Table sx={{ minWidth: 650 }}>
            <TableHead className="bg-slate-50">
              <TableRow>
                {columnsList.map((col, idx) => (
                  <TableCell
                    key={col.id}
                    align={col.align || 'left'}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, idx)}
                    className="font-bold text-slate-600 select-none cursor-move hover:bg-slate-100 transition-colors"
                  >
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
              {sortedVehicles.map((v) => (
                <TableRow key={v.id} hover className="transition-colors">
                  {columnsList.map((col) => {
                    if (col.id === 'plate') {
                      return (
                        <TableCell key={col.id}>
                          <Box className="flex items-center gap-2">
                            <DirectionsCarIcon sx={{ color: "#1B4965", fontSize: 20 }} />
                            <Typography variant="body2" className="font-mono font-bold text-[#1B4965]">{v.plate}</Typography>
                          </Box>
                        </TableCell>
                      );
                    }
                    if (col.id === 'capacity') {
                      return (
                        <TableCell key={col.id}>
                          <Typography variant="body2" className="text-slate-800">{v.capacity}</Typography>
                        </TableCell>
                      );
                    }
                    if (col.id === 'type') {
                      return (
                        <TableCell key={col.id}>
                          <Typography variant="body2" className="text-slate-800">{v.type}</Typography>
                        </TableCell>
                      );
                    }
                    if (col.id === 'verification') {
                      return (
                        <TableCell key={col.id}>
                          {getVerificationChip(v.verification)}
                        </TableCell>
                      );
                    }
                    if (col.id === 'active') {
                      return (
                        <TableCell key={col.id}>
                          <Typography variant="body2" className={`font-medium ${v.active ? 'text-emerald-600' : 'text-slate-500'}`}>
                            {v.active ? 'Sẵn sàng' : 'Bảo trì'}
                          </Typography>
                        </TableCell>
                      );
                    }
                    if (col.id === 'actions') {
                      return (
                        <TableCell key={col.id} align="right">
                          <Button 
                            size="small" 
                            variant="outlined" 
                            color="primary" 
                            startIcon={<SettingsIcon />} 
                            onClick={() => handleOpenDetails(v)}
                            sx={{ borderRadius: "6px" }}
                          >
                            Xem chi tiết
                          </Button>
                        </TableCell>
                      );
                    }
                    return null;
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Modal Thêm xe mới */}
      <Dialog open={openModal} onClose={handleClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: "12px" } }}>
        <DialogTitle className="font-bold text-[#1B4965] border-b border-slate-100 pb-3">
          Khai báo phương tiện mới
        </DialogTitle>
        <DialogContent className="pt-5">
          <Grid container spacing={4}>
            {/* Cột trái: Thông tin */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" className="font-bold text-slate-800 mb-4 uppercase tracking-wider">
                1. Thông số kỹ thuật
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField fullWidth label="Biển số xe" placeholder="VD: 29H-123.45" required />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Tải trọng (Tấn)" type="number" required />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField select fullWidth label="Loại thùng" defaultValue="kin" required>
                    <MenuItem value="kin">Thùng kín</MenuItem>
                    <MenuItem value="bat">Mui bạt</MenuItem>
                    <MenuItem value="lanh">Đông lạnh</MenuItem>
                    <MenuItem value="lung">Thùng lửng</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Kích thước thùng (D x R x C)" placeholder="VD: 6.2m x 2.1m x 2.1m" />
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
                    Giấy Đăng ký xe (Cà vẹt) <span className="text-red-500">*</span>
                  </Typography>
                  <Card variant="outlined" className="border-dashed border-2 hover:border-[#1B4965] transition-colors cursor-pointer bg-slate-50">
                    <CardContent className="text-center py-4 flex flex-col items-center gap-1">
                      <CloudUploadIcon sx={{ fontSize: 28, color: "#94A3B8" }} />
                      <Typography variant="body2" className="text-slate-600">Tải lên Ảnh chụp</Typography>
                    </CardContent>
                  </Card>
                </Box>
                <Box>
                  <Typography variant="body2" className="font-medium text-slate-700 mb-1">
                    Sổ Đăng kiểm xe <span className="text-red-500">*</span>
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
            <strong>Lưu ý:</strong> Xe mới thêm sẽ ở trạng thái <strong>Chờ duyệt</strong>. Bạn chỉ có thể dùng xe này để tham gia đấu giá sau khi Admin B2B Logistics phê duyệt giấy tờ hợp lệ.
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
          Import Danh sách Phương tiện
        </DialogTitle>
        <DialogContent className="pt-5">
          <Typography variant="body2" className="text-slate-600 mb-4">
            Để thêm hàng trăm phương tiện nhanh chóng, vui lòng tải biểu mẫu Excel của chúng tôi, điền đầy đủ thông tin kỹ thuật và tải lên lại hệ thống.
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
              <li><strong>Quy tắc đặt tên ảnh:</strong> Đặt theo biển số xe viết liền (không gạch ngang).<br/>
                - Cà vẹt: <code>[BienSo]_CaVet.jpg</code> (VD: <i>29H12345_CaVet.jpg</i>)<br/>
                - Đăng kiểm: <code>[BienSo]_DangKiem.jpg</code> (VD: <i>29H12345_DangKiem.jpg</i>)
              </li>
              <li>Hệ thống sẽ tự động phân tích và gán ảnh vào đúng phương tiện cho bạn!</li>
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

      {/* Drawer Chi tiết Phương tiện */}
      <DetailDrawer 
        open={!!selectedVehicle} 
        onClose={handleCloseDetails} 
        title={
          <Box className="flex items-center justify-between w-full pr-4">
            <span>Chi tiết Phương tiện</span>
            {selectedVehicle && getVerificationChip(selectedVehicle.verification)}
          </Box>
        }
      >
        {selectedVehicle && (
          <Box className="space-y-6">
            <Box>
              <Typography variant="subtitle2" className="text-slate-500 mb-1">Biển số xe</Typography>
              <Typography variant="h5" className="font-mono font-bold text-slate-800">{selectedVehicle.plate}</Typography>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" className="text-slate-500">Tải trọng</Typography>
                <Typography variant="body1" className="font-medium">{selectedVehicle.capacity}</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" className="text-slate-500">Loại xe</Typography>
                <Typography variant="body1" className="font-medium">{selectedVehicle.type}</Typography>
              </Grid>
            </Grid>

            <Divider className="my-2" />

            <Typography variant="subtitle2" className="font-bold text-slate-800">Giấy tờ kèm theo</Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" className="text-slate-500 mb-1">Cà vẹt xe</Typography>
                <Box className="w-full h-32 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center relative overflow-hidden group">
                  <img src="https://placehold.co/400x300/e2e8f0/64748b?text=Ca+Vet+Xe" alt="Cà vẹt" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" className="text-slate-500 mb-1">Sổ đăng kiểm</Typography>
                <Box className="w-full h-32 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center relative overflow-hidden group">
                  <img src="https://placehold.co/400x300/e2e8f0/64748b?text=So+Dang+Kiem" alt="Sổ đăng kiểm" className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                </Box>
              </Grid>
            </Grid>
            
            <Box className="flex flex-col gap-3 mt-6">
              <Button onClick={handleCloseDetails} variant="contained" fullWidth sx={{ borderRadius: "8px", backgroundColor: "#1B4965", fontWeight: 600 }}>
                Cập nhật thông tin
              </Button>
              <Button color="error" variant="outlined" fullWidth sx={{ borderRadius: "8px" }}>Xóa xe</Button>
            </Box>
          </Box>
        )}
      </DetailDrawer>
    </Box>
  );
}
