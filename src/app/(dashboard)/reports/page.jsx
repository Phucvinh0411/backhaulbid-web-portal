import { PageHeader } from "@/components/common";

export default function ReportsPage() {
  return (
    <PageHeader
      title="Báo cáo"
      subtitle="Thống kê và phân tích hoạt động nền tảng"
      breadcrumbs={[
        { label: "Trang chủ", path: "/" },
        { label: "Báo cáo" },
      ]}
    />
  );
}
