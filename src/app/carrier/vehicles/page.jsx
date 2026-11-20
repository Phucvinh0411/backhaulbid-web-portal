"use client";

import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import useMediaQuery from "@mui/material/useMediaQuery";
import { ConfirmDialog, EmptyState, ErrorState, ListSkeleton } from "@/components/ui";
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
import {
  Add as AddIcon,
  DirectionsCar as DirectionsCarIcon,
  Settings as SettingsIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
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
import {
  createVehicle,
  deactivateVehicle,
  getMyVehicles,
  updateVehicle,
} from "@/services/fleetApi";
import { mediaApi } from "@/services/mediaApi";
import { getApiErrorMessage } from "@/services/errorMessage";
import { useGlobalNotification } from "@/components/common/NotificationPopup";

export default function VehiclesPage() {
  const notify = useGlobalNotification();
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const [loadErrorMessage, setLoadErrorMessage] = useState("");
  const [vehicles, setVehicles] = useState([]);
  const [confirmDeactivate, setConfirmDeactivate] = useState(null);
  const [loading, setLoading] = useState(true);
  const setError = (message) => {
    if (message) notify.error(message);
  };
  const setSuccessMsg = (message) => notify.success(message);
  const [filter, setFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState("CARD");
  const [openModal, setOpenModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [saving, setSaving] = useState(false);
  const [createStep, setCreateStep] = useState(1);
  const [documents, setDocuments] = useState({
    registration: null,
    inspection: null,
  });
  const [editDocuments, setEditDocuments] = useState({
    registration: null,
    inspection: null,
  });

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
    setLoadErrorMessage("");
    setError("");
    try {
      setVehicles(await getMyVehicles());
    } catch (loadError) {
      const message = getApiErrorMessage(loadError, "Không thể tải danh sách phương tiện. Vui lòng thử lại.");
      setLoadErrorMessage(message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const [columnsList, setColumnsList] = useState([
    { id: "plate", label: "Biển số xe" },
    { id: "capacity", label: "Tải trọng" },
    { id: "type", label: "Loại xe" },
    { id: "verification", label: "Kiểm duyệt" },
    { id: "active", label: "Trạng thái xe" },
    { id: "actions", label: "Thao tác", align: "right", sortable: false },
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
    return vehicles.filter((v) => {
      if (filter === "VERIFIED") return v.verification === "VERIFIED";
      if (filter === "PENDING") return v.verification === "PENDING";
      if (filter === "REJECTED") return v.verification === "REJECTED";
      return true;
    });
  }, [vehicles, filter]);

  const sortedVehicles = React.useMemo(() => {
    let result = [...filteredVehicles];
    result.sort((a, b) => {
      let comparison = String(a[orderBy] || "").localeCompare(
        String(b[orderBy] || ""),
      );
      return order === "desc" ? -comparison : comparison;
    });
    return result;
  }, [filteredVehicles, order, orderBy]);

  const handleOpen = () => {
    setForm({
      licensePlate: "",
      payloadCapacity: "",
      vehicleType: "TRUCK_MEDIUM",
      bodyType: "",
    });
    setDocuments({ registration: null, inspection: null });
    setCreateStep(1);
    setError("");
    setOpenModal(true);
  };
  const handleClose = () => setOpenModal(false);

  const handleCreate = async () => {
    if (createStep < 3) {
      if (
        createStep === 1 &&
        (!form.licensePlate ||
          !form.payloadCapacity ||
          Number(form.payloadCapacity) <= 0)
      ) {
        setError("Vui lòng nhập biển số và tải trọng hợp lệ.");
        return;
      }
      if (
        createStep === 2 &&
        (!documents.registration || !documents.inspection)
      ) {
        setError("Vui lòng tải lên cà vẹt/đăng ký và đăng kiểm.");
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
        registrationUrl = await mediaApi.uploadFile(
          documents.registration,
          "vehicles/registration",
        );
      }
      let inspectionUrl = form.inspectionUrl || "";
      if (documents.inspection) {
        inspectionUrl = await mediaApi.uploadFile(
          documents.inspection,
          "vehicles/inspection",
        );
      }
      await createVehicle({
        ...form,
        payloadCapacity: Number(form.payloadCapacity),
        registrationUrl,
        inspectionUrl,
      });
      await loadVehicles();
      setOpenModal(false);
      setSuccessMsg(
        "Thêm phương tiện mới thành công! Hồ sơ đang chờ Admin duyệt.",
      );
    } catch (saveError) {
      setError(
        getApiErrorMessage(
          saveError,
          "Không thể gửi phương tiện để duyệt. Vui lòng kiểm tra hồ sơ rồi thử lại.",
        ),
      );
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
    if (
      !/^image\/(jpeg|png)$|^application\/pdf$/.test(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      setError("Hồ sơ chỉ nhận JPG, PNG hoặc PDF, dung lượng tối đa 5MB.");
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
        registrationUrl = await mediaApi.uploadFile(
          editDocuments.registration,
          "vehicles/registration",
        );
      }
      if (editDocuments.inspection) {
        inspectionUrl = await mediaApi.uploadFile(
          editDocuments.inspection,
          "vehicles/inspection",
        );
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
      setError(
        getApiErrorMessage(
          updateError,
          "Không thể cập nhật phương tiện. Vui lòng kiểm tra lại thông tin.",
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEditDocumentChange = (key, event) => {
    const file = event.target.files?.[0] || null;
    event.target.value = "";
    if (!file) return;
    if (
      !/^image\/(jpeg|png)$|^application\/pdf$/.test(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      setError("Hồ sơ chỉ nhận JPG, PNG hoặc PDF, dung lượng tối đa 5MB.");
      return;
    }
    setEditDocuments((current) => ({ ...current, [key]: file }));
    setError("");
  };

  const handleDeactivate = async (vehicle) => {
    try {
      await deactivateVehicle(vehicle.id);
      await loadVehicles();
      setSelectedVehicle(null);
      setSuccessMsg("Đã vô hiệu hóa phương tiện.");
    } catch (deactivateError) {
      setError(
        getApiErrorMessage(
          deactivateError,
          "Không thể vô hiệu hóa phương tiện. Vui lòng thử lại.",
        ),
      );
    }
  };

  const handleOpenDetails = (vehicle) => setSelectedVehicle(vehicle);
  const handleCloseDetails = () => setSelectedVehicle(null);

  const getVerificationChip = (status) => {
    switch (status) {
      case "VERIFIED":
        return (
          <Chip
            label="Đã duyệt"
            size="small"
            color="success"
            className="font-semibold"
          />
        );
      case "PENDING":
        return (
          <Chip
            label="Chờ duyệt"
            size="small"
            color="warning"
            className="font-semibold text-warning bg-warning-soft"
          />
        );
      case "REJECTED":
        return (
          <Chip
            label="Bị từ chối"
            size="small"
            color="error"
            className="font-semibold"
          />
        );
      default:
        return null;
    }
  };

  return (
    <Box className="animate-fade-in-up">
      <PageHeader
        title="Quản lý phương tiện"
        subtitle="Quản lý danh sách xe tải, thông số kỹ thuật và giấy tờ kiểm định"
        breadcrumbs={[
          { label: "Trang chủ", path: "/carrier/dashboard" },
          { label: "Vận hành" },
          { label: "Phương tiện" },
        ]}
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpen}
          >
            Thêm xe mới
          </Button>
        }
      />

      <Box
        sx={{
          mb: 3,
          borderBottom: 1,
          borderColor: "divider",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Tabs
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          value={filter}
          onChange={(e, v) => setFilter(v)}
          textColor="primary"
          indicatorColor="primary"
          sx={{
            maxWidth: "100%",
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.95rem",
            },
          }}
        >
          <Tab value="ALL" label="Tất cả" />
          <Tab value="VERIFIED" label="Đã duyệt" />
          <Tab value="PENDING" label="Chờ duyệt" />
          <Tab value="REJECTED" label="Bị từ chối" />
        </Tabs>

        {!isMobile && <ViewModeToggle
          viewMode={viewMode}
          onChange={setViewMode}
          sx={{ mb: { xs: 2, sm: 0 } }}
        />}
      </Box>

      {loading && <ListSkeleton rows={3} height={140} label="Đang tải dữ liệu phương tiện..." />}

      {!loading && loadErrorMessage && <ErrorState description={loadErrorMessage} onRetry={loadVehicles} />}
      {!loading && !loadErrorMessage && filteredVehicles.length === 0 && (
        <EmptyState
          title={filter === "ALL" ? "Chưa có phương tiện" : "Không có phương tiện trong nhóm này"}
          description={filter === "ALL" ? "Thêm hồ sơ và gửi duyệt để có thể phân công chuyến." : "Chọn nhóm khác để xem các hồ sơ còn lại."}
          action={<Button variant="outlined" onClick={filter === "ALL" ? handleOpen : () => setFilter("ALL")}>{filter === "ALL" ? "Thêm phương tiện" : "Xem tất cả"}</Button>}
        />
      )}

      {!loading && !loadErrorMessage && sortedVehicles.length > 0 && (isMobile || viewMode === "CARD" ? (
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
        <TableContainer
          component={Paper}
          className="rounded-xl border border-line shadow-sm overflow-x-auto"
        >
          <Table sx={{ minWidth: 650 }}>
            <TableHead className="bg-surface-sunken">
              <TableRow>
                {columnsList.map((col, idx) => (
                  <TableCell
                    key={col.id}
                    align={col.align || "left"}
                    draggable
                    onDragStart={(e) => handleDragStart(e, idx)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, idx)}
                    className="font-bold text-ink-muted select-none cursor-move hover:bg-surface-sunken transition-colors"
                  >
                    {col.sortable !== false ? (
                      <TableSortLabel
                        active={orderBy === col.id}
                        direction={orderBy === col.id ? order : "asc"}
                        onClick={() => handleRequestSort(col.id)}
                      >
                        {col.label}
                      </TableSortLabel>
                    ) : (
                      col.label
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedVehicles.map((v) => (
                <TableRow key={v.id} hover className="transition-colors">
                  {columnsList.map((col) => {
                    if (col.id === "plate") {
                      return (
                        <TableCell key={col.id}>
                          <Box className="flex items-center gap-2">
                            <DirectionsCarIcon
                              sx={{ color: "var(--color-brand)", fontSize: 20 }}
                            />
                            <Typography
                              variant="body2"
                              className="font-mono font-bold text-[var(--color-brand)]"
                            >
                              {v.plate}
                            </Typography>
                          </Box>
                        </TableCell>
                      );
                    }
                    if (col.id === "capacity") {
                      return (
                        <TableCell key={col.id}>
                          <Typography
                            variant="body2"
                            className="text-ink"
                          >
                            {v.capacity}
                          </Typography>
                        </TableCell>
                      );
                    }
                    if (col.id === "type") {
                      return (
                        <TableCell key={col.id}>
                          <Typography
                            variant="body2"
                            className="text-ink font-bold"
                          >
                            {v.type}
                          </Typography>
                          {v.bodyType && (
                            <Typography
                              variant="caption"
                              className="text-ink-muted block text-[0.72rem]"
                            >
                              {v.bodyType}
                            </Typography>
                          )}
                        </TableCell>
                      );
                    }
                    if (col.id === "verification") {
                      return (
                        <TableCell key={col.id}>
                          {getVerificationChip(v.verification)}
                        </TableCell>
                      );
                    }
                    if (col.id === "active") {
                      return (
                        <TableCell key={col.id}>
                          <Typography
                            variant="body2"
                            className={`font-medium ${v.active ? "text-success" : "text-ink-muted"}`}
                          >
                            {v.active ? "Sẵn sàng" : "Bảo trì"}
                          </Typography>
                        </TableCell>
                      );
                    }
                    if (col.id === "actions") {
                      return (
                        <TableCell key={col.id} align="right">
                          <Box className="flex justify-end gap-1">
                            <Button
                              size="small"
                              variant="text"
                              color="primary"
                              startIcon={<EditIcon />}
                              onClick={() => handleOpenEdit(v)}
                            >
                              Sửa
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="primary"
                              startIcon={<SettingsIcon />}
                              onClick={() => handleOpenDetails(v)}
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
      ))}

      {/* Modal Thêm xe mới */}
      <Dialog
        open={openModal}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ borderBottom: "1px solid var(--color-surface-sunken)", pb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "var(--color-brand)" }}>
            Khai báo phương tiện mới
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5, color: "var(--color-ink-muted)" }}>
            Hoàn thiện thông tin và hồ sơ trước khi gửi Admin xét duyệt.
          </Typography>
        </DialogTitle>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 1,
            px: 3,
            pt: 2,
          }}
          aria-label="Tiến trình khai báo phương tiện"
        >
          {["Thông tin", "Hồ sơ", "Xác nhận"].map((label, index) => (
            <Box
              key={label}
              sx={{
                borderRadius: "8px",
                border: "1px solid",
                px: 1.5,
                py: 1,
                textAlign: "center",
                fontSize: "0.8125rem",
                fontWeight: 600,
                borderColor:
                  createStep === index + 1
                    ? "var(--color-brand)"
                    : createStep > index + 1
                      ? "var(--color-success-soft)"
                      : "var(--color-line)",
                bgcolor:
                  createStep === index + 1
                    ? "var(--color-brand)"
                    : createStep > index + 1
                      ? "var(--color-success-soft)"
                      : "var(--color-surface-sunken)",
                color:
                  createStep === index + 1
                    ? "common.white"
                    : createStep > index + 1
                      ? "var(--color-success)"
                      : "var(--color-ink-subtle)",
                transition: "all 0.2s ease",
              }}
            >
              {index + 1}. {label}
            </Box>
          ))}
        </Box>
        <DialogContent
          sx={{ pt: 2.5, display: "flex", flexDirection: "column", gap: 2 }}
        >
          {createStep === 1 && (
            <Stack spacing={2} useFlexGap>
              <TextField
                fullWidth
                size="small"
                label="Biển số xe"
                placeholder="VD: 29H-123.45"
                required
                value={form.licensePlate}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    licensePlate: event.target.value,
                  }))
                }
              />
              <TextField
                fullWidth
                size="small"
                label="Tải trọng (tấn)"
                type="number"
                required
                value={form.payloadCapacity}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    payloadCapacity: event.target.value,
                  }))
                }
              />
              <TextField
                select
                fullWidth
                size="small"
                label="Loại xe"
                value={form.vehicleType}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    vehicleType: event.target.value,
                  }))
                }
                required
              >
                <MenuItem value="TRUCK_SMALL">Xe tải nhỏ</MenuItem>
                <MenuItem value="TRUCK_MEDIUM">Xe tải trung</MenuItem>
                <MenuItem value="TRUCK_HEAVY">Xe tải nặng</MenuItem>
                <MenuItem value="CONTAINER_TRACTOR">Xe đầu kéo container</MenuItem>
                <MenuItem value="REFRIGERATED_TRUCK">Xe tải đông lạnh</MenuItem>
                <MenuItem value="SPECIALIZED_TRUCK">Xe chuyên dụng</MenuItem>
              </TextField>
              <TextField
                fullWidth
                size="small"
                label="Mô tả thân xe"
                placeholder="VD: Thùng kín 6.2m x 2.1m"
                value={form.bodyType}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    bodyType: event.target.value,
                  }))
                }
              />
            </Stack>
          )}

          {createStep === 2 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 700, color: "var(--color-ink-muted)" }}
              >
                Tài liệu bắt buộc
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                  gap: 1.5,
                }}
              >
                {[
                  { key: "registration", label: "Cà vẹt / đăng ký xe" },
                  { key: "inspection", label: "Đăng kiểm" },
                ].map((document) => (
                  <Card
                    key={document.key}
                    component="label"
                    variant="outlined"
                    sx={{
                      cursor: "pointer",
                      borderStyle: "dashed",
                      borderWidth: 2,
                      bgcolor: "var(--color-surface-sunken)",
                      transition: "border-color 0.2s",
                      "&:hover": { borderColor: "var(--color-brand)" },
                    }}
                  >
                    <input
                      hidden
                      type="file"
                      accept="image/jpeg,image/png,application/pdf"
                      onChange={(event) =>
                        handleDocumentChange(document.key, event)
                      }
                    />
                    <CardContent
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 1.5,
                        py: "12px !important",
                      }}
                    >
                      <Box>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 700, color: "var(--color-ink-muted)" }}
                        >
                          {document.label} *
                        </Typography>
                        <Typography variant="caption" sx={{ color: "var(--color-ink-subtle)" }}>
                          JPG, PNG hoặc PDF, tối đa 5MB
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: "var(--color-brand)",
                          whiteSpace: "nowrap",
                          maxWidth: 100,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {documents[document.key]?.name || "Chọn tệp"}
                      </Typography>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>
          )}

          {createStep === 3 && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
                borderRadius: "12px",
                border: "1px solid var(--color-line)",
                bgcolor: "var(--color-surface-sunken)",
                p: 2.5,
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700, color: "var(--color-ink)" }}
              >
                Kiểm tra trước khi gửi
              </Typography>
              <Typography variant="body2">
                Biển số: <strong>{form.licensePlate}</strong>
              </Typography>
              <Typography variant="body2">
                Tải trọng: <strong>{form.payloadCapacity} tấn</strong>
              </Typography>
              <Typography variant="body2">
                Cà vẹt: <strong>{documents.registration?.name}</strong>
              </Typography>
              <Typography variant="body2">
                Đăng kiểm: <strong>{documents.inspection?.name}</strong>
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "var(--color-ink-muted)", display: "block" }}
              >
                Sau khi gửi, xe sẽ ở trạng thái Chờ duyệt để Admin kiểm tra hồ
                sơ.
              </Typography>
            </Box>
          )}

          <Box
            sx={{
              p: 1.5,
              bgcolor: "var(--color-info-soft)",
              color: "var(--color-info)",
              borderRadius: "8px",
              fontSize: "0.8125rem",
              border: "1px solid var(--color-info-soft)",
            }}
          >
            <strong>Lưu ý:</strong> Phương tiện mới thêm sẽ ở trạng thái{" "}
            <strong>Chờ duyệt</strong> trước khi tham gia đấu giá.
          </Box>
        </DialogContent>
        <DialogActions
          sx={{ px: 3, pb: 3, pt: 1.5, borderTop: "1px solid var(--color-surface-sunken)" }}
        >
          {createStep > 1 && (
            <Button onClick={handleCreateBack} color="inherit">
              Quay lại
            </Button>
          )}
          <Button onClick={handleClose} color="inherit">
            Hủy bỏ
          </Button>
          <Button onClick={handleCreate} disabled={saving} variant="contained">
            {saving
              ? "Đang gửi..."
              : createStep === 3
                ? "Gửi yêu cầu xét duyệt"
                : "Tiếp tục"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Chỉnh sửa thông số xe */}
      <Dialog
        open={openEditModal}
        onClose={handleCloseEdit}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            borderBottom: "1px solid var(--color-surface-sunken)",
            pb: 2,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <EditIcon sx={{ color: "var(--color-brand)", fontSize: 22 }} />
          <Typography variant="h6" sx={{ fontWeight: 700, color: "var(--color-brand)" }}>
            Chỉnh sửa thông số Phương tiện
          </Typography>
        </DialogTitle>
        <DialogContent
          sx={{ pt: 2.5, display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            fullWidth
            size="small"
            label="Biển số xe"
            required
            value={editForm.licensePlate}
            onChange={(e) =>
              setEditForm((prev) => ({ ...prev, licensePlate: e.target.value }))
            }
          />
          <TextField
            fullWidth
            size="small"
            label="Tải trọng (Tấn)"
            type="number"
            required
            value={editForm.payloadCapacity}
            onChange={(e) =>
              setEditForm((prev) => ({
                ...prev,
                payloadCapacity: e.target.value,
              }))
            }
          />
          <TextField
            select
            fullWidth
            size="small"
            label="Loại xe"
            required
            value={editForm.vehicleType}
            onChange={(e) =>
              setEditForm((prev) => ({ ...prev, vehicleType: e.target.value }))
            }
          >
            <MenuItem value="TRUCK_SMALL">Xe tải nhỏ</MenuItem>
            <MenuItem value="TRUCK_MEDIUM">Xe tải trung</MenuItem>
            <MenuItem value="TRUCK_HEAVY">Xe tải nặng</MenuItem>
            <MenuItem value="CONTAINER_TRACTOR">Xe đầu kéo container</MenuItem>
            <MenuItem value="REFRIGERATED_TRUCK">Xe tải đông lạnh</MenuItem>
            <MenuItem value="SPECIALIZED_TRUCK">Xe chuyên dụng</MenuItem>
          </TextField>
          <TextField
            fullWidth
            size="small"
            label="Mô tả thân xe"
            value={editForm.bodyType}
            onChange={(e) =>
              setEditForm((prev) => ({ ...prev, bodyType: e.target.value }))
            }
          />
          <Box>
            <Typography
              variant="subtitle2"
              sx={{ fontWeight: 700, color: "var(--color-ink-muted)", mb: 1.5 }}
            >
              Thay hồ sơ (không bắt buộc)
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                gap: 1.5,
              }}
            >
              {[
                { key: "registration", label: "Cà vẹt / đăng ký xe" },
                { key: "inspection", label: "Đăng kiểm" },
              ].map((document) => (
                <Card
                  key={document.key}
                  component="label"
                  variant="outlined"
                  sx={{
                    cursor: "pointer",
                    borderStyle: "dashed",
                    borderWidth: 2,
                    bgcolor: "var(--color-surface-sunken)",
                    transition: "border-color 0.2s",
                    "&:hover": { borderColor: "var(--color-brand)" },
                  }}
                >
                  <input
                    hidden
                    type="file"
                    accept="image/jpeg,image/png,application/pdf"
                    onChange={(event) =>
                      handleEditDocumentChange(document.key, event)
                    }
                  />
                  <CardContent sx={{ p: "10px 12px !important" }}>
                    <Typography
                      variant="caption"
                      sx={{ display: "block", color: "var(--color-ink-muted)" }}
                    >
                      {document.label}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: "var(--color-brand)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {editDocuments[document.key]?.name ||
                        "Giữ nguyên hồ sơ hiện tại"}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions
          sx={{ px: 3, pb: 3, pt: 1.5, borderTop: "1px solid var(--color-surface-sunken)" }}
        >
          <Button onClick={handleCloseEdit} color="inherit">
            Hủy bỏ
          </Button>
          <Button
            onClick={handleSaveEdit}
            disabled={
              saving || !editForm.licensePlate || !editForm.payloadCapacity
            }
            variant="contained"
          >
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Drawer Chi tiết Phương tiện */}
      <DetailDrawer
        open={!!selectedVehicle}
        onClose={handleCloseDetails}
        title={
          <Box className="flex items-center justify-between gap-2 w-full pr-4">
            <span>Chi tiết Phương tiện</span>
            {selectedVehicle &&
              getVerificationChip(selectedVehicle.verification)}
          </Box>
        }
      >
        {selectedVehicle && (
          <Box className="space-y-6">
            <Box>
              <Typography variant="subtitle2" className="text-ink-muted mb-1">
                Biển số xe
              </Typography>
              <Typography
                variant="h5"
                className="font-mono font-bold text-ink"
              >
                {selectedVehicle.plate}
              </Typography>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" className="text-ink-muted">
                  Tải trọng
                </Typography>
                <Typography variant="body1" className="font-medium">
                  {selectedVehicle.capacity}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" className="text-ink-muted">
                  Loại xe
                </Typography>
                <Typography variant="body1" className="font-medium">
                  {selectedVehicle.type}
                </Typography>
              </Grid>
            </Grid>

            <Divider className="my-2" />

            <Typography
              variant="subtitle2"
              className="font-bold text-ink"
            >
              Giấy tờ kèm theo
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" className="text-ink-muted mb-1">
                  Cà vẹt xe
                </Typography>
                <Box className="w-full h-32 bg-surface-sunken rounded-lg border border-line flex items-center justify-center relative overflow-hidden group p-1">
                  {selectedVehicle.registrationDocumentUrl ? (
                    <Button
                      component="a"
                      href={selectedVehicle.registrationDocumentUrl}
                      target="_blank"
                      rel="noreferrer"
                      size="small"
                      variant="outlined"
                    >
                      Xem Cà vẹt
                    </Button>
                  ) : (
                    <Typography
                      variant="caption"
                      className="px-2 text-center text-ink-muted"
                    >
                      Chưa có ảnh cà vẹt
                    </Typography>
                  )}
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" className="text-ink-muted mb-1">
                  Sổ đăng kiểm
                </Typography>
                <Box className="w-full h-32 bg-surface-sunken rounded-lg border border-line flex items-center justify-center relative overflow-hidden group p-1">
                  {selectedVehicle.inspectionDocumentUrl ? (
                    <Button
                      component="a"
                      href={selectedVehicle.inspectionDocumentUrl}
                      target="_blank"
                      rel="noreferrer"
                      size="small"
                      variant="outlined"
                    >
                      Xem Đăng kiểm
                    </Button>
                  ) : (
                    <Typography
                      variant="caption"
                      className="px-2 text-center text-ink-muted"
                    >
                      Chưa có ảnh đăng kiểm
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>

            <Box className="flex flex-col gap-3 mt-6">
              <Button
                onClick={() => handleOpenEdit(selectedVehicle)}
                startIcon={<EditIcon />}
                variant="contained"
                fullWidth
              >
                Cập nhật thông tin xe
              </Button>
              <Button
                color="error"
                variant="outlined"
                fullWidth
                onClick={() => setConfirmDeactivate(selectedVehicle)}
              >
                Vô hiệu hóa xe
              </Button>
            </Box>
          </Box>
        )}
      </DetailDrawer>
      <ConfirmDialog
        open={Boolean(confirmDeactivate)}
        title="Vô hiệu hóa xe?"
        message={`Xe ${confirmDeactivate?.plate || confirmDeactivate?.licensePlate || ""} sẽ không còn dùng được để phân công chuyến.`}
        confirmLabel="Vô hiệu hóa"
        onConfirm={async () => {
          await handleDeactivate(confirmDeactivate);
          setConfirmDeactivate(null);
        }}
        onClose={() => setConfirmDeactivate(null)}
      />
    </Box>
  );
}
