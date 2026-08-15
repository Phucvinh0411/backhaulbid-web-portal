"use client";

import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import ContractsManagementScreen from "@/components/contracts/ContractsManagementScreen";
import { contractApi } from "@/services/contractApi";

const statusMap = {
  DRAFT: "PENDING_SIGNATURE",
  WAITING_SIGNATURE: "PENDING_SIGNATURE",
  SIGNED: "ACTIVE",
  CANCELLED: "CANCELLED",
};

const formatCurrency = (value) =>
  value == null
    ? "Chưa cập nhật"
    : new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
      }).format(value);

const mapContract = (contract) => {
  const trip = contract.trip || {};
  return {
    backendId: contract.id,
    id: contract.contractCode || contract.id,
    auctionId: contract.contractCode || contract.id,
    origin: trip.pickupLocation || "Chưa cập nhật",
    destination: trip.deliveryLocation || "Chưa cập nhật",
    cargoType: "Chuyến vận chuyển",
    value: formatCurrency(trip.agreedPrice),
    date: contract.createdAt
      ? new Date(contract.createdAt).toLocaleDateString("vi-VN")
      : "Chưa cập nhật",
    status: statusMap[contract.status] || contract.status,
    shipperName: contract.shipperId || "Chưa cập nhật",
    carrierName: contract.carrierId || "Chưa cập nhật",
    pickupAddress: trip.pickupLocation,
    deliveryAddress: trip.deliveryLocation,
    tripId: contract.tripId,
  };
};

export default function CarrierContractsPage() {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    contractApi
      .listMine()
      .then((items) => {
        if (active) setContracts((items || []).map(mapContract));
      })
      .catch((loadError) => {
        if (active) {
          setError(
            loadError?.response?.data?.message ||
              "Không thể tải danh sách hợp đồng.",
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <Box className="flex min-h-[320px] items-center justify-center">
        <CircularProgress aria-label="Đang tải hợp đồng" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="p-4">
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return <ContractsManagementScreen role="carrier" contracts={contracts} />;
}
