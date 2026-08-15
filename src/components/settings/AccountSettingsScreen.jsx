"use client";

import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import AssignmentIndOutlinedIcon from "@mui/icons-material/AssignmentIndOutlined";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";

import { ActionButton, AppCard, PageHeader } from "@/components/common";
import BusinessVerificationPanel from "@/components/businessVerification/BusinessVerificationPanel";
import EkycModal from "@/components/eKYC/EkycModal";
import { getRepresentativeVerificationStatus } from "@/services/representativeVerificationApi";

const ROLE_COPY = {
  carrier: {
    title: "Hồ sơ & eKYC",
    subtitle:
      "Hoàn tất eKYC người đại diện và xác minh doanh nghiệp trước khi ký hợp đồng vận tải.",
    dashboardPath: "/carrier/dashboard",
  },
  shipper: {
    title: "Cài đặt tài khoản",
    subtitle:
      "Hoàn tất eKYC người đại diện và xác minh doanh nghiệp trước khi tạo phiên vận chuyển.",
    dashboardPath: "/shipper/dashboard",
  },
};

const EMPTY_EKYC = { status: "loading", fullName: "", failureReason: "" };

function statusPresentation(status) {
  if (status === "verified") {
    return { label: "Đã xác thực", color: "success" };
  }
  if (status === "pending") {
    return { label: "Đang xử lý", color: "warning" };
  }
  if (status === "loading") {
    return { label: "Đang kiểm tra", color: "default" };
  }
  return { label: "Chưa xác thực", color: "default" };
}

function StepStatus({ step, title, description, state }) {
  const isDone = state === "done";
  const isPending = state === "pending";

  return (
    <Box
      className={`rounded-2xl border p-4 transition-colors ${
        isDone
          ? "border-emerald-200 bg-emerald-50/60"
          : isPending
            ? "border-amber-200 bg-amber-50/60"
            : "border-slate-200 bg-slate-50/70"
      }`}
    >
      <Box className="flex items-start gap-3">
        <Box
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-black ${
            isDone
              ? "bg-emerald-500 text-white"
              : isPending
                ? "bg-amber-500 text-white"
                : "bg-slate-200 text-slate-500"
          }`}
        >
          {isDone ? <CheckCircleOutlinedIcon fontSize="small" /> : step}
        </Box>
        <Box className="min-w-0 flex-1">
          <Typography className="!font-bold text-slate-800">{title}</Typography>
          <Typography variant="body2" className="mt-1 text-slate-500">
            {description}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default function AccountSettingsScreen({ role = "carrier" }) {
  const config = ROLE_COPY[role] || ROLE_COPY.carrier;
  const [ekyc, setEkyc] = useState(EMPTY_EKYC);
  const [openEkycModal, setOpenEkycModal] = useState(false);
  const [verificationRefreshKey, setVerificationRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;

    getRepresentativeVerificationStatus()
      .then((data) => {
        if (!active) return;
        setEkyc({
          status:
            data?.status === "VERIFIED"
              ? "verified"
              : data?.status === "PENDING"
                ? "pending"
                : "unverified",
          fullName: data?.fullName || "",
          failureReason: data?.failureReason || "",
        });
      })
      .catch(() => {
        if (active) setEkyc({ ...EMPTY_EKYC, status: "unverified" });
      });

    return () => {
      active = false;
    };
  }, [verificationRefreshKey]);

  const ekycStatus = statusPresentation(ekyc.status);
  const ekycVerified = ekyc.status === "verified";
  const ekycPending = ekyc.status === "pending";

  return (
    <Box className="animate-fade-in-up">
      <PageHeader
        title={config.title}
        subtitle={config.subtitle}
        breadcrumbs={[
          { label: "Trang chủ", path: config.dashboardPath },
          { label: "Cài đặt tài khoản" },
        ]}
      />

      <Box className="mt-6 space-y-6">
        <AppCard showAccent={false} className="!rounded-3xl">
          <Box className="p-5 sm:p-6">
            <Box className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <Box>
                <Typography
                  variant="h6"
                  className="flex items-center gap-2 !font-black text-[#1B4965]"
                >
                  <AssignmentIndOutlinedIcon />
                  Trạng thái hồ sơ xác thực
                </Typography>
                <Typography variant="body2" className="mt-1 text-slate-500">
                  Dữ liệu doanh nghiệp chỉ xuất hiện sau khi tra cứu MST thành công. Không có dữ liệu mẫu trong hồ sơ chưa xác thực.
                </Typography>
              </Box>
              <Chip
                label={ekycStatus.label}
                color={ekycStatus.color}
                size="small"
                className="w-fit !font-bold"
              />
            </Box>

            <Grid container spacing={2} className="!mt-1">
              <Grid item xs={12} md={4}>
                <StepStatus
                  step="1"
                  title="eKYC người đại diện"
                  description={
                    ekycVerified
                      ? `Đã xác thực${ekyc.fullName ? `: ${ekyc.fullName}` : "."}`
                      : ekycPending
                        ? "Hồ sơ đang được xử lý."
                        : "Cần xác thực CCCD và khuôn mặt trước."
                  }
                  state={ekycVerified ? "done" : ekycPending ? "pending" : "idle"}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <StepStatus
                  step="2"
                  title="Tra cứu mã số thuế"
                  description={
                    ekycVerified
                      ? "Nhập MST để hệ thống tự điền dữ liệu doanh nghiệp."
                      : "Sẽ mở sau khi eKYC người đại diện hoàn tất."
                  }
                  state="idle"
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <StepStatus
                  step="3"
                  title="Admin xét duyệt"
                  description="Kiểm tra giấy phép kinh doanh và giấy ủy quyền nếu cần."
                  state="idle"
                />
              </Grid>
            </Grid>
          </Box>
        </AppCard>

        <Grid container spacing={3} alignItems="stretch">
          <Grid item xs={12} lg={5}>
            <AppCard showAccent={false} className="!rounded-3xl">
              <Box className="p-5 sm:p-6">
                <Typography
                  variant="h6"
                  className="flex items-center gap-2 !font-black text-[#1B4965]"
                >
                  <SecurityOutlinedIcon />
                  eKYC người đại diện
                </Typography>
                <Typography variant="body2" className="mt-1 text-slate-500">
                  Đây là nguồn duy nhất để xác định danh tính người đại diện. Thông tin không được tự điền trước khi eKYC thành công.
                </Typography>

                <Box className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                  <Box className="flex items-center justify-between gap-3">
                    <Typography variant="body2" className="!font-bold text-slate-700">
                      Trạng thái hồ sơ
                    </Typography>
                    <Chip label={ekycStatus.label} color={ekycStatus.color} size="small" />
                  </Box>

                  {ekycVerified ? (
                    <Box className="mt-4 space-y-3">
                      <Box className="rounded-xl border border-emerald-200 bg-white p-3">
                        <Typography variant="caption" className="text-slate-500">
                          Họ và tên theo eKYC
                        </Typography>
                        <Typography className="!font-bold text-slate-800">
                          {ekyc.fullName || "Đã xác thực thành công"}
                        </Typography>
                      </Box>
                      <Alert severity="success" variant="outlined">
                        Có thể tiếp tục tra cứu MST và nộp hồ sơ doanh nghiệp.
                      </Alert>
                    </Box>
                  ) : (
                    <Box className="mt-4">
                      <Alert severity={ekycPending ? "info" : "warning"} variant="outlined">
                        {ekycPending
                          ? "Hệ thống đang xử lý kết quả eKYC. Bạn chưa thể nộp hồ sơ doanh nghiệp."
                          : "Chưa có thông tin định danh. Hãy bắt đầu eKYC để hệ thống lấy dữ liệu thật."}
                      </Alert>
                      {ekyc.failureReason ? (
                        <Typography variant="body2" className="mt-2 text-rose-600">
                          Lý do: {ekyc.failureReason}
                        </Typography>
                      ) : null}
                      {!ekycPending ? (
                        <ActionButton
                          variant="primary"
                          size="md"
                          onClick={() => setOpenEkycModal(true)}
                          className="!mt-4"
                        >
                          Xác thực người đại diện
                        </ActionButton>
                      ) : null}
                    </Box>
                  )}
                </Box>

                <Box className="mt-5 flex items-start gap-2 text-slate-500">
                  <LockOutlinedIcon fontSize="small" className="mt-0.5" />
                  <Typography variant="caption">
                    Dữ liệu CCCD và khuôn mặt chỉ dùng để đối chiếu với thông tin đại diện trên MST.
                  </Typography>
                </Box>
              </Box>
            </AppCard>
          </Grid>

          <Grid item xs={12} lg={7}>
            <AppCard showAccent={false} className="!rounded-3xl">
              <Box className="p-5 sm:p-6">
                <Box className="mb-4 rounded-2xl border border-cyan-100 bg-cyan-50/60 p-4">
                  <Typography variant="body2" className="!font-bold text-[#1B4965]">
                    Bước 2 · Hồ sơ doanh nghiệp
                  </Typography>
                  <Typography variant="body2" className="mt-1 text-slate-600">
                    Tra cứu MST để tự điền thông tin, sau đó tải giấy tờ gửi admin duyệt.
                  </Typography>
                </Box>

                {!ekycVerified && (
                  <Alert severity="warning" variant="outlined" className="!mb-4">
                    Hoàn tất eKYC người đại diện trước khi nhập MST hoặc tải giấy phép kinh doanh.
                  </Alert>
                )}

                <Box
                  className={
                    !ekycVerified
                      ? "pointer-events-none rounded-2xl bg-slate-50/40"
                      : ""
                  }
                >
                  <BusinessVerificationPanel
                    refreshKey={verificationRefreshKey}
                  />
                </Box>
              </Box>
            </AppCard>
          </Grid>
        </Grid>
      </Box>

      {openEkycModal && (
        <EkycModal
          open={openEkycModal}
          onClose={() => setOpenEkycModal(false)}
          onComplete={() => {
            setOpenEkycModal(false);
            setVerificationRefreshKey((current) => current + 1);
          }}
        />
      )}
    </Box>
  );
}
