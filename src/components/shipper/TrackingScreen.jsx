"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { getAuction } from "@/services/biddingApi";
import CircularProgress from "@mui/material/CircularProgress";
import dynamic from "next/dynamic";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepContent from "@mui/material/StepContent";
import Rating from "@mui/material/Rating";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";

// Icons
import LocalShippingIcon from "@mui/icons-material/LocalShippingOutlined";
import LocationOnIcon from "@mui/icons-material/LocationOnOutlined";
import ReportIcon from "@mui/icons-material/ReportProblemOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import CloseIcon from "@mui/icons-material/Close";
import DescriptionIcon from "@mui/icons-material/DescriptionOutlined";
import StarIcon from "@mui/icons-material/Star";
import MapIcon from "@mui/icons-material/MapOutlined";
import PhoneIcon from "@mui/icons-material/PhoneInTalkOutlined";

import PageHeader from "@/components/common/PageHeader";

// Dynamically import Map component to avoid SSR issues with Leaflet
const Map = dynamic(() => import("@/components/map/Map"), { 
  ssr: false,
  loading: () => (
    <Box className="w-full h-[400px] flex items-center justify-center bg-slate-100 rounded-3xl border border-slate-200">
      <Typography variant="body2" className="text-slate-500 animate-pulse font-medium">Đang tải bản đồ...</Typography>
    </Box>
  )
});

// Coordinates for the route (Bình Dương -> TP. HCM -> Mỹ Tho -> Vĩnh Long -> Cần Thơ)
const ROUTE_POINTS = [
  [10.9634, 106.7029], // Bình Dương (Start)
  [10.7626, 106.6602], // TP. HCM
  [10.3606, 106.3533], // Mỹ Tho
  [10.2458, 105.9583], // Vĩnh Long
  [10.0102, 105.7483], // Cần Thơ (End)
];
const CURRENT_POS = [10.2458, 105.9583]; // Vĩnh Long

// Mock Driver & Vehicle details
const TIMELINE_STAGES = [
  {
    label: "Đã đến điểm lấy hàng",
    time: "2026-07-02 08:30",
    description: "Tài xế đã đỗ xe tại kho KCN VSIP I, bàn giao biên bản kiểm hàng đầu kỳ.",
  },
  {
    label: "Đang bốc hàng",
    time: "2026-07-02 09:15",
    description: "Hàng tiêu dùng đóng pallet đã được bốc xếp lên xe, niêm phong khóa chì hoàn tất.",
  },
  {
    label: "Đang di chuyển (Trong hành trình)",
    time: "Cập nhật 2 phút trước",
    description: "Xe tải di chuyển hướng về Cần Thơ trên Quốc lộ 1A. Dự kiến giao hàng lúc 15:45.",
  },
  {
    label: "Đã đến điểm giao (Hoàn thành giao nhận)",
    time: "Chờ xác nhận",
    description: "Bàn giao biên bản giao nhận có chữ ký số hoặc ký tay của người đại diện nhận hàng.",
  }
];

export default function TrackingScreen() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [trackingInfo, setTrackingInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrackingInfo = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const res = await getAuction(id);
        const data = res.data?.data || res.data;
        if (data) {
          setTrackingInfo({
            id: data.id || data._id || id,
            goodsType: data.goodsType || "Hàng hóa",
            weight: data.weight ? `${data.weight} tấn` : "N/A",
            carrier: data.winningBidId ? "Đơn vị vận chuyển (Đã chốt)" : "Chưa xác định",
            driverName: "Chưa cập nhật",
            driverPhone: "Chưa cập nhật",
            vehiclePlate: "Chưa cập nhật",
            vehicleType: data.vehicleTypeRequired || "N/A",
            from: data.pickupLocation?.address || "N/A",
            to: data.deliveryLocation?.address || "N/A",
            currentGps: "Đang chờ chuyến",
            currentRoad: "Chưa khởi hành",
            speed: "0 km/h"
          });
        }
      } catch (err) {
        console.error("Error fetching tracking:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrackingInfo();
  }, [id]);

  const [activeStep, setActiveStep] = useState(2); // Start at "Đang di chuyển"
  const [isCompleted, setIsCompleted] = useState(false);
  const [openEmergencyDialog, setOpenEmergencyDialog] = useState(false);
  const [emergencyReason, setEmergencyReason] = useState("");
  const [emergencyDescription, setEmergencyDescription] = useState("");
  const [openDisburseDialog, setOpenDisburseDialog] = useState(false);
  
  // Rating and review states
  const [driverRating, setDriverRating] = useState(5);
  const [reviewNote, setReviewNote] = useState("");
  const [isReviewed, setIsReviewed] = useState(false);

  const handleOpenDisburseDialog = () => {
    setOpenDisburseDialog(true);
  };

  const handleCloseDisburseDialog = () => {
    setOpenDisburseDialog(false);
  };

  const handleConfirmDisbursement = () => {
    setOpenDisburseDialog(false);
    setActiveStep(3); // Update Stepper to Completed
    setIsCompleted(true);
  };

  const handleOpenEmergencyDialog = () => {
    setEmergencyReason("");
    setEmergencyDescription("");
    setOpenEmergencyDialog(true);
  };

  const handleCloseEmergencyDialog = () => {
    setOpenEmergencyDialog(false);
  };

  const handleSubmitEmergency = () => {
    alert(`Báo cáo sự cố khẩn cấp thành công!\nLoại sự cố: ${emergencyReason}\nHệ thống đã gửi cảnh báo khẩn cấp tới nhà xe và lực lượng hỗ trợ.`);
    setOpenEmergencyDialog(false);
  };

  const handleReviewSubmit = () => {
    setIsReviewed(true);
  };

  
  if (loading) return <Box className="w-full h-screen flex justify-center items-center"><CircularProgress /></Box>;
  if (!trackingInfo) return <Box className="w-full p-8 text-center text-slate-500">Không tìm thấy thông tin chuyến đi</Box>;
return (
    <Box className="w-full min-h-screen">
      {/* Page Header */}
      <PageHeader
        title="Giám Sát Hành Trình & Nghiệm Thu"
        subtitle="Theo dõi thời gian thực vị trí GPS, tiến trình bàn giao và giải ngân thanh toán."
        breadcrumbs={[
          { label: "Trang chủ", path: "/shipper/dashboard" },
          { label: "Hợp đồng vận chuyển", path: "/shipper/contracts" },
          { label: "Giám sát đơn hàng" },
        ]}
      />

      <Grid container spacing={3} className="!mb-6">
        {/* Left Side: Map visualization & Action center */}
        <Grid item xs={12} lg={8} className="space-y-6">
          {/* Simulated Map View */}
          <Card
            className="!rounded-3xl border border-slate-100 overflow-hidden relative"
            sx={{
              background: "rgba(255, 255, 255, 0.8)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 8px 32px 0 rgba(27, 73, 101, 0.02)",
            }}
          >
              {/* Map Header Overlay */}
              <Box className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-100/50 shadow-sm flex items-center gap-2">
                <MapIcon className="text-[#1B4965]" />
                <div>
                  <Typography className="!text-[0.68rem] text-slate-400 font-bold uppercase tracking-wider leading-none">Bản đồ tuyến đường</Typography>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Typography variant="body2" className="!font-bold text-[#1B4965] leading-none">Bình Dương → Cần Thơ</Typography>
                  </div>
                </div>
              </Box>

              {/* Leaflet Map Integration */}
              <Box className="h-[400px] w-full relative z-0">
                <Map routePoints={ROUTE_POINTS} />
              </Box>

              {/* Floating route info panel overlay */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-slate-100/50 shadow-lg flex items-center justify-between text-xs transition-all z-10">
                <div className="space-y-1">
                  <Typography className="!text-[0.65rem] text-slate-400 font-bold uppercase tracking-wider">Hành trình chi tiết</Typography>
                  <Typography variant="body2" className="!font-bold text-slate-700 leading-tight">
                    Từ: {(trackingInfo || {}).from} → Đến: {(trackingInfo || {}).to}
                  </Typography>
                </div>
              </div>
          </Card>

          {/* Acceptance, Proof of Delivery and Disbursement */}
          <Card
            className="!rounded-3xl border border-slate-100"
            sx={{
              background: "rgba(255, 255, 255, 0.8)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 8px 32px 0 rgba(27, 73, 101, 0.02)",
            }}
          >
            <CardContent className="!p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Typography variant="h6" className="!font-bold text-slate-700">
                  Nghiệm thu hàng hóa & Hồ sơ giao nhận (POD)
                </Typography>
                {isCompleted && (
                  <Chip
                    label="Đã hoàn thành giải ngân"
                    size="small"
                    className="!font-bold !text-[0.72rem] bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full"
                  />
                )}
              </div>

              <Grid container spacing={3} className="items-center">
                {/* Proof Document Thumbnail */}
                <Grid item xs={12} sm={4}>
                  <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 flex flex-col items-center justify-center text-center space-y-2 relative overflow-hidden group">
                    <div className="w-12 h-12 bg-white rounded-xl border border-slate-100 flex items-center justify-center text-[#1B4965]">
                      <DescriptionIcon />
                    </div>
                    <div>
                      <Typography className="!font-bold text-slate-700 text-xs">
                        Bien_Ban_Giao_Nhan.pdf
                      </Typography>
                      <Typography className="text-slate-400 text-[0.68rem] font-medium">
                        Đã ký số bởi kho nhận hàng
                      </Typography>
                    </div>
                    <span className="text-[0.65rem] text-[#1B4965] font-bold underline cursor-pointer">Xem chi tiết file</span>
                  </div>
                </Grid>

                {/* Description & Action buttons */}
                <Grid item xs={12} sm={8} className="space-y-4">
                  <Typography variant="body2" className="text-slate-500 leading-relaxed">
                    Sau khi kiểm tra biên bản giao nhận (chữ ký số và tình trạng nguyên đai nguyên kiện của hàng tiêu dùng), vui lòng tiến hành xác nhận hoàn thành đơn hàng để giải ngân tiền thầu cho nhà xe.
                  </Typography>

                  <div className="flex flex-wrap gap-3">
                    {!isCompleted ? (
                      <Button
                        variant="contained"
                        onClick={handleOpenDisburseDialog}
                        className="!rounded-xl !py-3 !px-6 !font-bold !capitalize shadow-md hover:shadow-lg transition-all"
                        sx={{
                          background: "linear-gradient(135deg, #6366F1 0%, #4F46E5 50%, #3730A3 100%)",
                          boxShadow: "0 4px 18px rgba(99, 102, 241, 0.3)",
                          "&:hover": {
                            background: "linear-gradient(135deg, #4F46E5 0%, #3730A3 100%)",
                            boxShadow: "0 6px 24px rgba(99, 102, 241, 0.4)",
                          },
                        }}
                      >
                        Xác nhận hoàn thành & Giải ngân
                      </Button>
                    ) : (
                      <Button
                        variant="outlined"
                        disabled
                        className="!rounded-xl !py-3 !px-6 !font-bold !capitalize !border-emerald-200 !text-emerald-600 bg-emerald-50/30"
                      >
                        Đã nghiệm thu đơn hàng
                      </Button>
                    )}

                    <Button
                      variant="outlined"
                      color="error"
                      onClick={handleOpenEmergencyDialog}
                      startIcon={<ReportIcon />}
                      className="!rounded-xl !py-3 !px-5 hover:!bg-rose-50 !font-bold !capitalize"
                    >
                      Báo cáo sự cố khẩn cấp
                    </Button>
                  </div>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Side: Step Timeline & Driver Details */}
        <Grid item xs={12} lg={4} className="space-y-6">
          {/* Active Stepper Timeline */}
          <Card
            className="!rounded-3xl border border-slate-100"
            sx={{
              background: "rgba(255, 255, 255, 0.8)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 8px 32px 0 rgba(27, 73, 101, 0.02)",
            }}
          >
            <CardContent className="!p-6">
              <Typography variant="h6" className="!font-bold text-slate-700 border-b pb-3 mb-4">
                Tiến trình di chuyển
              </Typography>

              <Stepper activeStep={activeStep} orientation="vertical">
                {TIMELINE_STAGES.map((step, index) => (
                  <Step key={step.label}>
                    <StepLabel
                      StepIconProps={{
                        sx: {
                          "&.Mui-active": { color: "#06B6D4" }, // Live cyan active step
                          "&.Mui-completed": { color: "#10B981" }, // Success emerald completed step
                        }
                      }}
                    >
                      <div className="flex flex-col">
                        <span className={`text-sm font-bold ${
                          index === activeStep 
                            ? "text-cyan-600" 
                            : index < activeStep 
                              ? "text-emerald-600" 
                              : "text-slate-600"
                        }`}>
                          {step.label}
                        </span>
                        <span className="text-[0.68rem] text-slate-400 font-semibold">{step.time}</span>
                      </div>
                    </StepLabel>
                    <StepContent>
                      <Typography variant="caption" className="text-slate-500 block leading-relaxed mt-1">
                        {step.description}
                      </Typography>
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
            </CardContent>
          </Card>

          {/* Carrier & Driver Info */}
          <Card
            className="!rounded-3xl border border-slate-100"
            sx={{
              background: "rgba(255, 255, 255, 0.8)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 8px 32px 0 rgba(27, 73, 101, 0.02)",
            }}
          >
            <CardContent className="!p-6 space-y-4">
              <Typography variant="h6" className="!font-bold text-slate-700 border-b pb-3">
                Thông tin xe & tài xế điều phối
              </Typography>

              <div className="space-y-3.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Đơn vị chủ quản:</span>
                  <strong className="text-slate-700">{(trackingInfo || {}).carrier}</strong>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Tài xế điều khiển:</span>
                  <strong className="text-slate-700">{(trackingInfo || {}).driverName}</strong>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Số điện thoại liên hệ:</span>
                  <div className="flex items-center gap-1">
                    <PhoneIcon className="text-slate-400 !text-[0.9rem]" />
                    <strong className="text-[#1B4965] font-mono">{(trackingInfo || {}).driverPhone}</strong>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Biển kiểm soát:</span>
                  <span className="bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-slate-700 font-mono font-bold">
                    {(trackingInfo || {}).vehiclePlate}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium">Dòng xe:</span>
                  <strong className="text-slate-600">{(trackingInfo || {}).vehicleType}</strong>
                </div>
              </div>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Driver Rating & Review Section (Display once completed) */}
      {isCompleted && (
        <Card
          className="!rounded-3xl border border-emerald-100 animate-fade-in mb-6"
          sx={{
            background: "linear-gradient(135deg, rgba(236,253,245,0.7) 0%, rgba(209,250,229,0.3) 100%)",
            boxShadow: "0 8px 32px 0 rgba(16, 185, 129, 0.05)",
          }}
        >
          <CardContent className="!p-6 space-y-4">
            <Typography variant="h6" className="!font-bold text-[#157347] flex items-center gap-1.5">
              ⭐ Đánh giá nhà xe & tài xế dịch vụ
            </Typography>

            {isReviewed ? (
              <Box className="bg-white/80 p-5 rounded-2xl border border-emerald-100/50 flex flex-col items-center justify-center text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 border border-emerald-100 flex items-center justify-center text-xl">
                  ✓
                </div>
                <Typography variant="body2" className="!font-bold text-slate-700">
                  Cảm ơn bạn đã phản hồi!
                </Typography>
                <Typography variant="caption" className="text-slate-400 max-w-sm">
                  Đánh giá của bạn đã được ghi nhận vào hệ thống nhằm xếp hạng năng lực tài xế trong các phiên đấu thầu sau.
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={3} className="items-center">
                <Grid item xs={12} sm={3} className="flex flex-col items-center justify-center text-center">
                  <Typography variant="body2" className="text-slate-500 font-bold mb-2">
                    Mức độ hài lòng của bạn?
                  </Typography>
                  <Rating
                    value={driverRating}
                    onChange={(event, newValue) => setDriverRating(newValue)}
                    precision={1}
                    size="large"
                    emptyIcon={<StarIcon className="text-slate-200" fontSize="inherit" />}
                  />
                  <Typography className="text-xs font-black text-amber-500 mt-2">
                    {driverRating === 5 ? "Rất xuất sắc" : driverRating === 4 ? "Tốt" : "Trung bình"}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={9} className="space-y-4">
                  <TextField
                    label="Ý kiến đánh giá chất lượng dịch vụ (Thời gian bốc hàng, thái độ tài xế...)"
                    multiline
                    rows={3}
                    placeholder="Vui lòng để lại nhận xét để nâng cao uy tín cho hệ thống điều phối..."
                    fullWidth
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                    InputProps={{ className: "!rounded-2xl" }}
                    sx={{ backgroundColor: "#fff" }}
                  />

                  <Button
                    variant="contained"
                    onClick={handleReviewSubmit}
                    className="!font-bold !py-2.5 !px-8 !rounded-xl !capitalize"
                    sx={{
                      background: "linear-gradient(135deg, #198754 0%, #157347 100%)",
                      "&:hover": {
                        background: "linear-gradient(135deg, #157347 0%, #198754 100%)",
                      },
                    }}
                  >
                    Gửi nhận xét
                  </Button>
                </Grid>
              </Grid>
            )}
          </CardContent>
        </Card>
      )}

      {/* Confirmation release disbursement dialog */}
      <Dialog
        open={openDisburseDialog}
        onClose={handleCloseDisburseDialog}
        maxWidth="xs"
        fullWidth
        className="backdrop-blur-sm"
        PaperProps={{
          className: "!rounded-3xl !p-2",
        }}
      >
        <DialogTitle className="flex justify-between items-center !font-bold text-slate-800">
          Xác nhận Nghiệm thu & Giải ngân
          <IconButton size="small" onClick={handleCloseDisburseDialog} className="text-slate-400">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" className="text-slate-500">
            Hệ thống sẽ giải ngân trực tiếp số tiền vận chuyển từ tài khoản ký quỹ của bạn cho **Hợp tác xã Vận tải Hữu Nghị**. Bạn đã chắc chắn biên bản giao nhận (POD) hoàn toàn chính xác?
          </Typography>
        </DialogContent>
        <DialogActions className="!px-6 !pb-4 flex justify-end gap-3">
          <Button
            onClick={handleCloseDisburseDialog}
            variant="text"
            className="!text-slate-500 !font-bold !capitalize !rounded-xl"
          >
            Đóng
          </Button>
          <Button
            onClick={handleConfirmDisbursement}
            variant="contained"
            className="!font-bold !capitalize !rounded-xl !px-5"
            sx={{
              background: "linear-gradient(135deg, #1B4965 0%, #0D2B3E 100%)",
            }}
          >
            Giải ngân ngay
          </Button>
        </DialogActions>
      </Dialog>

      {/* Report Incident Dialog */}
      <Dialog
        open={openEmergencyDialog}
        onClose={handleCloseEmergencyDialog}
        maxWidth="xs"
        fullWidth
        className="backdrop-blur-sm"
        PaperProps={{
          className: "!rounded-3xl !p-2",
        }}
      >
        <DialogTitle className="flex justify-between items-center !font-bold text-rose-600">
          Báo cáo sự cố khẩn cấp
          <IconButton size="small" onClick={handleCloseEmergencyDialog} className="text-slate-400">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className="space-y-4 !pt-2">
          <Typography variant="body2" className="text-slate-500">
            Nếu xe tải gặp sự cố về tai nạn, hỏng hóc nặng hoặc thất thoát hàng hóa dọc đường, vui lòng khai báo để CSKH can thiệp ngay lập tức.
          </Typography>

          <TextField
            select
            label="Loại sự cố gặp phải"
            fullWidth
            value={emergencyReason}
            onChange={(e) => setEmergencyReason(e.target.value)}
            InputProps={{ className: "!rounded-2xl" }}
          >
            <MenuItem value="Phương tiện gặp tai nạn giao thông">Phương tiện gặp tai nạn giao thông</MenuItem>
            <MenuItem value="Xe hỏng dọc đường (Hỏng động cơ, lốp)">Xe hỏng dọc đường (Hỏng động cơ, lốp)</MenuItem>
            <MenuItem value="Hàng hóa bị hư hại/Thất thoát">Hàng hóa bị hư hại/Thất thoát</MenuItem>
            <MenuItem value="Tài xế mất liên lạc">Tài xế mất liên lạc</MenuItem>
            <MenuItem value="Khác">Lý do khác</MenuItem>
          </TextField>

          <TextField
            label="Mô tả cụ thể sự việc"
            multiline
            rows={3}
            placeholder="Nhập thời gian, địa điểm, tình trạng hiện tại..."
            fullWidth
            value={emergencyDescription}
            onChange={(e) => setEmergencyDescription(e.target.value)}
            InputProps={{ className: "!rounded-2xl" }}
          />
        </DialogContent>
        <DialogActions className="!px-6 !pb-4 flex justify-end gap-3">
          <Button
            onClick={handleCloseEmergencyDialog}
            variant="text"
            className="!text-slate-500 !font-bold !capitalize !rounded-xl"
          >
            Đóng
          </Button>
          <Button
            onClick={handleSubmitEmergency}
            disabled={!emergencyReason}
            variant="contained"
            color="error"
            className="!bg-rose-500 hover:!bg-rose-600 !font-bold !capitalize !rounded-xl !px-5"
          >
            Gửi báo cáo
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
