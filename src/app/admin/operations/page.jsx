"use client";

import { useCallback, useEffect, useState } from "react";
import { Alert } from "@mui/material";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { AdminPageHeader, AdminPageShell, AdminPrimaryButton } from "@/components/admin/AdminUI";
import AuctionMonitorView from "@/components/admin/AuctionMonitorView";
import { cancelAuction, flagAuction, listAuctions, listBids } from "@/services/biddingApi";
import { getPageItems, unwrapListData } from "@/services/responseData";

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const getTimeRemaining = (endTime) => {
  const remaining = new Date(endTime).getTime() - Date.now();
  if (!Number.isFinite(remaining) || remaining <= 0) return "Đã kết thúc";

  const totalSeconds = Math.floor(remaining / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return hours > 0
    ? `${hours}h ${String(minutes).padStart(2, "0")}p`
    : `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

const getImageSource = (images) => {
  if (!Array.isArray(images)) return null;
  return images.find((image) => typeof image === "string" && image.trim()) || null;
};

const mapAuction = async (auction) => {
  let bids = [];
  let bidError = "";

  try {
    const bidsResponse = await listBids(auction.id, {
      page: 1,
      pageSize: 100,
      sortOrder: "asc",
    });

    bids = unwrapListData(bidsResponse).map((bid) => ({
      time: bid.bidTime
        ? new Date(bid.bidTime).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "--:--",
      bid: Number(bid.bidAmount),
      carrierId: bid.carrierId,
    }));
  } catch (error) {
    bidError = getErrorMessage(error, "Không thể tải lịch sử báo giá cho phiên này.");
  }

  const amounts = bids.map((item) => item.bid).filter(Number.isFinite);
  const maxPrice = Number(auction.maxPrice);

  return {
    id: auction.id,
    title: auction.title || auction.cargoDescription || "Phiên đấu giá vận chuyển",
    route: `${auction.originLocationName || auction.origin || "Chưa xác định"} → ${auction.destinationLocationName || auction.destination || "Chưa xác định"}`,
    vehicleType: auction.vehicleTypeRequired || "Chưa xác định",
    timeRemaining: getTimeRemaining(auction.endTime),
    currentBid: amounts.length ? Math.min(...amounts) : maxPrice,
    activeBidders: new Set(bids.map((item) => item.carrierId).filter(Boolean)).size,
    status: auction.status,
    startPrice: maxPrice,
    bidHistory: bids,
    bidError,
    image: getImageSource(auction.images),
    fraudFlag: Boolean(auction.fraudFlag),
    fraudReason: auction.fraudReason || "",
  };
};

export default function AdminOperationsPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [openResponse, pendingResponse] = await Promise.all([
        listAuctions({ status: "OPEN", page: 1, pageSize: 100 }),
        listAuctions({ status: "PENDING", page: 1, pageSize: 100 }),
      ]);
      const auctions = [
        ...getPageItems(openResponse),
        ...getPageItems(pendingResponse),
      ];
      const mapped = await Promise.all(auctions.map(mapAuction));
      setSessions(mapped);
    } catch (loadError) {
      setSessions([]);
      setError(getErrorMessage(loadError, "Không thể tải các phiên đấu giá."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <AdminPageShell>
        <AdminPageHeader
          title="Giám sát đấu giá"
          subtitle="Đang đồng bộ phiên đấu giá và lịch sử báo giá từ bidding service."
        />
        <Box
          role="status"
          aria-label="Đang tải phiên đấu giá"
          sx={{
            minHeight: 360,
            display: "grid",
            placeItems: "center",
            border: "1px solid #E2E8F0",
            borderRadius: 3,
            bgcolor: "rgba(255,255,255,0.72)",
          }}
        >
          <Box sx={{ display: "grid", justifyItems: "center", gap: 1.5 }}>
            <CircularProgress size={30} sx={{ color: "#1B4965" }} />
            <Typography variant="body2" sx={{ color: "#64748B" }}>
              Đang tải dữ liệu vận hành...
            </Typography>
          </Box>
        </Box>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Giám sát đấu giá"
        subtitle="Theo dõi phiên đang diễn ra, diễn biến giá và thao tác can thiệp từ dữ liệu bidding service."
        breadcrumbs={[
          { label: "Admin", path: "/admin" },
          { label: "Vận hành", path: "/admin/operations" },
          { label: "Đấu giá" },
        ]}
      />

      {error ? (
        <Box
          sx={{
            display: "grid",
            gap: 2,
            p: { xs: 2.5, md: 4 },
            border: "1px solid #FECDD3",
            borderRadius: 3,
            bgcolor: "#FFF1F2",
          }}
        >
          <Alert severity="error" sx={{ bgcolor: "transparent", p: 0 }}>
            {error}
          </Alert>
          <Box>
            <AdminPrimaryButton onClick={loadData}>Thử tải lại</AdminPrimaryButton>
          </Box>
        </Box>
      ) : (
        <AuctionMonitorView
          sessions={sessions}
          onCancelAuction={async (auctionId) => {
            await cancelAuction(auctionId);
            setSessions((current) =>
              current.map((session) =>
                session.id === auctionId ? { ...session, status: "CANCELLED" } : session,
              ),
            );
          }}
          onFlagAuction={async (auctionId, reason) => {
            await flagAuction(auctionId, { reason });
            setSessions((current) =>
              current.map((session) =>
                session.id === auctionId
                  ? { ...session, fraudFlag: true, fraudReason: reason }
                  : session,
              ),
            );
          }}
        />
      )}
    </AdminPageShell>
  );
}
