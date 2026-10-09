"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import { KeyValueList, Panel, RouteLine, StatusBadge } from "@/components/ui";
import { formatCurrency, getParticipationFeeQuote, getCreationFeeQuote, VEHICLE_TYPES } from "./mockData";

export default function SummarySidebar({ form }) {
  const vehicleLabel = VEHICLE_TYPES.find((item) => item.value === form.requiredVehicleType)?.label;
  const hasPrice = Number(form.maxPrice) > 0;
  const size = [form.vehicleLength, form.vehicleWidth, form.vehicleHeight];
  return (
    <Panel title="Kiểm tra phiên vận chuyển" sx={{ position: { md: "sticky" }, top: 24 }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Typography sx={{ fontWeight: 700, overflowWrap: "anywhere" }}>{form.goodsName || "Chưa đặt tên lô hàng"}</Typography>
        <StatusBadge tone="brand" label={form.auctionType === "SEALED" ? "Đấu giá kín" : "Đấu giá công khai"} />
        <RouteLine compact from={form.fromLocationName || form.fromProvince || "Chưa chọn điểm lấy"} to={form.toLocationName || form.toProvince || "Chưa chọn điểm giao"} />
        <KeyValueList columns={1} items={[
          { label: "Loại hàng", value: form.goodsCategory || "Chưa chọn" },
          { label: "Khối lượng / thể tích", value: `${form.weight || "—"} tấn / ${form.volume || "—"} m³`, numeric: true },
          { label: "Phương tiện", value: vehicleLabel || "Chưa chọn" },
          { label: "Kích thước thùng tối thiểu", value: size.every((value) => Number(value) > 0) ? size.map((value) => `${value} m`).join(" × ") : "Chưa nhập", numeric: true },
        ]} />
        <Divider />
        <KeyValueList columns={1} items={[
          { label: "Giá trần", value: hasPrice ? formatCurrency(form.maxPrice) : "Chưa nhập", numeric: true, strong: true },
          { label: "Bước giảm tối thiểu", value: Number(form.priceStep) > 0 ? formatCurrency(form.priceStep) : "Chưa nhập", numeric: true },
          { label: "Phí tạo phiên dự kiến (Chủ hàng)", value: hasPrice ? formatCurrency(getCreationFeeQuote(form.maxPrice).amount) : "Nhập giá trần để tính", numeric: true },
          { label: "Phí tham gia dự kiến (Chủ xe)", value: hasPrice ? formatCurrency(getParticipationFeeQuote(form.maxPrice).amount) : "Nhập giá trần để tính", numeric: true },
          { label: "Đặt cọc của Chủ xe", value: form.isDepositRequired !== false ? formatCurrency(form.depositAmount) : "Không yêu cầu", numeric: true },
        ]} />
        <Typography variant="body2" color="text.secondary">Thông tin chưa được lưu. Kiểm tra các bước và xác nhận tạo phiên để gửi lên hệ thống.</Typography>
      </Box>
    </Panel>
  );
}
