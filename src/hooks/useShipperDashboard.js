import { useState, useEffect } from "react";
import { listAuctions } from "@/services/biddingApi";
import { contractApi } from "@/services/contractApi";
import { unwrapListData } from "@/services/responseData";

export const useShipperDashboard = (timeFilter) => {
  const [data, setData] = useState({
    activeAuctionsCount: 0,
    inTransitCount: 0,
    monthlySpend: 0,
    estimatedSavings: 0,
    spendData: [],
    activeShipments: [],
    endingAuctions: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch auctions gracefully
        let auctionsRes = [];
        try {
          auctionsRes = await listAuctions({ page: 1, pageSize: 50 });
        } catch (e) {
          console.warn("Failed to load auctions:", e);
        }
        const auctions = unwrapListData(auctionsRes);

        // Fetch contracts / trips gracefully
        let contracts = [];
        try {
          contracts = await contractApi.listMine({ page: 1, pageSize: 100 });
        } catch (e) {
          console.warn("Failed to load contracts:", e);
        }

        if (!active) return;

        // 1. Đang đấu giá (count of PENDING/OPEN)
        const openAuctions = auctions.filter((a) => a.status === "OPEN" || a.status === "PENDING");
        const activeAuctionsCount = openAuctions.length;

        // Ending Auctions (Top 3 open auctions sorted by some criteria)
        const endingAuctions = openAuctions.slice(0, 3).map((a) => ({
          id: a.id,
          goodsType: a.goodsType || a.title || "Hàng hóa",
          route: `${a.originLocationName || a.origin || "?"} → ${a.destinationLocationName || a.destination || "?"}`,
          maxPrice: a.maxPrice,
          currentLowest: a.currentLowestBid || a.maxPrice,
          bidCount: a.totalBids || 0,
          timeLeft: "Đang mở", // Would calculate from a.endTime if available
        }));

        // 2. Đang vận chuyển
        const inTransitContracts = unwrapListData(contracts).filter(
          (c) => c.status === "SIGNED" || (c.trip && c.trip.status === "IN_TRANSIT")
        );
        const inTransitCount = inTransitContracts.length;

        const activeShipments = inTransitContracts.slice(0, 5).map((c) => ({
          id: c.contractCode || c.id,
          goodsType: "Chuyến vận chuyển",
          route: `${c.trip?.pickupLocation || "?"} → ${c.trip?.deliveryLocation || "?"}`,
          driverName: c.trip?.driverName || "Chưa cập nhật",
          driverPlate: c.trip?.vehiclePlate || "Chưa cập nhật",
          progress: 50, // Mock progress, ideally calculated from milestones
          status: "Đang di chuyển",
        }));

        // 3. Chi tiêu tháng này & Tiết kiệm
        // Simulate chart data based on timeFilter using contracts
        let monthlySpend = 0;
        let estimatedSavings = 0;
        const spendDataMap = {};

        unwrapListData(contracts).forEach((c) => {
          if (c.status === "SIGNED" || c.status === "COMPLETED") {
            const price = c.trip?.agreedPrice || 0;
            // Assuming maxPrice can be fetched or estimated. For now, estimate a 15% savings if not present
            const maxPrice = price * 1.15; 
            const savings = maxPrice - price;
            monthlySpend += price;
            estimatedSavings += savings;
            
            const dateStr = c.createdAt ? new Date(c.createdAt).toLocaleDateString("vi-VN", { month: 'numeric', year: 'numeric' }) : "T1";
            if (!spendDataMap[dateStr]) spendDataMap[dateStr] = { spend: 0, savings: 0 };
            spendDataMap[dateStr].spend += price;
            spendDataMap[dateStr].savings += savings;
          }
        });

        // Format for Recharts
        const spendData = Object.keys(spendDataMap).map((k) => ({
          name: k,
          spend: spendDataMap[k].spend,
          savings: spendDataMap[k].savings,
        }));

        // Fallback chart data if empty
        if (spendData.length === 0) {
          spendData.push(
            { name: "T1", spend: 0, savings: 0 },
            { name: "T2", spend: 0, savings: 0 }
          );
        }

        setData({
          activeAuctionsCount,
          inTransitCount,
          monthlySpend,
          estimatedSavings,
          spendData,
          activeShipments,
          endingAuctions,
        });
      } catch (err) {
        if (active) setError("Có lỗi xảy ra khi tải dữ liệu tổng quan.");
        console.error("Dashboard fetch error:", err);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchDashboardData();

    return () => {
      active = false;
    };
  }, [timeFilter]);

  return { data, loading, error };
};
