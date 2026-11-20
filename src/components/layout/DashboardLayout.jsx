"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Sidebar, { SIDEBAR_WIDTH } from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";
import MobileBottomNav from "./MobileBottomNav";
import { navigationByRole, mobileNavigationByRole } from "@/navigation/navigation";
import useAccountVerification, { AccountVerificationProvider } from "@/hooks/useAccountVerification";

const ROLE_LABELS = { SHIPPER: "Chủ hàng", CARRIER: "Chủ xe", ADMIN: "Quản trị viên", DRIVER: "Tài xế" };
const VERIFICATION_BANNER_BY_ROLE = {
  shipper: "Tài khoản chưa hoàn tất xác thực eKYC và doanh nghiệp. Bạn chưa thể tạo phiên đấu giá, nạp/rút tiền hoặc ký hợp đồng.",
  carrier: "Tài khoản chưa hoàn tất xác thực eKYC và doanh nghiệp. Bạn chưa thể tham gia đấu giá, đăng ký tuyến xe rỗng, nạp/rút tiền hoặc ký hợp đồng.",
};
const LOCKED_PATHS_BY_ROLE = {
  shipper: new Set(["/shipper/bidding/create"]),
  carrier: new Set(["/carrier/auctions"]),
};
const BANNER_SUPPRESSED_EXACT = new Set([
  "/shipper/settings",
  "/carrier/settings",
  "/ekyc",
  "/shipper/bidding/create",
]);

export default function DashboardLayout({ children, role, userInfo }) {
  const pathname = usePathname();
  const navigation = navigationByRole[role] || navigationByRole.shipper;
  const mobileNavigation = mobileNavigationByRole[role] || [];
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(userInfo);
  const requiresVerification = role === "carrier" || role === "shipper";
  const verification = useAccountVerification(requiresVerification);
  const verificationLocked = requiresVerification && !verification.loading && !verification.fullyVerified;
  const lockedPaths = verificationLocked ? LOCKED_PATHS_BY_ROLE[role] || new Set() : new Set();
  const verificationBannerText = VERIFICATION_BANNER_BY_ROLE[role] || VERIFICATION_BANNER_BY_ROLE.carrier;
  const suppressVerificationBanner =
    BANNER_SUPPRESSED_EXACT.has(pathname) || pathname?.startsWith("/carrier/auctions");

  useEffect(() => {
    const refreshUser = async () => {
      try {
        let res = await fetch("/api/auth/me", { cache: "no-store" });
        if (res.status === 401) {
          const refreshRes = await fetch("/api/auth/refresh", { method: "POST" }).catch(() => null);
          if (refreshRes?.ok) {
            res = await fetch("/api/auth/me", { cache: "no-store" });
          }
        }
        if (res.status === 401 || res.status === 403 || res.status === 404) {
          if (typeof window !== "undefined" && window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
          return;
        }
        const resData = await res.json();
        if (!resData || !resData.success) {
          if (typeof window !== "undefined" && window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
          return;
        }
        if (resData.data) {
          const u = resData.data;
          const displayName = u.fullName || u.companyName || u.phone || "Người dùng";
          setCurrentUser({
            id: u.id || u.accountId,
            accountId: u.accountId || u.id,
            name: displayName,
            email: u.email || "",
            phone: u.phone || "",
            avatar: displayName.charAt(0).toUpperCase(),
            avatarUrl: u.avatarUrl || "",
            role: ROLE_LABELS[u.role] || "Người dùng",
            companyName: u.companyName,
            companyId: u.companyId,
          });
        }
      } catch (err) {
        console.error("Could not fetch user profile:", err);
      }
    };

    void refreshUser();
    window.addEventListener("account-profile-updated", refreshUser);
    return () => window.removeEventListener("account-profile-updated", refreshUser);
  }, [role]);

  return (
    <Box sx={{ display: "flex", minHeight: "100dvh", bgcolor: "background.default" }}>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[2000] focus:rounded-md focus:bg-surface focus:px-3 focus:py-2 focus:font-semibold focus:text-brand">
        Bỏ qua điều hướng
      </a>

      <Sidebar
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        navigation={navigation}
        role={role}
        lockedPaths={lockedPaths}
      />

      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", ml: { md: `${SIDEBAR_WIDTH}px` } }}>
        <Header userInfo={currentUser} role={role} />

        <Box
          component="main"
          id="main-content"
          tabIndex={-1}
          className="with-bottom-nav"
          sx={{ flex: 1, width: "100%", maxWidth: 1440, mx: "auto", px: { xs: 2, md: 3 }, pt: { xs: 2, md: 3 }, outline: "none" }}
        >
          <AccountVerificationProvider value={verification}>
            {verificationLocked && !suppressVerificationBanner && (
              <Alert
                severity="warning"
                className="!mb-4"
                action={
                  <Button
                    component={Link}
                    href={`/${role}/settings`}
                    color="inherit"
                    size="small"
                    className="!whitespace-nowrap"
                  >
                    Xác thực ngay
                  </Button>
                }
              >
                {verificationBannerText}
              </Alert>
            )}
            {children}
          </AccountVerificationProvider>
        </Box>

        <Box sx={{ display: { xs: "none", md: "block" }, px: 3, pb: 2, maxWidth: 1440, width: "100%", mx: "auto" }}>
          <Footer />
        </Box>
      </Box>

      <MobileBottomNav items={mobileNavigation} lockedPaths={lockedPaths} onOpenMore={() => setMobileOpen(true)} />
    </Box>
  );
}
