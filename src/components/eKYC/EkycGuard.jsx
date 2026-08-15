"use client";

import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import SecurityIcon from "@mui/icons-material/Security";
import EkycModal from "./EkycModal";
import { getRepresentativeVerificationStatus } from "@/services/representativeVerificationApi";

export default function EkycGuard({ children, role }) {
  const [isLoading, setIsLoading] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    let active = true;

    getRepresentativeVerificationStatus()
      .then((data) => {
        if (active) setIsVerified(data?.status === "VERIFIED");
      })
      .catch(() => {
        if (active) setIsVerified(false);
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
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm">
            <Box className="bg-white rounded-3xl p-8 max-w-md text-center shadow-2xl flex flex-col items-center">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                <SecurityIcon fontSize="large" />
              </div>
              <Typography variant="h6" className="!font-bold text-slate-800 mb-2">
                Tài khoản chưa được xác thực
              </Typography>
              <Typography variant="body2" className="text-slate-500 mb-6">
                Theo quy định của hệ thống BackHaulBid, bạn bắt buộc phải hoàn tất định danh người đại diện pháp luật (eKYC) để sử dụng các tính năng giao dịch.
              </Typography>
              <Button
                variant="contained"
                fullWidth
                onClick={() => setShowModal(true)}
                className="!font-bold !py-3 !rounded-xl"
                sx={{
                  background: "linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)",
                  },
                }}
              >
                Xác Thực eKYC Ngay
              </Button>
            </Box>
          </div>
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
