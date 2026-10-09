"use client";

import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import SecurityIcon from "@mui/icons-material/Security";
import { ActionButton, AppCard } from "@/components/common";
import { dispatchGlobalNotification } from "@/components/common/NotificationPopup";
import EkycModal from "./EkycModal";
import { getRepresentativeVerificationStatus } from "@/services/representativeVerificationApi";

/** Blocks protected business pages until the account's eKYC status is verified. */
export default function EkycGuard({ children, role }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [verificationRefreshKey, setVerificationRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setIsVerified(false);

    getRepresentativeVerificationStatus({ skipGlobalNotification: true })
      .then((data) => {
        if (active) setIsVerified(data?.status === "VERIFIED");
      })
      .catch(() => {
        if (active) {
          setIsVerified(false);
          dispatchGlobalNotification({
            type: "error",
            title: "Chưa thể kiểm tra eKYC",
            message:
              "Không thể kiểm tra trạng thái eKYC lúc này. Vui lòng thử lại sau hoặc mở xác thực eKYC để tiếp tục.",
          });
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [verificationRefreshKey]);

  /** Closes the NFC dialog and reloads the account verification status. */
  const handleEkycComplete = () => {
    setShowModal(false);
    setIsLoading(true);
    setVerificationRefreshKey((value) => value + 1);
  };

  return (
    <>
      <div className="relative w-full h-full">
        {/* Render the actual content but blur it if not verified */}
        <div className={`w-full h-full transition-all duration-300 ${isLoading || !isVerified ? 'blur-sm pointer-events-none select-none' : ''}`}>
          {children}
        </div>

        {/* Blocking Overlay */}
        {!isLoading && !isVerified && (
          <Box
            className="absolute inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ekyc-guard-title"
          >
            <AppCard
              className="w-full max-w-md p-6 text-center sm:p-8"
              showAccent={false}
            >
              <Box className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-info-soft text-[var(--color-brand)]">
                <SecurityIcon fontSize="large" />
              </Box>
              <Typography
                id="ekyc-guard-title"
                variant="h6"
                className="!font-bold text-ink"
              >
                Tài khoản chưa được xác thực
              </Typography>
              <Typography variant="body2" className="mt-2 text-ink-muted">
                Theo quy định của hệ thống BackHaulBid, bạn bắt buộc phải hoàn tất định danh người đại diện pháp luật (eKYC) để sử dụng các tính năng giao dịch.
              </Typography>
              <ActionButton
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => setShowModal(true)}
                className="mt-6"
              >
                Xác thực eKYC ngay
              </ActionButton>
            </AppCard>
          </Box>
        )}
      </div>

      {showModal && (
        <EkycModal
          role={role}
          onClose={() => setShowModal(false)}
          onComplete={handleEkycComplete}
        />
      )}
    </>
  );
}
