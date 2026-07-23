// Mock Data mapping representing professional logistics operations
export const AUCTION_SHIPMENTS_MAP = {
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

export const enrichShipmentDetails = (shipment) => {
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

export const getCarrierDetails = (bid) => {
  if (!bid) return null;
  
  const carrierDatabase = {
    "Công ty Vận tải Phước An": {
      code: "CARRIER-PA-8839",
      avatar: "PA",
      badge: "Nhà xe Kim Cương",
      verified: true,
      completedTrips: 1420,
      onTimeRate: "99.4%",
      cancellationRate: "0.2%",
      vehiclePlate: "29H-842.19",
      vehicleType: "Xe tải 8.5 tấn (Thùng kín bảo ôn)",
      vehicleDims: "6.8m x 2.2m x 2.3m",
      vehicleVolume: "34.4 m³",
      vehiclePayload: "8.5 tấn",
      vehicleBrand: "Hino 500 Series (2024)",
      driverName: "Nguyễn Văn Hùng",
      driverBirthYear: "1986",
      driverPhone: "0988.123.456",
      driverLicense: "Bằng FC",
      insuranceAmount: "2.0 Tỷ VNĐ",
      address: "KCN Yên Bình, Phổ Yên, Thái Nguyên",
      taxCode: "0108942156",
      foundingYear: "2015",
      fleetSize: "48 xe tải các loại",
    },
    "Vận tải Đông Lạnh Meito": {
      code: "CARRIER-MEITO-902",
      avatar: "MT",
      badge: "Nhà xe Kim Cương",
      verified: true,
      completedTrips: 2150,
      onTimeRate: "99.8%",
      cancellationRate: "0.1%",
      vehiclePlate: "51D-923.44",
      vehicleType: "Container lạnh 40ft (-18°C)",
      vehicleDims: "12.0m x 2.4m x 2.6m",
      vehicleVolume: "74.8 m³",
      vehiclePayload: "28.0 tấn",
      vehicleBrand: "Hyundai Xcient Cold (2023)",
      driverName: "Trần Quốc Tuấn",
      driverBirthYear: "1982",
      driverPhone: "0912.889.341",
      driverLicense: "Bằng FC",
      insuranceAmount: "5.0 Tỷ VNĐ",
      address: "KCN Tân Bình, TP. Hồ Chí Minh",
      taxCode: "0314892011",
      foundingYear: "2012",
      fleetSize: "75 xe lạnh",
    },
    "Logistics Bắc Nam T&T": {
      code: "CARRIER-[#1B4965]-TT",
      avatar: "TT",
      badge: "Nhà xe Vàng",
      verified: true,
      completedTrips: 890,
      onTimeRate: "98.7%",
      cancellationRate: "0.5%",
      vehiclePlate: "30F-112.88",
      vehicleType: "Xe tải 10 tấn thùng bạt",
      vehicleDims: "9.6m x 2.4m x 2.5m",
      vehicleVolume: "57.6 m³",
      vehiclePayload: "10.0 tấn",
      vehicleBrand: "Isuzu Giga (2022)",
      driverName: "Lê Hoàng Nam",
      driverBirthYear: "1990",
      driverPhone: "0934.567.890",
      driverLicense: "Bằng FC",
      insuranceAmount: "1.5 Tỷ VNĐ",
      address: "Quận Hoàng Mai, Hà Nội",
      taxCode: "0107728192",
      foundingYear: "2018",
      fleetSize: "32 xe",
    },
    "Hợp tác xã Vận tải Hữu Nghị": {
      code: "CARRIER-HN-441",
      avatar: "HN",
      badge: "Nhà xe Vàng",
      verified: true,
      completedTrips: 1840,
      onTimeRate: "98.9%",
      cancellationRate: "0.3%",
      vehiclePlate: "51C-777.45",
      vehicleType: "Xe tải 5 tấn thùng kín",
      vehicleDims: "6.2m x 2.1m x 2.2m",
      vehicleVolume: "28.6 m³",
      vehiclePayload: "5.0 tấn",
      vehicleBrand: "Thaco Ollin 700",
      driverName: "Trần Văn Bình",
      driverBirthYear: "1988",
      driverPhone: "0918.222.333",
      driverLicense: "Bằng C",
      insuranceAmount: "1.0 Tỷ VNĐ",
      address: "Quận Bình Tân, TP. Hồ Chí Minh",
      taxCode: "0312948123",
      foundingYear: "2014",
      fleetSize: "60 xe",
    },
    "Vận tải Nội Bài Express": {
      code: "CARRIER-[#1B4965]-NB",
      avatar: "NB",
      badge: "Nhà xe Bạc",
      verified: true,
      completedTrips: 450,
      onTimeRate: "97.8%",
      cancellationRate: "0.8%",
      vehiclePlate: "88C-452.10",
      vehicleType: "Xe tải 3.5 tấn thùng mui bạt",
      vehicleDims: "5.2m x 2.0m x 2.1m",
      vehicleVolume: "21.8 m³",
      vehiclePayload: "3.5 tấn",
      vehicleBrand: "Hyundai Mighty EX8",
      driverName: "Phạm Minh Đức",
      driverBirthYear: "1994",
      driverPhone: "0976.432.109",
      driverLicense: "Bằng C",
      insuranceAmount: "1.0 Tỷ VNĐ",
      address: "Huyện Sóc Sơn, Hà Nội",
      taxCode: "0109283741",
      foundingYear: "2020",
      fleetSize: "18 xe",
    }
  };

  const defaultDetails = {
    code: `CARRIER-${(bid.id || "BID").toUpperCase()}`,
    avatar: bid.carrierName ? bid.carrierName.charAt(0) : "N",
    badge: "Nhà xe Xác Thực",
    verified: true,
    completedTrips: Math.floor((bid.rating || 4.5) * 200),
    onTimeRate: "98.5%",
    cancellationRate: "0.5%",
    vehiclePlate: "29C-567.89",
    vehicleType: "Xe tải thùng bạt kín",
    vehicleDims: "6.5m x 2.1m x 2.2m",
    vehicleVolume: "30.0 m³",
    vehiclePayload: "8.0 tấn",
    vehicleBrand: "Isuzu Forward (2023)",
    driverName: "Phạm Văn Long",
    driverBirthYear: "1989",
    driverPhone: "0905.123.789",
    driverLicense: "Bằng FC",
    insuranceAmount: "1.5 Tỷ VNĐ",
    address: "Hà Nội / TP. Hồ Chí Minh",
    taxCode: "0102938475",
    foundingYear: "2017",
    fleetSize: "25 xe",
  };

  const specific = carrierDatabase[bid.carrierName] || {};
  return {
    ...defaultDetails,
    ...specific,
    ...bid,
  };
};

export const formatCurrency = (val) => {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" })
    .format(val)
    .replace("₫", "đ");
};

export const formatTime = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [
    h.toString().padStart(2, "0"),
    m.toString().padStart(2, "0"),
    s.toString().padStart(2, "0")
  ].join(":");
};
