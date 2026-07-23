"use client";

import { useState, useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import InputAdornment from "@mui/material/InputAdornment";
import Avatar from "@mui/material/Avatar";
import { 
  ArrowBack as ArrowBackIcon,
  Timer as TimerIcon,
  LocalShipping as LocalShippingIcon,
  Gavel as GavelIcon,
  MonetizationOn as MonetizationOnIcon,
  LocationOn as LocationOnIcon,
  TrendingDown as TrendingDownIcon,
  Lock as LockIcon,
  Info as InfoIcon
} from "@mui/icons-material";
import Link from "next/link";
import { PageHeader } from "@/components/common";

const MOCK_VEHICLES = [
  { id: "V1", plate: "29H-123.45", capacity: "15 Tấn" },
  { id: "V2", plate: "30F-987.65", capacity: "10 Tấn" },
];

const MOCK_SHIPMENTS_MAP = {
  "LH-2026-9041": {
    id: "LH-2026-9041",
    goodsType: "Linh kiện điện tử (Màn hình điện thoại)",
    weight: "5.2 tấn",
    volume: "28 m³",
    maxPrice: 12500000,
    createdTime: "2026-07-02T10:00:00",
    from: { name: "Kho Samsung Yên Bình - Thái Nguyên", address: "KCN Yên Bình, Phổ Yên, Thái Nguyên" },
    to: { name: "Kho Cảng Đình Vũ - Hải Phòng", address: "Đông Hải 2, Quận Hải An, Hải Phòng" },
    description: "Hàng linh kiện đóng pallet gỗ tissue chuẩn. Yêu cầu xe thùng kín bảo ôn chống ẩm ẩm mốc. Đơn vị vận chuyển có đầy đủ hóa đơn chứng từ.",
  },
  "LH-2026-9042": {
    id: "LH-2026-9042",
    goodsType: "Thực phẩm đông lạnh (Thủy sản)",
    weight: "8.0 tấn",
    volume: "45 m³",
    maxPrice: 28000000,
    createdTime: "2026-07-02T11:30:00",
    from: { name: "Kho Thủy Sản Sông Đốc - Cà Mau", address: "Cụm CN Sông Đốc, Huyện Trần Văn Thời, Cà Mau" },
    to: { name: "Kho Lạnh Transimex - TP. Hồ Chí Minh", address: "Khu Công Nghệ Cao Quận 9, TP. Hồ Chí Minh" },
    description: "Hàng hải sản đông lạnh xuất khẩu. Yêu cầu container lạnh giữ nhiệt độ ổn định ở -18 độ C suốt hành trình. Bàn giao đầy đủ CO/CQ.",
  },
  "LH-2026-9043": {
    id: "LH-2026-9043",
    goodsType: "Nông sản khô (Hạt điều)",
    weight: "15.0 tấn",
    volume: "60 m³",
    maxPrice: 18500000,
    createdTime: "2026-07-03T08:00:00",
    from: { name: "Nhà Máy Điều Đồng Phú - Bình Phước", address: "Kho xuất khẩu Đồng Phú, Bình Phước" },
    to: { name: "Cảng Cái Mép - Bà Rịa - Vũng Tàu", address: "Cảng Cái Mép - Thị Vải, Phú Mỹ, Bà Rịa - Vũng Tàu" },
    description: "Hạt điều sấy khô đóng bao 50kg. Yêu cầu xe bạt sạch sẽ, không có mùi lạ, che chắn mưa tuyệt đối.",
  },
  "LH-2026-9044": {
    id: "LH-2026-9044",
    goodsType: "Vật liệu xây dựng (Sắt thép)",
    weight: "22.5 tấn",
    volume: "18 m³",
    maxPrice: 16000000,
    createdTime: "2026-07-01T09:00:00",
    from: { name: "Nhà Máy Thép Hòa Phát - Quảng Ngãi", address: "KCN Dung Quất, Bình Sơn, Quảng Ngãi" },
    to: { name: "Tổng Kho Hòa Khánh - Đà Nẵng", address: "KCN Hòa Khánh, Liên Chiểu, Đà Nẵng" },
    description: "Thép cuộn xây dựng. Yêu cầu xe đầu kéo rơ-moóc sàn có xích neo chằng chịu lực cao. Giao hàng trong giờ hành chính.",
  },
  "LH-2026-9045": {
    id: "LH-2026-9045",
    goodsType: "Hàng tiêu dùng nhanh (FMCG)",
    weight: "3.5 tấn",
    volume: "22 m³",
    maxPrice: 9500000,
    createdTime: "2026-06-30T10:00:00",
    from: { name: "Kho Unilever VSIP I - Bình Dương", address: "KCN VSIP I, Thuận An, Bình Dương" },
    to: { name: "Mega Market Cái Răng - Cần Thơ", address: "Trung tâm phân phối Mega Market, Cái Răng, Cần Thơ" },
    description: "Nước giặt, xà bông đóng thùng carton. Yêu cầu xe tải thùng bạt hoặc thùng kín sạch sẽ, không rò rỉ nước.",
  },
  "LH-2026-9046": {
    id: "LH-2026-9046",
    goodsType: "Trái cây xuất khẩu (Thanh long)",
    weight: "10.0 tấn",
    volume: "40 m³",
    maxPrice: 42000000,
    createdTime: "2026-06-24T14:00:00",
    from: { name: "Vựa Thanh Long Hàm Thuận Nam - Bình Thuận", address: "Xã Hàm Mỹ, Hàm Thuận Nam, Bình Thuận" },
    to: { name: "Bãi Kiểm Hóa Cửa Khẩu Tân Thanh - Lạng Sơn", address: "Cửa khẩu Tân Thanh, Văn Lãng, Lạng Sơn" },
    description: "Thanh long tươi đóng thùng xốp. Yêu cầu container lạnh cài đặt nhiệt độ ở mức 5 độ C suốt hành trình để bảo quản chất lượng.",
  },
  "LH-2026-9047": {
    id: "LH-2026-9047",
    goodsType: "Hóa chất (Sơn công nghiệp)",
    weight: "6.0 tấn",
    volume: "24 m³",
    maxPrice: 15500000,
    createdTime: "2026-06-27T08:00:00",
    from: { name: "Nhà Máy Sơn Amata - Đồng Nai", address: "KCN Amata, Biên Hòa, Đồng Nai" },
    to: { name: "Kho Sơn Đông Á - Khánh Hòa", address: "KCN Suối Dầu, Cam Lâm, Khánh Hòa" },
    description: "Thùng sơn công nghiệp loại 20L. Yêu cầu xe tải sàn gỗ có đệm giảm chấn chèn lót kỹ càng, lái xe có chứng chỉ vận chuyển hàng nguy hiểm.",
  },
  "LH-2026-9048": {
    id: "LH-2026-9048",
    goodsType: "Bao bì carton",
    weight: "2.0 tấn",
    volume: "35 m³",
    maxPrice: 6500000,
    createdTime: "2026-07-02T15:00:00",
    from: { name: "Nhà Máy Bao Bì Phố Nối - Hưng Yên", address: "KCN Phố Nối A, Yên Mỹ, Hưng Yên" },
    to: { name: "Nhà Máy Foxconn Quang Châu - Bắc Giang", address: "KCN Quang Châu, Việt Yên, Bắc Giang" },
    description: "Thùng carton phẳng xếp kiện pallet bọc màng co PE. Yêu cầu thùng xe kín hoàn toàn để ngăn nước mưa làm hỏng bao bì.",
  }
};

const enrichShipmentDetails = (shipment) => {
  if (!shipment) return null;
  const baseTime = shipment.createdTime ? new Date(shipment.createdTime) : new Date("2026-07-02T10:00:00");
  const regStartTime = new Date(baseTime.getTime() - 2 * 3600000).toISOString();
  const regEndTime = new Date(baseTime.getTime() + 2 * 3600000).toISOString();
  const startTime = new Date(baseTime.getTime() + 3 * 3600000).toISOString();
  const endTime = new Date(baseTime.getTime() + 8 * 3600000).toISOString();
  const earliestPickup = new Date(baseTime.getTime() + 24 * 3600000).toISOString();
  const latestPickup = new Date(baseTime.getTime() + 28 * 3600000).toISOString();
  const earliestDelivery = new Date(baseTime.getTime() + 48 * 3600000).toISOString();
  const latestDelivery = new Date(baseTime.getTime() + 54 * 3600000).toISOString();

  let requiredVehicleType = "Xe tải thùng kín";
  let requiredVehicleDims = { length: 6.2, width: 2.1, height: 2.2 };
  if (shipment.goodsType.includes("Sắt thép") || shipment.goodsType.includes("Nông sản")) {
    requiredVehicleType = "Xe tải thùng bạt";
    requiredVehicleDims = { length: 9.6, width: 2.4, height: 2.5 };
  } else if (shipment.goodsType.includes("đông lạnh") || shipment.goodsType.includes("Trái cây")) {
    requiredVehicleType = "Xe tải container lạnh";
    requiredVehicleDims = { length: 12.0, width: 2.4, height: 2.6 };
  }

  const auctionType = shipment.auctionType || (shipment.id === "LH-2026-9042" || shipment.id === "LH-2026-9048" ? "SEALED" : "PUBLIC");

  return {
    ...shipment,
    auctionType,
    auctionCreator: "Công ty Cổ phần Sữa Việt Nam (Vinamilk)",
    regStartTime,
    regEndTime,
    startTime,
    endTime,
    priceStep: 100000,
    maxBids: 5,
    participationFee: 50000,
    depositAmount: Math.floor(shipment.maxPrice * 0.1),
    requiredVehicleType,
    requiredVehicleDims,
    earliestPickup,
    latestPickup,
    earliestDelivery,
    latestDelivery,
    goodsCategory: shipment.goodsType.includes("đông lạnh") ? "Hàng đông lạnh" 
                 : shipment.goodsType.includes("Hóa chất") ? "Hàng hóa chất nguy hiểm"
                 : shipment.goodsType.includes("Sắt thép") ? "Hàng siêu trường siêu trọng"
                 : "Hàng bách hóa",
    requiredTemp: shipment.goodsType.includes("đông lạnh") ? -18 
                : shipment.goodsType.includes("Trái cây") ? 5 
                : null,
    goodsValue: shipment.maxPrice * 15,
    goodsNotes: "Yêu cầu bốc xếp cẩn thận. Lái xe tự chuẩn bị dây tăng đai chằng buộc.",
  };
};

export default function LiveBiddingRoom({ params }) {
  const { id } = params;
  const rawShipment = MOCK_SHIPMENTS_MAP[id] || MOCK_SHIPMENTS_MAP["LH-2026-9041"];
  const shipment = enrichShipmentDetails(rawShipment);
  
  const isSealed = shipment && shipment.auctionType === "SEALED";

  // Simulated state
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [currentLowestBid, setCurrentLowestBid] = useState(shipment ? shipment.maxPrice - 600000 : 5500000);
  const [myBid, setMyBid] = useState(shipment ? shipment.maxPrice - 800000 : 5400000);
  const [bidHistory, setBidHistory] = useState(() => {
    if (isSealed) {
      return [
        { id: 1, bidder: "Bạn (Tôi)", amount: shipment ? shipment.maxPrice - 800000 : 5400000, time: "8 phút trước", isMe: true }
      ];
    }
    return [
      { id: 1, bidder: "Nhà xe H***", amount: shipment ? shipment.maxPrice - 600000 : 5500000, time: "Vừa xong" },
      { id: 2, bidder: "Vận tải T***", amount: shipment ? shipment.maxPrice - 400000 : 5800000, time: "1 phút trước" },
      { id: 3, bidder: "Logistics V***", amount: shipment ? shipment.maxPrice - 200000 : 6000000, time: "3 phút trước" },
      { id: 4, bidder: "Nhà xe Phát Tài", amount: shipment ? shipment.maxPrice - 100000 : 6100000, time: "5 phút trước" },
      { id: 5, bidder: "Vận tải Tiến Đạt", amount: shipment ? shipment.maxPrice - 50000 : 6250000, time: "8 phút trước" },
      { id: 7, bidder: "Nhà xe Q***", amount: shipment ? shipment.maxPrice : 6500000, time: "15 phút trước" },
    ];
  });

  const latestBidRef = useRef(currentLowestBid);
  useEffect(() => {
    latestBidRef.current = currentLowestBid;
  }, [currentLowestBid]);

  // Timer and Bot Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prevTime) => {
        const newTime = prevTime > 0 ? prevTime - 1 : 0;
        
        // 40% chance to have a new bid every second if time > 10 and not sealed
        if (!isSealed && newTime > 10 && Math.random() > 0.6) {
          const prevBid = latestBidRef.current;
          
          if (prevBid >= 4000000) {
            const drop = Math.floor(Math.random() * 2 + 1) * 50000;
            const newBid = prevBid - drop;
            
            setCurrentLowestBid(newBid);
            setBidHistory(history => [
              { id: Date.now() + Math.random(), bidder: `Nhà xe ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}***`, amount: newBid, time: "Vừa xong" },
              ...history
            ]);
          }
        }
        
        return newTime;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isSealed]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleQuickBid = (dropAmount) => {
    if (isSealed) {
      setMyBid(myBid - dropAmount);
    } else {
      setMyBid(currentLowestBid - dropAmount);
    }
  };

  const handleSubmitBid = () => {
    if (isSealed) {
      if (myBid > shipment.maxPrice) {
        alert("Giá thầu không được vượt quá giá trần!");
        return;
      }
    } else {
      if (myBid >= currentLowestBid) {
        alert("Giá thầu phải thấp hơn giá hiện tại!");
        return;
      }
      setCurrentLowestBid(myBid);
    }
    setBidHistory((history) => [
      { id: Date.now(), bidder: "Bạn (Tôi)", amount: myBid, time: "Vừa xong", isMe: true },
      ...history,
    ]);
    alert("Đặt giá thầu thành công!");
  };

  return (
    <Box className="animate-fade-in-up pb-10">
      <PageHeader 
        title="Theo dõi phiên đấu giá"
        breadcrumbs={[
          { label: "Trang chủ", path: "/carrier/dashboard" },
          { label: "Vận hành", path: "#" },
          { label: "Đấu giá", path: "/carrier/auctions" },
          { label: id, path: "#" }
        ]}
      />

      <Grid container spacing={3}>
        {/* LEO BOARD - Thông tin & Lịch sử */}
        <Grid item xs={12} lg={7}>
          <Box className="flex flex-col gap-6">
            <Card className="glass border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm">
              <Box className="bg-[#1B4965] text-white p-5 flex justify-between items-center relative overflow-hidden">
                <Box className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4">
                  <LocalShippingIcon sx={{ fontSize: 120 }} />
                </Box>
                <Box className="relative z-10">
                  <Typography variant="caption" className="uppercase tracking-widest opacity-80 font-semibold block mb-1">
                    Phiên đấu giá
                  </Typography>
                  <Typography variant="h5" className="font-bold">
                    {id}
                  </Typography>
                  <Box className="flex items-center gap-2 mt-2 opacity-90">
                    <LocationOnIcon fontSize="small" />
                    <Typography variant="body2">
                      {shipment.from.name.split(" - ").pop()} → {shipment.to.name.split(" - ").pop()}
                    </Typography>
                  </Box>
                </Box>
                
                <Box className="relative z-10 text-right">
                  <Chip 
                    icon={<TimerIcon className="!text-white" />} 
                    label={formatTime(timeLeft)} 
                    className={`!font-bold !text-lg !px-2 ${timeLeft < 60 ? 'bg-red-500 animate-pulse' : 'bg-white/20'}`}
                    sx={{ color: "white" }}
                  />
                  <Typography variant="caption" className="block mt-2 opacity-80">
                    Thời gian còn lại
                  </Typography>
                </Box>
              </Box>

              <CardContent className="!p-6 space-y-6">
                {/* Category 1: Yêu cầu & Cấu hình Đấu giá (16 fields) */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <span className="text-[#1B4965] font-black text-sm uppercase tracking-wider">
                      1. Yêu cầu & Cấu hình Đấu giá
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[0.8rem]">
                    <div className="space-y-2 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Người tạo phiên:</span>
                        <span className="font-bold text-slate-700">{shipment.auctionCreator}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Mở đăng ký:</span>
                        <span className="font-bold text-slate-700">{new Date(shipment.regStartTime).toLocaleString("vi-VN")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Đóng đăng ký:</span>
                        <span className="font-bold text-slate-700">{new Date(shipment.regEndTime).toLocaleString("vi-VN")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Bắt đầu đấu giá:</span>
                        <span className="font-bold text-slate-700">{new Date(shipment.startTime).toLocaleString("vi-VN")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Kết thúc đấu giá:</span>
                        <span className="font-bold text-slate-700">{new Date(shipment.endTime).toLocaleString("vi-VN")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Giá trần tối đa:</span>
                        <span className="font-bold text-[#1B4965]">{formatCurrency(shipment.maxPrice)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Bước giá tối thiểu:</span>
                        <span className="font-bold text-slate-700">{formatCurrency(shipment.priceStep)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Số lượt giá tối đa:</span>
                        <span className="font-bold text-slate-700">{shipment.maxBids} lần/nhà xe</span>
                      </div>
                    </div>

                    <div className="space-y-2 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Phí tham gia:</span>
                        <span className="font-bold text-slate-700">{formatCurrency(shipment.participationFee)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Tiền đặt cọc trước:</span>
                        <span className="font-bold text-amber-600" title="Hoàn lại khi hoàn thành giao hàng">{formatCurrency(shipment.depositAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Loại xe yêu cầu:</span>
                        <span className="font-bold text-slate-700 bg-sky-50 px-2 py-0.5 rounded text-sky-700">{shipment.requiredVehicleType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Kích thước lòng thùng:</span>
                        <span className="font-bold text-slate-700">
                          {shipment.requiredVehicleDims.length}m x {shipment.requiredVehicleDims.width}m x {shipment.requiredVehicleDims.height}m
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Nhận sớm nhất:</span>
                        <span className="font-bold text-slate-700">{new Date(shipment.earliestPickup).toLocaleString("vi-VN")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Nhận trễ nhất:</span>
                        <span className="font-bold text-slate-700">{new Date(shipment.latestPickup).toLocaleString("vi-VN")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Giao sớm nhất:</span>
                        <span className="font-bold text-slate-700">{new Date(shipment.earliestDelivery).toLocaleString("vi-VN")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Giao trễ nhất:</span>
                        <span className="font-bold text-slate-700">{new Date(shipment.latestDelivery).toLocaleString("vi-VN")}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Category 2: Chi tiết lô hàng & Quy cách (9 fields) */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <span className="text-[#1B4965] font-black text-sm uppercase tracking-wider">
                      2. Chi tiết lô hàng & Quy cách
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[0.8rem]">
                    <div className="space-y-2 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Phân loại hàng:</span>
                        <span className="font-bold text-slate-700 bg-emerald-50 px-2 py-0.5 rounded text-emerald-700">{shipment.goodsCategory}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Kích thước (D x R x C):</span>
                        <span className="font-bold text-slate-700">
                          {shipment.volume.includes("28") ? "6.0m x 2.0m x 2.2m" : shipment.volume.includes("45") ? "7.2m x 2.2m x 2.3m" : "Chưa xác định"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Tổng trọng lượng:</span>
                        <span className="font-bold text-slate-700">{shipment.weight}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Tổng thể tích:</span>
                        <span className="font-bold text-slate-700">{shipment.volume}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Nhiệt độ bảo quản:</span>
                        <span className="font-bold text-rose-650">{shipment.requiredTemp !== null ? `${shipment.requiredTemp} °C` : "Bình thường"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Giá trị ước tính:</span>
                        <span className="font-bold text-slate-700">{formatCurrency(shipment.goodsValue)}</span>
                      </div>
                      <div className="flex flex-col gap-1 pt-1">
                        <span className="text-slate-400">Ghi chú bốc xếp:</span>
                        <span className="text-slate-600 bg-white p-2 rounded-lg border border-slate-100 italic">{shipment.description}</span>
                      </div>
                    </div>

                    <div className="space-y-4 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
                      <div>
                        <Typography className="!text-[0.7rem] text-sky-600 font-bold uppercase tracking-wider">Địa điểm bốc hàng (A)</Typography>
                        <Typography variant="body2" className="text-slate-800 font-bold !mt-0.5">{shipment.from.name}</Typography>
                        <Typography variant="caption" className="text-slate-500 block leading-tight">{shipment.from.address}</Typography>
                      </div>

                      <div className="border-t border-slate-100 pt-2">
                        <Typography className="!text-[0.7rem] text-emerald-600 font-bold uppercase tracking-wider">Địa điểm giao trả (B)</Typography>
                        <Typography variant="body2" className="text-slate-800 font-bold !mt-0.5">{shipment.to.name}</Typography>
                        <Typography variant="caption" className="text-slate-500 block leading-tight">{shipment.to.address}</Typography>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

          {/* Bản đồ tuyến đường (Placeholder) */}
          <Card className="glass border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm">
            <Box className="h-[300px] w-full bg-slate-100 relative">
              <iframe 
                width="100%" 
                height="100%" 
                frameBorder="0" 
                scrolling="no" 
                marginHeight="0" 
                marginWidth="0" 
                src="https://www.openstreetmap.org/export/embed.html?bbox=105.6%2C9.9%2C106.8%2C11.0&amp;layer=mapnik&amp;marker=10.82%2C106.63"
                title="Bản đồ tuyến đường"
              ></iframe>
              <Box className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur p-4 rounded-xl shadow-lg border border-slate-100 flex justify-between items-center">
                <Box>
                  <Typography variant="caption" className="text-slate-500 block">Khoảng cách dự kiến</Typography>
                  <Typography variant="body2" className="font-bold text-slate-800">~ 165 km</Typography>
                </Box>
                <Divider orientation="vertical" flexItem className="opacity-50" />
                <Box>
                  <Typography variant="caption" className="text-slate-500 block">Thời gian di chuyển</Typography>
                  <Typography variant="body2" className="font-bold text-slate-800">3 giờ 30 phút</Typography>
                </Box>
                <Divider orientation="vertical" flexItem className="opacity-50" />
                <Box>
                  <Typography variant="caption" className="text-slate-500 block">Tuyến ưu tiên</Typography>
                  <Typography variant="body2" className="font-bold text-slate-800">QL1A - CT01</Typography>
                </Box>
              </Box>
            </Box>
          </Card>
          </Box>
        </Grid>

        {/* BIDDING ARENA - Hành động đặt giá */}
        <Grid item xs={12} lg={5}>
          <Box className="flex flex-col gap-6">
          <Card className={`border rounded-2xl overflow-hidden relative ${
            isSealed 
              ? "border-amber-500/30 shadow-[0_8px_30px_rgba(245,158,11,0.12)]" 
              : "border-[#10B981]/30 shadow-[0_8px_30px_rgba(16,185,129,0.15)]"
          }`}>
            {/* Background Glow */}
            <Box 
              className="absolute top-0 left-0 w-full h-full pointer-events-none" 
              sx={{ 
                background: isSealed 
                  ? "radial-gradient(circle at top right, rgba(245,158,11,0.08), transparent 70%)" 
                  : "radial-gradient(circle at top right, rgba(16,185,129,0.1), transparent 70%)" 
              }} 
            />
            
            <CardContent className="p-6 relative z-10 flex flex-col">
              {isSealed ? (
                <Box className="text-center mb-6 mt-2">
                  <Typography variant="subtitle2" className="text-amber-600 font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 mb-2">
                    <LockIcon fontSize="small" /> Đấu giá kín (Báo giá ẩn)
                  </Typography>
                  <Typography 
                    variant="h3" 
                    className="font-black text-[#1B4965] animate-pulse-glow"
                    key={myBid}
                    sx={{ animation: "pulse 0.5s ease-in-out" }}
                  >
                    {formatCurrency(myBid)}
                  </Typography>
                  <Typography variant="caption" className="text-slate-400 block mt-2">
                    Mức giá đề xuất hiện tại của bạn
                  </Typography>
                  <Box className="mt-4 p-3.5 bg-amber-50/50 border border-amber-100 rounded-2xl flex gap-2.5 items-start text-left">
                    <InfoIcon fontSize="small" className="text-amber-600 mt-0.5" />
                    <Typography variant="caption" className="text-amber-800 leading-normal font-medium">
                      Đây là phiên <strong>Đấu giá kín (Đấu thầu)</strong>. Các nhà xe khác không thể nhìn thấy giá thầu của bạn. Bạn chỉ được xem và điều chỉnh giá thầu của chính mình.
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Box className="text-center mb-6 mt-2">
                  <Typography variant="subtitle2" className="text-[#10B981] font-bold uppercase tracking-widest flex items-center justify-center gap-1 mb-2">
                    <TrendingDownIcon fontSize="small" /> Đang dẫn đầu
                  </Typography>
                  <Typography 
                    variant="h3" 
                    className="font-black text-slate-800 animate-pulse-glow"
                    key={currentLowestBid} // trigger animation on change
                    sx={{ animation: "pulse 0.5s ease-in-out" }}
                  >
                    {formatCurrency(currentLowestBid)}
                  </Typography>
                  <Typography variant="caption" className="text-slate-400 block mt-2">
                    Giá khởi điểm: {formatCurrency(shipment ? shipment.maxPrice : 6500000)}
                  </Typography>
                </Box>
              )}

              <Divider className="opacity-60 mb-6" />

              <Box className="flex-1 flex flex-col gap-4">
                <Box className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex items-center justify-between">
                  <Box>
                    <Typography variant="caption" className="text-slate-500 block">Phương tiện đã đăng ký</Typography>
                    <Typography variant="body2" className="font-bold text-[#1B4965]">29H-123.45 (15 Tấn)</Typography>
                  </Box>
                  <Chip label="Hợp lệ" size="small" color="success" className="!font-medium" />
                </Box>

                <Box>
                  <Typography variant="caption" className="text-slate-500 block mb-2 font-medium">
                    {isSealed ? "Giảm nhanh (so với giá thầu của bạn):" : "Đặt nhanh (so với giá hiện tại):"}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={4}>
                      <Button variant="outlined" color="primary" fullWidth onClick={() => handleQuickBid(100000)} sx={{ borderRadius: "8px" }}>
                        - 100k
                      </Button>
                    </Grid>
                    <Grid item xs={4}>
                      <Button variant="outlined" color="primary" fullWidth onClick={() => handleQuickBid(200000)} sx={{ borderRadius: "8px" }}>
                        - 200k
                      </Button>
                    </Grid>
                    <Grid item xs={4}>
                      <Button variant="outlined" color="primary" fullWidth onClick={() => handleQuickBid(500000)} sx={{ borderRadius: "8px" }}>
                        - 500k
                      </Button>
                    </Grid>
                  </Grid>
                </Box>

                <TextField
                  fullWidth
                  label="Hoặc nhập giá mong muốn"
                  type="number"
                  value={myBid}
                  onChange={(e) => setMyBid(Number(e.target.value))}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">₫</InputAdornment>,
                  }}
                  sx={{ "& .MuiOutlinedInput-root": { borderRadius: "12px", fontSize: "1.2rem", fontWeight: "bold" } }}
                />

                <Button 
                  variant="contained" 
                  fullWidth 
                  size="large"
                  onClick={handleSubmitBid}
                  startIcon={<GavelIcon />}
                  className="!bg-emerald-500 hover:!bg-emerald-600 !text-white"
                  sx={{ 
                    mt: "auto", 
                    py: 1.5, 
                    borderRadius: "12px", 
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    boxShadow: "0 8px 16px rgba(16, 185, 129, 0.25)"
                  }}
                >
                  Chốt Giá Thầu Này
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* LỊCH SỬ ĐẶT GIÁ (Chuyển sang cột phải) */}
          <Card className="border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm">
            <CardContent className="p-6">
              <Typography variant="subtitle2" className="text-slate-500 uppercase tracking-wider mb-4 flex items-center justify-between">
                Lịch sử đặt giá
                <Chip label={`${bidHistory.length} lượt`} size="small" className="!text-[10px] !h-5" />
              </Typography>
              <Box className="space-y-2 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                {bidHistory.map((bid, idx) => (
                  <Box 
                    key={bid.id} 
                    className={`flex items-center justify-between p-3 rounded-xl transition-all ${idx === 0 ? 'animate-flash-highlight border' : 'bg-slate-50 hover:bg-slate-100'}`}
                  >
                    <Box className="flex items-center gap-3">
                      <Avatar sx={{ width: 32, height: 32, bgcolor: bid.isMe ? "#1B4965" : "#94A3B8", fontSize: "0.85rem" }}>
                        {bid.isMe ? "Tôi" : bid.bidder.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" className={`font-bold ${bid.isMe ? 'text-[#1B4965]' : 'text-slate-700'}`}>
                          {bid.bidder}
                        </Typography>
                        <Typography variant="caption" className="text-slate-400 block -mt-0.5">{bid.time}</Typography>
                      </Box>
                    </Box>
                    <Typography variant="body2" className={`font-black ${idx === 0 ? 'text-emerald-600 text-base' : 'text-slate-600'}`}>
                      {formatCurrency(bid.amount)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
