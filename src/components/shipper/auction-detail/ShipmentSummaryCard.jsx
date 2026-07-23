"use client";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import StatusBadge from "./StatusBadge";
import { formatCurrency } from "./mockData";

export default function ShipmentSummaryCard({ shipment }) {
  if (!shipment) return null;

  return (
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
            <StatusBadge status={shipment.status} />
          </div>
        </div>

        {/* Category 1: Thông tin quan trọng của cuộc đấu giá */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <span className="text-[#1B4965] font-black text-sm uppercase tracking-wider">
              1. Thông tin đấu giá & Yêu cầu vận chuyển
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[0.8rem]">
            <div className="space-y-2 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-400">Người tạo phiên:</span>
                <span className="font-bold text-slate-700">{shipment.auctionCreator || "Công ty TNHH Vận tải & Thương mại Hùng Vương"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Hình thức đấu giá:</span>
                <span className={`font-bold ${shipment.auctionType === "PUBLIC" ? "text-sky-600" : "text-amber-600"}`}>
                  {shipment.auctionType === "SEALED" ? "Đấu giá kín (Báo giá ẩn)" : "Đấu giá công khai"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Thời gian mở đăng ký:</span>
                <span className="font-bold text-slate-700">{new Date(shipment.regStartTime || "2026-07-02T08:00:00").toLocaleString("vi-VN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Thời gian đóng đăng ký:</span>
                <span className="font-bold text-slate-700">{new Date(shipment.regEndTime || "2026-07-02T12:00:00").toLocaleString("vi-VN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Thời gian bắt đầu đấu giá:</span>
                <span className="font-bold text-slate-700">{new Date(shipment.startTime || "2026-07-02T13:00:00").toLocaleString("vi-VN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Thời gian kết thúc đấu giá:</span>
                <span className="font-bold text-slate-700">{new Date(shipment.endTime || "2026-07-02T18:00:00").toLocaleString("vi-VN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Giá trần tối đa:</span>
                <span className="font-bold text-slate-700 text-[#1B4965]">{formatCurrency(shipment.maxPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Bước giá:</span>
                <span className="font-bold text-slate-700">{formatCurrency(shipment.priceStep || 50000)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Số lần ra giá tối đa:</span>
                <span className="font-bold text-slate-700">{shipment.maxBids || 5} lần/nhà xe</span>
              </div>
            </div>

            <div className="space-y-2 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-400">Phí tham gia đấu giá:</span>
                <span className="font-bold text-slate-700">{formatCurrency(shipment.participationFee || 20000)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Tiền đặt trước (Cọc):</span>
                <span className="font-bold text-amber-600" title="Hoàn lại khi giao hàng thành công, đền bù cho chủ hàng nếu bỏ chuyến">{formatCurrency(shipment.depositAmount || 1000000)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Loại xe yêu cầu:</span>
                <span className="font-bold text-slate-700 bg-sky-50 px-2 py-0.5 rounded text-sky-700">{shipment.requiredVehicleType || "Xe tải thùng kín"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Kích thước thùng tối thiểu:</span>
                <span className="font-bold text-slate-700">
                  {shipment.requiredVehicleDims?.length || "6.2"}m x {shipment.requiredVehicleDims?.width || "2.1"}m x {shipment.requiredVehicleDims?.height || "2.2"}m
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Thời gian nhận sớm nhất:</span>
                <span className="font-bold text-slate-700">{new Date(shipment.earliestPickup || "2026-07-04T08:00:00").toLocaleString("vi-VN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Thời gian nhận trễ nhất:</span>
                <span className="font-bold text-slate-700">{new Date(shipment.latestPickup || "2026-07-04T12:00:00").toLocaleString("vi-VN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Thời gian giao sớm nhất:</span>
                <span className="font-bold text-slate-700">{new Date(shipment.earliestDelivery || "2026-07-05T14:00:00").toLocaleString("vi-VN")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Thời gian giao trễ nhất:</span>
                <span className="font-bold text-slate-700">{new Date(shipment.latestDelivery || "2026-07-05T18:00:00").toLocaleString("vi-VN")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category 2: Thông tin chi tiết hàng hóa */}
        <div className="space-y-4 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <span className="text-[#1B4965] font-black text-sm uppercase tracking-wider">
              2. Thông tin chi tiết hàng hóa
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[0.8rem]">
            <div className="space-y-2 bg-slate-50/50 p-3 rounded-2xl border border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-400">Phân loại hàng hóa:</span>
                <span className="font-bold text-slate-700 bg-emerald-50 px-2 py-0.5 rounded text-emerald-700">{shipment.goodsCategory || "Hàng bách hóa"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Kích thước hàng hóa (D x R x C):</span>
                <span className="font-bold text-slate-[#1B4965]">
                  {shipment.volume.includes("28") ? "6.0m x 2.0m x 2.2m" : shipment.volume.includes("45") ? "7.2m x 2.2m x 2.3m" : "Chưa xác định"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Trọng lượng hàng hóa:</span>
                <span className="font-bold text-slate-700">{shipment.weight}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Nhiệt độ yêu cầu:</span>
                <span className="font-bold text-rose-650">{shipment.requiredTemp !== null && shipment.requiredTemp !== undefined ? `${shipment.requiredTemp} °C` : "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Giá trị hàng hóa:</span>
                <span className="font-bold text-slate-700">{formatCurrency(shipment.goodsValue || 500000000)}</span>
              </div>
              <div className="flex flex-col gap-1 pt-1">
                <span className="text-slate-400">Mô tả chi tiết hàng hóa:</span>
                <span className="text-slate-600 bg-white p-2 rounded-lg border border-slate-100 italic">{shipment.description}</span>
              </div>
              {shipment.goodsNotes && (
                <div className="flex flex-col gap-1">
                  <span className="text-[#1B4965] font-bold text-xs">Ghi chú bốc xếp:</span>
                  <span className="text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-100/50">{shipment.goodsNotes}</span>
                </div>
              )}
            </div>

            <div className="space-y-4 bg-slate-50/50 p-3 rounded-2xl border border-slate-100 min-h-full">
              <div>
                <Typography className="!text-[0.7rem] text-sky-600 font-bold uppercase tracking-wide">Địa chỉ chi tiết nơi nhận hàng (A)</Typography>
                <Typography variant="body2" className="text-slate-800 font-bold !mt-0.5">{shipment.from.name}</Typography>
                <Typography variant="caption" className="text-slate-500 block">{shipment.from.address}</Typography>
              </div>

              <div className="border-t border-slate-100 pt-2">
                <Typography className="!text-[0.7rem] text-emerald-600 font-bold uppercase tracking-wide">Địa chỉ chi tiết nơi trả hàng (B)</Typography>
                <Typography variant="body2" className="text-slate-800 font-bold !mt-0.5">{shipment.to.name}</Typography>
                <Typography variant="caption" className="text-slate-500 block">{shipment.to.address}</Typography>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
