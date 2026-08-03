"use client";

import { useCallback, useState } from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CheckCircleIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import CloseIcon from "@mui/icons-material/Close";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import SecurityIcon from "@mui/icons-material/SecurityOutlined";
import { ActionButton } from "@/components/common";

import { axiosClient } from "@/configs/axiosClient";
import VNPTEkyc from "@/components/eKYC/VNPTEkyc";
import {
  REPRESENTATIVE_VERIFICATION_PATH,
  buildRepresentativeVerificationPayload,
  getRepresentativeVerificationFailureMessage,
} from "@/components/eKYC/representativeVerificationApi";

const ERROR_MESSAGES = {
  401: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
  403: "Tài khoản hiện tại không có quyền xác thực người đại diện.",
};

function maskIdentityNumber(identityNumber) {
  const value = String(identityNumber || "");
  if (value.length <= 6) return value || "Chưa nhận diện";
  return `${value.slice(0, 3)}••••${value.slice(-3)}`;
}

function readDocumentValue(value) {
  if (typeof value === "string" || typeof value === "number") {
    return String(value).trim();
  }
  if (!value || typeof value !== "object") return "";
  return readDocumentValue(
    value.value ?? value.text ?? value.name ?? value.data
  );
}

function normalizeDocumentResult(result) {
  const source =
    result?.ocr?.object ||
    result?.ocr?.data?.object ||
    result?.ocr?.data ||
    result?.object ||
    result?.data?.object ||
    result?.data ||
    result ||
    {};

  return {
    fullName: readDocumentValue(
      source.name ?? source.fullName ?? source.full_name ?? source.identityName
    ),
    identityNumber: readDocumentValue(
      source.id ??
        source.identityNumber ??
        source.identity_number ??
        source.id_number
    ),
  };
}

function ReviewStatus({ label, passed, detail }) {
  return (
    <Box
      className={`flex items-start gap-3 rounded-xl border p-3 ${
        passed
          ? "border-emerald-200 bg-emerald-50/60"
          : "border-rose-200 bg-rose-50/70"
      }`}
    >
      {passed ? (
        <CheckCircleIcon className="mt-0.5 !text-lg text-emerald-600" />
      ) : (
        <ErrorOutlineIcon className="mt-0.5 !text-lg text-rose-600" />
      )}
      <Box className="min-w-0">
        <Typography variant="body2" className="!font-bold text-slate-800">
          {label}
        </Typography>
        <Typography variant="caption" className="text-slate-600">
          {detail || (passed ? "Đạt" : "Chưa đạt")}
        </Typography>
      </Box>
    </Box>
  );
}

export default function EkycModal({ open = true, onClose, onComplete }) {
  const [phase, setPhase] = useState("capture");
  const [errorMessage, setErrorMessage] = useState("");
  const [reviewData, setReviewData] = useState(null);
  const [documentPreview, setDocumentPreview] = useState(null);
  const [attempt, setAttempt] = useState(0);

  const handleVnptResult = useCallback((vnptResult) => {
    setErrorMessage("");

    try {
      const payload = buildRepresentativeVerificationPayload(vnptResult);
      setReviewData(payload);
      setPhase("review");
    } catch (error) {
      setReviewData(null);
      setPhase("error");
      setErrorMessage(
        error.message ||
          "Kết quả VNPT eKYC chưa đầy đủ. Vui lòng thực hiện lại quy trình."
      );
    }
  }, []);

  const handleDocumentResult = useCallback((documentResult) => {
    const preview = normalizeDocumentResult(documentResult);
    if (preview.fullName || preview.identityNumber) {
      setDocumentPreview(preview);
    }
  }, []);

  const submitRepresentativeVerification = useCallback(async () => {
    if (!reviewData) return;

    setPhase("saving");
      setErrorMessage("");

      try {
        const { data } = await axiosClient.post(
          REPRESENTATIVE_VERIFICATION_PATH,
          reviewData
        );

        if (data?.status !== "VERIFIED") {
          setPhase("rejected");
          setErrorMessage(
            data?.failureReason ||
              getRepresentativeVerificationFailureMessage(reviewData)
          );
          return;
        }

        setPhase("success");
      } catch (error) {
        const status = error.response?.status;
        setPhase("error");
        setErrorMessage(
          ERROR_MESSAGES[status] ||
            error.response?.data?.message ||
            error.message ||
            "Không thể lưu kết quả eKYC. Vui lòng thử lại."
        );
      }
    },
    [reviewData]
  );

  const retry = () => {
    setErrorMessage("");
    setReviewData(null);
    setDocumentPreview(null);
    setPhase("capture");
    setAttempt((current) => current + 1);
  };

  const finish = () => {
    onComplete?.();
    onClose?.();
  };
  const reviewPassed =
    reviewData &&
    reviewData.ocrPassed &&
    reviewData.documentLivenessPassed &&
    reviewData.documentAuthenticityPassed &&
    reviewData.livenessPassed &&
    reviewData.faceMatched;

  return (
    <Dialog
      open={open}
      onClose={phase === "saving" ? undefined : onClose}
      maxWidth="md"
      fullWidth
      disableEscapeKeyDown={phase === "saving"}
      PaperProps={{
        className: "!rounded-3xl !p-2",
        sx: {
          background: "rgba(255, 255, 255, 0.98)",
          boxShadow: "0 24px 64px rgba(15, 23, 42, 0.15)",
        },
      }}
    >
      <DialogTitle className="flex items-center justify-between !font-bold text-slate-800">
        <span className="flex items-center gap-2 text-[#1B4965]">
          <SecurityIcon />
          Xác thực eKYC người đại diện
        </span>
        {phase !== "saving" && phase !== "success" && (
          <IconButton
            size="small"
            onClick={onClose}
            aria-label="Đóng hộp thoại eKYC"
            className="text-slate-400"
          >
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>

      <DialogContent className="!pt-2">
        {(phase === "capture" || phase === "error" || phase === "rejected") && (
          <Box className="flex flex-col gap-4 py-2">
            <Typography variant="body2" className="text-center text-slate-500">
              Quy trình này chỉ định danh người đại diện bằng CCCD và khuôn mặt.
              Xác thực giấy phép, mã số thuế và hồ sơ doanh nghiệp được thực hiện
              riêng trên trang cài đặt.
            </Typography>

            {errorMessage && (
              <Box
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-700"
              >
                <ErrorOutlineIcon fontSize="small" />
                <Typography variant="body2" className="min-w-0 flex-1 !font-medium">
                  {errorMessage}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => setErrorMessage("")}
                  aria-label="Đóng thông báo lỗi eKYC"
                  className="!p-0.5 !text-rose-700"
                >
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
            )}

            <Box className="relative min-h-[560px] w-full overflow-hidden rounded-xl border border-slate-200">
              <VNPTEkyc
                key={attempt}
                onResult={handleVnptResult}
                onDocumentResult={handleDocumentResult}
              />
            </Box>

            {documentPreview && phase === "capture" && (
              <Box className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
                <Typography className="!font-bold text-emerald-800">
                  Đã đọc xong thông tin CCCD
                </Typography>
                <Box className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Box>
                    <Typography variant="caption" className="text-slate-500">
                      Họ và tên
                    </Typography>
                    <Typography variant="body2" className="!font-bold text-slate-800">
                      {documentPreview.fullName || "Chưa nhận diện"}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" className="text-slate-500">
                      Số CCCD
                    </Typography>
                    <Typography variant="body2" className="!font-bold text-slate-800">
                      {maskIdentityNumber(documentPreview.identityNumber)}
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="caption" className="mt-3 block text-slate-600">
                  Đang tiếp tục xác thực khuôn mặt. Vui lòng hoàn tất bước liveness.
                </Typography>
              </Box>
            )}

            {(phase === "error" || phase === "rejected") && (
              <Box className="flex justify-end">
                <ActionButton
                  variant="outlined"
                  size="sm"
                  onClick={retry}
                >
                  Thử lại quy trình
                </ActionButton>
              </Box>
            )}
          </Box>
        )}

        {phase === "review" && reviewData && (
          <Box className="space-y-4 py-2" aria-live="polite">
            <Box className="rounded-2xl border border-cyan-100 bg-cyan-50/70 p-4">
              <Typography className="!font-bold text-[#1B4965]">
                Kiểm tra kết quả eKYC trước khi lưu
              </Typography>
              <Typography variant="body2" className="mt-1 text-slate-600">
                Thông tin dưới đây được đọc từ CCCD và kết quả xác thực khuôn mặt.
                Vui lòng kiểm tra lại trước khi xác nhận.
              </Typography>
            </Box>

            <Box className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Box className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
                <Typography variant="caption" className="text-slate-500">
                  Họ và tên trên CCCD
                </Typography>
                <Typography className="!font-bold text-slate-800">
                  {reviewData.fullName || "Chưa nhận diện"}
                </Typography>
              </Box>
              <Box className="rounded-xl border border-slate-200 bg-slate-50/80 p-3">
                <Typography variant="caption" className="text-slate-500">
                  Số CCCD
                </Typography>
                <Typography className="!font-bold text-slate-800">
                  {maskIdentityNumber(reviewData.identityNumber)}
                </Typography>
              </Box>
            </Box>

            <Box className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <ReviewStatus
                label="OCR và thông tin CCCD"
                passed={reviewData.ocrPassed}
                detail={
                  reviewData.ocrPassed
                    ? "Đã đọc được thông tin hợp lệ."
                    : "Không đọc được đầy đủ hoặc giấy tờ có cảnh báo."
                }
              />
              <ReviewStatus
                label="Kiểm tra giấy tờ thật"
                passed={reviewData.documentAuthenticityPassed}
                detail="Đối chiếu dấu hiệu giả mạo, in lại hoặc thay ảnh."
              />
              <ReviewStatus
                label="Liveness giấy tờ"
                passed={reviewData.documentLivenessPassed}
                detail="Kiểm tra CCCD được chụp trực tiếp."
              />
              <ReviewStatus
                label="Liveness khuôn mặt"
                passed={reviewData.livenessPassed}
                detail="Kiểm tra người thật qua chuyển động khuôn mặt."
              />
              <ReviewStatus
                label="Đối chiếu khuôn mặt"
                passed={reviewData.faceMatched}
                detail={
                  Number.isFinite(reviewData.faceMatchScore)
                    ? `Điểm tương đồng VNPT: ${reviewData.faceMatchScore.toFixed(1)}`
                    : "Chưa có điểm đối chiếu."
                }
              />
            </Box>

            {!reviewPassed && (
              <Box
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-800"
              >
                <ErrorOutlineIcon fontSize="small" />
                <Typography variant="body2" className="!font-medium">
                  Kết quả chưa đạt đủ điều kiện. Bạn cần thực hiện lại quy trình.
                </Typography>
              </Box>
            )}

            <Box className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <ActionButton variant="outlined" size="sm" onClick={retry}>
                Quét lại
              </ActionButton>
              {reviewPassed && (
                <ActionButton
                  variant="primary"
                  size="sm"
                  onClick={submitRepresentativeVerification}
                >
                  Xác nhận và lưu kết quả
                </ActionButton>
              )}
            </Box>
          </Box>
        )}

        {phase === "saving" && (
          <Box
            className="flex min-h-[360px] flex-col items-center justify-center gap-4 text-center"
            aria-live="polite"
          >
            <CircularProgress size={42} />
            <div>
              <Typography variant="h6" className="!font-bold text-slate-800">
                Đang lưu kết quả xác thực
              </Typography>
              <Typography variant="body2" className="mt-1 text-slate-500">
                Vui lòng không đóng cửa sổ trong giây lát.
              </Typography>
            </div>
          </Box>
        )}

        {phase === "success" && (
          <Box
            className="mx-auto flex min-h-[360px] max-w-md flex-col items-center justify-center gap-5 text-center"
            aria-live="polite"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-emerald-600">
              <CheckCircleIcon className="!text-4xl" />
            </div>
            <div>
              <Typography variant="h6" className="!font-bold text-slate-800">
                Đã xác thực người đại diện
              </Typography>
              <Typography variant="body2" className="mt-2 text-slate-500">
                Kết quả CCCD, kiểm tra người thật và đối chiếu khuôn mặt đã được
                lưu. Trạng thái xác thực doanh nghiệp không bị thay đổi.
              </Typography>
            </div>
            <ActionButton
              variant="primary"
              size="md"
              onClick={finish}
            >
              Đóng và hoàn tất
            </ActionButton>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
