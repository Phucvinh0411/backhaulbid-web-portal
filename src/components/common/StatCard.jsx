// ============================================
// src/components/common/StatCard.jsx
// ============================================

"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const gradients = {
  "#1B4965": {
    bg: "linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)", // Vibrant blue
    iconBg: "rgba(255, 255, 255, 0.16)",
    iconColor: "#FFFFFF",
    textColor: "#FFFFFF",
    subColor: "rgba(255, 255, 255, 0.76)",
    boxShadow: "0 10px 25px -5px rgba(30, 58, 138, 0.3)",
  },
  "#62B6CB": {
    bg: "linear-gradient(135deg, #0D9488 0%, #06B6D4 100%)", // Ocean teal-cyan
    iconBg: "rgba(255, 255, 255, 0.16)",
    iconColor: "#FFFFFF",
    textColor: "#FFFFFF",
    subColor: "rgba(255, 255, 255, 0.76)",
    boxShadow: "0 10px 25px -5px rgba(13, 148, 136, 0.3)",
  },
  "#2E7D32": {
    bg: "linear-gradient(135deg, #059669 0%, #10B981 100%)", // Emerald success
    iconBg: "rgba(255, 255, 255, 0.16)",
    iconColor: "#FFFFFF",
    textColor: "#FFFFFF",
    subColor: "rgba(255, 255, 255, 0.76)",
    boxShadow: "0 10px 25px -5px rgba(5, 150, 105, 0.3)",
  },
  "#ED6C02": {
    bg: "linear-gradient(135deg, #D97706 0%, #F59E0B 100%)", // Amber warning
    iconBg: "rgba(255, 255, 255, 0.16)",
    iconColor: "#FFFFFF",
    textColor: "#FFFFFF",
    subColor: "rgba(255, 255, 255, 0.76)",
    boxShadow: "0 10px 25px -5px rgba(217, 119, 6, 0.3)",
  },
};

export default function StatCard({ title, value, subtitle, icon: Icon, color = "#1B4965", tooltipInfo }) {
  const styleConfig = gradients[color] || {
    bg: "rgba(255, 255, 255, 0.7)",
    iconBg: `linear-gradient(135deg, ${color}14 0%, ${color}05 100%)`,
    iconColor: color,
    textColor: "#1E293B",
    subColor: "#64748B",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    boxShadow: "0 8px 32px 0 rgba(27, 73, 101, 0.02)",
  };

  return (
    <Card 
      className="group"
      sx={{
        background: styleConfig.bg,
        backdropFilter: "blur(20px)",
        borderRadius: "16px",
        border: styleConfig.border || "none",
        boxShadow: styleConfig.boxShadow,
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        overflow: "hidden",
        position: "relative",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: styleConfig.boxShadow ? `${styleConfig.boxShadow.slice(0, -1)}, 0.45)` : "0 12px 40px 0 rgba(27, 73, 101, 0.08)",
        }
      }}
    >
      <CardContent className="!p-5">
        <Box className="flex items-start justify-between">
          <Box className="space-y-1">
            <Box className="flex items-center gap-1.5 mb-1">
              <Typography 
                variant="body2" 
                className="!text-[0.74rem] !font-bold !tracking-wider uppercase !leading-none"
                sx={{ color: styleConfig.subColor }}
              >
                {title}
              </Typography>
              {tooltipInfo && (
                <Tooltip title={tooltipInfo} placement="top" arrow>
                  <InfoOutlinedIcon sx={{ fontSize: 15, color: styleConfig.subColor, cursor: "help", mt: -0.2, opacity: 0.8 }} />
                </Tooltip>
              )}
            </Box>
            <Typography 
              variant="h4" 
              className="!font-extrabold tracking-tight"
              sx={{
                color: styleConfig.textColor,
                fontFamily: "var(--font-inter), sans-serif",
                mt: 0.5
              }}
            >
              {value}
            </Typography>
            {subtitle && (
              <Typography 
                variant="caption" 
                className="!font-semibold !mt-1 block"
                sx={{ color: styleConfig.subColor }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>
          
          {Icon && (
            <Box
              className="flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 group-hover:scale-110"
              sx={{ 
                background: styleConfig.iconBg,
                border: styleConfig.border ? `1px solid ${color}1A` : "none",
                boxShadow: styleConfig.border ? `0 4px 12px ${color}0A` : "none",
              }}
            >
              <Icon sx={{ color: styleConfig.iconColor, fontSize: 24 }} />
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
