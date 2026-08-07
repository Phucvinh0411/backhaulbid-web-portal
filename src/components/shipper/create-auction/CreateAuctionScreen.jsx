"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import ArrowBackIcon from "@mui/icons-material/ArrowBackOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForwardOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircleOutlined";

import PageHeader from "@/components/common/PageHeader";

import { INITIAL_FORM_STATE } from "./mockData";
import StepNavigationHeader from "./StepNavigationHeader";
import SummarySidebar from "./SummarySidebar";
import AddressBookModal from "./AddressBookModal";

import Step1GoodsInfo from "./steps/Step1GoodsInfo";
import Step2RouteInfo from "./steps/Step2RouteInfo";
import Step3AuctionConfig from "./steps/Step3AuctionConfig";

export default function CreateAuctionScreen() {
  const router = useRouter();

  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Address book modal state
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [addressTarget, setAddressTarget] = useState("FROM"); // "FROM" | "TO"

  const updateForm = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleOpenAddressBook = (target) => {
    setAddressTarget(target);
    setAddressModalOpen(true);
  };

  const handleSelectAddress = (addr) => {
    if (addressTarget === "FROM") {
      setForm((prev) => ({
        ...prev,
        fromLocationName: addr.label,
        fromAddress: addr.detail,
        fromProvince: addr.province,
        fromContactName: addr.contactName,
        fromContactPhone: addr.contactPhone,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        toLocationName: addr.label,
        toAddress: addr.detail,
        toProvince: addr.province,
        toContactName: addr.contactName,
        toContactPhone: addr.contactPhone,
      }));
    }
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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const payload = {
        title: form.goodsName,
        goodsType: form.goodsCategory,
        vehicleTypeRequired: form.requiredVehicleType,
        origin: `${form.fromProvince} - ${form.fromLocationName}`,
        destination: `${form.toProvince} - ${form.toLocationName}`,
        weight: form.weight,
        maxPrice: form.maxPrice.toString(),
        notes: form.description,
        isDepositRequired: form.depositAmount > 0,
        depositAmount: form.depositAmount > 0 ? form.depositAmount.toString() : undefined,
        registrationEndTime: new Date(form.regEndTime).toISOString(),
        startTime: new Date(form.startTime).toISOString(),
        endTime: new Date(form.endTime).toISOString(),
        images: []
      };

      const response = await fetch("/api/bidding/auctions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Lỗi tạo phiên đấu giá");
      }

      alert("🎉 Tạo cuộc đấu giá thành công! Đơn hàng đã được đưa vào danh sách chờ mở đăng ký.");
      router.push("/shipper/bidding/sessions");
    } catch (error) {
      alert(`Lỗi: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box className="w-full min-h-screen pb-12">
      <PageHeader
        title="Tạo Phiên Đấu Giá Vận Tải Mới"
        subtitle="Thiết lập chi tiết lô hàng, thông tin hành trình A → B và cấu hình thể thức đấu giá."
        breadcrumbs={[
          { label: "Trang chủ", path: "/shipper/dashboard" },
          { label: "Đấu giá vận tải", path: "/shipper/bidding/sessions" },
          { label: "Tạo phiên mới" },
        ]}
      />

      {/* Stepper Header */}
      <StepNavigationHeader activeStep={activeStep} setActiveStep={setActiveStep} />

      {/* Main Grid: Step Content (left 7) + Summary Sidebar (right 5) */}
      <Grid container spacing={3} alignItems="flex-start">
        {/* Left Column: Form Step */}
        <Grid item xs={12} md={7} lg={8}>
          {activeStep === 0 && <Step1GoodsInfo form={form} updateForm={updateForm} />}
          {activeStep === 1 && (
            <Step2RouteInfo
              form={form}
              updateForm={updateForm}
              onOpenAddressBook={handleOpenAddressBook}
            />
          )}
          {activeStep === 2 && <Step3AuctionConfig form={form} updateForm={updateForm} />}

          {/* Wizard Action Footer */}
          <div className="flex items-center justify-between pt-6 border-t border-slate-200/80 mt-6">
            <Button
              variant="outlined"
              onClick={handleBack}
              disabled={activeStep === 0}
              startIcon={<ArrowBackIcon />}
              className="!rounded-2xl !py-3 !px-5 !font-bold !capitalize !border-slate-200 !text-slate-600 hover:!border-slate-300 hover:!bg-slate-50"
            >
              Quay lại
            </Button>

            {activeStep < 2 ? (
              <Button
                variant="contained"
                onClick={handleNext}
                endIcon={<ArrowForwardIcon />}
                className="!rounded-2xl !py-3 !px-6 !font-bold !capitalize shadow-md hover:shadow-lg transition-all"
                sx={{
                  background: "linear-[#1B4965]",
                  backgroundColor: "#1B4965",
                  "&:hover": { backgroundColor: "#0D2B3E" },
                }}
              >
                Tiếp theo
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={isSubmitting}
                startIcon={<CheckCircleIcon />}
                className="!rounded-2xl !py-3 !px-7 !font-bold !capitalize shadow-md hover:shadow-lg transition-all !text-white"
                sx={{
                  background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                  },
                }}
              >
                {isSubmitting ? "Đang khởi tạo..." : "Xác Nhận & Xuất Phiên Đấu Giá"}
              </Button>
            )}
          </div>
        </Grid>

        {/* Right Column: Live Sticky Summary Sidebar */}
        <Grid item xs={12} md={5} lg={4}>
          <SummarySidebar form={form} />
        </Grid>
      </Grid>

      {/* Saved Address Book Modal */}
      <AddressBookModal
        open={addressModalOpen}
        onClose={() => setAddressModalOpen(false)}
        onSelectAddress={handleSelectAddress}
        targetType={addressTarget}
      />
    </Box>
  );
}
