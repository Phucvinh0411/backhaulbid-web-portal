"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { KeyValueList, RouteLine } from "@/components/ui";
import { AUCTION_TYPE_META, getVehicleTypeLabel } from "@/lib/statusMeta";
import { formatDateTime, formatMoney, formatTimeWindow, toAmount } from "@/lib/format";

const FALLBACK = "Chưa cung cấp";

function place(location, ...fallbacks) {
  const name = location?.locationName || location?.name;
  const parts = [name, location?.province].filter(Boolean);
  return parts.length ? parts.join(", ") : fallbacks.find(Boolean) || "";
}

function dims(value) {
  if (!value?.length || !value?.width || !value?.height) return null;
  return `${value.length} × ${value.width} × ${value.height} m`;
}

/**
 * Accepts the bidding-service auction (or older mapped shapes) and returns one view
 * model so every auction detail surface shows the same facts.
 */
export const normalizeAuctionDetail = (auction = {}) => {
  const from = auction.from || {};
  const to = auction.to || {};
  const pickup = auction.pickupLocation || {};
  const delivery = auction.deliveryLocation || {};
  const deposit = toAmount(auction.depositAmount) || 0;
  return {
    id: auction.id,
    auctionType: auction.auctionType || "PUBLIC",
    title: auction.title || auction.goodsName,
    goodsType: auction.goodsType || auction.goodsCategory || auction.cargoType,
    weight: auction.weight,
    volume: auction.volume,
    goodsValue: auction.goodsValue,
    requiredTemp: auction.requiredTemp,
    vehicleType: getVehicleTypeLabel(auction.vehicleTypeRequired || auction.requiredVehicleType),
    vehicleDims: dims(auction.requiredVehicleDims || auction.vehicleSpecs),
    notes: auction.notes || auction.goodsNotes || (auction.description !== "Không có ghi chú thêm." ? auction.description : null),
    origin: place(pickup, auction.originLocationName, from.name, auction.origin),
    originAddress: pickup.address || auction.originAddress || from.address,
    destination: place(delivery, auction.destinationLocationName, to.name, auction.destination),
    destinationAddress: delivery.address || auction.destinationAddress || to.address,
    pickupWindow: formatTimeWindow(pickup.earliestTime || auction.earliestPickup, pickup.latestTime || auction.latestPickup, null),
    deliveryWindow: formatTimeWindow(delivery.earliestTime || auction.earliestDelivery, delivery.latestTime || auction.latestDelivery, null),
    maxPrice: auction.maxPrice,
    priceStep: auction.priceStep,
    maxBids: auction.maxBids,
    participationFee: auction.participationFeeAmount ?? auction.participationFee,
    isDepositRequired: Boolean(auction.isDepositRequired || deposit > 0),
    depositAmount: deposit,
    registrationEndTime: auction.registrationEndTime || auction.regEndTime,
    startTime: auction.startTime,
    endTime: auction.endTime,
  };
};

function Section({ title, children }) {
  return (
    <Box component="section" sx={{ py: 2, borderTop: "1px solid", borderColor: "divider", "&:first-of-type": { borderTop: 0, pt: 0 } }}>
      <Typography component="h3" sx={{ fontWeight: 700, fontSize: "0.9375rem", mb: 1.5 }}>
        {title}
      </Typography>
      {children}
    </Box>
  );
}

/** Canonical auction facts: route and time first, then cargo/vehicle, then auction terms. */
export default function AuctionDetailContent({ auction, footer = null }) {
  const detail = normalizeAuctionDetail(auction);
  const typeMeta = AUCTION_TYPE_META[detail.auctionType] || AUCTION_TYPE_META.PUBLIC;

  return (
    <Box>
      <Section title="Tuyến và khung giờ">
        <RouteLine
          from={detail.origin}
          fromDetail={detail.originAddress}
          fromTime={detail.pickupWindow ? `Lấy hàng: ${detail.pickupWindow}` : null}
          to={detail.destination}
          toDetail={detail.destinationAddress}
          toTime={detail.deliveryWindow ? `Giao hàng: ${detail.deliveryWindow}` : null}
        />
      </Section>

      <Section title="Hàng hóa và phương tiện">
        <KeyValueList
          items={[
            { label: "Lô hàng", value: detail.title || FALLBACK },
            { label: "Loại hàng", value: detail.goodsType || FALLBACK },
            { label: "Khối lượng", value: detail.weight ? `${detail.weight} tấn` : FALLBACK, numeric: true },
            { label: "Thể tích", value: detail.volume ? `${detail.volume} m³` : FALLBACK, numeric: true },
            { label: "Loại xe yêu cầu", value: detail.vehicleType || FALLBACK },
            { label: "Kích thước thùng tối thiểu", value: detail.vehicleDims, hidden: !detail.vehicleDims },
            { label: "Nhiệt độ bảo quản", value: detail.requiredTemp ? `${detail.requiredTemp} °C` : "Không yêu cầu" },
            { label: "Giá trị khai báo", value: formatMoney(detail.goodsValue, FALLBACK), numeric: true },
          ]}
        />
        {detail.notes && (
          <Box sx={{ mt: 1.5, p: 1.5, borderRadius: 2, bgcolor: "var(--color-surface-sunken)" }}>
            <Typography variant="caption" sx={{ fontWeight: 600, color: "text.secondary" }}>
              Ghi chú của chủ hàng
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
              {detail.notes}
            </Typography>
          </Box>
        )}
      </Section>

      <Section title="Điều kiện đấu giá">
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 1.5, maxWidth: "70ch" }}>
          {typeMeta.label}: {typeMeta.description} Giá thấp hơn có lợi hơn cho chủ hàng (đấu giá ngược).
        </Typography>
        <KeyValueList
          items={[
            { label: "Giá trần", value: formatMoney(detail.maxPrice), strong: true, numeric: true },
            {
              label: "Bước giảm tối thiểu",
              value: detail.auctionType === "SEALED" ? "Không áp dụng cho đấu giá kín" : formatMoney(detail.priceStep, "Không quy định"),
              numeric: true,
            },
            { label: "Số lượt đặt giá", value: detail.maxBids ? `Tối đa ${detail.maxBids} lượt mỗi nhà xe` : "Không giới hạn" },
            { label: "Phí tham gia", value: formatMoney(detail.participationFee, "Không có"), numeric: true },
            { label: "Tiền đặt cọc", value: detail.isDepositRequired ? formatMoney(detail.depositAmount) : "Không yêu cầu", numeric: true },
            { label: "Đóng đăng ký", value: formatDateTime(detail.registrationEndTime), numeric: true },
            { label: "Bắt đầu", value: formatDateTime(detail.startTime), numeric: true },
            { label: "Kết thúc", value: formatDateTime(detail.endTime), numeric: true },
          ]}
        />
      </Section>

      {footer && <Box sx={{ pt: 2, borderTop: "1px solid", borderColor: "divider" }}>{footer}</Box>}
    </Box>
  );
}
