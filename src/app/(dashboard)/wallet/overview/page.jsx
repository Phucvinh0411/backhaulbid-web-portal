import { PageHeader } from "@/components/common";

export default function WalletOverviewPage() {
  return (
    <PageHeader
      title="Tổng quan ví"
      subtitle="Theo dõi số dư và hoạt động ví"
      breadcrumbs={[
        { label: "Trang chủ", path: "/" },
        { label: "Ví & Thanh toán", path: "/wallet" },
        { label: "Tổng quan" },
      ]}
    />
  );
}
