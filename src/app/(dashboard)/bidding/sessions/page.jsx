import { PageHeader } from "@/components/common";

export default function BiddingSessionsPage() {
  return (
    <PageHeader
      title="Danh sách phiên đấu giá"
      subtitle="Quản lý và theo dõi các phiên đấu giá vận tải"
      breadcrumbs={[
        { label: "Trang chủ", path: "/" },
        { label: "Đấu giá", path: "/bidding" },
        { label: "Danh sách phiên" },
      ]}
    />
  );
}
