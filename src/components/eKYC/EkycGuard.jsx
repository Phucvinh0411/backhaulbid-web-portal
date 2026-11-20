"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import SecurityIcon from "@mui/icons-material/Security";
import { ActionButton, AppCard } from "@/components/common";
import { ListSkeleton } from "@/components/ui";
import useAccountVerification, { notifyAccountVerificationUpdated } from "@/hooks/useAccountVerification";

const EkycModal = dynamic(() => import("./EkycModal"), { ssr: false });

/** Blocks protected business pages until both eKYC and business verification are completed. */
export default function EkycGuard({ children, role }) {
  const verification = useAccountVerification(true);
  const [showModal, setShowModal] = useState(false);

  const isLoading = verification.loading;
  const isVerified = verification.fullyVerified;
  const missingEkyc = !verification.ekycVerified;
  const settingsHref = role === "carrier" ? "/carrier/settings" : "/shipper/settings";

  /** Closes the NFC dialog and reloads the account verification status. */
  const handleEkycComplete = () => {
    setShowModal(false);
    verification.refresh?.();
    notifyAccountVerificationUpdated();
  };

  if (isLoading) {
    return <ListSkeleton rows={3} height={140} label="Đang kiểm tra trạng thái xác thực..." />;
  }

  if (!isVerified) {
    return (
      <>
        <Box className="flex w-full justify-center py-8 px-4" role="region" aria-labelledby="ekyc-guard-title">
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
              {missingEkyc ? "Tài khoản chưa xác thực eKYC" : "Tài khoản chưa xác minh doanh nghiệp"}
            </Typography>
            <Typography variant="body2" className="mt-2 text-ink-muted">
              {missingEkyc
                ? role === "shipper"
                  ? "Chủ hàng bắt buộc phải hoàn tất xác thực người đại diện (eKYC) và xác minh doanh nghiệp trước khi tạo phiên đấu giá."
                  : role === "carrier"
                    ? "Chủ xe bắt buộc phải hoàn tất xác thực người đại diện (eKYC) và xác minh doanh nghiệp trước khi đăng ký và tham gia đấu giá."
                    : "Theo quy định của hệ thống BackHaulBid, bạn bắt buộc phải hoàn tất định danh người đại diện pháp luật (eKYC) và doanh nghiệp để sử dụng các tính năng giao dịch."
                : "Bạn đã hoàn tất eKYC người đại diện. Vui lòng hoàn tất xác minh hồ sơ doanh nghiệp để mở khóa chức năng này."}
            </Typography>
            {missingEkyc ? (
              <div className="mt-6 flex flex-col gap-2">
                <ActionButton
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={() => setShowModal(true)}
                >
                  Xác thực eKYC ngay
                </ActionButton>
                <Button component={Link} href={settingsHref} variant="text" fullWidth>
                  Mở cài đặt xác minh
                </Button>
              </div>
            ) : (
              <Button
                component={Link}
                href={settingsHref}
                variant="contained"
                size="large"
                fullWidth
                className="!mt-6"
              >
                Xác minh doanh nghiệp ngay
              </Button>
            )}
          </AppCard>
        </Box>

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

  return <>{children}</>;
}
