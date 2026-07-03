"use client";

import { useState, useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Rating from "@mui/material/Rating";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Grid from "@mui/material/Grid";
import Chip from "@mui/material/Chip";

// Icons
import GavelIcon from "@mui/icons-material/GavelOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTimeOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBackOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import CloseIcon from "@mui/icons-material/Close";
import StarIcon from "@mui/icons-material/Star";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import SecurityIcon from "@mui/icons-material/Security";

import PageHeader from "@/components/common/PageHeader";

// Mock Data mapping representing professional logistics operations
const AUCTION_SHIPMENTS_MAP = {
  "LH-2026-9041": {
    id: "LH-2026-9041",
    goodsType: "Linh kiện điện tử (Màn hình điện thoại)",
    weight: "5.2 tấn",
    volume: "28 m³",
    maxPrice: 12500000,
    createdTime: "2026-07-02T10:00:00",
    from: {
      name: "Kho Samsung Yên Bình - Thái Nguyên",
      address: "KCN Yên Bình, Phổ Yên, Thái Nguyên",
    },
    to: {
      name: "Kho Cảng Đình Vũ - Hải Phòng",
      address: "Đông Hải 2, Quận Hải An, Hải Phòng",
    },
    description: "Hàng linh kiện đóng pallet gỗ tissue chuẩn. Yêu cầu xe thùng kín bảo ôn chống ẩm ẩm mốc. Đơn vị vận chuyển có đầy đủ hóa đơn chứng từ.",
    status: "active_bids",
    bids: [
      {
        id: "bid-1",
        carrierName: "Công ty Vận tải Phước An",
        rating: 4.8,
        ratingCount: 156,
        bidAmount: 11200000,
        time: "2 phút trước",
        isLowest: true,
      },
      {
        id: "bid-2",
        carrierName: "Logistics Bắc Nam T&T",
        rating: 4.6,
        ratingCount: 89,
        bidAmount: 11500000,
        time: "5 phút trước",
        isLowest: false,
      },
      {
        id: "bid-3",
        carrierName: "Hợp tác xã Vận tải Hữu Nghị",
        rating: 4.5,
        ratingCount: 204,
        bidAmount: 11900000,
        time: "12 phút trước",
        isLowest: false,
      },
      {
        id: "bid-4",
        carrierName: "Vận tải Quốc tế Hoa Lâm",
        rating: 4.2,
        ratingCount: 42,
        bidAmount: 12200000,
        time: "18 phút trước",
        isLowest: false,
      }
    ]
  },
  "LH-2026-9042": {
    id: "LH-2026-9042",
    goodsType: "Thực phẩm đông lạnh (Thủy sản)",
    weight: "8.0 tấn",
    volume: "45 m³",
    maxPrice: 28000000,
    createdTime: "2026-07-02T11:30:00",
    from: {
      name: "Kho Thủy Sản Sông Đốc - Cà Mau",
      address: "Cụm CN Sông Đốc, Huyện Trần Văn Thời, Cà Mau",
    },
    to: {
      name: "Kho Lạnh Transimex - TP. Hồ Chí Minh",
      address: "Khu Công Nghệ Cao Quận 9, TP. Hồ Chí Minh",
    },
    description: "Hàng hải sản đông lạnh xuất khẩu. Yêu cầu container lạnh giữ nhiệt độ ổn định ở -18 độ C suốt hành trình. Bàn giao đầy đủ CO/CQ.",
    status: "active_bids",
    bids: [
      {
        id: "bid-1",
        carrierName: "Vận tải Đông Lạnh Meito",
        rating: 4.9,
        ratingCount: 312,
        bidAmount: 26500000,
        time: "1 phút trước",
        isLowest: true,
      },
      {
        id: "bid-2",
        carrierName: "Công ty Logistics Ánh Dương",
        rating: 4.7,
        ratingCount: 145,
        bidAmount: 27000000,
        time: "6 phút trước",
        isLowest: false,
      },
      {
        id: "bid-3",
        carrierName: "Logistics Bắc Nam T&T",
        rating: 4.6,
        ratingCount: 89,
        bidAmount: 27500000,
        time: "15 phút trước",
        isLowest: false,
      }
    ]
  },
  "LH-2026-9043": {
    id: "LH-2026-9043",
    goodsType: "Nông sản khô (Hạt điều)",
    weight: "15.0 tấn",
    volume: "60 m³",
    maxPrice: 18500000,
    createdTime: "2026-07-03T08:00:00",
    from: {
      name: "Nhà Máy Điều Đồng Phú - Bình Phước",
      address: "Kho xuất khẩu Đồng Phú, Bình Phước",
    },
    to: {
      name: "Cảng Cái Mép - Bà Rịa - Vũng Tàu",
      address: "Cảng Cái Mép - Thị Vải, Phú Mỹ, Bà Rịa - Vũng Tàu",
    },
    description: "Hạt điều sấy khô đóng bao 50kg. Yêu cầu xe bạt sạch sẽ, không có mùi lạ, che chắn mưa tuyệt đối.",
    status: "pending_bids",
    bids: []
  },
  "LH-2026-9044": {
    id: "LH-2026-9044",
    goodsType: "Vật liệu xây dựng (Sắt thép)",
    weight: "22.5 tấn",
    volume: "18 m³",
    maxPrice: 16000000,
    createdTime: "2026-07-01T09:00:00",
    from: {
      name: "Nhà Máy Thép Hòa Phát - Quảng Ngãi",
      address: "KCN Dung Quất, Bình Sơn, Quảng Ngãi",
    },
    to: {
      name: "Tổng Kho Hòa Khánh - Đà Nẵng",
      address: "KCN Hòa Khánh, Liên Chiểu, Đà Nẵng",
    },
    description: "Thép cuộn xây dựng. Yêu cầu xe đầu kéo rơ-moóc sàn có xích neo chằng chịu lực cao. Giao hàng trong giờ hành chính.",
    status: "awarded",
    bids: [
      {
        id: "bid-1",
        carrierName: "Công ty Vận tải Phước An",
        rating: 4.8,
        ratingCount: 156,
        bidAmount: 14800000,
        time: "1 ngày trước",
        isLowest: true,
      },
      {
        id: "bid-2",
        carrierName: "Vận tải Đa Quốc gia Minh Long",
        rating: 4.4,
        ratingCount: 78,
        bidAmount: 15200000,
        time: "1 ngày trước",
        isLowest: false,
      },
      {
        id: "bid-3",
        carrierName: "Hợp tác xã Vận tải Hữu Nghị",
        rating: 4.5,
        ratingCount: 204,
        bidAmount: 15500000,
        time: "2 ngày trước",
        isLowest: false,
      }
    ]
  },
  "LH-2026-9045": {
    id: "LH-2026-9045",
    goodsType: "Hàng tiêu dùng nhanh (FMCG)",
    weight: "3.5 tấn",
    volume: "22 m³",
    maxPrice: 9500000,
    createdTime: "2026-06-30T10:00:00",
    from: {
      name: "Kho Unilever VSIP I - Bình Dương",
      address: "KCN VSIP I, Thuận An, Bình Dương",
    },
    to: {
      name: "Mega Market Cái Răng - Cần Thơ",
      address: "Trung tâm phân phối Mega Market, Cái Răng, Cần Thơ",
    },
    description: "Nước giặt, xà bông đóng thùng carton. Yêu cầu xe tải thùng bạt hoặc thùng kín sạch sẽ, không rò rỉ nước.",
    status: "shipping",
    bids: [
      {
        id: "bid-1",
        carrierName: "Hợp tác xã Vận tải Hữu Nghị",
        rating: 4.5,
        ratingCount: 204,
        bidAmount: 8900000,
        time: "3 ngày trước",
        isLowest: true,
      },
      {
        id: "bid-2",
        carrierName: "Công ty Vận tải Phước An",
        rating: 4.8,
        ratingCount: 156,
        bidAmount: 9100000,
        time: "3 ngày trước",
        isLowest: false,
      },
      {
        id: "bid-3",
        carrierName: "Logistics Quốc tế Tân Cảng",
        rating: 4.7,
        ratingCount: 112,
        bidAmount: 9350000,
        time: "4 ngày trước",
        isLowest: false,
      }
    ]
  },
  "LH-2026-9046": {
    id: "LH-2026-9046",
    goodsType: "Trái cây xuất khẩu (Thanh long)",
    weight: "10.0 tấn",
    volume: "40 m³",
    maxPrice: 42000000,
    createdTime: "2026-06-24T14:00:00",
    from: {
      name: "Vựa Thanh Long Hàm Thuận Nam - Bình Thuận",
      address: "Xã Hàm Mỹ, Hàm Thuận Nam, Bình Thuận",
    },
    to: {
      name: "Bãi Kiểm Hóa Cửa Khẩu Tân Thanh - Lạng Sơn",
      address: "Cửa khẩu Tân Thanh, Văn Lãng, Lạng Sơn",
    },
    description: "Thanh long tươi đóng thùng xốp. Yêu cầu container lạnh cài đặt nhiệt độ ở mức 5 độ C suốt hành trình để bảo quản chất lượng.",
    status: "completed",
    bids: [
      {
        id: "bid-1",
        carrierName: "Logistics Bắc Nam T&T",
        rating: 4.6,
        ratingCount: 89,
        bidAmount: 39500000,
        time: "1 tuần trước",
        isLowest: true,
      },
      {
        id: "bid-2",
        carrierName: "Công ty Cổ phần Vận tải biển & GLC",
        rating: 4.3,
        ratingCount: 52,
        bidAmount: 40800000,
        time: "1 tuần trước",
        isLowest: false,
      },
      {
        id: "bid-3",
        carrierName: "Hợp tác xã Vận tải Hữu Nghị",
        rating: 4.5,
        ratingCount: 204,
        bidAmount: 41200000,
        time: "1 tuần trước",
        isLowest: false,
      }
    ]
  },
  "LH-2026-9047": {
    id: "LH-2026-9047",
    goodsType: "Hóa chất (Sơn công nghiệp)",
    weight: "6.0 tấn",
    volume: "24 m³",
    maxPrice: 15500000,
    createdTime: "2026-06-27T08:00:00",
    from: {
      name: "Nhà Máy Sơn Amata - Đồng Nai",
      address: "KCN Amata, Biên Hòa, Đồng Nai",
    },
    to: {
      name: "Kho Sơn Đông Á - Khánh Hòa",
      address: "KCN Suối Dầu, Cam Lâm, Khánh Hòa",
    },
    description: "Thùng sơn công nghiệp loại 20L. Yêu cầu xe tải sàn gỗ có đệm giảm chấn chèn lót kỹ càng, lái xe có chứng chỉ vận chuyển hàng nguy hiểm.",
    status: "cancelled",
    bids: [
      {
        id: "bid-1",
        carrierName: "Hợp tác xã Vận tải Hữu Nghị",
        rating: 4.5,
        ratingCount: 204,
        bidAmount: 14700000,
        time: "5 ngày trước",
        isLowest: true,
      },
      {
        id: "bid-2",
        carrierName: "Vận tải Đa Phương thức Vinafreight",
        rating: 4.2,
        ratingCount: 61,
        bidAmount: 15100000,
        time: "5 ngày trước",
        isLowest: false,
      }
    ]
  },
  "LH-2026-9048": {
    id: "LH-2026-9048",
    goodsType: "Bao bì carton",
    weight: "2.0 tấn",
    volume: "35 m³",
    maxPrice: 6500000,
    createdTime: "2026-07-02T15:00:00",
    from: {
      name: "Nhà Máy Bao Bì Phố Nối - Hưng Yên",
      address: "KCN Phố Nối A, Yên Mỹ, Hưng Yên",
    },
    to: {
      name: "Nhà Máy Foxconn Quang Châu - Bắc Giang",
      address: "KCN Quang Châu, Việt Yên, Bắc Giang",
    },
    description: "Thùng carton phẳng xếp kiện pallet bọc màng co PE. Yêu cầu thùng xe kín hoàn toàn để ngăn nước mưa làm hỏng bao bì.",
    status: "active_bids",
    bids: [
      {
        id: "bid-1",
        carrierName: "Vận tải Nội Bài Express",
        rating: 4.7,
        ratingCount: 65,
        bidAmount: 5800000,
        time: "10 phút trước",
        isLowest: true,
      },
      {
        id: "bid-2",
        carrierName: "Logistics Bắc Nam T&T",
        rating: 4.6,
        ratingCount: 89,
        bidAmount: 6000000,
        time: "20 phút trước",
        isLowest: false,
      },
      {
        id: "bid-3",
        carrierName: "Hợp tác xã Vận tải Hữu Nghị",
        rating: 4.5,
        ratingCount: 204,
        bidAmount: 6200000,
        time: "40 phút trước",
        isLowest: false,
      }
    ]
  }
};

export default function AuctionDetailScreen({ id }) {
  const shipment = AUCTION_SHIPMENTS_MAP[id] || AUCTION_SHIPMENTS_MAP["LH-2026-9041"];
  const [bids, setBids] = useState([]);

  useEffect(() => {
    if (shipment) {
      setBids(shipment.bids || []);
    }
  }, [id, shipment]);

  const [openOtpDialog, setOpenOtpDialog] = useState(false);
  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [isOtpSuccess, setIsOtpSuccess] = useState(false);
  const [countdown, setCountdown] = useState(930); // 15 minutes 30 seconds
  const otpInputRefs = useRef([]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "pending_bids":
        return (
          <span className="text-[0.72rem] font-bold px-3 py-1 bg-amber-50 text-amber-600 border border-amber-100 rounded-full">
            Chờ đấu giá
          </span>
        );
      case "active_bids":
        return (
          <span className="text-[0.72rem] font-bold px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full animate-pulse-subtle">
            Đấu giá hoạt động
          </span>
        );
      case "awarded":
        return (
          <span className="text-[0.72rem] font-bold px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-full">
            Đã chốt thầu
          </span>
        );
      case "shipping":
        return (
          <span className="text-[0.72rem] font-bold px-3 py-1 bg-cyan-50 text-cyan-600 border border-cyan-100 rounded-full">
            Đang vận chuyển
          </span>
        );
      case "completed":
        return (
          <span className="text-[0.72rem] font-bold px-3 py-1 bg-slate-50 text-slate-600 border border-slate-200 rounded-full">
            Đã hoàn thành
          </span>
        );
      case "cancelled":
        return (
          <span className="text-[0.72rem] font-bold px-3 py-1 bg-rose-50 text-rose-600 border border-rose-100 rounded-full">
            Đã hủy
          </span>
        );
      default:
        return null;
    }
  };

  // Live Timer Countdown Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format countdown seconds into HH:MM:SS
  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return [
      h.toString().padStart(2, "0"),
      m.toString().padStart(2, "0"),
      s.toString().padStart(2, "0")
    ].join(":");
  };

  const handleOpenOtpDialog = () => {
    setOtpValues(["", "", "", "", "", ""]);
    setIsOtpSuccess(false);
    setOpenOtpDialog(true);
  };

  const handleCloseOtpDialog = () => {
    setOpenOtpDialog(false);
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otpValues];
    newOtp[index] = value.substring(value.length - 1);
    setOtpValues(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    // Backspace handling
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      otpInputRefs.current[index - 1].focus();
    }
  };

  const handleOtpSubmit = () => {
    const otpCode = otpValues.join("");
    if (otpCode.length === 6) {
      setIsOtpSuccess(true);
      // Simulate real-time state update (e.g. Awarding the bidding)
      setTimeout(() => {
        setOpenOtpDialog(false);
        // We could route to contract detail or update state
        alert("Chốt thầu và Ký Hợp đồng điện tử thành công!");
      }, 1800);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" })
      .format(val)
      .replace("₫", "đ");
  };

  const lowestBidAmount = bids.find((b) => b.isLowest)?.bidAmount || 0;

  return (
    <Box className="w-full min-h-screen">
      {/* Page Header */}
      <PageHeader
        title="Theo Dõi Phiên Đấu Giá"
        subtitle="Chi tiết diễn biến lệnh đặt giá của các nhà xe đối với lô hàng của bạn."
        breadcrumbs={[
          { label: "Trang chủ", path: "/shipper/dashboard" },
          { label: "Đấu giá vận tải", path: "/shipper/bidding/sessions" },
          { label: `Lô hàng ${shipment.id}` },
        ]}
      />

      {/* Grid: Left - Shipment Detail Info | Right - Real-time Bidding status */}
      <Grid container spacing={3} className="!mb-6">
        {/* Left Side: Summary Card */}
        <Grid item xs={12} lg={7}>
          <Card 
            className="!rounded-3xl border border-slate-100 h-full"
            sx={{
              background: "rgba(255, 255, 255, 0.8)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 8px 32px 0 rgba(27, 73, 101, 0.02)",
            }}
          >
            <CardContent className="!p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <Typography variant="caption" className="text-slate-400 font-mono font-bold">
                    MÃ LÔ HÀNG: {shipment.id}
                  </Typography>
                  <Typography variant="h6" className="!font-bold text-slate-800 !mt-0.5">
                    {shipment.goodsType}
                  </Typography>
                </div>
                <div className="text-right">
                  {getStatusBadge(shipment.status)}
                </div>
              </div>

              {/* Specification Grid */}
              <div className="grid grid-cols-3 gap-4 py-1.5 bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50 text-xs">
                <div>
                  <Typography className="!text-[0.7rem] text-slate-400 font-medium uppercase">Khối lượng</Typography>
                  <Typography className="!font-bold text-slate-700 !mt-0.5">{shipment.weight}</Typography>
                </div>
                <div>
                  <Typography className="!text-[0.7rem] text-slate-400 font-medium uppercase">Thể tích</Typography>
                  <Typography className="!font-bold text-slate-700 !mt-0.5">{shipment.volume}</Typography>
                </div>
                <div>
                  <Typography className="!text-[0.7rem] text-slate-400 font-medium uppercase">Giá trần tối đa</Typography>
                  <Typography className="!font-bold text-slate-700 !mt-0.5">{formatCurrency(shipment.maxPrice)}</Typography>
                </div>
              </div>

              {/* Route details */}
              <div className="space-y-4 pt-1">
                <Typography variant="subtitle2" className="!font-bold text-slate-700">
                  Thông tin hành trình
                </Typography>
                
                {/* Pickup/Delivery Steps */}
                <div className="relative pl-6 space-y-4">
                  {/* Left Timeline Line */}
                  <div className="absolute left-[5px] top-2 bottom-2 w-[2px] bg-slate-200" />

                  {/* Pickup */}
                  <div className="relative">
                    <div className="absolute -left-[25px] top-1 w-3 h-3 rounded-full border-2 border-sky-500 bg-white" />
                    <div>
                      <Typography className="!text-xs !font-bold text-sky-600 uppercase tracking-wide">
                        Điểm Lấy Hàng
                      </Typography>
                      <Typography variant="body2" className="text-slate-800 font-bold !mt-0.5">
                        {shipment.from.name}
                      </Typography>
                      <Typography variant="caption" className="text-slate-500 font-medium block">
                        {shipment.from.address}
                      </Typography>
                    </div>
                  </div>

                  {/* Delivery */}
                  <div className="relative">
                    <div className="absolute -left-[25px] top-1 w-3 h-3 rounded-full border-2 border-emerald-500 bg-emerald-500" />
                    <div>
                      <Typography className="!text-xs !font-bold text-emerald-600 uppercase tracking-wide">
                        Điểm Giao Hàng
                      </Typography>
                      <Typography variant="body2" className="text-slate-800 font-bold !mt-0.5">
                        {shipment.to.name}
                      </Typography>
                      <Typography variant="caption" className="text-slate-500 font-medium block">
                        {shipment.to.address}
                      </Typography>
                    </div>
                  </div>
                </div>
              </div>

              {/* Note Details */}
              <div className="pt-3 border-t border-slate-100">
                <Typography variant="subtitle2" className="!font-bold text-slate-700 mb-1">
                  Yêu cầu & Ghi chú bổ sung
                </Typography>
                <Typography variant="body2" className="text-slate-500 leading-relaxed">
                  {shipment.description}
                </Typography>
              </div>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Side: Real-time Stats, Countdown & Best Bid */}
        <Grid item xs={12} lg={5}>
          <div className="space-y-6 flex flex-col justify-between h-full">
            {/* Live Countdown Box */}
            <Card
              className="!rounded-3xl border border-amber-400/20"
              sx={{
                background: "linear-gradient(135deg, #FF5A5F 0%, #FF7A00 100%)",
                boxShadow: "0 10px 30px rgba(255, 90, 95, 0.35)",
                color: "#fff",
              }}
            >
              <CardContent className="!p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <Typography className="!text-slate-300 font-bold uppercase tracking-wider text-xs flex items-center gap-1.5">
                    <AccessTimeIcon className="!text-[1rem]" /> Thời gian đóng thầu còn lại
                  </Typography>
                  <Typography variant="h3" className="!font-mono !font-black tracking-widest">
                    {formatTime(countdown)}
                  </Typography>
                </div>
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-2xl border border-white/10 animate-float">
                  ⏳
                </div>
              </CardContent>
            </Card>

            {/* Current Lowest Price Box */}
            <Card
              className="!rounded-3xl border border-emerald-100 flex-1 relative overflow-hidden"
              sx={{
                background: "linear-gradient(135deg, rgba(236,253,245,0.8) 0%, rgba(209,250,229,0.4) 100%)",
                boxShadow: "0 10px 30px rgba(16, 185, 129, 0.03)",
              }}
            >
              <Box className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl" />
              
              <CardContent className="!p-8 flex flex-col justify-between h-full space-y-4">
                <div className="space-y-1">
                  <Typography className="!text-emerald-700 !font-extrabold uppercase tracking-widest text-xs flex items-center gap-1">
                    <GavelIcon className="!text-[1rem]" /> Báo giá thấp nhất hiện tại
                  </Typography>
                  <Typography variant="h3" className="!font-black text-emerald-600 tracking-tight">
                    {lowestBidAmount > 0 ? formatCurrency(lowestBidAmount) : "Chưa có báo giá"}
                  </Typography>
                </div>

                <div className="bg-white/80 p-3 rounded-2xl border border-emerald-100/50 text-xs text-slate-500 font-medium space-y-1">
                  <div className="flex justify-between">
                    <span>Nhà xe báo giá thấp nhất:</span>
                    <strong className="text-slate-700">
                      {lowestBidAmount > 0 ? (bids.find((b) => b.isLowest)?.carrierName || "N/A") : "N/A"}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Tiết kiệm so với giá trần:</span>
                    <strong className="text-emerald-600 font-bold">
                      {lowestBidAmount > 0 
                        ? `-${formatCurrency(shipment.maxPrice - lowestBidAmount)} (${((shipment.maxPrice - lowestBidAmount) / shipment.maxPrice * 100).toFixed(1)}%)`
                        : "0đ (0%)"}
                    </strong>
                  </div>
                </div>

                {/* Primary CTA Action Button */}
                <Button
                  fullWidth
                  variant="contained"
                  onClick={handleOpenOtpDialog}
                  disabled={lowestBidAmount === 0 || shipment.status === "completed" || shipment.status === "cancelled" || shipment.status === "shipping"}
                  className="!rounded-2xl !py-3.5 !font-bold !capitalize shadow-lg shadow-emerald-500/10 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                  sx={{
                    background: "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                    "&:hover": {
                      background: "linear-gradient(135deg, #059669 0%, #10B981 100%)",
                    },
                  }}
                >
                  {shipment.status === "completed" 
                    ? "Đã Hoàn Thành Vận Chuyển" 
                    : shipment.status === "shipping"
                    ? "Đang Vận Chuyển"
                    : shipment.status === "cancelled"
                    ? "Đã Hủy Lô Hàng"
                    : lowestBidAmount > 0 
                    ? "Chốt thầu & Ký Hợp đồng" 
                    : "Chờ báo giá từ nhà xe..."}
                </Button>
              </CardContent>
            </Card>
          </div>
        </Grid>
      </Grid>

      {/* Table: List of Carrier bids */}
      <Card
        className="!rounded-3xl border border-slate-100 !shadow-[0_8px_32px_0_rgba(27,73,101,0.02)] overflow-hidden"
        sx={{
          background: "rgba(255, 255, 255, 0.8)",
          backdropFilter: "blur(20px)",
        }}
      >
        <Box className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <Typography variant="h6" className="!font-bold text-slate-700">
              Danh sách báo giá tham gia thầu
            </Typography>
            <Typography variant="caption" className="text-slate-400">
              Cập nhật trực tiếp thời gian thực từ các nhà xe
            </Typography>
          </div>
          <Chip
            label={`${bids.length} nhà xe báo giá`}
            size="small"
            className="!font-bold !text-[0.72rem] !px-2.5 !py-1 rounded-full bg-slate-100 text-slate-600"
          />
        </Box>

        <TableContainer component={Paper} className="!shadow-none !bg-transparent">
          <Table sx={{ minWidth: 650 }}>
            <TableHead className="bg-slate-50/50">
              <TableRow>
                <TableCell className="!font-bold !text-slate-400 !text-xs uppercase !border-slate-100">Nhà xe</TableCell>
                <TableCell align="center" className="!font-bold !text-slate-400 !text-xs uppercase !border-slate-100">Đánh giá tín nhiệm</TableCell>
                <TableCell align="right" className="!font-bold !text-slate-400 !text-xs uppercase !border-slate-100">Giá thầu đề xuất</TableCell>
                <TableCell align="right" className="!font-bold !text-slate-400 !text-xs uppercase !border-slate-100">Thời điểm đặt</TableCell>
                <TableCell align="center" className="!font-bold !text-slate-400 !text-xs uppercase !border-slate-100">Trạng thái</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bids.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" className="!py-12 !border-none">
                    <Typography variant="body2" className="text-slate-400 font-medium">
                      Chưa có nhà xe nào báo giá cho lô hàng này.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                bids.map((bid) => (
                  <TableRow
                    key={bid.id}
                    className={`transition-colors ${
                      bid.isLowest
                        ? "bg-emerald-500/5 hover:bg-emerald-500/10"
                        : "hover:bg-slate-50/50"
                    }`}
                  >
                    {/* Carrier Name */}
                    <TableCell className="!font-bold !text-slate-700 !border-slate-100">
                      <div className="flex flex-col">
                        <span>{bid.carrierName}</span>
                        <span className="text-[0.68rem] text-slate-400 font-medium">B2B Verified Member</span>
                      </div>
                    </TableCell>

                    {/* Rating */}
                    <TableCell align="center" className="!border-slate-100">
                      <div className="flex items-center justify-center gap-1.5">
                        <Rating
                          name="read-only"
                          value={bid.rating}
                          precision={0.1}
                          readOnly
                          size="small"
                          emptyIcon={<StarIcon className="text-slate-200" fontSize="inherit" />}
                        />
                        <span className="text-xs font-bold text-slate-600">{bid.rating}</span>
                        <span className="text-[0.7rem] text-slate-400">({bid.ratingCount})</span>
                      </div>
                    </TableCell>

                    {/* Bid Amount */}
                    <TableCell
                      align="right"
                      className={`!font-mono !font-bold !border-slate-100 ${
                        bid.isLowest ? "!text-emerald-600 !text-base" : "!text-slate-600"
                      }`}
                    >
                      {formatCurrency(bid.bidAmount)}
                    </TableCell>

                    {/* Bid Time */}
                    <TableCell align="right" className="!text-slate-500 !text-xs !border-slate-100">
                      {bid.time}
                    </TableCell>

                    {/* Action or Badge */}
                    <TableCell align="center" className="!border-slate-100">
                      {bid.isLowest ? (
                        <Chip
                          label="Thấp nhất"
                          size="small"
                          color="success"
                          className="!font-extrabold !text-[0.68rem] bg-emerald-500 text-white rounded-md"
                        />
                      ) : (
                        <span className="text-xs text-slate-400 font-bold">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* OTP Dialog Verification (Simulated electronic contract sign) */}
      <Dialog
        open={openOtpDialog}
        onClose={handleCloseOtpDialog}
        maxWidth="xs"
        fullWidth
        className="backdrop-blur-sm"
        PaperProps={{
          className: "!rounded-3xl !p-2",
        }}
      >
        <DialogTitle className="flex justify-between items-center !font-bold text-slate-800">
          Chốt thầu & Ký Hợp đồng điện tử
          <IconButton size="small" onClick={handleCloseOtpDialog} className="text-slate-400">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent className="flex flex-col items-center justify-center text-center space-y-4 !py-4">
          {isOtpSuccess ? (
            <div className="space-y-4 py-4 flex flex-col items-center animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 border border-emerald-100 animate-bounce">
                <CheckCircleIcon className="!text-4xl" />
              </div>
              <div className="space-y-1">
                <Typography className="!font-bold text-slate-800 text-base">
                  Xác nhận ký hợp đồng thành công!
                </Typography>
                <Typography variant="body2" className="text-slate-400 max-w-xs">
                  Hợp đồng vận chuyển điện tử đang được tạo. Hệ thống sẽ kết nối trực tiếp với tài xế của nhà xe Phước An.
                </Typography>
              </div>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center border border-amber-100 text-xl">
                <SecurityIcon />
              </div>
              
              <div className="space-y-1.5">
                <Typography variant="body2" className="text-slate-500">
                  Vui lòng nhập mã xác thực OTP 6 chữ số đã được gửi qua số điện thoại để ký kết hợp đồng điện tử với nhà xe.
                </Typography>
                <Typography variant="caption" className="text-slate-400 font-bold block">
                  (Nhập mã giả định: <span className="text-[#1B4965] font-mono">123456</span> để kiểm thử)
                </Typography>
              </div>

              {/* Segmented OTP Input */}
              <div className="flex gap-2 justify-center py-2">
                {otpValues.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => (otpInputRefs.current[idx] = el)}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-11 h-12 text-center text-xl font-bold rounded-xl border border-slate-200 focus:border-[#1B4965] focus:outline-none transition-all bg-slate-50/50 focus:bg-white"
                  />
                ))}
              </div>
            </>
          )}
        </DialogContent>
        {!isOtpSuccess && (
          <DialogActions className="!px-6 !pb-4 flex justify-between gap-3 border-t border-slate-100/50 pt-3">
            <Typography variant="caption" className="text-slate-400 font-semibold cursor-pointer hover:text-[#1B4965] transition-colors">
              Gửi lại mã OTP
            </Typography>
            <div className="flex gap-2">
              <Button
                onClick={handleCloseOtpDialog}
                variant="text"
                className="!text-slate-500 !font-bold !capitalize !rounded-xl"
              >
                Hủy bỏ
              </Button>
              <Button
                onClick={handleOtpSubmit}
                disabled={otpValues.join("").length < 6}
                variant="contained"
                className="!font-bold !capitalize !rounded-xl !px-5"
                sx={{
                  background: "linear-gradient(135deg, #1B4965 0%, #0D2B3E 100%)",
                  "&.Mui-disabled": {
                    background: "#E2E8F0",
                    color: "#94A3B8"
                  }
                }}
              >
                Xác nhận ký
              </Button>
            </div>
          </DialogActions>
        )}
      </Dialog>
    </Box>
  );
}
