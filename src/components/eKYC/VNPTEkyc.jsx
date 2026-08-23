"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Script from "next/script";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { dispatchGlobalNotification } from "@/components/common/NotificationPopup";
import {
  VNPT_DOCUMENT_FLOW_CONFIG,
  VNPT_EKYC_ASSETS,
  getVnptEkycConfigMessage,
  normalizeVnptAccessToken,
  validateVnptEkycConfig,
} from "@/configs/vnptEkycConfig";

const VNPT_CONFIG = {
  BACKEND_URL: process.env.NEXT_PUBLIC_VNPT_EKYC_BACKEND_URL || "",
  TOKEN_KEY: process.env.NEXT_PUBLIC_VNPT_EKYC_TOKEN_KEY || "",
  TOKEN_ID: process.env.NEXT_PUBLIC_VNPT_EKYC_TOKEN_ID || "",
  ACCESS_TOKEN: normalizeVnptAccessToken(
    process.env.NEXT_PUBLIC_VNPT_EKYC_AUTH || ""
  ),
};

export default function VNPTEkyc({ onResult, onDocumentResult }) {
  const onResultRef = useRef(onResult);
  const onDocumentResultRef = useRef(onDocumentResult);
  const [isConfigReady, setIsConfigReady] = useState(false);
  const [isFaceSdkReady, setIsFaceSdkReady] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const showError = useCallback((message) => {
    setErrorMessage(message);
    dispatchGlobalNotification({
      type: "error",
      title: "eKYC chưa thể tiếp tục",
      message,
    });
  }, []);

  useEffect(() => {
    onResultRef.current = onResult;
    onDocumentResultRef.current = onDocumentResult;
  }, [onDocumentResult, onResult]);

  useEffect(() => {
    const validation = validateVnptEkycConfig(VNPT_CONFIG);

    if (!validation.ok) {
      showError(getVnptEkycConfigMessage(validation));
      return;
    }

    setIsConfigReady(true);
  }, [showError]);

  const launchSdk = useCallback(() => {
    if (!window.SDK?.launch) {
      showError("Không thể khởi tạo VNPT eKYC SDK. Vui lòng tải lại trang.");
      return;
    }

    try {
      setErrorMessage("");
      window.SDK.launch({
        ...VNPT_CONFIG,
        HAS_RESULT_SCREEN: true,
        SDK_FLOW: "DOCUMENT_TO_FACE",
        ...VNPT_DOCUMENT_FLOW_CONFIG,
        ENABLE_API_LIVENESS_DOCUMENT: true,
        ENABLE_API_LIVENESS_FACE: true,
        ENABLE_API_MASKED_FACE: true,
        ENABLE_API_COMPARE_FACE: true,
        ENABLE_API_OCR_DOCUMENT: true,
        CUSTOM_THEME: {
          PRIMARY_COLOR: "#1B4965",
          TEXT_COLOR_DEFAULT: "#ffffff",
          BACKGROUND_COLOR: "#0F2B3B",
        },
        SHOW_STEP: true,
        HAS_QR_SCAN: true,
        DEFAULT_LANGUAGE: "vi",
        URL_WEB_OVAL: VNPT_EKYC_ASSETS.WEB_OVAL,
        URL_MOBILE_OVAL: VNPT_EKYC_ASSETS.MOBILE_OVAL,
        URL_ENGLISH_VIDEO_TUTORIAL: VNPT_EKYC_ASSETS.ENGLISH_TUTORIAL,
        URL_VIETNAMESE_VIDEO_TUTORIAL:
          VNPT_EKYC_ASSETS.VIETNAMESE_TUTORIAL,
        CALL_BACK_END_FLOW: (result) => {
          if (!result || typeof result !== "object") {
            showError("VNPT eKYC trả về kết quả không hợp lệ.");
            return;
          }

          onResultRef.current?.(result);
        },
        CALL_BACK_DOCUMENT_RESULT: (result) => {
          if (result && typeof result === "object") {
            onDocumentResultRef.current?.(result);
          }
        },
      });
    } catch {
      showError("Không thể khởi tạo VNPT eKYC SDK. Vui lòng tải lại trang.");
    }
  }, [showError]);

  if (errorMessage) {
    return (
      <Box className="flex min-h-[500px] w-full items-center justify-center p-6">
        <Alert severity="error" variant="outlined" className="w-full max-w-xl">
          {errorMessage}
        </Alert>
      </Box>
    );
  }

  return (
    <div className="relative flex h-full w-full items-center justify-center">
      {!isConfigReady && (
        <Box
          role="status"
          className="absolute inset-0 flex flex-col items-center justify-center gap-3"
        >
          <CircularProgress size={32} />
          <Typography variant="body2" color="text.secondary">
            Đang kiểm tra cấu hình VNPT eKYC...
          </Typography>
        </Box>
      )}

      {isConfigReady && (
        <Script
          id="vnpt_face_sdk"
          src={VNPT_EKYC_ASSETS.FACE_SDK_SCRIPT}
          strategy="afterInteractive"
          onReady={() => {
            if (!window.FaceVNPTBrowserSDK) {
              showError(
                "Không thể khởi tạo mô-đun xác thực khuôn mặt VNPT."
              );
              return;
            }

            setIsFaceSdkReady(true);
          }}
          onError={() =>
            showError(
              "Không thể tải mô-đun xác thực khuôn mặt VNPT. Vui lòng thử lại."
            )
          }
        />
      )}

      {isConfigReady && isFaceSdkReady && (
        <Script
          id="vnpt_ekyc_sdk"
          src="/web-sdk-version-3.2.1.0.js"
          strategy="afterInteractive"
          onReady={launchSdk}
          onError={() =>
            showError("Không thể tải VNPT eKYC SDK. Vui lòng thử lại.")
          }
        />
      )}

      <div
        id="ekyc_sdk_intergrated"
        className="min-h-[500px] w-full"
      />
    </div>
  );
}
