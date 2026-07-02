"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Grid from "@mui/material/Grid";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";

// Icons
import CloudUploadIcon from "@mui/icons-material/CloudUploadOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutlineOutlined";
import ImportContactsIcon from "@mui/icons-material/ImportContactsOutlined";
import CalendarIcon from "@mui/icons-material/CalendarMonthOutlined";
import MoneyIcon from "@mui/icons-material/AttachMoneyOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBackOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import LocationOnIcon from "@mui/icons-material/LocationOnOutlined";
import DescriptionIcon from "@mui/icons-material/DescriptionOutlined";
import ScaleIcon from "@mui/icons-material/ScaleOutlined";
import CloseIcon from "@mui/icons-material/Close";

import PageHeader from "@/components/common/PageHeader";

// Mock Address Book for quick populating
const MOCK_ADDRESS_BOOK = [
  {
    id: "addr-1",
    label: "Kho Samsung Yên Bình - Thái Nguyên",
    contactName: "Trần Thế Hải",
    contactPhone: "0912.345.678",
    province: "Thái Nguyên",
    detail: "Cổng số 3, KCN Yên Bình, Phổ Yên",
  },
  {
    id: "addr-2",
    label: "Kho ICD Mỹ Đình - Hà Nội",
    contactName: "Nguyễn Thị Hương",
    contactPhone: "0988.776.655",
    province: "Hà Nội",
    detail: "Vực 17 Phạm Hùng, Mỹ Đình, Nam Từ Liêm",
  },
  {
    id: "addr-3",
    label: "Cảng Đình Vũ - Hải Phòng",
    contactName: "Phạm Hồng Minh",
    contactPhone: "0904.445.555",
    province: "Hải Phòng",
    detail: "Cầu cảng số 2, Cảng Đình Vũ, Đông Hải 2, Hải An",
  },
  {
    id: "addr-4",
    label: "Kho KCN VSIP 1 - Bình Dương",
    contactName: "Lê Quốc Tuấn",
    contactPhone: "0911.223.344",
    province: "Bình Dương",
    detail: "Đường số 8, KCN VSIP I, Thuận An",
  },
  {
    id: "addr-5",
    label: "Cảng Cái Mép - Bà Rịa Vũng Tàu",
    contactName: "Đặng Văn Nam",
    contactPhone: "0909.112.233",
    province: "Bà Rịa - Vũng Tàu",
    detail: "Cầu cảng TCIT, Tân Phước, Thị xã Phú Mỹ",
  }
];

const STEPS = ["Thông tin hàng hóa", "Địa chỉ & Tuyến đường", "Thiết lập Đấu giá"];

export default function CreateShipmentScreen() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // --- STEP 1 STATE: Goods Info ---
  const [goodsType, setGoodsType] = useState("");
  const [weight, setWeight] = useState("");
  const [weightUnit, setWeightUnit] = useState("tấn");
  const [volume, setVolume] = useState("");
  const [dimensions, setDimensions] = useState({ length: "", width: "", height: "" });
  const [uploadedImages, setUploadedImages] = useState([]);
  const [step1Errors, setStep1Errors] = useState({});

  // --- STEP 2 STATE: Locations ---
  const [pickup, setPickup] = useState({
    contactName: "",
    contactPhone: "",
    province: "",
    detail: "",
  });
  const [delivery, setDelivery] = useState({
    contactName: "",
    contactPhone: "",
    province: "",
    detail: "",
  });
  const [addressBookTarget, setAddressBookTarget] = useState(null); // 'pickup' or 'delivery'
  const [openAddressBook, setOpenAddressBook] = useState(false);
  const [step2Errors, setStep2Errors] = useState({});

  // --- STEP 3 STATE: Auction ---
  const [maxPrice, setMaxPrice] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [notes, setNotes] = useState("");
  const [step3Errors, setStep3Errors] = useState({});

  // --- Step 1 image handler (simulation) ---
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
    }));
    setUploadedImages((prev) => [...prev, ...newImages]);
  };

  const handleRemoveImage = (index) => {
    setUploadedImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  // --- Step 2 Address Book handler ---
  const handleOpenAddressBook = (target) => {
    setAddressBookTarget(target);
    setOpenAddressBook(true);
  };

  const handleSelectAddress = (address) => {
    const updatedValue = {
      contactName: address.contactName,
      contactPhone: address.contactPhone,
      province: address.province,
      detail: address.detail,
    };

    if (addressBookTarget === "pickup") {
      setPickup(updatedValue);
    } else {
      setDelivery(updatedValue);
    }

    setOpenAddressBook(false);
  };

  // --- Validations ---
  const validateStep1 = () => {
    const errors = {};
    if (!goodsType.trim()) errors.goodsType = "Vui lòng nhập loại hàng hóa";
    if (!weight || Number(weight) <= 0) errors.weight = "Trọng lượng phải lớn hơn 0";
    if (!volume || Number(volume) <= 0) errors.volume = "Thể tích phải lớn hơn 0";
    setStep1Errors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep2 = () => {
    const errors = {};
    if (!pickup.contactName.trim()) errors.pickupName = "Nhập tên người liên hệ lấy hàng";
    if (!pickup.contactPhone.trim()) errors.pickupPhone = "Nhập số điện thoại lấy hàng";
    if (!pickup.province.trim()) errors.pickupProvince = "Nhập tỉnh/thành phố lấy hàng";
    if (!pickup.detail.trim()) errors.pickupDetail = "Nhập địa chỉ chi tiết lấy hàng";

    if (!delivery.contactName.trim()) errors.deliveryName = "Nhập tên người liên hệ giao hàng";
    if (!delivery.contactPhone.trim()) errors.deliveryPhone = "Nhập số điện thoại giao hàng";
    if (!delivery.province.trim()) errors.deliveryProvince = "Nhập tỉnh/thành phố giao hàng";
    if (!delivery.detail.trim()) errors.deliveryDetail = "Nhập địa chỉ chi tiết giao hàng";

    setStep2Errors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateStep3 = () => {
    const errors = {};
    if (!maxPrice || Number(maxPrice) <= 0) errors.maxPrice = "Vui lòng nhập giá trần tối đa hợp lệ";
    if (!startTime) errors.startTime = "Chọn thời gian bắt đầu đấu giá";
    if (!endTime) errors.endTime = "Chọn thời gian đóng thầu";
    
    if (startTime && endTime && new Date(startTime) >= new Date(endTime)) {
      errors.endTime = "Thời gian kết thúc phải sau thời gian bắt đầu";
    }

    setStep3Errors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (validateStep1()) setActiveStep(1);
    } else if (activeStep === 1) {
      if (validateStep2()) setActiveStep(2);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    if (validateStep3()) {
      setIsSubmitted(true);
    }
  };

  // Auto calculate volume placeholder based on dimensions (length * width * height)
  const handleDimensionChange = (field, value) => {
    const updated = { ...dimensions, [field]: value };
    setDimensions(updated);
    if (updated.length && updated.width && updated.height) {
      const vol = (Number(updated.length) * Number(updated.width) * Number(updated.height)).toFixed(1);
      setVolume(vol);
    }
  };

  return (
    <Box className="w-full min-h-screen">
      {/* Header section */}
      <PageHeader
        title="Tạo Lô Hàng Mới"
        subtitle="Thiết lập các thông số hàng hóa, điểm hành trình và điều kiện giá thầu để đăng phiên."
        breadcrumbs={[
          { label: "Trang chủ", path: "/shipper/dashboard" },
          { label: "Đấu giá vận tải", path: "/shipper/bidding/sessions" },
          { label: "Tạo lô hàng mới" },
        ]}
      />

      {/* Stepper Card */}
      <Card className="!rounded-3xl border border-slate-100 !shadow-[0_8px_32px_0_rgba(27,73,101,0.03)] bg-white/80 backdrop-blur-xl mb-6">
        <CardContent className="!p-6 sm:!p-8">
          <Stepper activeStep={activeStep} alternativeLabel className="mb-10">
            {STEPS.map((label) => (
              <Step key={label} sx={{
                "& .MuiStepLabel-label.Mui-active": { color: "#2563EB", fontWeight: 700 },
                "& .MuiStepLabel-label.Mui-completed": { color: "#10B981", fontWeight: 600 },
                "& .MuiStepIcon-root.Mui-active": { color: "#2563EB" },
                "& .MuiStepIcon-root.Mui-completed": { color: "#10B981" },
              }}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {isSubmitted ? (
            /* --- SUCCESS STATE VIEW --- */
            <Box className="flex flex-col items-center justify-center text-center py-10 space-y-6 max-w-md mx-auto">
              <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 animate-float">
                <CheckCircleIcon className="!text-5xl" />
              </div>
              <div className="space-y-2">
                <Typography variant="h5" className="!font-bold text-slate-800">
                  Đăng lô hàng thành công!
                </Typography>
                <Typography variant="body2" className="text-slate-500">
                  Lô hàng của bạn đã được khởi tạo và cấu hình đấu giá thành công. Phiên đấu giá sẽ tự động bắt đầu theo đúng khung giờ bạn đã thiết lập.
                </Typography>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full pt-4">
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    setIsSubmitted(false);
                    setActiveStep(0);
                    setGoodsType("");
                    setWeight("");
                    setVolume("");
                    setDimensions({ length: "", width: "", height: "" });
                    setUploadedImages([]);
                    setPickup({ contactName: "", contactPhone: "", province: "", detail: "" });
                    setDelivery({ contactName: "", contactPhone: "", province: "", detail: "" });
                    setMaxPrice("");
                    setStartTime("");
                    setEndTime("");
                    setNotes("");
                  }}
                  className="!border-slate-200 !text-slate-600 hover:!bg-slate-50 !font-bold !py-3 !rounded-2xl !capitalize"
                >
                  Tạo lô hàng khác
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => router.push("/shipper/bidding/sessions")}
                  className="!font-bold !py-3 !rounded-2xl !capitalize"
                  sx={{
                    background: "linear-gradient(135deg, #1B4965 0%, #0D2B3E 100%)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #0D2B3E 0%, #1B4965 100%)",
                    },
                  }}
                >
                  Xem danh sách lô hàng
                </Button>
              </div>
            </Box>
          ) : (
            /* --- FORM CONTENT --- */
            <Box className="space-y-6">
              {/* STEP 1: GOODS DETAILS */}
              {activeStep === 0 && (
                <div className="space-y-6 animate-fade-in">
                  <Typography variant="h6" className="!font-bold text-[#1B4965] border-b pb-2 flex items-center gap-2">
                    <DescriptionIcon /> Thông tin hàng hóa cần vận chuyển
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        label="Loại hàng hóa"
                        placeholder="Ví dụ: Thiết bị điện tử, Nông sản sấy, Sắt hộp xây dựng..."
                        fullWidth
                        value={goodsType}
                        onChange={(e) => setGoodsType(e.target.value)}
                        error={!!step1Errors.goodsType}
                        helperText={step1Errors.goodsType}
                        InputProps={{ className: "!rounded-2xl" }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Khối lượng (Trọng tải)"
                        type="number"
                        placeholder="Nhập trọng tải hàng"
                        fullWidth
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        error={!!step1Errors.weight}
                        helperText={step1Errors.weight}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <TextField
                                select
                                value={weightUnit}
                                onChange={(e) => setWeightUnit(e.target.value)}
                                variant="standard"
                                className="!border-none"
                                InputProps={{ disableUnderline: true }}
                              >
                                <MenuItem value="tấn">Tấn</MenuItem>
                                <MenuItem value="kg">Kg</MenuItem>
                              </TextField>
                            </InputAdornment>
                          ),
                          className: "!rounded-2xl",
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Thể tích ước tính (m³)"
                        type="number"
                        placeholder="Nhập thể tích thùng xe yêu cầu"
                        fullWidth
                        value={volume}
                        onChange={(e) => setVolume(e.target.value)}
                        error={!!step1Errors.volume}
                        helperText={step1Errors.volume || "Nếu không biết thể tích, hãy nhập Kích thước để tính toán tự động."}
                        InputProps={{
                          endAdornment: <InputAdornment position="end">m³</InputAdornment>,
                          className: "!rounded-2xl",
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <Typography variant="body2" className="text-slate-500 font-semibold mb-2">
                        Kích thước chi tiết (Dài x Rộng x Cao tính theo mét - Không bắt buộc)
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={4}>
                          <TextField
                            label="Dài (m)"
                            type="number"
                            fullWidth
                            value={dimensions.length}
                            onChange={(e) => handleDimensionChange("length", e.target.value)}
                            InputProps={{ className: "!rounded-2xl" }}
                          />
                        </Grid>
                        <Grid item xs={4}>
                          <TextField
                            label="Rộng (m)"
                            type="number"
                            fullWidth
                            value={dimensions.width}
                            onChange={(e) => handleDimensionChange("width", e.target.value)}
                            InputProps={{ className: "!rounded-2xl" }}
                          />
                        </Grid>
                        <Grid item xs={4}>
                          <TextField
                            label="Cao (m)"
                            type="number"
                            fullWidth
                            value={dimensions.height}
                            onChange={(e) => handleDimensionChange("height", e.target.value)}
                            InputProps={{ className: "!rounded-2xl" }}
                          />
                        </Grid>
                      </Grid>
                    </Grid>

                    {/* Image Drag & Drop Uploader */}
                    <Grid item xs={12}>
                      <Typography variant="body2" className="text-slate-500 font-semibold mb-2">
                        Hình ảnh thực tế hàng hóa
                      </Typography>
                      <div className="border-2 border-dashed border-slate-200 hover:border-[#1B4965]/50 transition-all rounded-3xl p-6 bg-slate-50/50 flex flex-col items-center justify-center text-center cursor-pointer relative group">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <CloudUploadIcon className="!text-4xl text-slate-400 group-hover:text-[#1B4965] group-hover:scale-105 transition-all mb-2" />
                        <Typography variant="body2" className="!font-bold text-slate-600">
                          Kéo thả hình ảnh vào đây hoặc click để tải lên
                        </Typography>
                        <Typography variant="caption" className="text-slate-400">
                          Hỗ trợ định dạng JPG, PNG, tối đa 5MB/ảnh. Nên có ít nhất 1 ảnh chụp rõ hàng hóa.
                        </Typography>
                      </div>

                      {/* Uploaded Previews */}
                      {uploadedImages.length > 0 && (
                        <div className="flex flex-wrap gap-3 mt-4">
                          {uploadedImages.map((img, idx) => (
                            <div key={idx} className="relative w-20 h-20 rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 flex items-center justify-center group/img">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={img.url} alt={img.name} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                                <IconButton
                                  size="small"
                                  onClick={() => handleRemoveImage(idx)}
                                  className="text-white"
                                >
                                  <DeleteIcon />
                                </IconButton>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </Grid>
                  </Grid>
                </div>
              )}

              {/* STEP 2: ADDRESSES & ROUTE */}
              {activeStep === 1 && (
                <div className="space-y-6 animate-fade-in">
                  <Typography variant="h6" className="!font-bold text-[#1B4965] border-b pb-2 flex items-center gap-2">
                    <LocationOnIcon /> Địa điểm lấy hàng và giao nhận
                  </Typography>

                  <Grid container spacing={4}>
                    {/* Pickup Address Form */}
                    <Grid item xs={12} md={6} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Typography className="!font-bold text-slate-700 flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
                          Điểm Lấy Hàng
                        </Typography>
                        <Button
                          size="small"
                          startIcon={<ImportContactsIcon />}
                          onClick={() => handleOpenAddressBook("pickup")}
                          className="!text-[#1B4965] !font-bold !capitalize !text-[0.78rem]"
                        >
                          Sổ địa chỉ
                        </Button>
                      </div>

                      <TextField
                        label="Họ & tên người gửi"
                        fullWidth
                        value={pickup.contactName}
                        onChange={(e) => setPickup({ ...pickup, contactName: e.target.value })}
                        error={!!step2Errors.pickupName}
                        helperText={step2Errors.pickupName}
                        InputProps={{ className: "!rounded-2xl" }}
                      />
                      <TextField
                        label="Số điện thoại liên hệ"
                        fullWidth
                        value={pickup.contactPhone}
                        onChange={(e) => setPickup({ ...pickup, contactPhone: e.target.value })}
                        error={!!step2Errors.pickupPhone}
                        helperText={step2Errors.pickupPhone}
                        InputProps={{ className: "!rounded-2xl" }}
                      />
                      <TextField
                        label="Tỉnh / Thành phố"
                        placeholder="Ví dụ: Thái Nguyên, Hà Nội..."
                        fullWidth
                        value={pickup.province}
                        onChange={(e) => setPickup({ ...pickup, province: e.target.value })}
                        error={!!step2Errors.pickupProvince}
                        helperText={step2Errors.pickupProvince}
                        InputProps={{ className: "!rounded-2xl" }}
                      />
                      <TextField
                        label="Địa chỉ chi tiết (Số nhà, kho bãi)"
                        multiline
                        rows={2}
                        placeholder="Ví dụ: Kho A, Cụm 3, KCN Yên Bình..."
                        fullWidth
                        value={pickup.detail}
                        onChange={(e) => setPickup({ ...pickup, detail: e.target.value })}
                        error={!!step2Errors.pickupDetail}
                        helperText={step2Errors.pickupDetail}
                        InputProps={{ className: "!rounded-2xl" }}
                      />
                    </Grid>

                    {/* Delivery Address Form */}
                    <Grid item xs={12} md={6} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Typography className="!font-bold text-slate-700 flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                          Điểm Giao Hàng
                        </Typography>
                        <Button
                          size="small"
                          startIcon={<ImportContactsIcon />}
                          onClick={() => handleOpenAddressBook("delivery")}
                          className="!text-[#1B4965] !font-bold !capitalize !text-[0.78rem]"
                        >
                          Sổ địa chỉ
                        </Button>
                      </div>

                      <TextField
                        label="Họ & tên người nhận"
                        fullWidth
                        value={delivery.contactName}
                        onChange={(e) => setDelivery({ ...delivery, contactName: e.target.value })}
                        error={!!step2Errors.deliveryName}
                        helperText={step2Errors.deliveryName}
                        InputProps={{ className: "!rounded-2xl" }}
                      />
                      <TextField
                        label="Số điện thoại nhận hàng"
                        fullWidth
                        value={delivery.contactPhone}
                        onChange={(e) => setDelivery({ ...delivery, contactPhone: e.target.value })}
                        error={!!step2Errors.deliveryPhone}
                        helperText={step2Errors.deliveryPhone}
                        InputProps={{ className: "!rounded-2xl" }}
                      />
                      <TextField
                        label="Tỉnh / Thành phố"
                        placeholder="Ví dụ: Hải Phòng, TP.HCM..."
                        fullWidth
                        value={delivery.province}
                        onChange={(e) => setDelivery({ ...delivery, province: e.target.value })}
                        error={!!step2Errors.deliveryProvince}
                        helperText={step2Errors.deliveryProvince}
                        InputProps={{ className: "!rounded-2xl" }}
                      />
                      <TextField
                        label="Địa chỉ chi tiết (Số nhà, kho bãi)"
                        multiline
                        rows={2}
                        placeholder="Ví dụ: Số 12 Cảng Đình Vũ, Quận Hải An..."
                        fullWidth
                        value={delivery.detail}
                        onChange={(e) => setDelivery({ ...delivery, detail: e.target.value })}
                        error={!!step2Errors.deliveryDetail}
                        helperText={step2Errors.deliveryDetail}
                        InputProps={{ className: "!rounded-2xl" }}
                      />
                    </Grid>
                  </Grid>
                </div>
              )}

              {/* STEP 3: AUCTION PARAMETERS */}
              {activeStep === 2 && (
                <div className="space-y-6 animate-fade-in">
                  <Typography variant="h6" className="!font-bold text-[#1B4965] border-b pb-2 flex items-center gap-2">
                    <ScaleIcon /> Cấu hình các điều kiện đấu giá vận chuyển
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        label="Giá trần đấu thầu (VNĐ tối đa)"
                        type="number"
                        placeholder="Nhập mức giá cao nhất bạn có thể trả"
                        fullWidth
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        error={!!step3Errors.maxPrice}
                        helperText={step3Errors.maxPrice || "Các nhà xe sẽ cạnh tranh giảm giá từ mức giá trần này xuống."}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <MoneyIcon className="text-slate-400" />
                            </InputAdornment>
                          ),
                          endAdornment: <InputAdornment position="end">VNĐ</InputAdornment>,
                          className: "!rounded-2xl",
                        }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Thời gian bắt đầu đấu giá"
                        type="datetime-local"
                        fullWidth
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        error={!!step3Errors.startTime}
                        helperText={step3Errors.startTime}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <CalendarIcon className="text-slate-400" />
                            </InputAdornment>
                          ),
                          className: "!rounded-2xl",
                        }}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Thời gian kết thúc (Đóng thầu)"
                        type="datetime-local"
                        fullWidth
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        error={!!step3Errors.endTime}
                        helperText={step3Errors.endTime}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <CalendarIcon className="text-slate-400" />
                            </InputAdornment>
                          ),
                          className: "!rounded-2xl",
                        }}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <TextField
                        label="Ghi chú thêm cho nhà xe (Điều khoản giao nhận, yêu cầu xe bạt/thùng kín...)"
                        multiline
                        rows={4}
                        placeholder="Mô tả cụ thể các yêu cầu đặc biệt như: cần xe nâng hỗ trợ bốc xếp, yêu cầu tài xế có chứng chỉ an toàn hóa chất..."
                        fullWidth
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        InputProps={{ className: "!rounded-2xl" }}
                      />
                    </Grid>
                  </Grid>
                </div>
              )}

              {/* STEP CONTROLS BUTTONS */}
              <Box className="flex justify-between items-center pt-6 border-t border-slate-100">
                <Button
                  startIcon={<ArrowBackIcon />}
                  disabled={activeStep === 0}
                  onClick={handleBack}
                  className="!text-slate-500 disabled:!text-slate-300 !font-bold !capitalize !rounded-xl"
                >
                  Quay lại
                </Button>

                {activeStep < STEPS.length - 1 ? (
                  <Button
                    variant="contained"
                    onClick={handleNext}
                    className="!font-bold !px-6 !py-2.5 !rounded-xl !capitalize"
                    sx={{
                      background: "linear-gradient(135deg, #1B4965 0%, #0D2B3E 100%)",
                      "&:hover": {
                        background: "linear-gradient(135deg, #0D2B3E 0%, #1B4965 100%)",
                      },
                    }}
                  >
                    Tiếp tục
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={handleSubmit}
                    className="!font-bold !px-8 !py-3 !rounded-xl !capitalize shadow-md hover:shadow-lg"
                    sx={{
                      background: "linear-gradient(135deg, #198754 0%, #157347 100%)",
                      "&:hover": {
                        background: "linear-gradient(135deg, #157347 0%, #198754 100%)",
                      },
                    }}
                  >
                    Đăng lô hàng
                  </Button>
                )}
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Quick Address Book Selector Dialog */}
      <Dialog
        open={openAddressBook}
        onClose={() => setOpenAddressBook(false)}
        maxWidth="sm"
        fullWidth
        className="backdrop-blur-sm"
        PaperProps={{
          className: "!rounded-3xl !p-2",
        }}
      >
        <DialogTitle className="flex justify-between items-center !font-bold text-slate-800">
          Sổ địa chỉ doanh nghiệp
          <IconButton size="small" onClick={() => setOpenAddressBook(false)} className="text-slate-400">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className="!pt-2">
          <Typography variant="caption" className="text-slate-400 block mb-3">
            Chọn một địa chỉ đã lưu dưới đây để điền nhanh các thông tin liên hệ và bến bãi.
          </Typography>
          <List className="space-y-2.5">
            {MOCK_ADDRESS_BOOK.map((item) => (
              <ListItemButton
                key={item.id}
                onClick={() => handleSelectAddress(item)}
                className="!border !border-slate-100 hover:!border-[#1B4965]/30 hover:!bg-[#1B4965]/5 !rounded-2xl !p-3.5 transition-all"
              >
                <ListItemText
                  primary={
                    <Typography className="!font-bold text-[#1B4965] text-sm mb-1 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#1B4965]" />
                      {item.label}
                    </Typography>
                  }
                  secondary={
                    <span className="block space-y-1 text-slate-500 text-xs mt-1.5">
                      <span className="block"><strong>Người liên hệ:</strong> {item.contactName} ({item.contactPhone})</span>
                      <span className="block"><strong>Địa chỉ chi tiết:</strong> {item.detail}, {item.province}</span>
                    </span>
                  }
                />
              </ListItemButton>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
