import { PageHeader } from "@/components/common";

export default function RoutesPage() {
  return (
    <PageHeader
      title="Quản lý tuyến đường"
      subtitle="Thiết lập và theo dõi các tuyến vận tải"
      breadcrumbs={[
        { label: "Trang chủ", path: "/" },
        { label: "Đội xe", path: "/fleet" },
        { label: "Tuyến đường" },
      ]}
    />
  );
}
