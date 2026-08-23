"use client";

import { useCallback, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import TextField from "@mui/material/TextField";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";

// Icons
import PersonIcon from "@mui/icons-material/PersonOutlineOutlined";
import BookIcon from "@mui/icons-material/ImportContactsOutlined";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutlineOutlined";
import CloseIcon from "@mui/icons-material/Close";

import PageHeader from "@/components/common/PageHeader";
import AppCard from "@/components/common/AppCard";
import { useGlobalNotification } from "@/components/common/NotificationPopup";
import EkycModal from "@/components/eKYC/EkycModal";
import BusinessVerificationPanel from "@/components/businessVerification/BusinessVerificationPanel";
import { getRepresentativeVerificationStatus } from "@/services/representativeVerificationApi";
import { addressBookApi } from "@/services/addressBookApi";
import { getApiErrorMessage } from "@/services/errorMessage";

export default function ProfileWalletScreen({ initialTab = 0 }) {
  const notify = useGlobalNotification();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [addresses, setAddresses] = useState([]);
  const [addressLoading, setAddressLoading] = useState(true);
  const [addressError, setAddressError] = useState("");
  const [addressSaving, setAddressSaving] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const [representativeStatus, setRepresentativeStatus] = useState("loading");
  const [openEkycModal, setOpenEkycModal] = useState(false);

  useEffect(() => {
    let active = true;

    getRepresentativeVerificationStatus()
      .then((data) => {
        if (!active) return;
        setRepresentativeStatus(
          data?.status === "VERIFIED"
            ? "verified"
            : data?.status === "PENDING"
              ? "pending"
              : "unverified"
        );
      })
      .catch(() => {
        if (active) setRepresentativeStatus("unverified");
      });

    return () => {
      active = false;
    };
  }, []);

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

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

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
      {/* Page Header */}
      <PageHeader
        title="Tài Khoản & Thiết Lập"
        subtitle="Quản lý thông tin doanh nghiệp, xác thực hồ sơ eKYC và sổ địa chỉ giao nhận."
        breadcrumbs={[
          { label: "Trang chủ", path: "/shipper/dashboard" },
          { label: "Thiết lập tài khoản" },
        ]}
      />

      {/* Main Tabs Navigation */}
      <Box className="bg-white/80 backdrop-blur-xl border border-slate-100 rounded-3xl p-3 shadow-[0_8px_32px_0_rgba(27,73,101,0.03)] mb-6">
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            "& .MuiTabs-indicator": {
              backgroundColor: "#1B4965",
              height: 3,
              borderRadius: 2,
            },
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: "0.92rem",
              color: "#64748B",
              minHeight: 48,
              "&.Mui-selected": {
                color: "#1B4965",
                fontWeight: 700,
              },
            },
          }}
        >
          <Tab icon={<PersonIcon className="!text-[1.2rem] mr-2" />} iconPosition="start" label="Hồ sơ & eKYC" />
          <Tab icon={<BookIcon className="!text-[1.2rem] mr-2" />} iconPosition="start" label="Sổ địa chỉ" />
        </Tabs>
      </Box>

      {/* TAB CONTENT 1: PROFILE & eKYC */}
      {activeTab === 0 && (
        <div className="space-y-6 animate-fade-in">
          <AppCard
            showAccent={false}
            className="!rounded-3xl border border-slate-100"
            sx={{
              background: "rgba(255, 255, 255, 0.8)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 8px 32px 0 rgba(27, 73, 101, 0.02)",
            }}
          >
            <CardContent className="!p-6 sm:!p-8 space-y-6">
              <div className="flex flex-col gap-4 rounded-2xl border border-sky-100 bg-sky-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <Typography variant="subtitle1" className="!font-bold text-[#1B4965]">
                    eKYC người đại diện pháp luật
                  </Typography>
                  <Typography variant="body2" className="text-slate-500">
                    Định danh CCCD và khuôn mặt cá nhân. Quy trình này độc lập với hồ sơ doanh nghiệp.
                  </Typography>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Chip
                    label={
                      representativeStatus === "verified"
                        ? "Đã xác thực"
                        : representativeStatus === "pending"
                          ? "Đang xử lý"
                          : representativeStatus === "loading"
                            ? "Đang kiểm tra"
                            : "Chưa xác thực"
                    }
                    color={
                      representativeStatus === "verified"
                        ? "success"
                        : representativeStatus === "pending"
                          ? "warning"
                          : "default"
                    }
                    size="small"
                    className="!font-bold"
                  />
                  {representativeStatus !== "verified" && (
                    <Button
                      variant="contained"
                      size="small"
                      disabled={representativeStatus === "loading"}
                      onClick={() => setOpenEkycModal(true)}
                      className="!rounded-full !font-bold !normal-case"
                      sx={{ backgroundColor: "#1B4965" }}
                    >
                      Xác thực ngay
                    </Button>
                  )}
                </div>
              </div>

              <BusinessVerificationPanel />
            </CardContent>
          </AppCard>
        </div>
      )}

      {/* TAB CONTENT 3: ADDRESS BOOK */}
      {activeTab === 1 && (
        <div className="space-y-6 animate-fade-in">
          {/* Toolbar with Add Address Button */}
          <div className="flex justify-between items-center">
            <Typography variant="body2" className="text-slate-400 font-semibold">
              Danh sách địa điểm bến bãi thường dùng lấy / nhận hàng hóa
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenAddressAdd}
              className="!rounded-2xl !py-2.5 !px-5 !text-xs !font-bold !capitalize shadow-md"
              sx={{
                background: "linear-gradient(135deg, #1B4965 0%, #0D2B3E 100%)",
              }}
            >
              Thêm địa chỉ mới
            </Button>
          </div>

          {/* Grid list of addresses */}
          {addressLoading ? (
            <Box className="flex min-h-40 items-center justify-center rounded-3xl border border-slate-100 bg-white/70">
              <CircularProgress size={28} sx={{ color: "#1B4965" }} />
            </Box>
          ) : addressError ? (
            <Box className="flex min-h-40 flex-col items-center justify-center gap-3 rounded-3xl border border-rose-100 bg-rose-50/60 p-6 text-center">
              <Typography className="!font-semibold text-rose-700">{addressError}</Typography>
              <Button variant="outlined" onClick={loadAddresses} className="!rounded-xl !font-bold !capitalize">
                Thử tải lại
              </Button>
            </Box>
          ) : addresses.length === 0 ? (
            <Box className="flex min-h-40 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white/70 p-6 text-center">
              <Typography className="!font-bold text-slate-700">Chưa có địa chỉ nào được lưu</Typography>
              <Typography variant="body2" className="text-slate-500">
                Thêm địa chỉ kho hoặc điểm giao nhận để chọn nhanh khi tạo phiên đấu giá.
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
            {addresses.map((addr) => (
              <Grid item xs={12} md={6} lg={4} key={addr.id}>
                <AppCard
                  showAccent={false}
                  className="group hover:border-[#1B4965]/20 hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 border border-slate-100 !rounded-3xl relative overflow-hidden"
                  sx={{
                    background: "rgba(255, 255, 255, 0.8)",
                    backdropFilter: "blur(20px)",
                  }}
                >
                  {/* Decorative indicator line */}
                  <Box className="absolute top-0 left-0 w-full h-1 bg-[#1B4965] opacity-20 group-hover:opacity-100 transition-opacity" />
                  
                  <CardContent className="!p-5 space-y-3.5">
                    {/* Address title */}
                    <div className="flex items-center justify-between">
                      <Typography className="!font-bold text-slate-700 text-sm truncate max-w-[200px]">
                        {addr.label}
                      </Typography>
                      <div className="flex gap-0.5">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenAddressEdit(addr)}
                          className="text-slate-400 hover:text-[#1B4965]"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleAddressDelete(addr.id)}
                          className="text-slate-400 hover:text-rose-500"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </div>
                    </div>

                    {/* Detailed info */}
                    <div className="space-y-1.5 text-xs text-slate-500 font-medium">
                      <div>
                        <strong className="text-slate-400 font-semibold block text-[0.65rem] uppercase">Người liên hệ</strong>
                        <span className="text-slate-700 font-semibold">{addr.contactName} ({addr.contactPhone})</span>
                      </div>
                      <div>
                        <strong className="text-slate-400 font-semibold block text-[0.65rem] uppercase">Địa chỉ kho bãi</strong>
                        <span className="text-slate-600 block truncate mt-0.5">{addr.detail}</span>
                        <span className="text-slate-400 font-bold block">{addr.province}</span>
                      </div>
                    </div>
                  </CardContent>
                </AppCard>
              </Grid>
            ))}
            </Grid>
          )}
        </div>
      )}


      {/* Address Edit/Add Dialog */}
      <Dialog
        open={openAddressDialog}
        onClose={() => setOpenAddressDialog(false)}
        maxWidth="xs"
        fullWidth
        className="backdrop-blur-sm"
        PaperProps={{
          className: "!rounded-3xl !p-2",
        }}
      >
        <DialogTitle className="flex justify-between items-center !font-bold text-slate-800">
          {addressEditMode ? "Cập nhật địa chỉ kho bãi" : "Thêm địa chỉ kho bãi mới"}
          <IconButton size="small" onClick={() => setOpenAddressDialog(false)} className="text-slate-400">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className="space-y-4 !pt-2">
          <TextField
            label="Tên gợi nhớ kho (Ví dụ: Kho Tổng Đông Anh)"
            fullWidth
            value={addressForm.label}
            onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
            InputProps={{ className: "!rounded-2xl" }}
          />
          <TextField
            label="Họ tên người liên hệ"
            fullWidth
            value={addressForm.contactName}
            onChange={(e) => setAddressForm({ ...addressForm, contactName: e.target.value })}
            InputProps={{ className: "!rounded-2xl" }}
          />
          <TextField
            label="Số điện thoại liên hệ"
            fullWidth
            value={addressForm.contactPhone}
            onChange={(e) => setAddressForm({ ...addressForm, contactPhone: e.target.value })}
            InputProps={{ className: "!rounded-2xl" }}
          />
          <TextField
            label="Tỉnh / Thành phố"
            fullWidth
            value={addressForm.province}
            onChange={(e) => setAddressForm({ ...addressForm, province: e.target.value })}
            InputProps={{ className: "!rounded-2xl" }}
          />
          <TextField
            label="Địa chỉ chi tiết (Số nhà, ngõ, đường, cụm kho)"
            multiline
            rows={2}
            fullWidth
            value={addressForm.detail}
            onChange={(e) => setAddressForm({ ...addressForm, detail: e.target.value })}
            InputProps={{ className: "!rounded-2xl" }}
          />
        </DialogContent>
        <DialogActions className="!px-6 !pb-4 flex justify-end gap-3">
          <Button
            onClick={() => setOpenAddressDialog(false)}
            variant="text"
            className="!text-slate-500 !font-bold !capitalize !rounded-xl"
          >
            Đóng
          </Button>
          <Button
            onClick={handleAddressSubmit}
            variant="contained"
            disabled={addressSaving}
            className="!font-bold !capitalize !rounded-xl !px-5"
            sx={{
              background: "linear-gradient(135deg, #1B4965 0%, #0D2B3E 100%)",
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
        PaperProps={{ className: "!rounded-3xl !p-2" }}
      >
        <DialogTitle className="!font-bold text-slate-800">Xóa địa chỉ đã lưu?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" className="text-slate-600">
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

      {/* Trigger eKYC Modal from Settings */}
      {openEkycModal && (
        <EkycModal 
          open={openEkycModal} 
          onClose={() => setOpenEkycModal(false)}
          onComplete={() => {
            setOpenEkycModal(false);
            setRepresentativeStatus("verified");
          }} 
        />
      )}
    </Box>
  );
}
