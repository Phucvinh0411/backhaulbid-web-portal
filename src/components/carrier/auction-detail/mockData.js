// ─────────────────────────────────────────────────────────────────
// Shared mock data and helpers for the Carrier Auction Detail screen
// ─────────────────────────────────────────────────────────────────

export const CARRIER_AUCTION_SHIPMENTS_MAP = {
  "LH-2026-9041": {
    id: "LH-2026-9041",
    goodsType: "Linh kiện điện tử (Màn hình điện thoại)",
    weight: "5.2 tấn", volume: "28 m³", maxPrice: 12500000,
    createdTime: "2026-07-02T10:00:00",
    from: { name: "Kho Samsung Yên Bình - Thái Nguyên", address: "KCN Yên Bình, Phổ Yên, Thái Nguyên" },
    to: { name: "Kho Cảng Đình Vũ - Hải Phòng", address: "Đông Hải 2, Quận Hải An, Hải Phòng" },
    description: "Hàng linh kiện đóng pallet gỗ tissue chuẩn. Yêu cầu xe thùng kín bảo ôn chống ẩm. Đơn vị có đầy đủ hóa đơn chứng từ.",
  },
  "LH-2026-9042": {
    id: "LH-2026-9042", auctionType: "SEALED",
    goodsType: "Thực phẩm đông lạnh (Thủy sản)",
    weight: "8.0 tấn", volume: "45 m³", maxPrice: 28000000,
    createdTime: "2026-07-02T11:30:00",
    from: { name: "Kho Thủy Sản Sông Đốc - Cà Mau", address: "Cụm CN Sông Đốc, Huyện Trần Văn Thời, Cà Mau" },
    to: { name: "Kho Lạnh Transimex - TP. Hồ Chí Minh", address: "Khu Công Nghệ Cao Quận 9, TP. Hồ Chí Minh" },
    description: "Hàng hải sản đông lạnh xuất khẩu. Yêu cầu container lạnh -18°C suốt hành trình. Bàn giao đầy đủ CO/CQ.",
  },
  "LH-2026-9044": {
    id: "LH-2026-9044",
    goodsType: "Vật liệu xây dựng (Sắt thép)",
    weight: "22.5 tấn", volume: "18 m³", maxPrice: 16000000,
    createdTime: "2026-07-01T09:00:00",
    from: { name: "Nhà Máy Thép Hòa Phát - Quảng Ngãi", address: "KCN Dung Quất, Bình Sơn, Quảng Ngãi" },
    to: { name: "Tổng Kho Hòa Khánh - Đà Nẵng", address: "KCN Hòa Khánh, Liên Chiểu, Đà Nẵng" },
    description: "Thép cuộn xây dựng. Yêu cầu xe đầu kéo rơ-moóc sàn có xích neo chằng chịu lực cao. Giao hàng trong giờ hành chính.",
  },
  "LH-2026-9048": {
    id: "LH-2026-9048", auctionType: "SEALED",
    goodsType: "Bao bì carton",
    weight: "2.0 tấn", volume: "35 m³", maxPrice: 6500000,
    createdTime: "2026-07-02T15:00:00",
    from: { name: "Nhà Máy Bao Bì Phố Nối - Hưng Yên", address: "KCN Phố Nối A, Yên Mỹ, Hưng Yên" },
    to: { name: "Nhà Máy Foxconn Quang Châu - Bắc Giang", address: "KCN Quang Châu, Việt Yên, Bắc Giang" },
    description: "Thùng carton phẳng xếp kiện pallet bọc màng co PE. Yêu cầu thùng xe kín hoàn toàn để ngăn nước mưa.",
  },
};

export const enrichCarrierShipment = (shipment) => {
  if (!shipment) return null;
  const base = new Date(shipment.createdTime || "2026-07-02T10:00:00");
  const at = (h) => new Date(base.getTime() + h * 3600000).toISOString();

  let requiredVehicleType = "Xe tải thùng kín";
  let requiredVehicleDims = { length: 6.2, width: 2.1, height: 2.2 };
  if (shipment.goodsType.includes("Sắt thép") || shipment.goodsType.includes("Nông sản")) {
    requiredVehicleType = "Xe tải thùng bạt";
    requiredVehicleDims = { length: 9.6, width: 2.4, height: 2.5 };
  } else if (shipment.goodsType.includes("đông lạnh") || shipment.goodsType.includes("Trái cây")) {
    requiredVehicleType = "Xe tải container lạnh";
    requiredVehicleDims = { length: 12.0, width: 2.4, height: 2.6 };
  }

  const auctionType = shipment.auctionType ||
    (shipment.id === "LH-2026-9042" || shipment.id === "LH-2026-9048" ? "SEALED" : "PUBLIC");

  return {
    ...shipment,
    auctionType,
    auctionCreator: "Công ty Cổ phần Sữa Việt Nam (Vinamilk)",
    regStartTime: at(-2), regEndTime: at(2),
    startTime: at(3), endTime: at(8),
    earliestPickup: at(24), latestPickup: at(28),
    earliestDelivery: at(48), latestDelivery: at(54),
    priceStep: 100000, maxBids: 5,
    participationFee: 50000,
    depositAmount: Math.floor(shipment.maxPrice * 0.1),
    requiredVehicleType, requiredVehicleDims,
    goodsCategory:
      shipment.goodsType.includes("đông lạnh") ? "Hàng đông lạnh"
      : shipment.goodsType.includes("Hóa chất") ? "Hàng hóa chất nguy hiểm"
      : shipment.goodsType.includes("Sắt thép") ? "Hàng siêu trường siêu trọng"
      : "Hàng bách hóa",
    requiredTemp:
      shipment.goodsType.includes("đông lạnh") ? -18
      : shipment.goodsType.includes("Trái cây") ? 5
      : null,
    goodsValue: shipment.maxPrice * 15,
    goodsNotes: "Yêu cầu bốc xếp cẩn thận. Lái xe tự chuẩn bị dây tăng đai chằng buộc.",
  };
};

/** Seed initial bid history for simulation */
export const buildInitialBidHistory = (shipment, isSealed) => {
  const base = shipment.maxPrice;
  if (isSealed) {
    return [{ id: 1, isMe: true, amount: base - 800000, time: "8 phút trước" }];
  }
  return [
    { id: 1, bidder: "Nhà xe H***", amount: base - 600000, time: "Vừa xong" },
    { id: 2, bidder: "Vận tải T***", amount: base - 400000, time: "1 phút trước" },
    { id: 3, bidder: "Logistics V***", amount: base - 200000, time: "3 phút trước" },
    { id: 4, bidder: "Nhà xe P***", amount: base - 100000, time: "5 phút trước" },
    { id: 5, bidder: "Vận tải Q***", amount: base, time: "15 phút trước" },
  ];
};

export const formatCurrency = (val) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" })
    .format(val)
    .replace("₫", "đ");

export const formatTime = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
};
