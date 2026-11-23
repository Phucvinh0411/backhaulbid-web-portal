"use client";

import { useCallback, useEffect, useState } from "react";
import { Alert } from "@mui/material";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { AdminPageHeader, AdminPageShell, AdminPrimaryButton } from "@/components/admin/AdminUI";
import AuctionMonitorView from "@/components/admin/AuctionMonitorView";
import useAuctionSocket from "@/hooks/useAuctionSocket";
import { cancelAuction, flagAuction, listAuctions, listBids, unflagAuction } from "@/services/biddingApi";
import { identityApi } from "@/services/identityApi";
import { getPageItems, unwrapListData } from "@/services/responseData";
import { getVehicleTypeLabel } from "@/lib/statusMeta";

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

const getImageSource = (images) => {
  if (!Array.isArray(images)) return null;
  return images.find((image) => typeof image === "string" && image.trim()) || null;
};

const formatBidEntries = (rawBids = []) =>
  rawBids.map((bid) => ({
    id: bid.id,
    time: bid.bidTime
      ? new Date(bid.bidTime).toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      : "--:--",
    bid: Number(bid.bidAmount),
    carrierId: bid.carrierId,
  }));

const mapAuction = async (auction) => {
  let bids = [];
  let bidError = "";
  const loadUpfront = auction.status === "OPEN";

  if (loadUpfront) {
    try {
      const bidsResponse = await listBids(auction.id, {
        page: 1,
        pageSize: 100,
        sortOrder: "asc",
      });
      bids = formatBidEntries(unwrapListData(bidsResponse));
    } catch (error) {
      bidError = getErrorMessage(error, "Không thể tải lịch sử báo giá cho phiên này.");
    }
  }

  const amounts = bids.map((item) => item.bid).filter(Number.isFinite);
  const maxPrice = Number(auction.maxPrice);

  return {
    id: auction.id,
    title: auction.title || auction.cargoDescription || "Phiên đấu giá vận chuyển",
    route: `${auction.originLocationName || auction.origin || "Chưa xác định"} → ${auction.destinationLocationName || auction.destination || "Chưa xác định"}`,
    vehicleType: getVehicleTypeLabel(auction.vehicleTypeRequired) || "Chưa xác định",
    auctionType: auction.auctionType || "PUBLIC",
    startTime: auction.startTime,
    endTime: auction.endTime,
    currentBid: amounts.length ? Math.min(...amounts) : maxPrice,
    activeBidders: new Set(bids.map((item) => item.carrierId).filter(Boolean)).size,
    status: auction.status,
    startPrice: maxPrice,
    bidHistory: bids,
    bidsLoaded: loadUpfront || auction.status === "PENDING" || auction.status === "CANCELLED",
    bidError,
    image: getImageSource(auction.images),
    fraudFlag: Boolean(auction.fraudFlag),
    fraudReason: auction.fraudReason || "",
    winningBidAmount: auction.winningBidId
      ? bids.find((bid) => bid.id === auction.winningBidId)?.bid ?? null
      : null,
    lastBidAt: null,
  };
};

export default function AdminOperationsPage() {
  const [sessions, setSessions] = useState([]);
  const [carrierNames, setCarrierNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { joinMonitor, on, connected } = useAuctionSocket();

  useEffect(() => {
    let active = true;
    identityApi
      .listAdminAccounts()
      .then((accounts) => {
        if (!active || !Array.isArray(accounts)) return;
        const map = {};
        accounts.forEach((account) => {
          if (account?.id) {
            map[String(account.id)] = account.companyName || account.fullName || account.phone;
          }
        });
        setCarrierNames(map);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const loadSessionBids = useCallback(async (auctionId) => {
    try {
      const bidsResponse = await listBids(auctionId, {
        page: 1,
        pageSize: 100,
        sortOrder: "asc",
      });
      const bids = formatBidEntries(unwrapListData(bidsResponse));
      const amounts = bids.map((item) => item.bid).filter(Number.isFinite);
      setSessions((current) =>
        current.map((session) => {
          if (session.id !== auctionId) return session;
          return {
            ...session,
            bidHistory: bids,
            bidsLoaded: true,
            currentBid: amounts.length ? Math.min(...amounts) : session.currentBid,
            activeBidders: new Set(bids.map((item) => item.carrierId).filter(Boolean)).size,
          };
        }),
      );
    } catch {
      // Keep existing summary cleanly if detail bid history fails to load.
    }
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [openResponse, pendingResponse, completedResponse, cancelledResponse] = await Promise.all([
        listAuctions({ status: "OPEN", page: 1, pageSize: 100 }),
        listAuctions({ status: "PENDING", page: 1, pageSize: 100 }),
        listAuctions({ status: "COMPLETED", page: 1, pageSize: 100 }),
        listAuctions({ status: "CANCELLED", page: 1, pageSize: 100 }),
      ]);
      const auctions = [
        ...getPageItems(openResponse),
        ...getPageItems(pendingResponse),
        ...getPageItems(completedResponse),
        ...getPageItems(cancelledResponse),
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

  useEffect(() => {
    const offBidPlaced = on("bidPlaced", (payload) => {
      const auctionId = payload?.auctionId;
      const bid = payload?.bid;
      if (!auctionId || !bid) return;

      setSessions((current) =>
        current.map((session) => {
          if (session.id !== auctionId) return session;
          if (bid.id && session.bidHistory.some((item) => item.id === bid.id)) return session;

          const amount = Number(bid.bidAmount);
          const bidDate = new Date(bid.bidTime);
          const entry = {
            id: bid.id,
            time: Number.isNaN(bidDate.getTime())
              ? "--:--"
              : bidDate.toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                }),
            bid: amount,
            carrierId: bid.carrierId,
          };
          const bidHistory = [...session.bidHistory, entry];

          return {
            ...session,
            bidHistory,
            currentBid:
              Number.isFinite(amount) && (session.currentBid == null || amount < session.currentBid)
                ? amount
                : session.currentBid,
            activeBidders: new Set(bidHistory.map((item) => item.carrierId).filter(Boolean)).size,
            lastBidAt: Date.now(),
          };
        }),
      );
    });

    const offStatusChanged = on("auctionStatusChanged", (payload) => {
      const auctionId = payload?.auctionId;
      if (!auctionId) return;

      setSessions((current) =>
        current.map((session) => {
          if (session.id !== auctionId) return session;
          return {
            ...session,
            status: payload.status || session.status,
            endTime: payload.endTime || session.endTime,
            winningBidAmount:
              payload.winningBidAmount != null ? Number(payload.winningBidAmount) : session.winningBidAmount,
          };
        }),
      );
    });

    joinMonitor().catch(() => {});

    return () => {
      offBidPlaced();
      offStatusChanged();
    };
  }, [joinMonitor, on]);

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
            border: "1px solid var(--color-line)",
            borderRadius: 3,
            bgcolor: "var(--color-surface)",
          }}
        >
          <Box sx={{ display: "grid", justifyItems: "center", gap: 1.5 }}>
            <CircularProgress size={30} sx={{ color: "var(--color-brand)" }} />
            <Typography variant="body2" sx={{ color: "var(--color-ink-muted)" }}>
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
            border: "1px solid var(--color-danger-soft)",
            borderRadius: 3,
            bgcolor: "var(--color-danger-soft)",
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
          carrierNames={carrierNames}
          live={connected}
          onLoadSessionBids={loadSessionBids}
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
          onUnflagAuction={async (auctionId) => {
            await unflagAuction(auctionId);
            setSessions((current) =>
              current.map((session) =>
                session.id === auctionId
                  ? { ...session, fraudFlag: false, fraudReason: "" }
                  : session,
              ),
            );
          }}
        />
      )}
    </AdminPageShell>
  );
}
