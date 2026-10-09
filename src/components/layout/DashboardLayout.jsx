"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Sidebar, { SIDEBAR_WIDTH } from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";
import MobileBottomNav from "./MobileBottomNav";
import { navigationByRole, mobileNavigationByRole } from "@/navigation/navigation";

const ROLE_LABELS = { SHIPPER: "Chủ hàng", CARRIER: "Chủ xe", ADMIN: "Quản trị viên", DRIVER: "Tài xế" };

export default function DashboardLayout({ children, role, userInfo }) {
  const navigation = navigationByRole[role] || navigationByRole.shipper;
  const mobileNavigation = mobileNavigationByRole[role] || [];
  const [mobileOpen, setMobileOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(userInfo);

  useEffect(() => {
    const refreshUser = () => fetch("/api/auth/me", { cache: "no-store" })
      .then((res) => {
        if (res.status === 401 || res.status === 403 || res.status === 404) {
          if (typeof window !== "undefined" && window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
          throw new Error("Unauthorized or user profile not found");
        }
        return res.json();
      })
      .then((resData) => {
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
      })
      .catch((err) => {
        console.error("Could not fetch user profile:", err);
      });

    refreshUser();
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
          {children}
        </Box>

        <Box sx={{ display: { xs: "none", md: "block" }, px: 3, pb: 2, maxWidth: 1440, width: "100%", mx: "auto" }}>
          <Footer />
        </Box>
      </Box>

      <MobileBottomNav items={mobileNavigation} onOpenMore={() => setMobileOpen(true)} />
    </Box>
  );
}
