"use client";

import { useRef, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import ArrowBackIcon from "@mui/icons-material/ArrowBackOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForwardOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircleOutlined";

import PageHeader from "@/components/common/PageHeader";
import { StickyActionBar } from "@/components/ui";
import { useGlobalNotification } from "@/components/common/NotificationPopup";
import { createAuction } from "@/services/biddingApi";
import { getApiErrorMessage } from "@/services/errorMessage";
import { INITIAL_FORM_STATE } from "./mockData";
import {
  mapFormToAuctionPayload,
  validateCreateAuctionForm,
} from "./createAuctionValidation";
import StepNavigationHeader from "./StepNavigationHeader";
import SummarySidebar from "./SummarySidebar";
import AddressBookModal from "./AddressBookModal";
import Step1GoodsInfo from "./steps/Step1GoodsInfo";
import Step2RouteInfo from "./steps/Step2RouteInfo";
import Step3AuctionConfig from "./steps/Step3AuctionConfig";
import { uploadAuctionImages } from "./auctionImageUpload";
import { placeFromAddressBookEntry } from "./routePlace";
import { identityApi } from "@/services/identityApi";
import { notificationApi } from "@/services/notificationApi";


/* Legacy inline mapping/validation retained temporarily while the tested pure
 * implementation below is used by the submission flow.
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
}; */

export default function CreateAuctionScreen() {
  const notify = useGlobalNotification();
  const creationIdempotencyKeyRef = useRef(null);
  const submittingRef = useRef(false);
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [addressTarget, setAddressTarget] = useState("FROM");
  const [imageUploading, setImageUploading] = useState(false);

  // Address, province and pin live in one Place object, so they can never drift apart and need no manual resets.
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
      [`${prefix}Place`]: placeFromAddressBookEntry(address),
      [`${prefix}ContactName`]: address.contactName,
      [`${prefix}ContactPhone`]: address.contactPhone,
    }));
    setAddressModalOpen(false);
  };

  const handleImagesSelected = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (!files.length) return;

    setImageUploading(true);
    try {
      const uploadedUrls = await uploadAuctionImages(files);
      updateForm("images", [...(form.images || []), ...uploadedUrls]);
      showToast(`Đã tải lên ${uploadedUrls.length} ảnh hàng hóa.`, "success");
    } catch (error) {
      showToast(
        getApiErrorMessage(
          error,
          "Không thể tải ảnh hàng hóa. Vui lòng thử lại.",
        ),
      );
    } finally {
      setImageUploading(false);
    }
  };

  const handleRemoveImage = (imageUrl) => {
    updateForm(
      "images",
      (form.images || []).filter((image) => image !== imageUrl),
    );
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
    const notifyMethod = notify[severity] || notify.error;
    notifyMethod(message, {
      title: severity === "success" ? "Thành công" : "Thông báo",
    });
  };

  const handleSubmit = async () => {
    if (submittingRef.current) return;
    const validationError = validateCreateAuctionForm(form);
    if (validationError) {
      showToast(validationError, "warning");
      return;
    }

    if (!creationIdempotencyKeyRef.current) {
      creationIdempotencyKeyRef.current =
        globalThis.crypto?.randomUUID?.() ||
        `auction-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    }

    submittingRef.current = true;
    setIsSubmitting(true);

    try {
      const res = await createAuction(mapFormToAuctionPayload(form), {
        skipGlobalNotification: true,
        headers: {
          "X-Idempotency-Key": creationIdempotencyKeyRef.current,
        },
      });

      const newAuctionId =
        res?.id || res?._id || res?.data?._id || res?.data?.id;
      if (!newAuctionId) {
        throw new Error("The auction service did not return an auction ID.");
      }

      // Gửi thông báo đến notification-service cho cả Shipper và Carrier
      try {
        const userAccount = await identityApi.getCurrentAccount();
        const userId =
          userAccount?.companyId || userAccount?.id || userAccount?.accountId;
        if (userId) {
          // 1. Thông báo cho Shipper
          await notificationApi.createNotification({
            userId: String(userId),
            title: "Tạo phiên đấu giá thành công",
            message: `Lô hàng "${form.goodsName || "Mới"}" đã tạo phiên đấu giá thành công trên hệ thống.`,
            referenceId: String(newAuctionId),
            type: "AUCTION_CREATED",
          });
        }

      } catch (notifErr) {
        console.warn("Không thể gửi thông báo tới Notification Service:", notifErr);
      }

      showToast(
        "Tạo phiên đấu giá thành công! Đang chuyển hướng...",
        "success",
      );
      window.setTimeout(() => {
        window.location.href = "/shipper/bidding/sessions";
      }, 1500);
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        "Không thể tạo phiên đấu giá. Vui lòng kiểm tra lại dữ liệu.",
      );
      showToast(message);
      submittingRef.current = false;
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
            <Step1GoodsInfo
              form={form}
              updateForm={updateForm}
              imageUploading={imageUploading}
              onImagesSelected={handleImagesSelected}
              onRemoveImage={handleRemoveImage}
            />
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


        </Grid>

        <Grid item xs={12} md={5} lg={4}>
          <SummarySidebar form={form} />
        </Grid>
      </Grid>
      <Box sx={{ mt: 3 }}><StickyActionBar hint={activeStep === 2 ? "Kiểm tra thông tin và mức phí trước khi tạo phiên." : `Bước ${activeStep + 1} / 3`}>
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={activeStep === 0 || isSubmitting}
              startIcon={<ArrowBackIcon />}
              className="!rounded-xl !py-3 !px-5 !font-bold !capitalize"
            >
              Quay lại
            </Button>

            {activeStep < 2 ? (
              <Button
                variant="contained"
                disabled={isSubmitting || imageUploading}
                onClick={handleNext}
                endIcon={<ArrowForwardIcon />}
                className="!rounded-xl !py-3 !px-6 !font-bold !capitalize"
              >
                Tiếp theo
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={isSubmitting || imageUploading}
                startIcon={<CheckCircleIcon />}
                className="!rounded-xl !py-3 !px-7 !font-bold !capitalize !text-white"
                sx={{
                  background:
                    "var(--color-success)",
                  "&:hover": {
                    background:
                      "var(--color-success)",
                  },
                }}
              >
                {isSubmitting ? "Đang khởi tạo..." : "Xác nhận và xuất phiên"}
              </Button>
            )}
          </StickyActionBar></Box>

      <AddressBookModal
        open={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        onSelectAddress={handleSelectAddress}
        targetType={addressTarget}
      />
    </Box>
  );
}
