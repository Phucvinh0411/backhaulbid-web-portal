import { useEffect, useState } from "react";
import { listAuctions } from "@/services/biddingApi";
import { contractApi } from "@/services/contractApi";
import { unwrapListData } from "@/services/responseData";
import {
  calculateTripProgress,
  mapBackendToShipment,
} from "@/services/shipperAuctionMapper";

const initialDashboardData = {
  activeAuctionsCount: 0,
  inTransitCount: 0,
  monthlySpend: 0,
  estimatedSavings: 0,
  spendData: [],
  activeShipments: [],
  endingAuctions: [],
};

const toNumber = (value) => Number(value) || 0;

const getDate = (value) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const isInTimeFilter = (value, timeFilter) => {
  const date = getDate(value);
  if (!date) return false;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  if (timeFilter === "week") return diffMs >= 0 && diffMs <= 7 * 24 * 60 * 60 * 1000;
  if (timeFilter === "year") return date.getFullYear() === now.getFullYear();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
};

const getChartBucket = (value, timeFilter) => {
  const date = getDate(value);
  if (!date) return "Chưa rõ";
  if (timeFilter === "week") {
    return new Intl.DateTimeFormat("vi-VN", { weekday: "short", day: "2-digit" }).format(date);
  }
  if (timeFilter === "year") {
    return new Intl.DateTimeFormat("vi-VN", { month: "short" }).format(date);
  }
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit" }).format(date);
};

const getTimeLeftLabel = (endTime) => {
  const end = getDate(endTime);
  if (!end) return "Chưa cập nhật";
  const diffMs = end.getTime() - Date.now();
  if (diffMs <= 0) return "Đã kết thúc";
  const totalMinutes = Math.ceil(diffMs / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `${days} ngày ${hours} giờ`;
  if (hours > 0) return `${hours} giờ ${minutes} phút`;
  return `${minutes} phút`;
};

const getContractAmount = (contract) =>
  toNumber(contract.trip?.agreedPrice ?? contract.agreedPrice ?? contract.value);

const getContractBaseline = (contract, auctionsById) => {
  const auctionId = contract.auctionId || contract.trip?.auctionId;
  const auction = auctionId ? auctionsById.get(String(auctionId)) : null;
  return toNumber(
    auction?.maxPrice ??
      contract.auctionMaxPrice ??
      contract.trip?.auctionMaxPrice ??
      contract.maxPrice,
  );
};

export const useShipperDashboard = (timeFilter) => {
  const [data, setData] = useState(initialDashboardData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [auctionResponse, contractResponse] = await Promise.all([
          listAuctions({ page: 1, pageSize: 100 }).catch((err) => {
            console.warn("Failed to load auctions:", err);
            return [];
          }),
          contractApi.listMine({ page: 1, pageSize: 100 }).catch((err) => {
            console.warn("Failed to load contracts:", err);
            return [];
          }),
        ]);

        if (!active) return;

        const auctions = unwrapListData(auctionResponse).map(mapBackendToShipment);
        const contracts = unwrapListData(contractResponse);
        const auctionsById = new Map(auctions.map((auction) => [String(auction.id), auction]));
        const openAuctions = auctions.filter((auction) =>
          ["pending_bids", "active_bids"].includes(auction.status),
        );

        const endingAuctions = openAuctions
          .slice()
          .sort((left, right) => {
            const leftEnd = getDate(left.endTime)?.getTime() ?? Number.MAX_SAFE_INTEGER;
            const rightEnd = getDate(right.endTime)?.getTime() ?? Number.MAX_SAFE_INTEGER;
            return leftEnd - rightEnd;
          })
          .slice(0, 3)
          .map((auction) => ({
            id: auction.id,
            goodsType: auction.title || auction.goodsType,
            route: `${auction.from.province} → ${auction.to.province}`,
            maxPrice: auction.maxPrice,
            currentLowest: auction.currentLowestBid || auction.maxPrice,
            bidCount: auction.bidCount,
            timeLeft: getTimeLeftLabel(auction.endTime),
          }));

        const inTransitContracts = contracts.filter((contract) =>
          ["SIGNED", "ACTIVE"].includes(contract.status) ||
          ["WAITING_PICKUP", "PICKED_UP", "IN_TRANSIT", "DELIVERED"].includes(contract.trip?.status),
        );

        const activeShipments = inTransitContracts.slice(0, 5).map((contract) => ({
          id: contract.trip?.id || contract.tripId || contract.contractCode || contract.id,
          goodsType: contract.trip?.cargoType || contract.cargoType || "Chuyến vận chuyển",
          route: `${contract.trip?.pickupLocation || "Chưa cập nhật"} → ${contract.trip?.deliveryLocation || "Chưa cập nhật"}`,
          driverName: contract.trip?.driverName || "Chưa cập nhật",
          driverPlate: contract.trip?.vehiclePlate || "Chưa cập nhật",
          progress: calculateTripProgress(contract.trip?.status),
          status: contract.trip?.status || contract.status,
        }));

        let monthlySpend = 0;
        let estimatedSavings = 0;
        const spendDataMap = new Map();

        contracts
          .filter((contract) => ["SIGNED", "COMPLETED", "ACTIVE"].includes(contract.status))
          .filter((contract) => isInTimeFilter(contract.createdAt || contract.trip?.createdAt, timeFilter))
          .forEach((contract) => {
            const amount = getContractAmount(contract);
            const baseline = getContractBaseline(contract, auctionsById);
            const savings = baseline > amount ? baseline - amount : 0;
            const bucket = getChartBucket(contract.createdAt || contract.trip?.createdAt, timeFilter);
            const current = spendDataMap.get(bucket) || { name: bucket, spend: 0, savings: 0 };
            current.spend += amount;
            current.savings += savings;
            spendDataMap.set(bucket, current);
            monthlySpend += amount;
            estimatedSavings += savings;
          });

        setData({
          activeAuctionsCount: openAuctions.length,
          inTransitCount: inTransitContracts.length,
          monthlySpend,
          estimatedSavings,
          spendData: Array.from(spendDataMap.values()),
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
