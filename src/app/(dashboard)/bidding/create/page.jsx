import { PageHeader } from "@/components/common";

export default function BiddingCreatePage() {
  return (
    <PageHeader
      title="Tạo phiên đấu giá mới"
      subtitle="Thiết lập và khởi tạo phiên đấu giá vận tải"
      breadcrumbs={[
        { label: "Trang chủ", path: "/" },
        { label: "Đấu giá", path: "/bidding" },
        { label: "Tạo phiên mới" },
      ]}
    />
  );
}
