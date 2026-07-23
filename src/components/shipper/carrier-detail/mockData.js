// Mock Database of Carriers with Comprehensive Enterprise Details
export const CARRIER_DATABASE = {
  "CARRIER-PA-8839": {
    id: "CARRIER-PA-8839",
    code: "CARRIER-PA-8839",
    carrierName: "Công ty Vận tải Phước An",
    representative: "Nguyễn Phước An (Giám đốc Điều hành)",
    avatar: "PA",
    badge: "Nhà xe Kim Cương",
    verified: true,
    rating: 4.95,
    completedTrips: 1420,
    onTimeRate: "99.4%",
    cancellationRate: "0.2%",
    taxCode: "0108942156",
    foundingYear: "2015",
    address: "KCN Yên Bình, Phổ Yên, Thái Nguyên",
    hotline: "0988.123.456",
    email: "contact@phuocanlogistics.vn",
    licenseNo: "GP-VT/2022-881 (Sở GTVT Thái Nguyên)",
    insuranceAmount: "2.0 Tỷ VNĐ",

    fleet: [
      {
        id: "V-01",
        plate: "29H-842.19",
        type: "Xe tải 8.5 tấn (Thùng kín bảo ôn)",
        brand: "Hino 500 Series (2024)",
        dims: "6.8m x 2.2m x 2.3m",
        volume: "34.4 m³",
        payload: "8.5 Tấn",
        gpsActive: true,
        status: "Sẵn sàng điều động",
      },
      {
        id: "V-02",
        plate: "29C-118.90",
        type: "Xe tải 15 tấn (Thùng mui bạt)",
        brand: "Isuzu Giga 4 chân (2023)",
        dims: "9.6m x 2.4m x 2.6m",
        volume: "59.9 m³",
        payload: "15.0 Tấn",
        gpsActive: true,
        status: "Đang di chuyển",
      },
    ],

    drivers: [
      {
        id: "D-01",
        name: "Nguyễn Văn Hùng",
        birthYear: "1986",
        phone: "0988.123.456",
        license: "Bằng FC",
        experience: "12 năm kinh nghiệm đường dài",
        safetyRecord: "100% chuyến an toàn",
      },
      {
        id: "D-02",
        name: "Trần Minh Đức",
        birthYear: "1990",
        phone: "0912.345.678",
        license: "Bằng C",
        experience: "8 năm kinh nghiệm",
        safetyRecord: "100% chuyến an toàn",
      },
    ],

    reviews: [
      {
        id: "R-1",
        shipperName: "Công ty Điện tử Samsung Việt Nam",
        rating: 5,
        date: "2026-07-15",
        comment: "Vận chuyển hàng linh kiện tuyệt đối đúng giờ. Lái xe cẩn thận, hỗ trợ bốc xếp nhiệt tình.",
      },
      {
        id: "R-2",
        shipperName: "Tập đoàn Hòa Phát",
        rating: 5,
        date: "2026-07-02",
        comment: "Nhà xe chuyên nghiệp, GPS theo dõi chuẩn xác từng phút. Giá đấu thầu rất cạnh tranh.",
      },
    ],
  },

  "CARRIER-MEITO-902": {
    id: "CARRIER-MEITO-902",
    code: "CARRIER-MEITO-902",
    carrierName: "Vận tải Đông Lạnh Meito",
    representative: "Trần Nhật Quang (Tổng Giám đốc)",
    avatar: "MT",
    badge: "Nhà xe Kim Cương",
    verified: true,
    rating: 4.98,
    completedTrips: 2150,
    onTimeRate: "99.8%",
    cancellationRate: "0.1%",
    taxCode: "0314892011",
    foundingYear: "2012",
    address: "KCN Tân Bình, TP. Hồ Chí Minh",
    hotline: "0912.889.341",
    email: "contact@meitologistics.com.vn",
    licenseNo: "GP-VT/2021-992 (Sở GTVT TP.HCM)",
    insuranceAmount: "5.0 Tỷ VNĐ",

    fleet: [
      {
        id: "V-M1",
        plate: "51D-923.44",
        type: "Container lạnh 40ft (-18°C)",
        brand: "Hyundai Xcient Cold (2023)",
        dims: "12.0m x 2.4m x 2.6m",
        volume: "74.8 m³",
        payload: "28.0 Tấn",
        gpsActive: true,
        status: "Sẵn sàng điều động",
      },
    ],

    drivers: [
      {
        id: "D-M1",
        name: "Trần Quốc Tuấn",
        birthYear: "1982",
        phone: "0912.889.341",
        license: "Bằng FC",
        experience: "16 năm chạy xe đông lạnh",
        safetyRecord: "100% chuyến an toàn",
      },
    ],

    reviews: [
      {
        id: "R-M1",
        shipperName: "Công ty Nông sản Nông Việt",
        rating: 5,
        date: "2026-07-10",
        comment: "Nhiệt độ thùng lạnh duy trì chuẩn xác -18°C suốt hành trình. Rất yên tâm!",
      },
    ],
  },

  "CARRIER-TT": {
    id: "CARRIER-TT",
    code: "CARRIER-TT",
    carrierName: "Logistics Bắc Nam T&T",
    representative: "Lê Văn Tiến (Giám đốc Điều hành)",
    avatar: "TT",
    badge: "Nhà xe Vàng",
    verified: true,
    rating: 4.87,
    completedTrips: 890,
    onTimeRate: "98.7%",
    cancellationRate: "0.5%",
    taxCode: "0107728192",
    foundingYear: "2018",
    address: "Quận Hoàng Mai, Hà Nội",
    hotline: "0934.567.890",
    email: "contact@ttlogistics.vn",
    licenseNo: "GP-VT/2023-441 (Sở GTVT Hà Nội)",
    insuranceAmount: "1.5 Tỷ VNĐ",

    fleet: [
      {
        id: "V-TT1",
        plate: "30F-112.88",
        type: "Xe tải 10 tấn thùng bạt",
        brand: "Isuzu Giga (2022)",
        dims: "9.6m x 2.4m x 2.5m",
        volume: "57.6 m³",
        payload: "10.0 Tấn",
        gpsActive: true,
        status: "Sẵn sàng điều động",
      },
    ],

    drivers: [
      {
        id: "D-TT1",
        name: "Lê Hoàng Nam",
        birthYear: "1990",
        phone: "0934.567.890",
        license: "Bằng FC",
        experience: "10 năm kinh nghiệm",
        safetyRecord: "100% chuyến an toàn",
      },
    ],

    reviews: [
      {
        id: "R-TT1",
        shipperName: "Kho Vận Hà Nội Express",
        rating: 4.9,
        date: "2026-06-18",
        comment: "Dịch vụ bắc nam chuyên nghiệp, hỗ trợ theo dõi đơn hàng minh bạch.",
      },
    ],
  },

  "CARRIER-HN-441": {
    id: "CARRIER-HN-441",
    code: "CARRIER-HN-441",
    carrierName: "Hợp tác xã Vận tải Hữu Nghị",
    representative: "Trần Văn Nghị (Chủ tịch HTX)",
    avatar: "HN",
    badge: "Nhà xe Vàng",
    verified: true,
    rating: 4.89,
    completedTrips: 1840,
    onTimeRate: "98.9%",
    cancellationRate: "0.3%",
    taxCode: "0312948123",
    foundingYear: "2014",
    address: "Quận Bình Tân, TP. Hồ Chí Minh",
    hotline: "0918.222.333",
    email: "htxhuunghi@gmail.com",
    licenseNo: "GP-VT/2020-112 (Sở GTVT TP.HCM)",
    insuranceAmount: "1.0 Tỷ VNĐ",

    fleet: [
      {
        id: "V-HN1",
        plate: "51C-777.45",
        type: "Xe tải 5 tấn thùng kín",
        brand: "Thaco Ollin 700",
        dims: "6.2m x 2.1m x 2.2m",
        volume: "28.6 m³",
        payload: "5.0 Tấn",
        gpsActive: true,
        status: "Sẵn sàng điều động",
      },
    ],

    drivers: [
      {
        id: "D-HN1",
        name: "Trần Văn Bình",
        birthYear: "1988",
        phone: "0918.222.333",
        license: "Bằng C",
        experience: "9 năm kinh nghiệm",
        safetyRecord: "100% chuyến an toàn",
      },
    ],

    reviews: [
      {
        id: "R-HN1",
        shipperName: "Bao Bì Sài Gòn",
        rating: 4.8,
        date: "2026-07-01",
        comment: "Báo giá nhanh, lái xe thông thuộc đường xá miền Nam.",
      },
    ],
  },

  "CARRIER-NB": {
    id: "CARRIER-NB",
    code: "CARRIER-NB",
    carrierName: "Vận tải Nội Bài Express",
    representative: "Phạm Quốc Tuấn (Giám đốc)",
    avatar: "NB",
    badge: "Nhà xe Bạc",
    verified: true,
    rating: 4.78,
    completedTrips: 450,
    onTimeRate: "97.8%",
    cancellationRate: "0.8%",
    taxCode: "0109283741",
    foundingYear: "2020",
    address: "Huyện Sóc Sơn, Hà Nội",
    hotline: "0976.432.109",
    email: "noibaiexpress@gmail.com",
    licenseNo: "GP-VT/2024-009 (Sở GTVT Hà Nội)",
    insuranceAmount: "1.0 Tỷ VNĐ",

    fleet: [
      {
        id: "V-NB1",
        plate: "88C-452.10",
        type: "Xe tải 3.5 tấn thùng mui bạt",
        brand: "Hyundai Mighty EX8",
        dims: "5.2m x 2.0m x 2.1m",
        volume: "21.8 m³",
        payload: "3.5 Tấn",
        gpsActive: true,
        status: "Sẵn sàng điều động",
      },
    ],

    drivers: [
      {
        id: "D-NB1",
        name: "Phạm Minh Đức",
        birthYear: "1994",
        phone: "0976.432.109",
        license: "Bằng C",
        experience: "6 năm kinh nghiệm",
        safetyRecord: "100% chuyến an toàn",
      },
    ],

    reviews: [
      {
        id: "R-NB1",
        shipperName: "Thời Trang Hàng Hiệu HN",
        rating: 4.7,
        date: "2026-06-25",
        comment: "Giao hàng từ Nội Bài đi nội thành rất nhanh chóng.",
      },
    ],
  },
};

export const getCarrierByCode = (code) => {
  if (!code) return CARRIER_DATABASE["CARRIER-PA-8839"];
  const decodeStr = decodeURIComponent(code).toUpperCase();
  
  // 1. Direct match by exact key
  if (CARRIER_DATABASE[decodeStr]) {
    return CARRIER_DATABASE[decodeStr];
  }

  // 2. Search by matching code or carrierName substring
  const found = Object.values(CARRIER_DATABASE).find(
    (c) =>
      c.code.toUpperCase().includes(decodeStr) ||
      decodeStr.includes(c.code.toUpperCase()) ||
      c.carrierName.toLowerCase().includes(code.toLowerCase()) ||
      code.toLowerCase().includes(c.carrierName.toLowerCase())
  );

  if (found) return found;

  // 3. Fallback dynamic object generated for unknown clicked carrier
  const cleanName = decodeURIComponent(code);
  return {
    id: `CARRIER-${code}`,
    code: code,
    carrierName: cleanName.includes("CARRIER-") ? "Công ty Vận tải Phước An" : cleanName,
    representative: "Nguyễn Văn Đại (Giám đốc Điều hành)",
    avatar: cleanName.charAt(0).toUpperCase() || "N",
    badge: "Nhà xe Xác Thực",
    verified: true,
    rating: 4.85,
    completedTrips: 680,
    onTimeRate: "98.5%",
    cancellationRate: "0.4%",
    taxCode: "0109988776",
    foundingYear: "2019",
    address: "Hà Nội / TP. Hồ Chí Minh",
    hotline: "0905.123.789",
    email: "contact@carrier-partner.vn",
    licenseNo: "GP-VT/2023-999 (Sở GTVT)",
    insuranceAmount: "1.5 Tỷ VNĐ",

    fleet: [
      {
        id: "V-DEF1",
        plate: "29C-567.89",
        type: "Xe tải 8 tấn thùng kín",
        brand: "Isuzu Forward (2023)",
        dims: "6.5m x 2.1m x 2.2m",
        volume: "30.0 m³",
        payload: "8.0 Tấn",
        gpsActive: true,
        status: "Sẵn sàng điều động",
      },
    ],

    drivers: [
      {
        id: "D-DEF1",
        name: "Phạm Văn Long",
        birthYear: "1989",
        phone: "0905.123.789",
        license: "Bằng FC",
        experience: "10 năm kinh nghiệm",
        safetyRecord: "100% chuyến an toàn",
      },
    ],

    reviews: [
      {
        id: "R-DEF1",
        shipperName: "Đối Tác Vận Tải Quốc Tế",
        rating: 4.8,
        date: "2026-07-05",
        comment: "Vận chuyển an toàn, cẩn thận, đúng tiến độ cam kết.",
      },
    ],
  };
};
