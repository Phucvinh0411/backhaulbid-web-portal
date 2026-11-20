"use client";

import { useCallback, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Autocomplete from "@mui/material/Autocomplete";
import IconButton from "@mui/material/IconButton";

// Icons
import BookIcon from "@mui/icons-material/ImportContactsOutlined";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutlineOutlined";

import PageHeader from "@/components/common/PageHeader";
import AppCard from "@/components/common/AppCard";
import { ErrorState, ListSkeleton, ResponsiveDialog } from "@/components/ui";
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
            >
              Thêm địa chỉ mới
            </Button>
          </div>

          {/* Grid list of addresses */}
          {addressLoading ? (
            <ListSkeleton rows={3} height={140} label="Đang tải sổ địa chỉ..." />
          ) : addressError ? (
            <ErrorState description={addressError} onRetry={loadAddresses} />
          ) : addresses.length === 0 ? (
            <Box className="flex min-h-40 flex-col items-center justify-center rounded-xl border border-dashed border-line bg-white p-6 text-center">
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
                  className="group hover:border-[var(--color-brand)]/30 transition-colors border border-line relative overflow-hidden"
                >
                  <CardContent className="!p-5 space-y-3.5">
                    {/* Address title */}
                    <div className="flex items-center justify-between">
                      <Typography className="!font-bold text-ink text-sm truncate max-w-[200px]">
                        {addr.label}
                      </Typography>
                      <div className="flex gap-0.5">
                        <IconButton
                          size="small"
                          aria-label={`Chỉnh sửa địa chỉ ${addr.label}`}
                          onClick={() => handleOpenAddressEdit(addr)}
                          className="text-ink-subtle hover:text-[var(--color-brand)]"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          aria-label={`Xóa địa chỉ ${addr.label}`}
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
                        <span className="text-xs font-medium text-ink-muted block">Người liên hệ</span>
                        <span className="text-ink font-semibold">{addr.contactName} ({addr.contactPhone})</span>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-ink-muted block">Địa chỉ kho bãi</span>
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
      <ResponsiveDialog
        open={openAddressDialog}
        onClose={() => !addressSaving && setOpenAddressDialog(false)}
        title={
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-info-soft text-info flex items-center justify-center font-bold">
              <BookIcon className="!text-[1.2rem]" />
            </div>
            <div>
              <span className="block text-base font-bold text-ink">
                {addressEditMode ? "Cập nhật địa chỉ kho bãi" : "Thêm địa chỉ kho bãi mới"}
              </span>
              <span className="block text-xs text-ink-subtle font-normal">
                Điền thông tin kho bãi để chọn nhanh khi tạo phiên đấu giá
              </span>
            </div>
          </div>
        }
        titleId="address-book-edit-dialog-title"
        maxWidth="sm"
        busy={addressSaving}
        actions={
          <>
            <Button
              onClick={() => setOpenAddressDialog(false)}
              variant="text"
              disabled={addressSaving}
            >
              Đóng
            </Button>
            <Button
              onClick={handleAddressSubmit}
              variant="contained"
              disabled={addressSaving}
            >
              {addressSaving ? "Đang lưu..." : addressEditMode ? "Lưu lại" : "Thêm mới"}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-5">
          <TextField
            label="Tên gợi nhớ kho (Ví dụ: Kho Tổng Đông Anh)"
            fullWidth
            required
            value={addressForm.label}
            onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
            placeholder="VD: Kho hàng Tân Bình / Nhà máy 2"
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
          />

          <CoordinatePicker label="Vị trí kho" value={addressForm} hint={addressHint} disabled={addressSaving} onChange={(point) => setAddressForm((old) => ({ ...old, ...(point || { latitude: null, longitude: null, coordinateSource: null, coordinateConfirmedAt: null }) }))} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <TextField
              label="Họ tên người liên hệ"
              fullWidth
              required
              value={addressForm.contactName}
              onChange={(e) => setAddressForm({ ...addressForm, contactName: e.target.value })}
              placeholder="VD: Nguyễn Văn A"
            />
            <TextField
              label="Số điện thoại liên hệ"
              fullWidth
              required
              value={addressForm.contactPhone}
              onChange={(e) => setAddressForm({ ...addressForm, contactPhone: e.target.value })}
              placeholder="VD: 0912345678"
            />
          </div>
        </div>
      </ResponsiveDialog>

      <ResponsiveDialog
        open={Boolean(pendingDeleteId)}
        onClose={() => setPendingDeleteId(null)}
        title="Xóa địa chỉ đã lưu?"
        titleId="address-book-delete-dialog-title"
        maxWidth="xs"
        actions={
          <>
            <Button onClick={() => setPendingDeleteId(null)} variant="text">
              Hủy
            </Button>
            <Button
              onClick={handleConfirmAddressDelete}
              variant="contained"
              color="error"
            >
              Xóa địa chỉ
            </Button>
          </>
        }
      >
        <Typography variant="body2" className="text-ink-muted">
          Địa chỉ này sẽ bị xóa khỏi sổ địa chỉ dùng chung. Bạn có muốn tiếp tục không?
        </Typography>
      </ResponsiveDialog>

    </Box>
  );
}
