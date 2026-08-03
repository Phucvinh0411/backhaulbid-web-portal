"use client";

import ContractItem from "@/components/contracts/ContractItem";

/** Legacy carrier entry point; contract cards now share the shipper baseline. */
export default function CarrierContractItem(props) {
  return <ContractItem {...props} partnerLabel="Chủ hàng" />;
}
