"use client";

import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
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
import Avatar from "@mui/material/Avatar";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { Add as AddIcon, Person as PersonIcon, Settings as SettingsIcon, FileUpload as FileUploadIcon, Edit as EditIcon } from "@mui/icons-material";
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
import { createDriverWithDocuments, deleteDriver, getMyDrivers, updateDriver, updateDriverWithDocuments } from "@/services/fleetApi";
import { downloadCsvTemplate, parseSimpleCsv } from "@/services/csvImport";

const buildDriverDocumentFormData = (form, licenseImage) => {
  const formData = new FormData();
  formData.append("metadata", new globalThis.Blob([JSON.stringify({ fullName: form.fullName, phone: form.phone, licenseNumber: form.licenseNumber })], { type: "application/json" }));
  formData.append("licenseImage", licenseImage);
  return formData;
};

const buildDriverUpdateFormData = (form, licenseImage) => {
  const formData = new FormData();
  formData.append("metadata", new globalThis.Blob([JSON.stringify({ fullName: form.fullName, phone: form.phone, licenseNumber: form.licenseNumber })], { type: "application/json" }));
  if (licenseImage) formData.append("licenseImage", licenseImage);
  return formData;
};

export default function DriversPage() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState("CARD");
  const [openModal, setOpenModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openImportModal, setOpenImportModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [saving, setSaving] = useState(false);
  const [importRows, setImportRows] = useState([]);
  const [importFileName, setImportFileName] = useState("");
  const [documentFiles, setDocumentFiles] = useState([]);
  const [importStep, setImportStep] = useState(1);
  const [createStep, setCreateStep] = useState(1);
  const [licenseImage, setLicenseImage] = useState(null);
  const [editLicenseImage, setEditLicenseImage] = useState(null);

  const [form, setForm] = useState({ fullName: "", phone: "", licenseNumber: "", licenseImageUrl: "" });
  const [editForm, setEditForm] = useState({ id: "", fullName: "", phone: "", licenseNumber: "", licenseImageUrl: "" });

  const loadDrivers = async () => {
    setLoading(true);
    setError("");
    try {
      setDrivers(await getMyDrivers());
    } catch (loadError) {
      setError(loadError?.response?.data?.message || "Không thể tải danh sách tài xế.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers();
  }, []);

  const filteredDrivers = React.useMemo(() => {
    return drivers.filter(d => {
      if (filter === "VERIFIED") return d.verification === "VERIFIED";
      if (filter === "PENDING") return d.verification === "PENDING";
      if (filter === "REJECTED") return d.verification === "REJECTED";
      return true;
    });
  }, [drivers, filter]);

  const [order] = useState("asc");
  const [orderBy] = useState("name");

  const sortedDrivers = React.useMemo(() => {
    let result = [...filteredDrivers];
    result.sort((a, b) => {
      let comparison = String(a[orderBy] || "").localeCompare(String(b[orderBy] || ""));
      return order === "desc" ? -comparison : comparison;
    });
    return result;
  }, [filteredDrivers, order, orderBy]);

  const handleOpen = () => {
    setForm({ fullName: "", phone: "", licenseNumber: "", licenseImageUrl: "" });
    setLicenseImage(null);
    setCreateStep(1);
    setError("");
    setOpenModal(true);
  };
  const handleClose = () => setOpenModal(false);

  const handleCreate = async () => {
    if (createStep < 3) {
      if (createStep === 1 && (!form.fullName || !form.phone || !form.licenseNumber)) {
        setError("Vui long nhap du ho ten, so dien thoai va so GPLX.");
        return;
      }
      if (createStep === 2 && !licenseImage) {
        setError("Vui long upload anh GPLX.");
        return;
      }
      setError("");
      setCreateStep((current) => current + 1);
      return;
    }
    setSaving(true);
    setError("");
    try {
      await createDriverWithDocuments(buildDriverDocumentFormData(form, licenseImage));
      await loadDrivers();
      setOpenModal(false);
      setSuccessMsg("Khai báo tài xế mới thành công! Hồ sơ đang chờ Admin duyệt.");
    } catch (saveError) {
      setError(saveError?.response?.data?.message || "Không thể gửi tài xế để duyệt.");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateBack = () => {
    setError("");
    setCreateStep((current) => Math.max(1, current - 1));
  };

  const handleLicenseImageChange = (event) => {
    const file = event.target.files?.[0] || null;
    event.target.value = "";
    if (!file) return;
    if (!/^image\/(jpeg|png)$|^application\/pdf$/.test(file.type) || file.size > 5 * 1024 * 1024) {
      setError("Anh GPLX chi nhan JPG, PNG hoac PDF, dung luong toi da 5MB.");
      return;
    }
    setLicenseImage(file);
    setError("");
  };

  const handleOpenEdit = (driver) => {
    const d = driver || selectedDriver;
    if (!d) return;
    setEditForm({
      id: d.id,
      fullName: d.fullName || d.name || "",
      phone: d.phone || "",
      licenseNumber: d.licenseNumber || d.licenseClass || "",
      licenseImageUrl: d.licenseImageUrl || "",
    });
    setEditLicenseImage(null);
    setError("");
    setOpenEditModal(true);
  };
  const handleCloseEdit = () => setOpenEditModal(false);

  const handleSaveEdit = async () => {
    setSaving(true);
    setError("");
    try {
      const metadata = {
        fullName: editForm.fullName,
        phone: editForm.phone,
        licenseNumber: editForm.licenseNumber,
        licenseImageUrl: editForm.licenseImageUrl,
      };
      if (editLicenseImage) {
        await updateDriverWithDocuments(editForm.id, buildDriverUpdateFormData(metadata, editLicenseImage));
      } else {
        await updateDriver(editForm.id, metadata);
      }
      await loadDrivers();
      setOpenEditModal(false);
      if (selectedDriver) {
        setSelectedDriver((prev) => ({
          ...prev,
          fullName: editForm.fullName,
          name: editForm.fullName,
          phone: editForm.phone,
          licenseNumber: editForm.licenseNumber,
          licenseClass: editForm.licenseNumber,
          licenseImageUrl: editForm.licenseImageUrl,
        }));
      }
      setSuccessMsg("Cập nhật thông tin tài xế thành công!");
    } catch (updateError) {
      setError(updateError?.response?.data?.message || "Không thể cập nhật thông tin tài xế.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditLicenseImageChange = (event) => {
    const file = event.target.files?.[0] || null;
    event.target.value = "";
    if (!file) return;
    if (!/^image\/(jpeg|png)$|^application\/pdf$/.test(file.type) || file.size > 5 * 1024 * 1024) {
      setError("Anh GPLX chi nhan JPG, PNG hoac PDF, dung luong toi da 5MB.");
      return;
    }
    setEditLicenseImage(file);
    setError("");
  };

  const handleDelete = async (driver) => {
    if (!window.confirm("Ban co chac muon xoa tai xe nay?")) return;
    try {
      await deleteDriver(driver.id);
      setDrivers((current) => current.filter((item) => item.id !== driver.id));
      setSelectedDriver(null);
      setSuccessMsg("Đã xóa tài xế khỏi danh sách.");
    } catch (deleteError) {
      setError(deleteError?.response?.data?.message || "Không thể xóa tài xế.");
    }
  };

  const handleOpenImport = () => {
    setImportRows([]);
    setImportFileName("");
    setDocumentFiles([]);
    setImportStep(1);
    setError("");
    setOpenImportModal(true);
  };
  const handleCloseImport = () => {
    if (!saving) setOpenImportModal(false);
  };

  const handleImportCsvFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      const rows = parseSimpleCsv(await file.text()).map((row) => ({
        fullName: row.fullName,
        phone: row.phone,
        licenseNumber: row.licenseNumber,
        licenseImageFile: row.licenseImageFile || row.licenseImage || row.licenseImageUrl || "",
      }));
      if (rows.some((row) => !row.fullName || !row.phone || !row.licenseNumber)) {
        throw new Error("Mỗi dòng phải có fullName, phone và licenseNumber");
      }
      setImportRows(rows);
      setImportFileName(file.name);
      setError("");
    } catch (importError) {
      setImportRows([]);
      setImportFileName("");
      setError(importError.message || "Không thể đọc file CSV");
    }
  };

  const handleImportDocumentFiles = (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;
    const invalidFile = files.find((file) => !/^image\/(jpeg|png)$|^application\/pdf$/.test(file.type) || file.size > 5 * 1024 * 1024);
    if (invalidFile) {
      setError(`Tệp ${invalidFile.name} không hợp lệ. Chỉ nhận JPG, PNG hoặc PDF, tối đa 5MB mỗi tệp.`);
      return;
    }
    setDocumentFiles(files);
    setError("");
  };

  const findImportDocument = (name) => documentFiles.find((file) => file.name.toLowerCase() === String(name || "").trim().toLowerCase());

  const validateImportDocuments = () => {
    const missing = importRows.filter((row) => !findImportDocument(row.licenseImageFile)).map((row) => row.fullName);
    if (missing.length) {
      setError(`Chưa tìm thấy ảnh hoặc file GPLX của ${missing.slice(0, 2).join(" và ")}${missing.length > 2 ? " và các tài xế liên quan" : ""}. Kiểm tra lại tên file trong CSV.`);
      return false;
    }
    return true;
  };

  const handleBulkImport = async () => {
    if (importStep < 3) {
      if (importStep === 1 && !importRows.length) {
        setError("Vui lòng tải file CSV thông tin trước khi tiếp tục.");
        return;
      }
      if (importStep === 2 && !validateImportDocuments()) return;
      setError("");
      setImportStep((current) => current + 1);
      return;
    }
    setSaving(true);
    setError("");
    try {
      for (const row of importRows) {
        await createDriverWithDocuments(buildDriverDocumentFormData({
          fullName: row.fullName,
          phone: row.phone,
          licenseNumber: row.licenseNumber,
        }, findImportDocument(row.licenseImageFile)));
      }
      setSuccessMsg(`Đã gửi ${importRows.length} hồ sơ tài xế để Admin xét duyệt.`);
      await loadDrivers();
      setOpenImportModal(false);
      setImportRows([]);
      setImportFileName("");
      setDocumentFiles([]);
      setImportStep(1);
    } catch (importError) {
      setError(importError?.response?.data?.message || "Không thể gửi danh sách tài xế.");
    } finally {
      setSaving(false);
    }
  };

  const handleImportBack = () => {
    setError("");
    setImportStep((current) => Math.max(1, current - 1));
  };

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

      {error && <Box role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</Box>}
      {successMsg && <Box role="status" className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{successMsg}</Box>}
      {loading && <Box role="status" className="mb-4 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">Đang tải dữ liệu tài xế...</Box>}

      {filteredDrivers.length === 0 && (
        <Box className="text-center p-10 bg-white/50 backdrop-blur-md rounded-2xl border border-slate-200 mb-4">
          <Typography variant="h6" className="text-slate-400">Không có tài xế nào</Typography>
        </Box>
      )}

      {viewMode === "CARD" ? (
        <Grid container spacing={3}>
          {sortedDrivers.map((d) => (
            <Grid item xs={12} sm={6} md={4} key={d.id}>
              <Card className="rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <Box className="flex items-center gap-4 mb-4">
                    <Avatar sx={{ bgcolor: "#1B4965", width: 52, height: 52 }}>
                      <PersonIcon />
                    </Avatar>
                    <Box className="min-w-0 flex-1">
                      <Typography variant="h6" className="font-bold text-slate-800 truncate">{d.name || d.fullName}</Typography>
                      <Typography variant="body2" className="text-slate-500">{d.phone}</Typography>
                    </Box>
                    {getVerificationChip(d.verification)}
                  </Box>

                  <Box className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4 flex justify-between">
                    <div>
                      <Typography variant="caption" className="text-slate-500 block">Số GPLX</Typography>
                      <Typography variant="body2" className="font-bold text-[#1B4965]">{d.licenseClass || d.licenseNumber}</Typography>
                    </div>
                    <div className="text-right">
                      <Typography variant="caption" className="text-slate-500 block">Trạng thái</Typography>
                      <Typography variant="body2" className={d.active ? "text-emerald-600 font-bold" : "text-amber-600 font-bold"}>
                        {d.active ? "Sẵn sàng" : "Chờ duyệt"}
                      </Typography>
                    </div>
                  </Box>

                  <Box className="flex justify-end gap-2">
                    <Button size="small" variant="text" startIcon={<EditIcon />} onClick={() => handleOpenEdit(d)} sx={{ fontWeight: 600 }}>
                      Sửa
                    </Button>
                    <Button size="small" variant="outlined" startIcon={<SettingsIcon />} onClick={() => handleOpenDetails(d)} sx={{ fontWeight: 600 }}>
                      Chi tiết
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <TableContainer component={Paper} className="rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
          <Table sx={{ minWidth: 650 }}>
            <TableHead className="bg-slate-50">
              <TableRow>
                <TableCell className="font-bold text-slate-600">Họ và tên</TableCell>
                <TableCell className="font-bold text-slate-600">Số điện thoại</TableCell>
                <TableCell className="font-bold text-slate-600">Số GPLX</TableCell>
                <TableCell className="font-bold text-slate-600">Kiểm duyệt</TableCell>
                <TableCell className="font-bold text-slate-600" align="right">Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedDrivers.map((d) => (
                <TableRow key={d.id} hover className="transition-colors">
                  <TableCell>
                    <Box className="flex items-center gap-3">
                      <Avatar sx={{ bgcolor: "#1B4965", width: 32, height: 32 }}><PersonIcon sx={{ fontSize: 18 }} /></Avatar>
                      <Typography variant="body2" className="font-bold text-slate-800">{d.name || d.fullName}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell><Typography variant="body2" className="text-slate-600">{d.phone}</Typography></TableCell>
                  <TableCell><Typography variant="body2" className="font-mono font-bold text-[#1B4965]">{d.licenseClass || d.licenseNumber}</Typography></TableCell>
                  <TableCell>{getVerificationChip(d.verification)}</TableCell>
                  <TableCell align="right">
                    <Box className="flex justify-end gap-1">
                      <Button size="small" variant="text" startIcon={<EditIcon />} onClick={() => handleOpenEdit(d)} sx={{ borderRadius: "6px" }}>
                        Sửa
                      </Button>
                      <Button size="small" variant="outlined" startIcon={<SettingsIcon />} onClick={() => handleOpenDetails(d)} sx={{ borderRadius: "6px" }}>
                        Chi tiết
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Modal Thêm tài xế mới */}
      <Dialog open={openModal} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: "12px" } }}>
        <DialogTitle sx={{ borderBottom: "1px solid #f1f5f9", pb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#1B4965" }}>Khai báo tài xế mới</Typography>
          <Typography variant="body2" sx={{ mt: 0.5, color: "#64748b" }}>Hoàn thiện thông tin và hồ sơ trước khi gửi Admin xét duyệt.</Typography>
        </DialogTitle>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, px: 3, pt: 2 }} aria-label="Tiến trình khai báo tài xế">
          {["Thông tin", "Hồ sơ", "Xác nhận"].map((label, index) => (
            <Box key={label} sx={{
              borderRadius: "8px",
              border: "1px solid",
              px: 1.5, py: 1,
              textAlign: "center",
              fontSize: "0.8125rem",
              fontWeight: 600,
              borderColor: createStep === index + 1 ? "#1B4965" : createStep > index + 1 ? "#a7f3d0" : "#e2e8f0",
              bgcolor: createStep === index + 1 ? "#1B4965" : createStep > index + 1 ? "#ecfdf5" : "#f8fafc",
              color: createStep === index + 1 ? "#fff" : createStep > index + 1 ? "#065f46" : "#94a3b8",
              transition: "all 0.2s ease",
            }}>{index + 1}. {label}</Box>
          ))}
        </Box>
        <DialogContent sx={{ pt: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
          {createStep === 1 && (
            <Stack spacing={2} useFlexGap>
              <TextField
                fullWidth size="small" variant="outlined"
                label="Họ và tên" placeholder="VD: Nguyễn Văn A"
                required
                value={form.fullName}
                onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
              />
              <TextField
                fullWidth size="small" variant="outlined"
                label="Số điện thoại" placeholder="VD: 0901234567"
                required
                value={form.phone}
                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
              />
              <TextField
                fullWidth size="small" variant="outlined"
                label="Số Giấy phép lái xe" placeholder="VD: 790123456789"
                required
                value={form.licenseNumber}
                onChange={(e) => setForm((prev) => ({ ...prev, licenseNumber: e.target.value }))}
              />
            </Stack>
          )}

          {createStep === 2 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Card component="label" variant="outlined" sx={{
                cursor: "pointer",
                borderStyle: "dashed",
                borderWidth: 2,
                bgcolor: "#f8fafc",
                transition: "border-color 0.2s",
                "&:hover": { borderColor: "#1B4965" }
              }}>
                <input hidden type="file" accept="image/jpeg,image/png,application/pdf" onChange={handleLicenseImageChange} />
                <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5, py: "16px !important" }}>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#334155" }}>Ảnh hoặc file GPLX *</Typography>
                    <Typography variant="caption" sx={{ color: "#94a3b8" }}>JPG, PNG hoặc PDF, tối đa 5MB</Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: "#1B4965", whiteSpace: "nowrap", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis" }}>
                    {licenseImage?.name || "Chọn tệp"}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          )}

          {createStep === 3 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, borderRadius: "12px", border: "1px solid #e2e8f0", bgcolor: "#f8fafc", p: 2.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1e293b" }}>Kiểm tra trước khi gửi</Typography>
              <Typography variant="body2">Họ tên: <strong>{form.fullName}</strong></Typography>
              <Typography variant="body2">Số GPLX: <strong>{form.licenseNumber}</strong></Typography>
              <Typography variant="body2">Ảnh GPLX: <strong>{licenseImage?.name}</strong></Typography>
              <Typography variant="caption" sx={{ color: "#64748b", display: "block" }}>Sau khi gửi, tài xế sẽ ở trạng thái Chờ duyệt để Admin kiểm tra hồ sơ.</Typography>
            </Box>
          )}

          <Box sx={{ p: 1.5, bgcolor: "#eff6ff", color: "#1e40af", borderRadius: "8px", fontSize: "0.8125rem", border: "1px solid #bfdbfe" }}>
            <strong>Lưu ý:</strong> Tài xế mới thêm sẽ ở trạng thái <strong>Chờ duyệt</strong> trước khi tham gia nhận chuyến.
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 1.5, borderTop: "1px solid #f1f5f9" }}>
          {createStep > 1 && <Button onClick={handleCreateBack} color="inherit" sx={{ borderRadius: "8px", fontWeight: 600 }}>Quay lại</Button>}
          <Button onClick={handleClose} color="inherit" sx={{ borderRadius: "8px", fontWeight: 600 }}>Hủy bỏ</Button>
          <Button onClick={handleCreate} disabled={saving} variant="contained" sx={{ borderRadius: "8px", bgcolor: "#1B4965", fontWeight: 600, "&:hover": { bgcolor: "#0d2b3e" } }}>
            {saving ? "Đang gửi..." : createStep === 3 ? "Gửi yêu cầu xét duyệt" : "Tiếp tục"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Chỉnh sửa thông tin tài xế */}
      <Dialog open={openEditModal} onClose={handleCloseEdit} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: "12px" } }}>
        <DialogTitle sx={{ borderBottom: "1px solid #f1f5f9", pb: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <EditIcon sx={{ color: "#1B4965", fontSize: 22 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#1B4965" }}>Chỉnh sửa thông tin Tài xế</Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            fullWidth size="small" variant="outlined"
            label="Họ và tên" required
            value={editForm.fullName}
            onChange={(e) => setEditForm((prev) => ({ ...prev, fullName: e.target.value }))}
          />
          <TextField
            fullWidth size="small" variant="outlined"
            label="Số điện thoại" required
            value={editForm.phone}
            onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
          />
          <TextField
            fullWidth size="small" variant="outlined"
            label="Số Giấy phép lái xe" required
            value={editForm.licenseNumber}
            onChange={(e) => setEditForm((prev) => ({ ...prev, licenseNumber: e.target.value }))}
          />
          <Card component="label" variant="outlined" sx={{
            cursor: "pointer",
            borderStyle: "dashed",
            borderWidth: 2,
            bgcolor: "#f8fafc",
            transition: "border-color 0.2s",
            "&:hover": { borderColor: "#1B4965" }
          }}>
            <input hidden type="file" accept="image/jpeg,image/png,application/pdf" onChange={handleEditLicenseImageChange} />
            <CardContent sx={{ p: "10px 12px !important" }}>
              <Typography variant="caption" sx={{ display: "block", color: "#64748b" }}>Thay ảnh GPLX (không bắt buộc)</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: "#1B4965", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {editLicenseImage?.name || "Giữ nguyên hồ sơ hiện tại"}
              </Typography>
            </CardContent>
          </Card>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 1.5, borderTop: "1px solid #f1f5f9" }}>
          <Button onClick={handleCloseEdit} color="inherit" sx={{ borderRadius: "8px", fontWeight: 600 }}>Hủy bỏ</Button>
          <Button onClick={handleSaveEdit} disabled={saving || !editForm.fullName || !editForm.phone || !editForm.licenseNumber} variant="contained" sx={{ borderRadius: "8px", bgcolor: "#1B4965", fontWeight: 600, "&:hover": { bgcolor: "#0d2b3e" } }}>
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Drawer Chi tiết Tài xế */}
      <Dialog open={openImportModal} onClose={handleCloseImport} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: "12px" } }}>
        <DialogTitle className="border-b border-slate-100 pb-3">
          <Typography variant="h6" className="font-bold text-[#1B4965]">Nhập hồ sơ tài xế</Typography>
          <Typography variant="body2" className="mt-1 text-slate-500">Gom thông tin và tài liệu theo từng bước để tránh nhầm file.</Typography>
        </DialogTitle>
        <DialogContent className="pt-5">
          <Box className="mb-5 grid grid-cols-1 gap-2 sm:grid-cols-3" aria-label="Tiến trình nhập hồ sơ">
            {["Thông tin", "Hồ sơ", "Xác nhận"].map((label, index) => (
              <Box key={label} className={`rounded-lg border px-3 py-2 text-center text-sm font-semibold ${importStep === index + 1 ? "border-[#1B4965] bg-[#1B4965] text-white" : importStep > index + 1 ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-50 text-slate-500"}`}>
                {index + 1}. {label}
              </Box>
            ))}
          </Box>

          {importStep === 1 && (
            <Box className="space-y-4">
              <Box className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
                <Typography variant="subtitle2" className="font-bold text-[#1B4965]">Bắt đầu bằng file thông tin</Typography>
                <Typography variant="body2" className="mt-1 text-slate-600">Mỗi dòng CSV là một tài xế. Tên file GPLX ở cột cuối sẽ được đối chiếu ở bước tiếp theo.</Typography>
              </Box>
              <Box className="flex flex-wrap items-center justify-between gap-3">
                <Typography variant="body2" className="text-slate-600">Định dạng: CSV, tối đa 500 dòng.</Typography>
                <Button size="small" variant="outlined" startIcon={<FileDownloadIcon />} onClick={() => downloadCsvTemplate("drivers-template.csv", "fullName,phone,licenseNumber,licenseImageFile\nNguyen Van A,0901234567,B2,gplx001.jpg\n")} sx={{ textTransform: "none", fontWeight: 600 }}>Tải file mẫu</Button>
              </Box>
              <Card component="label" htmlFor="driver-csv-input-v2" variant="outlined" className="cursor-pointer border-2 border-dashed bg-slate-50 transition-colors hover:border-[#1B4965]">
                <input id="driver-csv-input-v2" hidden type="file" accept=".csv,text/csv" onChange={handleImportCsvFile} />
                <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
                  <FileUploadIcon sx={{ fontSize: 42, color: "#1B4965" }} />
                  <Typography variant="subtitle1" className="font-semibold text-slate-700">{importFileName || "Chọn file CSV thông tin"}</Typography>
                  <Typography variant="caption" className="text-slate-500">Bắt buộc có họ tên, số điện thoại, số GPLX và tên file GPLX.</Typography>
                </CardContent>
              </Card>
              {importRows.length > 0 && <Box role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">Đã đọc {importRows.length} dòng thông tin.</Box>}
            </Box>
          )}

          {importStep === 2 && (
            <Box className="space-y-4">
              <Box className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3">
                <Typography variant="subtitle2" className="font-bold text-[#1B4965]">Tải ảnh và tài liệu rời</Typography>
                <Typography variant="body2" className="mt-1 text-slate-600">Không cần nén ZIP. Chọn các file JPG, PNG hoặc PDF có tên trùng với tên đã ghi trong CSV.</Typography>
              </Box>
              <Card component="label" htmlFor="driver-documents-input-v2" variant="outlined" className="cursor-pointer border-2 border-dashed bg-slate-50 transition-colors hover:border-[#1B4965]">
                <input id="driver-documents-input-v2" hidden multiple type="file" accept="image/jpeg,image/png,application/pdf" onChange={handleImportDocumentFiles} />
                <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
                  <FileUploadIcon sx={{ fontSize: 42, color: "#1B4965" }} />
                  <Typography variant="subtitle1" className="font-semibold text-slate-700">{documentFiles.length ? `Đã chọn ${documentFiles.length} file tài liệu` : "Chọn ảnh và file GPLX"}</Typography>
                  <Typography variant="caption" className="text-slate-500">Mỗi file tối đa 5MB. Hệ thống sẽ đối chiếu đủ file cho từng tài xế.</Typography>
                </CardContent>
              </Card>
              {documentFiles.length > 0 && <Box className="grid max-h-40 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">{documentFiles.map((file) => <Box key={file.name} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"><span className="font-medium">{file.name}</span><span className="ml-2 text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)}MB</span></Box>)}</Box>}
            </Box>
          )}

          {importStep === 3 && (
            <Box className="space-y-4">
              <Box className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <Typography variant="subtitle2" className="font-bold text-slate-800">Kiểm tra trước khi gửi</Typography>
                <Typography variant="body2" className="mt-1 text-slate-600">{importRows.length} tài xế sẽ được tạo ở trạng thái Chờ duyệt. Admin sẽ kiểm tra từng bộ hồ sơ.</Typography>
              </Box>
              <Box className="max-h-60 space-y-2 overflow-y-auto">{importRows.map((row) => <Box key={row.fullName} className="grid grid-cols-1 gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm sm:grid-cols-2"><Typography className="font-semibold text-[#1B4965]">{row.fullName}</Typography><Typography className="truncate text-slate-600">GPLX: {row.licenseImageFile}</Typography></Box>)}</Box>
              <Typography variant="caption" className="block text-slate-500">Sau khi gửi, hồ sơ sẽ xuất hiện trong danh sách Chờ duyệt của bạn.</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions className="border-t border-slate-100 px-6 pb-5 pt-3">
          {importStep > 1 && <Button onClick={handleImportBack} color="inherit" sx={{ borderRadius: "8px", fontWeight: 600 }}>Quay lại</Button>}
          <Button onClick={handleCloseImport} color="inherit" sx={{ borderRadius: "8px", fontWeight: 600 }}>Hủy bỏ</Button>
          <Button onClick={handleBulkImport} disabled={saving || (importStep === 1 && !importRows.length)} variant="contained" sx={{ borderRadius: "8px", backgroundColor: "#1B4965", fontWeight: 600 }}>
            {saving ? "Đang gửi..." : importStep === 3 ? "Gửi hồ sơ" : "Tiếp tục"}
          </Button>
        </DialogActions>
      </Dialog>

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
                <Typography variant="h5" className="font-bold text-slate-800">{selectedDriver.name || selectedDriver.fullName}</Typography>
                <Typography variant="body1" className="text-slate-500">{selectedDriver.phone}</Typography>
              </Box>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body2" className="text-slate-500">Số Giấy phép lái xe</Typography>
                <Typography variant="body1" className="font-medium text-[#1B4965] font-mono font-bold">
                  {selectedDriver.licenseClass || selectedDriver.licenseNumber}
                </Typography>
              </Grid>
            </Grid>

            <Divider className="my-2" />

            <Typography variant="subtitle2" className="font-bold text-slate-800">Ảnh chụp Giấy phép lái xe</Typography>
            <Box className="w-full h-40 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center relative overflow-hidden group p-2">
              {selectedDriver.licenseImageUrl ? (
                <Button component="a" href={selectedDriver.licenseImageUrl} target="_blank" rel="noreferrer" size="small" variant="outlined">
                  Mở ảnh bằng lái gốc
                </Button>
              ) : (
                <Typography variant="caption" className="px-2 text-center text-slate-500">Chưa có ảnh bằng lái</Typography>
              )}
            </Box>

            <Box className="flex flex-col gap-3 mt-6">
              <Button onClick={() => handleOpenEdit(selectedDriver)} startIcon={<EditIcon />} variant="contained" fullWidth sx={{ borderRadius: "8px", backgroundColor: "#1B4965", fontWeight: 600 }}>
                Cập nhật thông tin tài xế
              </Button>
              <Button onClick={() => handleDelete(selectedDriver)} color="error" variant="outlined" fullWidth sx={{ borderRadius: "8px" }}>
                Xóa tài xế
              </Button>
            </Box>
          </Box>
        )}
      </DetailDrawer>
    </Box>
  );
}
