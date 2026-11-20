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
import Avatar from "@mui/material/Avatar";
import {
  Add as AddIcon,
  Person as PersonIcon,
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
import { PageHeader, ViewModeToggle, DetailDrawer } from "@/components/common";
import {
  createDriver,
  deleteDriver,
  getMyDrivers,
  updateDriver,
} from "@/services/fleetApi";
import { mediaApi } from "@/services/mediaApi";
import { getApiErrorMessage } from "@/services/errorMessage";
import { useGlobalNotification } from "@/components/common/NotificationPopup";

export default function DriversPage() {
  const notify = useGlobalNotification();
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down("sm"));
  const [loadErrorMessage, setLoadErrorMessage] = useState("");
  const [drivers, setDrivers] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const setError = (message) => {
    if (message) notify.error(message);
  };
  const setSuccessMsg = (message) => notify.success(message);
  const [filter, setFilter] = useState("ALL");
  const [viewMode, setViewMode] = useState("CARD");
  const [openModal, setOpenModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [saving, setSaving] = useState(false);
  const [createStep, setCreateStep] = useState(1);
  const [licenseImage, setLicenseImage] = useState(null);
  const [editLicenseImage, setEditLicenseImage] = useState(null);

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    licenseNumber: "",
    licenseImageUrl: "",
  });
  const [editForm, setEditForm] = useState({
    id: "",
    fullName: "",
    phone: "",
    licenseNumber: "",
    licenseImageUrl: "",
  });

  const loadDrivers = async () => {
    setLoading(true);
    setLoadErrorMessage("");
    setError("");
    try {
      setDrivers(await getMyDrivers());
    } catch (loadError) {
      const message = getApiErrorMessage(loadError, "Không thể tải danh sách tài xế. Vui lòng thử lại.");
      setLoadErrorMessage(message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers();
  }, []);

  const filteredDrivers = React.useMemo(() => {
    return drivers.filter((d) => {
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
      let comparison = String(a[orderBy] || "").localeCompare(
        String(b[orderBy] || ""),
      );
      return order === "desc" ? -comparison : comparison;
    });
    return result;
  }, [filteredDrivers, order, orderBy]);

  const handleOpen = () => {
    setForm({
      fullName: "",
      phone: "",
      licenseNumber: "",
      licenseImageUrl: "",
    });
    setLicenseImage(null);
    setCreateStep(1);
    setError("");
    setOpenModal(true);
  };
  const handleClose = () => setOpenModal(false);

  const handleCreate = async () => {
    if (createStep < 3) {
      if (
        createStep === 1 &&
        (!form.fullName || !form.phone || !form.licenseNumber)
      ) {
        setError("Vui lòng nhập đủ họ tên, số điện thoại và số GPLX.");
        return;
      }
      if (createStep === 2 && !licenseImage) {
        setError("Vui lòng tải lên ảnh GPLX.");
        return;
      }
      setError("");
      setCreateStep((current) => current + 1);
      return;
    }
    setSaving(true);
    setError("");
    try {
      let uploadedUrl = form.licenseImageUrl;
      if (licenseImage) {
        uploadedUrl = await mediaApi.uploadFile(
          licenseImage,
          "drivers/license",
        );
      }
      await createDriver({ ...form, licenseImageUrl: uploadedUrl });
      await loadDrivers();
      setOpenModal(false);
      setSuccessMsg(
        "Khai báo tài xế mới thành công! Hồ sơ đang chờ Admin duyệt.",
      );
    } catch (saveError) {
      setError(
        getApiErrorMessage(
          saveError,
          "Không thể gửi tài xế để duyệt. Vui lòng kiểm tra hồ sơ rồi thử lại.",
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

  const handleLicenseImageChange = (event) => {
    const file = event.target.files?.[0] || null;
    event.target.value = "";
    if (!file) return;
    if (
      !/^image\/(jpeg|png)$|^application\/pdf$/.test(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      setError("Ảnh GPLX chỉ nhận JPG, PNG hoặc PDF, dung lượng tối đa 5MB.");
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
      let uploadedUrl = editForm.licenseImageUrl;
      if (editLicenseImage) {
        uploadedUrl = await mediaApi.uploadFile(
          editLicenseImage,
          "drivers/license",
        );
      }
      metadata.licenseImageUrl = uploadedUrl;
      await updateDriver(editForm.id, metadata);
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
          licenseImageUrl: uploadedUrl,
        }));
      }
      setSuccessMsg("Cập nhật thông tin tài xế thành công!");
    } catch (updateError) {
      setError(
        getApiErrorMessage(
          updateError,
          "Không thể cập nhật thông tin tài xế. Vui lòng kiểm tra lại.",
        ),
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEditLicenseImageChange = (event) => {
    const file = event.target.files?.[0] || null;
    event.target.value = "";
    if (!file) return;
    if (
      !/^image\/(jpeg|png)$|^application\/pdf$/.test(file.type) ||
      file.size > 5 * 1024 * 1024
    ) {
      setError("Ảnh GPLX chỉ nhận JPG, PNG hoặc PDF, dung lượng tối đa 5MB.");
      return;
    }
    setEditLicenseImage(file);
    setError("");
  };

  const handleDelete = async (driver) => {
    try {
      await deleteDriver(driver.id);
      setDrivers((current) => current.filter((item) => item.id !== driver.id));
      setSelectedDriver(null);
      setSuccessMsg("Đã xóa tài xế khỏi danh sách.");
    } catch (deleteError) {
      setError(
        getApiErrorMessage(
          deleteError,
          "Không thể xóa tài xế. Vui lòng thử lại.",
        ),
      );
    }
  };

  const handleOpenDetails = (driver) => setSelectedDriver(driver);
  const handleCloseDetails = () => setSelectedDriver(null);

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
        title="Quản lý tài xế"
        subtitle="Danh sách nhân sự lái xe và kiểm soát bằng lái"
        breadcrumbs={[
          { label: "Trang chủ", path: "/carrier/dashboard" },
          { label: "Vận hành" },
          { label: "Tài xế" },
        ]}
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpen}
          >
            Thêm tài xế mới
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

      {loading && <ListSkeleton rows={3} height={140} label="Đang tải dữ liệu tài xế..." />}

      {!loading && loadErrorMessage && <ErrorState description={loadErrorMessage} onRetry={loadDrivers} />}
      {!loading && !loadErrorMessage && filteredDrivers.length === 0 && (
        <EmptyState
          title={filter === "ALL" ? "Chưa có tài xế" : "Không có tài xế trong nhóm này"}
          description={filter === "ALL" ? "Thêm hồ sơ và gửi duyệt để có thể phân công chuyến." : "Chọn nhóm khác để xem các hồ sơ còn lại."}
          action={<Button variant="outlined" onClick={filter === "ALL" ? handleOpen : () => setFilter("ALL")}>{filter === "ALL" ? "Thêm tài xế" : "Xem tất cả"}</Button>}
        />
      )}

      {!loading && !loadErrorMessage && sortedDrivers.length > 0 && (isMobile || viewMode === "CARD" ? (
        <Grid container spacing={3}>
          {sortedDrivers.map((d) => (
            <Grid item xs={12} sm={6} md={4} key={d.id}>
              <Card className="rounded-xl border border-line shadow-none">
                <CardContent className="p-6">
                  <Box className="flex items-center gap-4 mb-4">
                    <Avatar sx={{ bgcolor: "var(--color-brand)", width: 52, height: 52 }}>
                      <PersonIcon />
                    </Avatar>
                    <Box className="min-w-0 flex-1">
                      <Typography
                        variant="h6"
                        className="font-bold text-ink truncate"
                      >
                        {d.name || d.fullName}
                      </Typography>
                      <Typography variant="body2" className="text-ink-muted">
                        {d.phone}
                      </Typography>
                    </Box>
                    {getVerificationChip(d.verification)}
                  </Box>

                  <Box className="bg-surface-sunken p-3 rounded-xl border border-line mb-4 flex justify-between">
                    <div>
                      <Typography
                        variant="caption"
                        className="text-ink-muted block"
                      >
                        Số GPLX
                      </Typography>
                      <Typography
                        variant="body2"
                        className="font-bold text-[var(--color-brand)]"
                      >
                        {d.licenseClass || d.licenseNumber}
                      </Typography>
                    </div>
                    <div className="text-right">
                      <Typography
                        variant="caption"
                        className="text-ink-muted block"
                      >
                        Trạng thái
                      </Typography>
                      <Typography
                        variant="body2"
                        className={
                          d.active
                            ? "text-success font-bold"
                            : "text-warning font-bold"
                        }
                      >
                        {d.active ? "Sẵn sàng" : "Chờ duyệt"}
                      </Typography>
                    </div>
                  </Box>

                  <Box className="flex justify-end gap-2">
                    <Button
                      size="small"
                      variant="text"
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenEdit(d)}
                      sx={{ fontWeight: 600 }}
                    >
                      Sửa
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<SettingsIcon />}
                      onClick={() => handleOpenDetails(d)}
                      sx={{ fontWeight: 600 }}
                    >
                      Chi tiết
                    </Button>
                  </Box>
                </CardContent>
              </Card>
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
                <TableCell className="font-bold text-ink-muted">
                  Họ và tên
                </TableCell>
                <TableCell className="font-bold text-ink-muted">
                  Số điện thoại
                </TableCell>
                <TableCell className="font-bold text-ink-muted">
                  Số GPLX
                </TableCell>
                <TableCell className="font-bold text-ink-muted">
                  Kiểm duyệt
                </TableCell>
                <TableCell className="font-bold text-ink-muted" align="right">
                  Thao tác
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedDrivers.map((d) => (
                <TableRow key={d.id} hover className="transition-colors">
                  <TableCell>
                    <Box className="flex items-center gap-3">
                      <Avatar
                        sx={{ bgcolor: "var(--color-brand)", width: 32, height: 32 }}
                      >
                        <PersonIcon sx={{ fontSize: 18 }} />
                      </Avatar>
                      <Typography
                        variant="body2"
                        className="font-bold text-ink"
                      >
                        {d.name || d.fullName}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" className="text-ink-muted">
                      {d.phone}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      className="font-mono font-bold text-[var(--color-brand)]"
                    >
                      {d.licenseClass || d.licenseNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>{getVerificationChip(d.verification)}</TableCell>
                  <TableCell align="right">
                    <Box className="flex justify-end gap-1">
                      <Button
                        size="small"
                        variant="text"
                        startIcon={<EditIcon />}
                        onClick={() => handleOpenEdit(d)}
                      >
                        Sửa
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<SettingsIcon />}
                        onClick={() => handleOpenDetails(d)}
                      >
                        Chi tiết
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ))}

      {/* Modal Thêm tài xế mới */}
      <Dialog
        open={openModal}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ borderBottom: "1px solid var(--color-surface-sunken)", pb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "var(--color-brand)" }}>
            Khai báo tài xế mới
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
          aria-label="Tiến trình khai báo tài xế"
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
                label="Họ và tên"
                placeholder="VD: Nguyễn Văn A"
                required
                value={form.fullName}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, fullName: e.target.value }))
                }
              />
              <TextField
                fullWidth
                size="small"
                label="Số điện thoại"
                placeholder="VD: 0901234567"
                required
                value={form.phone}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, phone: e.target.value }))
                }
              />
              <TextField
                fullWidth
                size="small"
                label="Số giấy phép lái xe"
                placeholder="VD: 790123456789"
                required
                value={form.licenseNumber}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    licenseNumber: e.target.value,
                  }))
                }
              />
            </Stack>
          )}

          {createStep === 2 && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Card
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
                  onChange={handleLicenseImageChange}
                />
                <CardContent
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1.5,
                    py: "16px !important",
                  }}
                >
                  <Box>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 700, color: "var(--color-ink-muted)" }}
                    >
                      Ảnh hoặc file GPLX *
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
                      maxWidth: 120,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {licenseImage?.name || "Chọn tệp"}
                  </Typography>
                </CardContent>
              </Card>
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
                Họ tên: <strong>{form.fullName}</strong>
              </Typography>
              <Typography variant="body2">
                Số GPLX: <strong>{form.licenseNumber}</strong>
              </Typography>
              <Typography variant="body2">
                Ảnh GPLX: <strong>{licenseImage?.name}</strong>
              </Typography>
              <Typography
                variant="caption"
                sx={{ color: "var(--color-ink-muted)", display: "block" }}
              >
                Sau khi gửi, tài xế sẽ ở trạng thái Chờ duyệt để Admin kiểm tra
                hồ sơ.
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
            <strong>Lưu ý:</strong> Tài xế mới thêm sẽ ở trạng thái{" "}
            <strong>Chờ duyệt</strong> trước khi tham gia nhận chuyến.
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
          <Button
            onClick={handleCreate}
            disabled={saving}
            variant="contained"
          >
            {saving
              ? "Đang gửi..."
              : createStep === 3
                ? "Gửi yêu cầu xét duyệt"
                : "Tiếp tục"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Chỉnh sửa thông tin tài xế */}
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
            Chỉnh sửa thông tin Tài xế
          </Typography>
        </DialogTitle>
        <DialogContent
          sx={{ pt: 2.5, display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            fullWidth
            size="small"
            label="Họ và tên"
            required
            value={editForm.fullName}
            onChange={(e) =>
              setEditForm((prev) => ({ ...prev, fullName: e.target.value }))
            }
          />
          <TextField
            fullWidth
            size="small"
            label="Số điện thoại"
            required
            value={editForm.phone}
            onChange={(e) =>
              setEditForm((prev) => ({ ...prev, phone: e.target.value }))
            }
          />
          <TextField
            fullWidth
            size="small"
            label="Số Giấy phép lái xe"
            required
            value={editForm.licenseNumber}
            onChange={(e) =>
              setEditForm((prev) => ({
                ...prev,
                licenseNumber: e.target.value,
              }))
            }
          />
          <Card
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
              onChange={handleEditLicenseImageChange}
            />
            <CardContent sx={{ p: "10px 12px !important" }}>
              <Typography
                variant="caption"
                sx={{ display: "block", color: "var(--color-ink-muted)" }}
              >
                Thay ảnh GPLX (không bắt buộc)
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
                {editLicenseImage?.name || "Giữ nguyên hồ sơ hiện tại"}
              </Typography>
            </CardContent>
          </Card>
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
              saving ||
              !editForm.fullName ||
              !editForm.phone ||
              !editForm.licenseNumber
            }
            variant="contained"
          >
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Drawer Chi tiết Tài xế */}
      <DetailDrawer
        open={!!selectedDriver}
        onClose={handleCloseDetails}
        title={
          <Box className="flex items-center justify-between gap-2 w-full pr-4">
            <span>Chi tiết Tài xế</span>
            {selectedDriver && getVerificationChip(selectedDriver.verification)}
          </Box>
        }
      >
        {selectedDriver && (
          <Box className="space-y-6">
            <Box className="flex items-center gap-4">
              <Avatar
                sx={{
                  bgcolor: selectedDriver.active ? "var(--color-brand)" : "var(--color-ink-subtle)",
                  width: 64,
                  height: 64,
                }}
              >
                <PersonIcon fontSize="large" />
              </Avatar>
              <Box>
                <Typography variant="h5" className="font-bold text-ink">
                  {selectedDriver.name || selectedDriver.fullName}
                </Typography>
                <Typography variant="body1" className="text-ink-muted">
                  {selectedDriver.phone}
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body2" className="text-ink-muted">
                  Số Giấy phép lái xe
                </Typography>
                <Typography
                  variant="body1"
                  className="font-medium text-[var(--color-brand)] font-mono font-bold"
                >
                  {selectedDriver.licenseClass || selectedDriver.licenseNumber}
                </Typography>
              </Grid>
            </Grid>

            <Divider className="my-2" />

            <Typography
              variant="subtitle2"
              className="font-bold text-ink"
            >
              Ảnh chụp Giấy phép lái xe
            </Typography>
            <Box className="w-full h-40 bg-surface-sunken rounded-lg border border-line flex items-center justify-center relative overflow-hidden group p-2">
              {selectedDriver.licenseImageUrl ? (
                <Button
                  component="a"
                  href={selectedDriver.licenseImageUrl}
                  target="_blank"
                  rel="noreferrer"
                  size="small"
                  variant="outlined"
                >
                  Mở ảnh bằng lái gốc
                </Button>
              ) : (
                <Typography
                  variant="caption"
                  className="px-2 text-center text-ink-muted"
                >
                  Chưa có ảnh bằng lái
                </Typography>
              )}
            </Box>

            <Box className="flex flex-col gap-3 mt-6">
              <Button
                onClick={() => handleOpenEdit(selectedDriver)}
                startIcon={<EditIcon />}
                variant="contained"
                fullWidth
              >
                Cập nhật thông tin tài xế
              </Button>
              <Button
                onClick={() => setConfirmDelete(selectedDriver)}
                color="error"
                variant="outlined"
                fullWidth
              >
                Xóa tài xế
              </Button>
            </Box>
          </Box>
        )}
      </DetailDrawer>
      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title="Xóa tài xế?"
        message={`${confirmDelete?.fullName || confirmDelete?.name || "Tài xế này"} sẽ bị xóa khỏi danh sách đội xe.`}
        confirmLabel="Xóa tài xế"
        onConfirm={async () => {
          await handleDelete(confirmDelete);
          setConfirmDelete(null);
        }}
        onClose={() => setConfirmDelete(null)}
      />
    </Box>
  );
}
