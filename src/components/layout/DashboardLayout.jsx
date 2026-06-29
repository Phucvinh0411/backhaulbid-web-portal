"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import Sidebar, { SIDEBAR_WIDTH } from "./Sidebar";
import Header from "./Header";

export default function DashboardLayout({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box className="flex min-h-screen bg-slate-50">
      {/* Sidebar - permanent on desktop, temporary on mobile */}
      {isMobile ? (
        <Sidebar
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
        />
      ) : (
        <Sidebar variant="permanent" />
      )}

      {/* Header */}
      <Header onMenuToggle={handleDrawerToggle} />

      {/* Main content */}
      <Box
        component="main"
        className="flex-1 flex flex-col min-h-screen"
        sx={{
          width: { md: `calc(100% - ${SIDEBAR_WIDTH}px)` },
        }}
      >
        <Toolbar /> {/* Spacer for fixed AppBar */}
        <Box className="flex-1 p-4 md:p-6">
          {children}
        </Box>
      </Box>
    </Box>
  );
}
