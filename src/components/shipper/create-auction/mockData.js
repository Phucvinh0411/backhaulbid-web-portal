// ─────────────────────────────────────────────────────────────────
// Mock presets, static options, and helper utilities for Create Auction
// ─────────────────────────────────────────────────────────────────

export const MOCK_ADDRESS_BOOK = [
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
  },
];

export const GOODS_CATEGORIES = [
  "Linh kiện điện tử",
  "Thực phẩm đông lạnh",
  "Nông sản khô",
  "Vật liệu xây dựng",
  "Hàng tiêu dùng nhanh (FMCG)",
  "Hóa chất & Sơn",
  "Bao bì & Giấy",
  "Khác",
];

export const VEHICLE_TYPES = [
  "Xe tải thùng kín",
  "Xe tải thùng bạt",
  "Xe tải container lạnh",
  "Xe đầu kéo rơ-móoc sàn",
  "Xe tải siêu trường siêu trọng",
];

export const INITIAL_FORM_STATE = {
  // Step 1: Goods Info
  goodsName: "Linh kiện điện tử (Màn hình điện thoại)",
  goodsCategory: "Linh kiện điện tử",
  weight: 5.2,
  volume: 28,
  goodsValue: 180000000,
  requiredVehicleType: "Xe tải thùng kín",
  vehicleLength: 6.2,
  vehicleWidth: 2.1,
  vehicleHeight: 2.2,
  requiredTemp: "",
  description: "Hàng linh kiện đóng pallet gỗ tissue chuẩn. Yêu cầu xe thùng kín bảo ôn chống ẩm.",
  images: [],

  // Step 2: Route Info (Pickup A -> Delivery B)
  fromLocationName: "Kho Samsung Yên Bình - Thái Nguyên",
  fromAddress: "Cổng số 3, KCN Yên Bình, Phổ Yên",
  fromProvince: "Thái Nguyên",
  fromContactName: "Trần Thế Hải",
  fromContactPhone: "0912.345.678",

  toLocationName: "Kho Cảng Đình Vũ - Hải Phòng",
  toAddress: "Cầu cảng số 2, Cảng Đình Vũ, Đông Hải 2, Hải An",
  toProvince: "Hải Phòng",
  toContactName: "Phạm Hồng Minh",
  toContactPhone: "0904.445.555",

  earliestPickup: "2026-07-24T08:00",
  latestPickup: "2026-07-24T12:00",
  earliestDelivery: "2026-07-25T10:00",
  latestDelivery: "2026-07-25T16:00",

  // Step 3: Auction Config
  auctionType: "PUBLIC", // "PUBLIC" | "SEALED"
  maxPrice: 12500000,
  priceStep: 100000,
  participationFee: 50000,
  depositAmount: 1250000,
  maxBids: 5,

  regStartTime: "2026-07-23T12:00",
  regEndTime: "2026-07-23T14:00",
  startTime: "2026-07-23T15:00",
  endTime: "2026-07-23T16:00",
};

export const formatCurrency = (val) => {
  if (!val || isNaN(val)) return "0 đ";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" })
    .format(val)
    .replace("₫", "đ");
};

export const formatDisplayNumber = (val) => {
  if (!val || isNaN(val) || val <= 0) return "";
  return new Intl.NumberFormat("vi-VN").format(val);
};

export const parseDisplayNumber = (str) => {
  if (!str) return 0;
  return Number(str.replace(/[.\s]/g, "").replace(/[^0-9]/g, "")) || 0;
};
