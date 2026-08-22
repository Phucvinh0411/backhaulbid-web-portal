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
import MenuItem from "@mui/material/MenuItem";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { Add as AddIcon, DirectionsCar as DirectionsCarIcon, Settings as SettingsIcon, FileUpload as FileUploadIcon, Edit as EditIcon } from "@mui/icons-material";
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
import { createVehicle, deactivateVehicle, getMyVehicles, updateVehicle } from "@/services/fleetApi";
import { downloadCsvTemplate, parseSimpleCsv } from "@/services/csvImport";
import { mediaApi } from "@/services/mediaApi";

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState("CARD");
  const [openModal, setOpenModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [openImportModal, setOpenImportModal] = useState(false);
  const [importStep, setImportStep] = useState(1);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [saving, setSaving] = useState(false);
  const [importRows, setImportRows] = useState([]);
  const [importFileName, setImportFileName] = useState("");
  const [documentFiles, setDocumentFiles] = useState([]);
  const [createStep, setCreateStep] = useState(1);
  const [documents, setDocuments] = useState({ registration: null, inspection: null });
  const [editDocuments, setEditDocuments] = useState({ registration: null, inspection: null });

  const [form, setForm] = useState({
    licensePlate: "",
    payloadCapacity: "",
    vehicleType: "TRUCK_MEDIUM",
    bodyType: "",
  });

  const [editForm, setEditForm] = useState({
    id: "",
    licensePlate: "",
    payloadCapacity: "",
    vehicleType: "TRUCK_MEDIUM",
    bodyType: "",
  });

  const loadVehicles = async () => {
    setLoading(true);
    setError("");
    try {
      setVehicles(await getMyVehicles());
    } catch (loadError) {
      setError(loadError?.response?.data?.message || "Không thể tải danh sách phương tiện.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

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

  const handleOpen = () => {
    setForm({ licensePlate: "", payloadCapacity: "", vehicleType: "TRUCK_MEDIUM", bodyType: "" });
    setDocuments({ registration: null, inspection: null });
    setCreateStep(1);
    setError("");
    setOpenModal(true);
  };
  const handleClose = () => setOpenModal(false);

  const handleCreate = async () => {
    if (createStep < 3) {
      if (createStep === 1 && (!form.licensePlate || !form.payloadCapacity || Number(form.payloadCapacity) <= 0)) {
        setError("Vui long nhap bien so va tai trong hop le.");
        return;
      }
      if (createStep === 2 && (!documents.registration || !documents.inspection)) {
        setError("Vui long upload ca vet/dang ky va dang kiem.");
        return;
      }
      setError("");
      setCreateStep((current) => current + 1);
      return;
    }
    setSaving(true);
    setError("");
    try {
      let registrationUrl = form.registrationUrl || "";
      if (documents.registration) {
        registrationUrl = await mediaApi.uploadFile(documents.registration, "vehicles/registration");
      }
      let inspectionUrl = form.inspectionUrl || "";
      if (documents.inspection) {
        inspectionUrl = await mediaApi.uploadFile(documents.inspection, "vehicles/inspection");
      }
      await createVehicle({ ...form, payloadCapacity: Number(form.payloadCapacity), registrationUrl, inspectionUrl });
      await loadVehicles();
      setOpenModal(false);
      setSuccessMsg("Thêm phương tiện mới thành công! Hồ sơ đang chờ Admin duyệt.");
    } catch (saveError) {
      setError(saveError?.response?.data?.message || "Không thể gửi phương tiện để duyệt.");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateBack = () => {
    setError("");
    setCreateStep((current) => Math.max(1, current - 1));
  };

  const handleDocumentChange = (key, event) => {
    const file = event.target.files?.[0] || null;
    event.target.value = "";
    if (!file) return;
    if (!/^image\/(jpeg|png)$|^application\/pdf$/.test(file.type) || file.size > 5 * 1024 * 1024) {
      setError("Ho so chi nhan JPG, PNG hoac PDF, dung luong toi da 5MB.");
      return;
    }
    setDocuments((current) => ({ ...current, [key]: file }));
    setError("");
  };

  const handleOpenEdit = (vehicle) => {
    const v = vehicle || selectedVehicle;
    if (!v) return;
    setEditForm({
      id: v.id,
      licensePlate: v.licensePlate || v.plate || "",
      payloadCapacity: String(v.payloadCapacity || ""),
      vehicleType: v.vehicleType || "TRUCK_MEDIUM",
      bodyType: v.bodyType || "",
    });
    setEditDocuments({ registration: null, inspection: null });
    setError("");
    setOpenEditModal(true);
  };
  const handleCloseEdit = () => setOpenEditModal(false);

  const handleSaveEdit = async () => {
    setSaving(true);
    setError("");
    try {
      const metadata = {
        licensePlate: editForm.licensePlate,
        payloadCapacity: Number(editForm.payloadCapacity),
        vehicleType: editForm.vehicleType,
        bodyType: editForm.bodyType,
      };
      let registrationUrl = editForm.registrationUrl;
      let inspectionUrl = editForm.inspectionUrl;
      if (editDocuments.registration) {
        registrationUrl = await mediaApi.uploadFile(editDocuments.registration, "vehicles/registration");
      }
      if (editDocuments.inspection) {
        inspectionUrl = await mediaApi.uploadFile(editDocuments.inspection, "vehicles/inspection");
      }
      metadata.registrationUrl = registrationUrl;
      metadata.inspectionUrl = inspectionUrl;
      await updateVehicle(editForm.id, metadata);
      await loadVehicles();
      setOpenEditModal(false);
      if (selectedVehicle) {
        setSelectedVehicle((prev) => ({
          ...prev,
          licensePlate: editForm.licensePlate,
          plate: editForm.licensePlate,
          payloadCapacity: editForm.payloadCapacity,
          capacity: `${editForm.payloadCapacity} tấn`,
          vehicleType: editForm.vehicleType,
          bodyType: editForm.bodyType,
          type: editForm.bodyType || editForm.vehicleType,
        }));
      }
      setSuccessMsg("Cập nhật thông tin phương tiện thành công!");
    } catch (updateError) {
      setError(updateError?.response?.data?.message || "Không thể cập nhật phương tiện.");
    } finally {
      setSaving(false);
    }
  };

  const handleEditDocumentChange = (key, event) => {
    const file = event.target.files?.[0] || null;
    event.target.value = "";
    if (!file) return;
    if (!/^image\/(jpeg|png)$|^application\/pdf$/.test(file.type) || file.size > 5 * 1024 * 1024) {
      setError("Ho so chi nhan JPG, PNG hoac PDF, dung luong toi da 5MB.");
      return;
    }
    setEditDocuments((current) => ({ ...current, [key]: file }));
    setError("");
  };

  const handleDeactivate = async (vehicle) => {
    if (!window.confirm("Ban co chac muon vo hieu hoa xe nay?")) return;
    try {
      await deactivateVehicle(vehicle.id);
      await loadVehicles();
      setSelectedVehicle(null);
      setSuccessMsg("Đã vô hiệu hóa phương tiện.");
    } catch (deactivateError) {
      setError(deactivateError?.response?.data?.message || "Không thể vô hiệu hóa phương tiện.");
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
        licensePlate: row.licensePlate,
        payloadCapacity: Number(row.payloadCapacity),
        vehicleType: row.vehicleType || "TRUCK_MEDIUM",
        bodyType: row.bodyType || "",
        registrationFile: row.registrationFile || row.cavetImage || "",
        inspectionFile: row.inspectionFile || row.dangKiemImage || "",
      }));
      if (rows.some((row) => !row.licensePlate || !Number.isFinite(row.payloadCapacity) || row.payloadCapacity <= 0)) {
        throw new Error("Mỗi dòng phải có licensePlate và payloadCapacity lớn hơn 0");
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
    const missing = importRows.flatMap((row) => {
      const missingForRow = [];
      if (!findImportDocument(row.registrationFile)) missingForRow.push(`cà vẹt của ${row.licensePlate}`);
      if (!findImportDocument(row.inspectionFile)) missingForRow.push(`đăng kiểm của ${row.licensePlate}`);
      return missingForRow;
    });
    if (missing.length) {
      setError(`Chưa tìm thấy ${missing.slice(0, 2).join(" và ")}${missing.length > 2 ? " và các tệp liên quan" : ""}. Kiểm tra lại tên file trong CSV.`);
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
        const registrationUrl = await mediaApi.uploadFile(
          findImportDocument(row.registrationFile),
          "vehicles/registration"
        );
        const inspectionUrl = await mediaApi.uploadFile(
          findImportDocument(row.inspectionFile),
          "vehicles/inspection"
        );
        await createVehicle({
          licensePlate: row.licensePlate,
          payloadCapacity: row.payloadCapacity,
          vehicleType: row.vehicleType,
          bodyType: row.bodyType,
          registrationUrl,
          inspectionUrl,
        });
      }
      setSuccessMsg(`Đã gửi ${importRows.length} hồ sơ phương tiện để Admin xét duyệt.`);
      await loadVehicles();
      setOpenImportModal(false);
      setImportRows([]);
      setImportFileName("");
      setDocumentFiles([]);
      setImportStep(1);
    } catch (importError) {
      setError(importError?.response?.data?.message || "Không thể gửi danh sách phương tiện.");
    } finally {
      setSaving(false);
    }
  };

  const handleImportBack = () => {
    setError("");
    setImportStep((current) => Math.max(1, current - 1));
  };

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

      {error && <Box role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</Box>}
      {successMsg && <Box role="status" className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{successMsg}</Box>}
      {loading && <Box role="status" className="mb-4 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">Đang tải dữ liệu phương tiện...</Box>}

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
                          <Box className="flex justify-end gap-1">
                            <Button 
                              size="small" 
                              variant="text" 
                              color="primary" 
                              startIcon={<EditIcon />} 
                              onClick={() => handleOpenEdit(v)}
                              sx={{ borderRadius: "6px" }}
                            >
                              Sửa
                            </Button>
                            <Button 
                              size="small" 
                              variant="outlined" 
                              color="primary" 
                              startIcon={<SettingsIcon />} 
                              onClick={() => handleOpenDetails(v)}
                              sx={{ borderRadius: "6px" }}
                            >
                              Chi tiết
                            </Button>
                          </Box>
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
      <Dialog open={openModal} onClose={handleClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: "12px" } }}>
        <DialogTitle sx={{ borderBottom: "1px solid #f1f5f9", pb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#1B4965" }}>Khai báo phương tiện mới</Typography>
          <Typography variant="body2" sx={{ mt: 0.5, color: "#64748b" }}>Hoàn thiện thông tin và hồ sơ trước khi gửi Admin xét duyệt.</Typography>
        </DialogTitle>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, px: 3, pt: 2 }} aria-label="Tiến trình khai báo phương tiện">
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
                label="Biển số xe" placeholder="VD: 29H-123.45"
                required
                value={form.licensePlate}
                onChange={(event) => setForm((current) => ({ ...current, licensePlate: event.target.value }))}
              />
              <TextField
                fullWidth size="small" variant="outlined"
                label="Tải trọng (Tấn)" type="number"
                required
                value={form.payloadCapacity}
                onChange={(event) => setForm((current) => ({ ...current, payloadCapacity: event.target.value }))}
              />
              <TextField
                select fullWidth size="small" variant="outlined"
                label="Loại xe"
                value={form.vehicleType}
                onChange={(event) => setForm((current) => ({ ...current, vehicleType: event.target.value }))}
                required
              >
                <MenuItem value="TRUCK_SMALL">Xe tải nhỏ</MenuItem>
                <MenuItem value="TRUCK_MEDIUM">Xe tải trung</MenuItem>
                <MenuItem value="TRUCK_HEAVY">Xe tải nặng</MenuItem>
                <MenuItem value="CONTAINER_TRACTOR">Đầu kéo container</MenuItem>
                <MenuItem value="REFRIGERATED_TRUCK">Xe tải đông lạnh</MenuItem>
                <MenuItem value="SPECIALIZED_TRUCK">Xe chuyên dụng</MenuItem>
              </TextField>
              <TextField
                fullWidth size="small" variant="outlined"
                label="Mô tả thân xe" placeholder="VD: Thùng kín 6.2m x 2.1m"
                value={form.bodyType}
                onChange={(event) => setForm((current) => ({ ...current, bodyType: event.target.value }))}
              />
            </Stack>
          )}

          {createStep === 2 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#334155" }}>Tài liệu bắt buộc</Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
                {[{ key: "registration", label: "Cà vẹt / đăng ký xe" }, { key: "inspection", label: "Đăng kiểm" }].map((document) => (
                  <Card key={document.key} component="label" variant="outlined" sx={{
                    cursor: "pointer",
                    borderStyle: "dashed",
                    borderWidth: 2,
                    bgcolor: "#f8fafc",
                    transition: "border-color 0.2s",
                    "&:hover": { borderColor: "#1B4965" }
                  }}>
                    <input hidden type="file" accept="image/jpeg,image/png,application/pdf" onChange={(event) => handleDocumentChange(document.key, event)} />
                    <CardContent sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5, py: "12px !important" }}>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#334155" }}>{document.label} *</Typography>
                        <Typography variant="caption" sx={{ color: "#94a3b8" }}>JPG, PNG hoặc PDF, tối đa 5MB</Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "#1B4965", whiteSpace: "nowrap", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis" }}>
                        {documents[document.key]?.name || "Chọn tệp"}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>
          )}

          {createStep === 3 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, borderRadius: "12px", border: "1px solid #e2e8f0", bgcolor: "#f8fafc", p: 2.5 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#1e293b" }}>Kiểm tra trước khi gửi</Typography>
              <Typography variant="body2">Biển số: <strong>{form.licensePlate}</strong></Typography>
              <Typography variant="body2">Tải trọng: <strong>{form.payloadCapacity} tấn</strong></Typography>
              <Typography variant="body2">Cà vẹt: <strong>{documents.registration?.name}</strong></Typography>
              <Typography variant="body2">Đăng kiểm: <strong>{documents.inspection?.name}</strong></Typography>
              <Typography variant="caption" sx={{ color: "#64748b", display: "block" }}>Sau khi gửi, xe sẽ ở trạng thái Chờ duyệt để Admin kiểm tra hồ sơ.</Typography>
            </Box>
          )}

          <Box sx={{ p: 1.5, bgcolor: "#eff6ff", color: "#1e40af", borderRadius: "8px", fontSize: "0.8125rem", border: "1px solid #bfdbfe" }}>
            <strong>Lưu ý:</strong> Phương tiện mới thêm sẽ ở trạng thái <strong>Chờ duyệt</strong> trước khi tham gia đấu giá.
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

      {/* Modal Chỉnh sửa thông số xe */}
      <Dialog open={openEditModal} onClose={handleCloseEdit} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: "12px" } }}>
        <DialogTitle sx={{ borderBottom: "1px solid #f1f5f9", pb: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <EditIcon sx={{ color: "#1B4965", fontSize: 22 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#1B4965" }}>Chỉnh sửa thông số Phương tiện</Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            fullWidth size="small" variant="outlined"
            label="Biển số xe" required
            value={editForm.licensePlate}
            onChange={(e) => setEditForm((prev) => ({ ...prev, licensePlate: e.target.value }))}
          />
          <TextField
            fullWidth size="small" variant="outlined"
            label="Tải trọng (Tấn)" type="number" required
            value={editForm.payloadCapacity}
            onChange={(e) => setEditForm((prev) => ({ ...prev, payloadCapacity: e.target.value }))}
          />
          <TextField
            select fullWidth size="small" variant="outlined"
            label="Loại xe" required
            value={editForm.vehicleType}
            onChange={(e) => setEditForm((prev) => ({ ...prev, vehicleType: e.target.value }))}
          >
            <MenuItem value="TRUCK_SMALL">Xe tải nhỏ</MenuItem>
            <MenuItem value="TRUCK_MEDIUM">Xe tải trung</MenuItem>
            <MenuItem value="TRUCK_HEAVY">Xe tải nặng</MenuItem>
            <MenuItem value="CONTAINER_TRACTOR">Đầu kéo container</MenuItem>
            <MenuItem value="REFRIGERATED_TRUCK">Xe tải đông lạnh</MenuItem>
            <MenuItem value="SPECIALIZED_TRUCK">Xe chuyên dụng</MenuItem>
          </TextField>
          <TextField
            fullWidth size="small" variant="outlined"
            label="Mô tả thân xe"
            value={editForm.bodyType}
            onChange={(e) => setEditForm((prev) => ({ ...prev, bodyType: e.target.value }))}
          />
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#334155", mb: 1.5 }}>Thay hồ sơ (không bắt buộc)</Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
              {[{ key: "registration", label: "Cà vẹt / đăng ký xe" }, { key: "inspection", label: "Đăng kiểm" }].map((document) => (
                <Card key={document.key} component="label" variant="outlined" sx={{
                  cursor: "pointer",
                  borderStyle: "dashed",
                  borderWidth: 2,
                  bgcolor: "#f8fafc",
                  transition: "border-color 0.2s",
                  "&:hover": { borderColor: "#1B4965" }
                }}>
                  <input hidden type="file" accept="image/jpeg,image/png,application/pdf" onChange={(event) => handleEditDocumentChange(document.key, event)} />
                  <CardContent sx={{ p: "10px 12px !important" }}>
                    <Typography variant="caption" sx={{ display: "block", color: "#64748b" }}>{document.label}</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: "#1B4965", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {editDocuments[document.key]?.name || "Giữ nguyên hồ sơ hiện tại"}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 1.5, borderTop: "1px solid #f1f5f9" }}>
          <Button onClick={handleCloseEdit} color="inherit" sx={{ borderRadius: "8px", fontWeight: 600 }}>Hủy bỏ</Button>
          <Button onClick={handleSaveEdit} disabled={saving || !editForm.licensePlate || !editForm.payloadCapacity} variant="contained" sx={{ borderRadius: "8px", bgcolor: "#1B4965", fontWeight: 600, "&:hover": { bgcolor: "#0d2b3e" } }}>
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Drawer Chi tiết Phương tiện */}
      <Dialog open={openImportModal} onClose={handleCloseImport} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: "12px" } }}>
        <DialogTitle className="border-b border-slate-100 pb-3">
          <Typography variant="h6" className="font-bold text-[#1B4965]">Nhập hồ sơ phương tiện</Typography>
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
                <Typography variant="body2" className="mt-1 text-slate-600">Mỗi dòng CSV là một phương tiện. Tên file tài liệu ở hai cột cuối sẽ được đối chiếu ở bước tiếp theo.</Typography>
              </Box>
              <Box className="flex flex-wrap items-center justify-between gap-3">
                <Typography variant="body2" className="text-slate-600">Định dạng: CSV, tối đa 500 dòng.</Typography>
                <Button size="small" variant="outlined" startIcon={<FileDownloadIcon />} onClick={() => downloadCsvTemplate("vehicles-template.csv", "licensePlate,payloadCapacity,vehicleType,bodyType,registrationFile,inspectionFile\n29H-123.45,10.5,TRUCK_MEDIUM,Thung bat,29H12345_cavet.jpg,29H12345_dangkiem.jpg\n")} sx={{ textTransform: "none", fontWeight: 600 }}>Tải file mẫu</Button>
              </Box>
              <Card component="label" htmlFor="vehicle-csv-input-v2" variant="outlined" className="cursor-pointer border-2 border-dashed bg-slate-50 transition-colors hover:border-[#1B4965]">
                <input id="vehicle-csv-input-v2" hidden type="file" accept=".csv,text/csv" onChange={handleImportCsvFile} />
                <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
                  <FileUploadIcon sx={{ fontSize: 42, color: "#1B4965" }} />
                  <Typography variant="subtitle1" className="font-semibold text-slate-700">{importFileName || "Chọn file CSV thông tin"}</Typography>
                  <Typography variant="caption" className="text-slate-500">Bắt buộc có biển số, tải trọng và tên file cà vẹt, đăng kiểm.</Typography>
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
              <Card component="label" htmlFor="vehicle-documents-input-v2" variant="outlined" className="cursor-pointer border-2 border-dashed bg-slate-50 transition-colors hover:border-[#1B4965]">
                <input id="vehicle-documents-input-v2" hidden multiple type="file" accept="image/jpeg,image/png,application/pdf" onChange={handleImportDocumentFiles} />
                <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
                  <FileUploadIcon sx={{ fontSize: 42, color: "#1B4965" }} />
                  <Typography variant="subtitle1" className="font-semibold text-slate-700">{documentFiles.length ? `Đã chọn ${documentFiles.length} file tài liệu` : "Chọn ảnh và file hồ sơ"}</Typography>
                  <Typography variant="caption" className="text-slate-500">Mỗi file tối đa 5MB. Hệ thống sẽ kiểm tra đủ cà vẹt và đăng kiểm cho từng xe.</Typography>
                </CardContent>
              </Card>
              {documentFiles.length > 0 && <Box className="grid max-h-40 grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">{documentFiles.map((file) => <Box key={file.name} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"><span className="font-medium">{file.name}</span><span className="ml-2 text-xs text-slate-400">{(file.size / 1024 / 1024).toFixed(2)}MB</span></Box>)}</Box>}
            </Box>
          )}

          {importStep === 3 && (
            <Box className="space-y-4">
              <Box className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                <Typography variant="subtitle2" className="font-bold text-slate-800">Kiểm tra trước khi gửi</Typography>
                <Typography variant="body2" className="mt-1 text-slate-600">{importRows.length} phương tiện sẽ được tạo ở trạng thái Chờ duyệt. Admin sẽ kiểm tra từng bộ hồ sơ.</Typography>
              </Box>
              <Box className="max-h-60 space-y-2 overflow-y-auto">{importRows.map((row) => <Box key={row.licensePlate} className="grid grid-cols-1 gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm sm:grid-cols-3"><Typography className="font-semibold text-[#1B4965]">{row.licensePlate}</Typography><Typography className="truncate text-slate-600">Cà vẹt: {row.registrationFile}</Typography><Typography className="truncate text-slate-600">Đăng kiểm: {row.inspectionFile}</Typography></Box>)}</Box>
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
                <Box className="w-full h-32 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center relative overflow-hidden group p-1">
                  {selectedVehicle.registrationDocumentUrl ? (
                    <Button component="a" href={selectedVehicle.registrationDocumentUrl} target="_blank" rel="noreferrer" size="small" variant="outlined">
                      Xem Cà vẹt
                    </Button>
                  ) : (
                    <Typography variant="caption" className="px-2 text-center text-slate-500">Chưa có ảnh cà vẹt</Typography>
                  )}
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" className="text-slate-500 mb-1">Sổ đăng kiểm</Typography>
                <Box className="w-full h-32 bg-slate-100 rounded-lg border border-slate-200 flex items-center justify-center relative overflow-hidden group p-1">
                  {selectedVehicle.inspectionDocumentUrl ? (
                    <Button component="a" href={selectedVehicle.inspectionDocumentUrl} target="_blank" rel="noreferrer" size="small" variant="outlined">
                      Xem Đăng kiểm
                    </Button>
                  ) : (
                    <Typography variant="caption" className="px-2 text-center text-slate-500">Chưa có ảnh đăng kiểm</Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
            
            <Box className="flex flex-col gap-3 mt-6">
              <Button onClick={() => handleOpenEdit(selectedVehicle)} startIcon={<EditIcon />} variant="contained" fullWidth sx={{ borderRadius: "8px", backgroundColor: "#1B4965", fontWeight: 600 }}>
                Cập nhật thông tin xe
              </Button>
              <Button color="error" variant="outlined" fullWidth sx={{ borderRadius: "8px" }} onClick={() => handleDeactivate(selectedVehicle)}>
                Vô hiệu hóa xe
              </Button>
            </Box>
          </Box>
        )}
      </DetailDrawer>
    </Box>
  );
}
