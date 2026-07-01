// ============================================
// src/shared/components/layout/MainLayout.jsx
// Premium 2026 Design - Orchestrator Layout
// ============================================

import { useState } from "react";
import { Outlet } from "react-router-dom";
import Toolbar from "@mui/material/Toolbar";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import Header from "./Header";
import Sidebar, { SIDEBAR_WIDTH } from "./Sidebar";
import Footer from "./Footer";

export default function MainLayout({ userRole }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => setMobileOpen((prev) => !prev);

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: "#F1F5F9" }}>
      {/* Sidebar */}
      {isMobile ? (
        <Sidebar userRole={userRole} variant="temporary" open={mobileOpen} onClose={handleDrawerToggle} />
      ) : (
        <Sidebar userRole={userRole} variant="permanent" />
      )}

      {/* Header (Fixed) */}
      <Header userRole={userRole} onMenuToggle={handleDrawerToggle} />

      {/* Main Content */}
      <main
        className="flex-1 flex flex-col min-h-screen"
        style={{ width: isMobile ? "100%" : `calc(100% - ${SIDEBAR_WIDTH}px)` }}
      >
        {/* Spacer for fixed AppBar */}
        <Toolbar sx={{ minHeight: "64px !important" }} />

        {/* Content area with subtle background pattern */}
        <div
          className="flex-1 p-4 md:p-6 relative"
          style={{
            background: `
              radial-gradient(ellipse at 20% 0%, rgba(95, 168, 211, 0.04) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 100%, rgba(6, 182, 212, 0.03) 0%, transparent 50%),
              #F1F5F9
            `,
          }}
        >
          {/* Page content with fade-in animation */}
          <div className="animate-fade-in-up">
            <Outlet />
          </div>
        </div>

        {/* Footer */}
        <Footer />
      </main>
    </div>
  );
}
