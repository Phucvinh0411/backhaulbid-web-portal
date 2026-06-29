import { PageHeader } from "@/components/common";

export default function BiddingHistoryPage() {
  return (
    <PageHeader
      title="Lịch sử đấu giá"
      subtitle="Xem lại các phiên đấu giá đã hoàn thành"
      breadcrumbs={[
        { label: "Trang chủ", path: "/" },
        { label: "Đấu giá", path: "/bidding" },
        { label: "Lịch sử" },
      ]}
    />
  );
}
