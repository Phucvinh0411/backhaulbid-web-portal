"use client";

import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import ContractsManagementScreen from "@/components/contracts/ContractsManagementScreen";
import { contractApi } from "@/services/contractApi";
import { mapContractResponses } from "@/services/contractMapper";
import { getApiErrorMessage } from "@/services/errorMessage";
import { useGlobalNotification } from "@/components/common/NotificationPopup";

export default function CarrierContractsPage() {
  const notify = useGlobalNotification();
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    contractApi
      .listMine()
      .then((items) => {
        if (active) setContracts(mapContractResponses(items, "carrier"));
      })
      .catch((loadError) => {
        if (active) {
          notify.error(
            getApiErrorMessage(
              loadError,
              "Không thể tải danh sách hợp đồng. Vui lòng thử lại.",
            ),
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [notify]);

  if (loading) {
    return (
      <Box className="flex min-h-[320px] items-center justify-center">
        <CircularProgress aria-label="Đang tải hợp đồng" />
      </Box>
    );
  }

  return <ContractsManagementScreen role="carrier" contracts={contracts} />;
}
