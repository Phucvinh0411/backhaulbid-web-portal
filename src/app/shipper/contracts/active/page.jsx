"use client";

import ContractsManagementScreen from "@/components/contracts/ContractsManagementScreen";

export default function ActiveContractPage() {
  return <ContractsManagementScreen role="shipper" initialFilter="ACTIVE" />;
}
