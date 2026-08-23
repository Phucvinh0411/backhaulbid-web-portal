"use client";

import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import SecurityIcon from "@mui/icons-material/Security";
import { ActionButton, AppCard } from "@/components/common";
import { dispatchGlobalNotification } from "@/components/common/NotificationPopup";
import EkycModal from "./EkycModal";
import { getRepresentativeVerificationStatus } from "@/services/representativeVerificationApi";

export default function EkycGuard({ children, role }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    let active = true;

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
  }, []);

  const handleEkycComplete = () => {
    setIsVerified(true);
    setShowModal(false);
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
            className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ekyc-guard-title"
          >
            <AppCard
              className="w-full max-w-md p-6 text-center sm:p-8"
              showAccent={false}
            >
              <Box className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-50 text-[#1B4965]">
                <SecurityIcon fontSize="large" />
              </Box>
              <Typography
                id="ekyc-guard-title"
                variant="h6"
                className="!font-bold text-slate-800"
              >
                Tài khoản chưa được xác thực
              </Typography>
              <Typography variant="body2" className="mt-2 text-slate-500">
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
