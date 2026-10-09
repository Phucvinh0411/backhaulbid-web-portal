"use client";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import { RouteLine, StatusBadge } from "@/components/ui";
import { AUCTION_TYPE_META, getVehicleTypeLabel } from "@/lib/statusMeta";
import { formatDateTime, formatMoney, formatWeight, shortId } from "@/lib/format";

function placeName(location, fallback) {
  if (!location) return fallback || "";
  const name = location.locationName || location.name;
  return [name, location.province].filter(Boolean).join(", ") || fallback || "";
}

/** The one time fact that matters for the auction's current phase. */
export function getAuctionTimeline(auction, now = Date.now()) {
  const at = (value) => (value ? new Date(value).getTime() : NaN);
  if (auction.status === "PENDING") {
    if (auction.registrationOpen && at(auction.registrationEndTime) > now) {
      return { label: "Đóng đăng ký", value: formatDateTime(auction.registrationEndTime) };
    }
    return { label: "Mở phiên lúc", value: formatDateTime(auction.startTime) };
  }
  if (auction.status === "OPEN") return { label: "Kết thúc lúc", value: formatDateTime(auction.endTime) };
  if (auction.status === "COMPLETED") return { label: "Đã kết thúc", value: formatDateTime(auction.endTime) };
  return null;
}

/**
 * Canonical auction card shared by shipper and carrier lists.
 * `auction` is the bidding-service auction as returned by the API; role screens
 * pass the status they want to emphasise (`status` meta), an optional `note`
 * (the next step for this user) and their own `actions`.
 */
export default function AuctionSessionCard({ auction, status, note, noteTone = "neutral", actions, onOpen, extraFacts = [] }) {
  const typeMeta = AUCTION_TYPE_META[auction.auctionType] || AUCTION_TYPE_META.PUBLIC;
  const timeline = getAuctionTimeline(auction);
  const facts = [
    { label: "Giá trần", value: formatMoney(auction.maxPrice) },
    timeline,
    ...extraFacts,
  ].filter(Boolean);

  const title = auction.title || auction.goodsType || "Lô hàng";
  const Heading = onOpen ? ButtonBase : Box;

  return (
    <Box
      component="article"
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        "&:hover": { borderColor: "var(--color-line-strong)" },
      }}
    >
      <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1.25, flex: 1 }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, alignItems: "center" }}>
          {status && <StatusBadge size="sm" meta={status} />}
          <StatusBadge size="sm" tone="neutral" icon={auction.auctionType === "SEALED" ? "lock" : "public"} label={typeMeta.label} />
          <Typography component="span" variant="caption" className="tabular" sx={{ color: "text.secondary", ml: "auto" }} title={`Mã phiên ${auction.id}`}>
            #{shortId(auction.id)}
          </Typography>
        </Box>

        <Heading
          onClick={onOpen}
          sx={{ display: "block", textAlign: "left", borderRadius: 1, "&.Mui-focusVisible": { outline: "2px solid var(--color-focus)" } }}
        >
          <RouteLine
            compact
            component="h3"
            from={placeName(auction.pickupLocation, auction.originProvince || auction.origin)}
            to={placeName(auction.deliveryLocation, auction.destinationProvince || auction.destination)}
          />
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.25, overflowWrap: "anywhere" }}>
            {title}
            {auction.goodsType && auction.goodsType !== title ? ` · ${auction.goodsType}` : ""} · {formatWeight(auction.weight)}
            {auction.vehicleTypeRequired ? ` · ${getVehicleTypeLabel(auction.vehicleTypeRequired)}` : ""}
          </Typography>
        </Heading>

        <Box component="dl" sx={{ m: 0, display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 1 }}>
          {facts.map((fact) => (
            <Box key={fact.label} sx={{ minWidth: 0 }}>
              <Typography component="dt" variant="caption" sx={{ color: "text.secondary" }}>
                {fact.label}
              </Typography>
              <Typography component="dd" className="tabular" sx={{ m: 0, fontWeight: 700, fontSize: "0.875rem", color: fact.tone === "success" ? "success.main" : "text.primary" }}>
                {fact.value}
              </Typography>
            </Box>
          ))}
        </Box>

        {note && (
          <Box sx={{ mt: "auto" }}>
            <StatusBadge size="sm" tone={noteTone} label={note} sx={{ whiteSpace: "normal" }} />
          </Box>
        )}
      </Box>

      {actions && (
        <Box sx={{ display: "flex", gap: 1, px: 2, py: 1.5, borderTop: "1px solid", borderColor: "divider", "& > *": { flex: 1 } }}>
          {actions}
        </Box>
      )}
    </Box>
  );
}
