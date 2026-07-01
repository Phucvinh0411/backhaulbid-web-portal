"use client";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import GavelOutlinedIcon from "@mui/icons-material/GavelOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { PageHeader, StatCard } from "@/components/common";

const stats = [
  {
    title: "Tổng phiên đấu giá",
    value: "1,284 phiên",
    subtitle: "+12.4% so với tháng trước",
    icon: GavelOutlinedIcon,
    color: "#1B4965",
  },
  {
    title: "Phương tiện hoạt động",
    value: "342 xe",
    subtitle: "85.2% hiệu suất vận hành",
    icon: LocalShippingOutlinedIcon,
    color: "#62B6CB",
  },
  {
    title: "Doanh thu tháng",
    value: "2.48 tỷ đ",
    subtitle: "+8.2% tăng trưởng đều",
    icon: AccountBalanceWalletOutlinedIcon,
    color: "#2E7D32",
  },
  {
    title: "Tỷ lệ giao hàng",
    value: "98.5%",
    subtitle: "+1.8% độ tin cậy dịch vụ",
    icon: TrendingUpOutlinedIcon,
    color: "#ED6C02",
  },
];

export default function DashboardPage() {
  return (
    <>
      <PageHeader
        title="Hệ thống Điều hành"
        subtitle="Tổng quan hoạt động và giao dịch vận tải BackHaulBid"
        breadcrumbs={[
          { label: "Trang chủ", path: "/" },
          { label: "Tổng quan" },
        ]}
        action={
          <Button
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            className="!rounded-xl"
            sx={{
              background: "linear-gradient(135deg, #1B4965 0%, #0D2B3E 100%)",
              boxShadow: "0 4px 14px rgba(27, 73, 101, 0.25)",
              "&:hover": {
                background: "linear-gradient(135deg, #0D2B3E 0%, #1B4965 100%)",
                boxShadow: "0 6px 20px rgba(27, 73, 101, 0.35)",
              },
              fontWeight: 600,
              fontSize: "0.82rem",
              py: 1,
              px: 2.5,
            }}
          >
            Bắt đầu đấu giá
          </Button>
        }
      />

      {/* Stats Grid */}
      <Grid container spacing={3} className="!mb-6">
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} lg={3} key={index}>
            <StatCard {...stat} />
          </Grid>
        ))}
      </Grid>

      {/* Detail dashboard layout sections */}
      <Grid container spacing={3}>
        {/* Left main area - Chart placeholder */}
        <Grid item xs={12} lg={8}>
          <Card 
            sx={{
              background: "rgba(255, 255, 255, 0.7)",
              backdropFilter: "blur(20px)",
              borderRadius: "16px",
              border: "1px solid rgba(255, 255, 255, 0.5)",
              boxShadow: "0 8px 32px 0 rgba(27, 73, 101, 0.02)",
            }}
          >
            <CardContent className="!p-6">
              <Box className="flex items-center justify-between mb-4">
                <div>
                  <Typography variant="h6" className="!font-bold text-slate-700 leading-none mb-1">
                    Xu hướng Đấu giá & Doanh thu
                  </Typography>
                  <Typography variant="caption" className="text-slate-400">
                    Phân tích số liệu trực quan hàng tuần của năm {new Date().getFullYear()}
                  </Typography>
                </div>
                
                {/* Visual filter options placeholder */}
                <Box className="flex items-center gap-2">
                  <Box className="px-2.5 py-1 text-[0.72rem] font-bold text-slate-500 bg-slate-100 rounded-lg cursor-pointer">Tuần</Box>
                  <Box className="px-2.5 py-1 text-[0.72rem] font-bold text-[#1B4965] bg-[#1B4965]/10 rounded-lg cursor-pointer">Tháng</Box>
                </Box>
              </Box>
              
              <Box 
                className="flex flex-col items-center justify-center h-[300px] rounded-2xl border border-dashed border-slate-200/80 bg-slate-50/40 relative overflow-hidden group"
              >
                {/* Abstract grid lines representing layout visual design */}
                <Box className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none opacity-20">
                  <div className="border-b border-slate-200 w-full" />
                  <div className="border-b border-slate-200 w-full" />
                  <div className="border-b border-slate-200 w-full" />
                  <div className="border-b border-slate-200 w-full" />
                </Box>
                
                <Box className="z-10 text-center space-y-2">
                  <Typography className="text-3xl animate-float">📊</Typography>
                  <Typography variant="body2" className="!font-bold text-slate-500">
                    Mô hình biểu đồ trực quan
                  </Typography>
                  <Typography variant="caption" className="text-slate-400 max-w-xs block mx-auto">
                    Khu vực tích hợp các biểu đồ tương tác Highcharts / Recharts ở giai đoạn tiếp theo.
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Right side area - Quick activity placeholder */}
        <Grid item xs={12} lg={4}>
          <Card 
            sx={{
              background: "rgba(255, 255, 255, 0.7)",
              backdropFilter: "blur(20px)",
              borderRadius: "16px",
              border: "1px solid rgba(255, 255, 255, 0.5)",
              boxShadow: "0 8px 32px 0 rgba(27, 73, 101, 0.02)",
              height: "100%"
            }}
          >
            <CardContent className="!p-6">
              <div className="mb-4">
                <Typography variant="h6" className="!font-bold text-slate-700 leading-none mb-1">
                  Phiên đấu giá đang diễn ra
                </Typography>
                <Typography variant="caption" className="text-slate-400">
                  Các chuyến hàng đang mở đấu giá công khai
                </Typography>
              </div>

              {/* Fake list of activities representing dynamic logs */}
              <Box className="space-y-3.5">
                {[
                  { route: "Hà Nội → Hải Phòng", price: "2.4 Tr đ", time: "Còn 15p" },
                  { route: "TP.HCM → Bình Dương", price: "1.2 Tr đ", time: "Còn 34p" },
                  { route: "Đà Nẵng → Quảng Nam", price: "3.5 Tr đ", time: "Còn 48p" },
                ].map((item, idx) => (
                  <Box 
                    key={idx} 
                    className="p-3 rounded-xl flex items-center justify-between border border-slate-100 hover:border-slate-200/80 transition-all cursor-pointer"
                    style={{
                      background: "rgba(248, 250, 252, 0.5)",
                    }}
                  >
                    <div>
                      <Typography variant="body2" className="!font-bold text-slate-700">
                        {item.route}
                      </Typography>
                      <Typography variant="caption" className="text-emerald-600 font-semibold">
                        Giá khởi điểm: {item.price}
                      </Typography>
                    </div>
                    <Box className="text-right">
                      <span className="text-[0.7rem] px-2 py-0.5 rounded-full font-bold bg-[#1B4965]/10 text-[#1B4965]">
                        {item.time}
                      </span>
                    </Box>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
}
