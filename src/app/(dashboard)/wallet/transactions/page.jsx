import { PageHeader } from "@/components/common";

export default function TransactionsPage() {
  return (
    <PageHeader
      title="Lịch sử giao dịch"
      subtitle="Chi tiết các giao dịch thanh toán"
      breadcrumbs={[
        { label: "Trang chủ", path: "/" },
        { label: "Ví & Thanh toán", path: "/wallet" },
        { label: "Lịch sử giao dịch" },
      ]}
    />
  );
}
