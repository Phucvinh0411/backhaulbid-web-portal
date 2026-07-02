"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import Sidebar, { SIDEBAR_WIDTH } from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";

export default function DashboardLayout({ children }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box 
      className="flex min-h-screen relative"
      sx={{
        backgroundColor: "#F6F8FC", // Premium soft gray-blue
        backgroundImage: `
          radial-gradient(circle at 5% 15%, rgba(98, 182, 203, 0.16) 0%, transparent 35%),
          radial-gradient(circle at 95% 80%, rgba(27, 73, 101, 0.12) 0%, transparent 40%),
          radial-gradient(circle at 10% 80%, rgba(99, 102, 241, 0.08) 0%, transparent 35%),
          radial-gradient(circle at 50% 50%, rgba(248, 250, 252, 0.6) 0%, transparent 100%)
        `,
        backgroundAttachment: "fixed",
      }}
    >
      {/* Sidebar - permanent on desktop (floating), temporary on mobile */}
      {isMobile ? (
        <Sidebar
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
        />
      ) : (
        <Sidebar variant="permanent" />
      )}

      {/* Header - Floating next to sidebar */}
      <Header onMenuToggle={handleDrawerToggle} />

      {/* Main content area */}
      <Box
        component="main"
        className="flex-1 flex flex-col min-h-screen"
        sx={{
          width: { 
            md: `calc(100% - ${SIDEBAR_WIDTH}px)` 
          },
          maxWidth: {
            md: `calc(100% - ${SIDEBAR_WIDTH}px)`
          },
          ml: {
            // md: `${SIDEBAR_WIDTH}px`
          },
          pl: { 
            md: 0.5 // Subtle gap between sidebar and content
          },
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Spacer for floating AppBar (AppBar height is ~80px + top margin 20px + breathing space) */}
        <Box sx={{ height: { xs: "90px", md: "108px" } }} />

        {/* Content canvas */}
        <Box 
          className="flex-1"
          sx={{
            px: { xs: 2, md: 2.5 },
            pb: 2.5,
          }}
        >
          {children}
        </Box>

        {/* Footer - aligned with right content grid */}
        <Box 
          sx={{ 
            px: { xs: 2, md: 2.5 }, 
            pb: 2.5 
          }}
        >
          <Footer />
        </Box>
      </Box>
    </Box>
  );
}
