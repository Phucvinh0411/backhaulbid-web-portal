"use client";

import { Box, Typography, Button, Grid, Card, CardContent, Divider, Avatar, Rating, IconButton, Tooltip } from "@mui/material";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ShareIcon from "@mui/icons-material/Share";
import PrintIcon from "@mui/icons-material/Print";
import CheckIcon from "@mui/icons-material/Check";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CircleOutlinedIcon from "@mui/icons-material/CircleOutlined";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import PhoneIcon from "@mui/icons-material/Phone";
import StarIcon from "@mui/icons-material/Star";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";

// Dynamically import Map component to avoid SSR issues with Leaflet
const Map = dynamic(() => import("@/components/map/Map"), { 
  ssr: false,
  loading: () => (
    <Box className="w-full h-full flex items-center justify-center bg-slate-100">
      <Typography variant="body2" className="text-slate-500 animate-pulse">Đang tải bản đồ...</Typography>
    </Box>
  )
});

export default function TransportTrackingPage() {
  const params = useParams();
  const transportId = params.id;

  const mockRoutePoints = [
    [21.0285, 105.8542], // Hà Nội
    [20.9400, 105.9800], // Hưng Yên
    [20.8500, 106.3300], // Hải Dương
    [20.8600, 106.6800], // Hải Phòng (destination)
  ];
  const currentPos = [20.9000, 106.1500]; // Somewhere in between

  return (
    <Box className="flex flex-col gap-6 animate-fade-in-up pb-12 w-full mt-6">
      {/* Page Header */}
      <Box className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <Box>
          <Box className="flex items-center gap-1 text-slate-500 mb-2">
            <Typography component={Link} href="/carrier/transports" variant="body2" className="hover:text-[#1B4965] transition-colors">
              Quản lý vận chuyển
            </Typography>
            <ChevronRightIcon fontSize="small" />
            <Typography variant="body2" className="text-slate-800 font-medium">Tracking #{transportId}</Typography>
          </Box>
          <Typography variant="h5" className="font-bold text-[#1B4965]">Đang Vận Chuyển: {transportId}</Typography>
        </Box>
        <Box className="flex items-center gap-3">
          <Box className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full flex items-center gap-2 border border-emerald-200 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <Typography variant="body2" className="font-semibold">Đang Di Chuyển</Typography>
          </Box>
          <Button variant="outlined" color="inherit" startIcon={<PrintIcon />} className="rounded-lg shadow-sm bg-white hover:bg-slate-50 transition-colors">
            Xuất PDF
          </Button>
          <Button variant="outlined" color="inherit" startIcon={<ShareIcon />} className="rounded-lg shadow-sm bg-white hover:bg-slate-50 transition-colors">
            Chia sẻ
          </Button>
        </Box>
      </Box>

      {/* Hero Section: Map & Timeline */}
      <Box className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col relative h-[500px]">
        {/* Overlay Timeline */}
        <Box className="absolute top-0 left-0 right-0 z-10 bg-white/90 backdrop-blur-md border-b border-slate-200 p-4">
          <Box className="max-w-4xl mx-auto">
            <Box className="relative flex justify-between items-center w-full">
              {/* Line */}
              <Box className="absolute left-0 top-4 -translate-y-1/2 w-full h-1 bg-slate-200 rounded-full -z-10"></Box>
              <Box className="absolute left-0 top-4 -translate-y-1/2 w-[65%] h-1 bg-[#1B4965] rounded-full -z-10"></Box>
              
              {/* Steps */}
              <Box className="flex flex-col items-center gap-1.5">
                <Box className="w-8 h-8 rounded-full bg-[#1B4965] text-white flex items-center justify-center shadow-md">
                  <CheckIcon fontSize="small" />
                </Box>
                <Typography variant="caption" className="font-semibold text-[#1B4965]">Đã Đặt</Typography>
              </Box>
              
              <Box className="flex flex-col items-center gap-1.5">
                <Box className="w-8 h-8 rounded-full bg-[#1B4965] text-white flex items-center justify-center shadow-md">
                  <CheckIcon fontSize="small" />
                </Box>
                <Typography variant="caption" className="font-semibold text-[#1B4965]">Đã Lấy Hàng</Typography>
              </Box>
              
              <Box className="flex flex-col items-center gap-1.5">
                <Box className="w-8 h-8 rounded-full border-2 border-[#1B4965] bg-white text-[#1B4965] flex items-center justify-center shadow-md ring-4 ring-[#1B4965]/20">
                  <LocalShippingIcon fontSize="small" />
                </Box>
                <Typography variant="caption" className="font-bold text-[#1B4965]">Đang Vận Chuyển</Typography>
              </Box>
              
              <Box className="flex flex-col items-center gap-1.5">
                <Box className="w-8 h-8 rounded-full bg-slate-100 border-2 border-slate-300 text-slate-400 flex items-center justify-center">
                  <Inventory2Icon fontSize="small" />
                </Box>
                <Typography variant="caption" className="font-medium text-slate-500">Đã Giao</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
        
        {/* Map Area */}
        <Box className="flex-1 w-full h-full relative z-0">
          <Map routePoints={mockRoutePoints} currentPos={currentPos} />
        </Box>
      </Box>

      {/* Content Area (Bento Grid Layout) */}
      <Grid container spacing={3}>
        {/* Left Column (Main details) */}
        <Grid item xs={12} md={8}>
          <Box className="flex flex-col gap-6">
            {/* Cargo Info */}
            <Card variant="outlined" className="rounded-xl border-slate-200 shadow-sm">
              <CardContent className="p-6">
                <Box className="flex items-center gap-3 mb-6">
                  <Box className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-[#1B4965]">
                    <Inventory2Icon />
                  </Box>
                  <Typography variant="h6" className="font-bold text-slate-800">Thông Tin Hàng Hóa</Typography>
                </Box>
                <Grid container spacing={4}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" className="text-slate-500 font-semibold mb-1 block uppercase tracking-wider">Mô tả</Typography>
                    <Typography variant="body1" className="font-medium text-slate-800">Hàng Điện Tử (Linh kiện máy tính)</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" className="text-slate-500 font-semibold mb-1 block uppercase tracking-wider">Trọng lượng</Typography>
                    <Typography variant="body1" className="font-medium text-slate-800">4.5 Tấn</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" className="text-slate-500 font-semibold mb-1 block uppercase tracking-wider">Kích thước</Typography>
                    <Typography variant="body1" className="font-medium text-slate-800">10m x 2.4m x 2.6m</Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="caption" className="text-slate-500 font-semibold mb-1 block uppercase tracking-wider">Yêu cầu đặc biệt</Typography>
                    <Box className="flex gap-2 mt-1">
                      <span className="px-2 py-1 bg-orange-50 text-orange-600 rounded text-xs font-medium border border-orange-200">Dễ vỡ</span>
                      <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-xs font-medium border border-blue-200">Giữ khô ráo</span>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Vehicle Info */}
            <Card variant="outlined" className="rounded-xl border-slate-200 shadow-sm">
              <CardContent className="p-6">
                <Box className="flex items-center gap-3 mb-6">
                  <Box className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-[#1B4965]">
                    <DirectionsCarIcon />
                  </Box>
                  <Typography variant="h6" className="font-bold text-slate-800">Thông Tin Phương Tiện</Typography>
                </Box>
                <Grid container spacing={3}>
                  <Grid item xs={6} sm={3}>
                    <Box className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                      <Typography variant="caption" className="text-slate-500 font-semibold mb-1 block">BIỂN SỐ</Typography>
                      <Typography variant="body1" className="font-bold text-slate-800">29H-123.45</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                      <Typography variant="caption" className="text-slate-500 font-semibold mb-1 block">LOẠI XE</Typography>
                      <Typography variant="body2" className="font-medium text-slate-800 mt-1">Container 5 Tấn</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box className="bg-slate-50 rounded-lg p-3 border border-slate-100 flex items-center justify-between h-full">
                      <Box>
                        <Typography variant="caption" className="text-slate-500 font-semibold mb-1 block">TỐC ĐỘ HIỆN TẠI</Typography>
                        <Box className="flex items-baseline gap-1">
                          <Typography variant="h5" className="font-bold text-emerald-600">65</Typography>
                          <Typography variant="body2" className="text-slate-500">km/h</Typography>
                        </Box>
                      </Box>
                      <Typography variant="caption" className="text-slate-400">
                        Cập nhật: 2 phút trước
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Box>
        </Grid>

        {/* Right Column (Side details) */}
        <Grid item xs={12} md={4}>
          <Box className="flex flex-col gap-6 h-full">
            <Card variant="outlined" className="rounded-xl border-slate-200 shadow-sm h-full flex flex-col">
              <CardContent className="p-6 flex-1 flex flex-col">
                <Typography variant="h6" className="font-bold text-slate-800 mb-6">Người Phụ Trách</Typography>
                
                {/* Driver Info */}
                <Box className="flex items-center gap-4 mb-4">
                  <Avatar sx={{ width: 64, height: 64, bgcolor: "#1B4965", fontSize: "1.2rem", fontWeight: "bold" }}>
                    T
                  </Avatar>
                  <Box>
                    <Typography variant="body1" className="font-bold text-slate-800">Trần Tài Xế</Typography>
                    <Typography variant="body2" className="text-slate-500">Kinh nghiệm: 5 năm</Typography>
                  </Box>
                </Box>
                
                {/* Driver Rating - As requested by user */}
                <Box className="flex items-center gap-2 mb-6 bg-amber-50 p-3 rounded-lg border border-amber-100">
                  <Box className="flex items-center">
                    <Typography variant="h6" className="font-bold text-amber-600 mr-1">4.8</Typography>
                    <Rating value={4.8} precision={0.1} readOnly size="small" sx={{ color: "#f59e0b" }} />
                  </Box>
                  <Typography variant="caption" className="text-amber-700">(124 đánh giá)</Typography>
                </Box>
                
                <Divider className="my-4" />
                
                {/* Contact Actions */}
                <Typography variant="caption" className="text-slate-500 font-semibold mb-2 block uppercase tracking-wider">Liên hệ</Typography>
                <Button 
                  variant="contained" 
                  fullWidth 
                  startIcon={<PhoneIcon />}
                  sx={{ bgcolor: "#1B4965", "&:hover": { bgcolor: "#0d2b3e" }, borderRadius: "8px", py: 1.2, mb: 2 }}
                >
                  Gọi ngay: 0912 345 678
                </Button>
                
                <Box className="mt-auto">
                  <Box className="bg-slate-50 rounded-lg p-4 border border-slate-100">
                    <Typography variant="caption" className="text-slate-500 font-semibold mb-2 block uppercase tracking-wider">Ước tính (ETA)</Typography>
                    <Typography variant="h6" className="font-bold text-slate-800">14:30, Hôm nay</Typography>
                    <Typography variant="body2" className="text-emerald-600 mt-1 font-medium flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Đang đúng tiến độ
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Grid>
      </Grid>

      {/* Tracking Log Section */}
      <Box className="mt-2">
        <Typography variant="h6" className="font-bold text-slate-800 mb-4">Lịch Sử Cập Nhật</Typography>
        <Card variant="outlined" className="rounded-xl border-slate-200 shadow-sm overflow-hidden">
          <Box className="flex flex-col">
            {/* Log Item 1 */}
            <Box className="flex gap-4 p-4 hover:bg-slate-50 transition-colors relative">
              <Box className="flex flex-col items-center mt-1">
                <CheckCircleIcon className="text-emerald-500 z-10 bg-white" fontSize="small" />
                <Box className="w-0.5 h-full bg-slate-200 absolute top-7 bottom-0"></Box>
              </Box>
              <Box>
                <Typography variant="body1" className="font-semibold text-slate-800">Xe đã qua trạm thu phí cao tốc 5B (Hưng Yên)</Typography>
                <Typography variant="body2" className="text-slate-500">14:15 - Hôm nay</Typography>
              </Box>
            </Box>
            
            {/* Log Item 2 */}
            <Box className="flex gap-4 p-4 hover:bg-slate-50 transition-colors relative border-t border-slate-100">
              <Box className="flex flex-col items-center mt-1">
                <CheckCircleIcon className="text-emerald-500 z-10 bg-white" fontSize="small" />
                <Box className="w-0.5 h-full bg-slate-200 absolute top-7 bottom-0"></Box>
              </Box>
              <Box>
                <Typography variant="body1" className="font-semibold text-slate-800">Tài xế đã nhận hàng hóa tại kho</Typography>
                <Typography variant="body2" className="text-slate-500">08:30 - Hôm nay</Typography>
              </Box>
            </Box>

            {/* Log Item 3 */}
            <Box className="flex gap-4 p-4 hover:bg-slate-50 transition-colors relative border-t border-slate-100">
              <Box className="flex flex-col items-center mt-1">
                <CheckCircleIcon className="text-emerald-500 z-10 bg-white" fontSize="small" />
              </Box>
              <Box>
                <Typography variant="body1" className="font-semibold text-slate-800">Đơn hàng được xác nhận</Typography>
                <Typography variant="body2" className="text-slate-500">15:45 - Hôm qua</Typography>
              </Box>
            </Box>
          </Box>
        </Card>
      </Box>
    </Box>
  );
}
