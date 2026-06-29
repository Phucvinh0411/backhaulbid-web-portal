import { PageHeader } from "@/components/common";

export default function VehiclesPage() {
  return (
    <PageHeader
      title="Quản lý phương tiện"
      subtitle="Danh sách và theo dõi phương tiện vận tải"
      breadcrumbs={[
        { label: "Trang chủ", path: "/" },
        { label: "Đội xe", path: "/fleet" },
        { label: "Phương tiện" },
      ]}
    />
  );
}
