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

export const getParticipationFeeQuote = (maxPrice) => {
  const value = Number(maxPrice) || 0;

  if (value <= 2000000) return { tier: "LEVEL_1", amount: 10000 };
  if (value <= 5000000) return { tier: "LEVEL_2", amount: 20000 };
  if (value <= 15000000) return { tier: "LEVEL_3", amount: 50000 };
  if (value <= 50000000) return { tier: "LEVEL_4", amount: 100000 };
  return { tier: "LEVEL_5", amount: 200000 };
};

export const INITIAL_FORM_STATE = {
  // Step 1: Goods Info
  goodsName: "",
  goodsCategory: "",
  weight: "",
  volume: "",
  goodsValue: "",
  requiredVehicleType: "",
  vehicleLength: "",
  vehicleWidth: "",
  vehicleHeight: "",
  requiredTemp: "",
  description: "",
  images: [],

  // Step 2: Route Info (Pickup A -> Delivery B)
  fromLocationName: "",
  fromAddress: "",
  fromProvince: "",
  fromContactName: "",
  fromContactPhone: "",

  toLocationName: "",
  toAddress: "",
  toProvince: "",
  toContactName: "",
  toContactPhone: "",

  earliestPickup: "",
  latestPickup: "",
  earliestDelivery: "",
  latestDelivery: "",

  // Step 3: Auction Config
  auctionType: "PUBLIC", // "PUBLIC" | "SEALED"
  maxPrice: 12500000,
  priceStep: 100000,
  participationFee: 50000,
  isDepositRequired: true,
  depositAmount: 1250000,
  maxBids: 5,

  regStartTime: "2026-08-08T12:00",
  regEndTime: "2026-08-08T14:00",
  startTime: "2026-08-08T15:00",
  endTime: "2026-08-08T16:00",
  auctionType: "PUBLIC", // Default to PUBLIC
  maxPrice: "",
  priceStep: "",
  participationFee: "",
  depositAmount: "",
  maxBids: "",

  regStartTime: "",
  regEndTime: "",
  startTime: "",
  endTime: "",
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
