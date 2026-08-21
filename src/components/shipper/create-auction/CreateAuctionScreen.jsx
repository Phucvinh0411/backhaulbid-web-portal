"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import ArrowBackIcon from "@mui/icons-material/ArrowBackOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForwardOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircleOutlined";

import PageHeader from "@/components/common/PageHeader";
import { createAuction } from "@/services/biddingApi";
import { INITIAL_FORM_STATE, getParticipationFeeQuote } from "./mockData";
import StepNavigationHeader from "./StepNavigationHeader";
import SummarySidebar from "./SummarySidebar";
import AddressBookModal from "./AddressBookModal";
import Step1GoodsInfo from "./steps/Step1GoodsInfo";
import Step2RouteInfo from "./steps/Step2RouteInfo";
import Step3AuctionConfig from "./steps/Step3AuctionConfig";

const mapFormToPayload = (form) => ({
  title: form.goodsName.trim(),
  goodsType: form.goodsCategory,
  weight: Number(form.weight),
  volume: form.volume ? Number(form.volume) : undefined,
  goodsValue: form.goodsValue ? Number(form.goodsValue).toString() : undefined,
  vehicleTypeRequired: form.requiredVehicleType,
  requiredTemp: form.requiredTemp?.trim() || undefined,
  vehicleSpecs: {
    length: form.vehicleLength ? Number(form.vehicleLength) : undefined,
    width: form.vehicleWidth ? Number(form.vehicleWidth) : undefined,
    height: form.vehicleHeight ? Number(form.vehicleHeight) : undefined,
  },
  pickupLocation: {
    locationName: form.fromLocationName?.trim() || "",
    province: form.fromProvince?.trim() || "",
    address: form.fromAddress?.trim() || "",
    contactName: form.fromContactName?.trim() || undefined,
    contactPhone: form.fromContactPhone?.trim() || undefined,
    earliestTime: form.earliestPickup
      ? new Date(form.earliestPickup).toISOString()
      : undefined,
    latestTime: form.latestPickup
      ? new Date(form.latestPickup).toISOString()
      : undefined,
  },
  deliveryLocation: {
    locationName: form.toLocationName?.trim() || "",
    province: form.toProvince?.trim() || "",
    address: form.toAddress?.trim() || "",
    contactName: form.toContactName?.trim() || undefined,
    contactPhone: form.toContactPhone?.trim() || undefined,
    earliestTime: form.earliestDelivery
      ? new Date(form.earliestDelivery).toISOString()
      : undefined,
    latestTime: form.latestDelivery
      ? new Date(form.latestDelivery).toISOString()
      : undefined,
  },
  auctionType: form.auctionType || "PUBLIC",
  maxPrice: Number(form.maxPrice).toString(),
  priceStep: Number(form.priceStep).toString(),
  participationFeeTier: getParticipationFeeQuote(form.maxPrice).tier,
  maxBids: form.maxBids ? Number(form.maxBids) : undefined,
  notes: form.description?.trim() || "",
  isDepositRequired: form.isDepositRequired !== false,
  depositAmount:
    form.isDepositRequired !== false && Number(form.depositAmount) > 0
      ? Number(form.depositAmount).toString()
      : undefined,
  registrationStartTime: form.regStartTime
    ? new Date(form.regStartTime).toISOString()
    : undefined,
  registrationEndTime: new Date(form.regEndTime).toISOString(),
  startTime: new Date(form.startTime).toISOString(),
  endTime: new Date(form.endTime).toISOString(),
  images: (form.images || []).filter((image) => /^https?:\/\//.test(image)),
});

const validateForm = (form) => {
  if (!form.goodsName?.trim()) return "Vui lòng nhập tên lô hàng.";
  if (!form.goodsCategory) return "Vui lòng chọn loại hàng hóa.";
  if (!form.weight || Number(form.weight) <= 0) {
    return "Trọng lượng phải lớn hơn 0.";
  }
  if (!form.requiredVehicleType) return "Vui lòng chọn loại xe yêu cầu.";
  if (!form.maxPrice || Number(form.maxPrice) <= 0) {
    return "Vui lòng nhập giá trần hợp lệ.";
  }
  if (!form.priceStep || Number(form.priceStep) <= 0) {
    return "Vui lòng nhập bước giá hợp lệ.";
  }
  if (!form.regEndTime || !form.startTime || !form.endTime) {
    return "Vui lòng chọn đầy đủ thời gian mở và đóng thầu.";
  }
  return null;
};

export default function CreateAuctionScreen() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "info",
  });
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [addressTarget, setAddressTarget] = useState("FROM");

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleOpenAddressBook = (target) => {
    setAddressTarget(target);
    setAddressModalOpen(true);
  };

  const handleSelectAddress = (address) => {
    const prefix = addressTarget === "FROM" ? "from" : "to";
    setForm((prev) => ({
      ...prev,
      [`${prefix}LocationName`]: address.label,
      [`${prefix}Address`]: address.detail,
      [`${prefix}Province`]: address.province,
      [`${prefix}ContactName`]: address.contactName,
      [`${prefix}ContactPhone`]: address.contactPhone,
    }));
    setAddressModalOpen(false);
  };

  const handleNext = () => {
    if (activeStep < 2) {
      setActiveStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const showToast = (message, severity = "error") => {
    setToast({ open: true, message, severity });
  };

  const handleCloseToast = (event, reason) => {
    if (reason === "clickaway") return;
    setToast((prev) => ({ ...prev, open: false }));
  };

  const handleSubmit = async () => {
    const validationError = validateForm(form);
    if (validationError) {
      showToast(validationError, "warning");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const res = await createAuction(mapFormToPayload(form));
      
      const newAuctionId = res?.data?._id || res?.data?.id || "DEMO_ID";

      // (Real notifications will be handled by the backend BiddingGateway communicating with Fleet and Notification services)

      showToast("Tạo phiên đấu giá thành công! Đang chuyển hướng...", "success");
      window.setTimeout(() => {
        window.location.href = "/shipper/bidding/sessions";
      }, 1500);
    } catch (error) {
      const responseMessage = error?.response?.data?.message;
      const message = Array.isArray(responseMessage)
        ? responseMessage.join(", ")
        : responseMessage ||
          error?.message ||
          "Không thể tạo phiên đấu giá. Vui lòng kiểm tra lại dữ liệu.";
      setSubmitError(message);
      showToast(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box className="w-full min-h-screen pb-12">
      <PageHeader
        title="Tạo Phiên Đấu Giá Vận Tải Mới"
        subtitle="Thiết lập thông tin lô hàng, hành trình và cấu hình phiên đấu giá."
        breadcrumbs={[
          { label: "Trang chủ", path: "/shipper/dashboard" },
          { label: "Đấu giá vận tải", path: "/shipper/bidding/sessions" },
          { label: "Tạo phiên mới" },
        ]}
      />

      <StepNavigationHeader
        activeStep={activeStep}
        setActiveStep={setActiveStep}
      />

      <Grid container spacing={3} alignItems="flex-start">
        <Grid item xs={12} md={7} lg={8}>
          {activeStep === 0 && (
            <Step1GoodsInfo form={form} updateForm={updateForm} />
          )}
          {activeStep === 1 && (
            <Step2RouteInfo
              form={form}
              updateForm={updateForm}
              onOpenAddressBook={handleOpenAddressBook}
            />
          )}
          {activeStep === 2 && (
            <Step3AuctionConfig form={form} updateForm={updateForm} />
          )}

          {submitError && (
            <Alert severity="error" className="!mt-5 !rounded-2xl">
              {submitError}
            </Alert>
          )}

          <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-200/80">
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={activeStep === 0}
              startIcon={<ArrowBackIcon />}
              className="!rounded-2xl !py-3 !px-5 !font-bold !capitalize"
            >
              Quay lại
            </Button>

            {activeStep < 2 ? (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<ArrowForwardIcon />}
                className="!rounded-2xl !py-3 !px-6 !font-bold !capitalize"
              >
                Tiếp theo
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={isSubmitting}
                startIcon={<CheckCircleIcon />}
                className="!rounded-2xl !py-3 !px-7 !font-bold !capitalize !text-white"
                sx={{
                  background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                  },
                }}
              >
                {isSubmitting ? "Đang khởi tạo..." : "Xác nhận và xuất phiên"}
              </Button>
            )}
          </div>
        </Grid>

        <Grid item xs={12} md={5} lg={4}>
          <SummarySidebar form={form} />
        </Grid>
      </Grid>

      <AddressBookModal
        open={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        onSelectAddress={handleSelectAddress}
        targetType={addressTarget}
      />

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseToast}
          severity={toast.severity}
          variant="filled"
          sx={{ width: "100%", borderRadius: "12px", boxShadow: 3 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
