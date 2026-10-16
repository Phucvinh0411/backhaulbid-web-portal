"use client";

import { useCallback, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Autocomplete from "@mui/material/Autocomplete";

// Icons
import BookIcon from "@mui/icons-material/ImportContactsOutlined";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutlineOutlined";
import CloseIcon from "@mui/icons-material/Close";

import PageHeader from "@/components/common/PageHeader";
import AppCard from "@/components/common/AppCard";
import CoordinatePicker from "@/components/map/CoordinatePicker";
import { useGlobalNotification } from "@/components/common/NotificationPopup";
import { useAddressHint } from "@/components/shipper/create-auction/useAddressHint";
import { addressBookApi } from "@/services/addressBookApi";
import { getApiErrorMessage } from "@/services/errorMessage";
import { VIETNAM_PROVINCES } from "@/utils/provinces";

const PROVINCE_NAMES = VIETNAM_PROVINCES.map((p) => p.name);

/** Shipper address book. Representative eKYC and business verification live in Cài đặt tài khoản. */
export default function ProfileWalletScreen() {
  const notify = useGlobalNotification();
  const [addresses, setAddresses] = useState([]);
  const [addressLoading, setAddressLoading] = useState(true);
  const [addressError, setAddressError] = useState("");
  const [addressSaving, setAddressSaving] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const loadAddresses = useCallback(() => {
    setAddressLoading(true);
    setAddressError("");

    addressBookApi
      .list()
      .then((data) => setAddresses(Array.isArray(data) ? data : []))
      .catch((error) => {
        const message = getApiErrorMessage(
          error,
          "Không thể tải sổ địa chỉ. Vui lòng thử lại.",
        );
        setAddressError(message);
        notify.error(message);
      })
      .finally(() => setAddressLoading(false));
  }, [notify]);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  // States for Address Book Actions
  const [openAddressDialog, setOpenAddressDialog] = useState(false);
  const [addressEditMode, setAddressEditMode] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    label: "",
    contactName: "",
    contactPhone: "",
    province: "",
    detail: "",
  });
  // Search only while the dialog is open, so a closed dialog does not keep querying the map service.
  const addressHint = useAddressHint({
    detail: openAddressDialog ? addressForm.detail : "",
    province: addressForm.province,
  });

  // --- Address Book Handlers ---
  const handleOpenAddressAdd = () => {
    setAddressEditMode(false);
    setAddressForm({
      label: "",
      contactName: "",
      contactPhone: "",
      province: "",
      detail: "",
    });
    setOpenAddressDialog(true);
  };

  const handleOpenAddressEdit = (addr) => {
    setAddressEditMode(true);
    setSelectedAddressId(addr.id);
    setAddressForm({
      label: addr.label,
      contactName: addr.contactName,
      contactPhone: addr.contactPhone,
      province: addr.province,
      detail: addr.detail,
      latitude: addr.latitude ?? null,
      longitude: addr.longitude ?? null,
      coordinateSource: addr.coordinateSource ?? null,
      coordinateConfirmedAt: addr.coordinateConfirmedAt ?? null,
    });
    setOpenAddressDialog(true);
  };

  const handleAddressDelete = (id) => {
    setPendingDeleteId(id);
  };

  const handleConfirmAddressDelete = async () => {
    if (!pendingDeleteId) return;

    try {
      await addressBookApi.remove(pendingDeleteId);
      setAddresses((current) => current.filter((item) => item.id !== pendingDeleteId));
      notify.success("Đã xóa địa chỉ khỏi sổ địa chỉ.");
    } catch (error) {
      notify.error(getApiErrorMessage(error, "Không thể xóa địa chỉ. Vui lòng thử lại."));
    } finally {
      setPendingDeleteId(null);
    }
  };

  const handleAddressSubmit = async () => {
    if (!addressForm.label || !addressForm.detail || !addressForm.contactName || !addressForm.contactPhone || !addressForm.province) {
      notify.warning("Vui lòng nhập đầy đủ tên kho, người liên hệ, số điện thoại, tỉnh/thành và địa chỉ chi tiết.");
      return;
    }

    setAddressSaving(true);
    try {
      const response = addressEditMode
        ? await addressBookApi.update(selectedAddressId, addressForm)
        : await addressBookApi.create(addressForm);
      const savedAddress = response?.data?.id ? response.data : response;

      setAddresses((current) =>
        addressEditMode
          ? current.map((item) => (item.id === selectedAddressId ? savedAddress : item))
          : [savedAddress, ...current],
      );
      setOpenAddressDialog(false);
      notify.success(addressEditMode ? "Đã cập nhật địa chỉ." : "Đã thêm địa chỉ mới.");
    } catch (error) {
      notify.error(
        getApiErrorMessage(
          error,
          addressEditMode
            ? "Không thể cập nhật địa chỉ. Vui lòng thử lại."
            : "Không thể thêm địa chỉ. Vui lòng thử lại.",
        ),
      );
    } finally {
      setAddressSaving(false);
    }
  };

  return (
    <Box className="w-full min-h-screen">
      <PageHeader
        title="Sổ địa chỉ kho"
        subtitle="Kho lấy và giao hàng dùng lại khi tạo phiên. Ghim vị trí kho để bản đồ theo dõi vẽ được tuyến A → B."
        breadcrumbs={[
          { label: "Trang chủ", path: "/shipper/dashboard" },
          { label: "Sổ địa chỉ kho" },
        ]}
      />

        <div className="space-y-6 animate-fade-in">
          {/* Toolbar with Add Address Button */}
          <div className="flex justify-between items-center">
            <Typography variant="body2" className="text-ink-subtle font-semibold">
              Danh sách địa điểm bến bãi thường dùng lấy / nhận hàng hóa
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenAddressAdd}
              className="!rounded-xl !py-2.5 !px-5 !text-xs !font-bold !capitalize shadow-md"
              sx={{
                background: "var(--color-brand)",
              }}
            >
              Thêm địa chỉ mới
            </Button>
          </div>

          {/* Grid list of addresses */}
          {addressLoading ? (
            <Box className="flex min-h-40 items-center justify-center rounded-xl border border-line bg-white/70">
              <CircularProgress size={28} sx={{ color: "var(--color-brand)" }} />
            </Box>
          ) : addressError ? (
            <Box className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-xl border border-danger-soft bg-danger-soft/60 p-6 text-center">
              <Typography className="!font-semibold text-danger">{addressError}</Typography>
              <Button variant="outlined" onClick={loadAddresses} className="!rounded-xl !font-bold !capitalize">
                Thử tải lại
              </Button>
            </Box>
          ) : addresses.length === 0 ? (
            <Box className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-line bg-white/70 p-6 text-center">
              <Typography className="!font-bold text-ink">Chưa có địa chỉ nào được lưu</Typography>
              <Typography variant="body2" className="text-ink-muted">
                Thêm địa chỉ kho hoặc điểm giao nhận để chọn nhanh khi tạo phiên đấu giá.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
            {addresses.map((addr) => (
              <Grid item xs={12} md={6} lg={4} key={addr.id}>
                <AppCard
                  showAccent={false}
                  className="group hover:border-[var(--color-brand)]/20 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 border border-line !rounded-xl relative overflow-hidden"
                  sx={{
                    background: "rgba(255, 255, 255, 0.8)",
                    backdropFilter: "blur(20px)",
                  }}
                >
                  {/* Decorative indicator line */}
                  <Box className="absolute top-0 left-0 w-full h-1 bg-[var(--color-brand)] opacity-20 group-hover:opacity-100 transition-opacity" />
                  
                  <CardContent className="!p-5 space-y-3.5">
                    {/* Address title */}
                    <div className="flex items-center justify-between">
                      <Typography className="!font-bold text-ink text-sm truncate max-w-[200px]">
                        {addr.label}
                      </Typography>
                      <div className="flex gap-0.5">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenAddressEdit(addr)}
                          className="text-ink-subtle hover:text-[var(--color-brand)]"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleAddressDelete(addr.id)}
                          className="text-ink-subtle hover:text-danger"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </div>
                    </div>

                    {/* Detailed info */}
                    <div className="space-y-1.5 text-xs text-ink-muted font-medium">
                      <div>
                        <strong className="text-ink-subtle font-semibold block text-[0.65rem] uppercase">Người liên hệ</strong>
                        <span className="text-ink font-semibold">{addr.contactName} ({addr.contactPhone})</span>
                      </div>
                      <div>
                        <strong className="text-ink-subtle font-semibold block text-[0.65rem] uppercase">Địa chỉ kho bãi</strong>
                        <span className="text-ink-muted block truncate mt-0.5">{addr.detail}</span>
                        <span className="text-ink-subtle font-bold block">{addr.province}</span>
                      </div>
                    </div>
                  </CardContent>
                </AppCard>
              </Grid>
            ))}
            </Grid>
          )}
        </div>


      {/* Address Edit/Add Dialog */}
      <Dialog
        open={openAddressDialog}
        onClose={() => setOpenAddressDialog(false)}
        maxWidth="sm"
        fullWidth
        className="backdrop-blur-sm"
        PaperProps={{
          className: "!rounded-xl !p-2 shadow-2xl",
        }}
      >
        <DialogTitle className="flex justify-between items-center !font-bold text-ink !px-4 !py-3 border-b border-line">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-info-soft text-info flex items-center justify-center font-bold">
              <BookIcon className="!text-[1.2rem]" />
            </div>
            <div>
              <span className="block text-base font-extrabold text-ink">
                {addressEditMode ? "Cập nhật địa chỉ kho bãi" : "Thêm địa chỉ kho bãi mới"}
              </span>
              <span className="block text-xs text-ink-subtle font-normal">
                Điền thông tin kho bãi để chọn nhanh khi tạo phiên đấu giá
              </span>
            </div>
          </div>
          <IconButton size="small" onClick={() => setOpenAddressDialog(false)} className="!bg-surface-sunken hover:!bg-line">
            <CloseIcon className="!text-[1rem] text-ink-muted" />
          </IconButton>
        </DialogTitle>
        <DialogContent className="!pt-6 !pb-4 flex flex-col gap-6">
          <TextField
            label="Tên gợi nhớ kho (Ví dụ: Kho Tổng Đông Anh)"
            fullWidth
            required
            value={addressForm.label}
            onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
            placeholder="VD: Kho hàng Tân Bình / Nhà máy 2"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
          />

          <Autocomplete
            freeSolo
            options={PROVINCE_NAMES}
            value={addressForm.province || ""}
            onChange={(event, newValue) => setAddressForm((old) => ({ ...old, province: newValue || "", ...(old.province !== (newValue || "") ? { latitude: null, longitude: null, coordinateSource: null, coordinateConfirmedAt: null } : {}) }))}
            onInputChange={(event, newInputValue) => setAddressForm((old) => ({ ...old, province: newInputValue, ...(old.province !== newInputValue ? { latitude: null, longitude: null, coordinateSource: null, coordinateConfirmedAt: null } : {}) }))}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                required
                label="Tỉnh / Thành phố"
                placeholder="VD: Hồ Chí Minh / Hà Nội"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
              />
            )}
          />

          <TextField
            label="Địa chỉ chi tiết (Số nhà, ngõ, đường, cụm kho)"
            multiline
            rows={2}
            fullWidth
            required
            value={addressForm.detail}
            onChange={(e) => setAddressForm({ ...addressForm, detail: e.target.value, latitude: null, longitude: null, coordinateSource: null, coordinateConfirmedAt: null })}
            placeholder="VD: Số 123 Đường Nguyễn Thị Minh Khai, Phường 6, Quận 3"
            sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
          />

          <CoordinatePicker label="Vị trí kho" value={addressForm} hint={addressHint} disabled={addressSaving} onChange={(point) => setAddressForm((old) => ({ ...old, ...(point || { latitude: null, longitude: null, coordinateSource: null, coordinateConfirmedAt: null }) }))} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <TextField
              label="Họ tên người liên hệ"
              fullWidth
              required
              value={addressForm.contactName}
              onChange={(e) => setAddressForm({ ...addressForm, contactName: e.target.value })}
              placeholder="VD: Nguyễn Văn A"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
            />
            <TextField
              label="Số điện thoại liên hệ"
              fullWidth
              required
              value={addressForm.contactPhone}
              onChange={(e) => setAddressForm({ ...addressForm, contactPhone: e.target.value })}
              placeholder="VD: 0912345678"
              sx={{ "& .MuiOutlinedInput-root": { borderRadius: "16px" } }}
            />
          </div>
        </DialogContent>
        <DialogActions className="!px-6 !py-4 flex justify-end gap-3 border-t border-line">
          <Button
            onClick={() => setOpenAddressDialog(false)}
            variant="text"
            className="!text-ink-muted !font-bold !capitalize !rounded-xl"
          >
            Đóng
          </Button>
          <Button
            onClick={handleAddressSubmit}
            variant="contained"
            disabled={addressSaving}
            className="!font-bold !capitalize !rounded-xl !px-6 !py-2.5 shadow-md"
            sx={{
              background: "var(--color-brand)",
            }}
          >
            {addressSaving ? "Đang lưu..." : addressEditMode ? "Lưu lại" : "Thêm mới"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(pendingDeleteId)}
        onClose={() => setPendingDeleteId(null)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ className: "!rounded-xl !p-2" }}
      >
        <DialogTitle className="!font-bold text-ink">Xóa địa chỉ đã lưu?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" className="text-ink-muted">
            Địa chỉ này sẽ bị xóa khỏi sổ địa chỉ dùng chung. Bạn có muốn tiếp tục không?
          </Typography>
        </DialogContent>
        <DialogActions className="!px-6 !pb-4">
          <Button onClick={() => setPendingDeleteId(null)} className="!rounded-xl !font-bold !capitalize">
            Hủy
          </Button>
          <Button
            onClick={handleConfirmAddressDelete}
            variant="contained"
            color="error"
            className="!rounded-xl !font-bold !capitalize"
          >
            Xóa địa chỉ
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
