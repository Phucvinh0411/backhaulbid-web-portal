"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

export default function StatCard({ title, value, subtitle, icon: Icon, color = "#1B4965" }) {
  return (
    <Card 
      className="group"
      sx={{
        background: "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(20px)",
        borderRadius: "16px",
        border: "1px solid rgba(255, 255, 255, 0.5)",
        boxShadow: "0 8px 32px 0 rgba(27, 73, 101, 0.02)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        overflow: "hidden",
        position: "relative",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 12px 40px 0 rgba(27, 73, 101, 0.06)",
          borderColor: "rgba(27, 73, 101, 0.12)",
        }
      }}
    >
      {/* Decorative top border gradient line on hover */}
      <Box 
        className="absolute top-0 left-0 right-0 h-[3px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `linear-gradient(90deg, ${color} 0%, #62B6CB 100%)`
        }}
      />
      
      <CardContent className="!p-5">
        <Box className="flex items-start justify-between">
          <Box className="space-y-1">
            <Typography variant="body2" className="!text-slate-400 !text-[0.78rem] !font-bold !tracking-wider uppercase !leading-none">
              {title}
            </Typography>
            <Typography 
              variant="h4" 
              className="!font-extrabold text-slate-800 tracking-tight"
              style={{
                fontFamily: "var(--font-inter), sans-serif",
              }}
            >
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" className="!text-slate-400 !font-semibold !mt-1 block">
                {subtitle}
              </Typography>
            )}
          </Box>
          
          {Icon && (
            <Box
              className="flex items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 group-hover:scale-110"
              sx={{ 
                background: `linear-gradient(135deg, ${color}14 0%, ${color}05 100%)`,
                border: `1px solid ${color}1A`,
                boxShadow: `0 4px 12px ${color}0A`,
              }}
            >
              <Icon sx={{ color, fontSize: 24 }} />
            </Box>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
