import { PageHeader } from "@/components/common";

export default function DriversPage() {
  return (
    <PageHeader
      title="Quản lý tài xế"
      subtitle="Danh sách và quản lý tài xế vận tải"
      breadcrumbs={[
        { label: "Trang chủ", path: "/" },
        { label: "Đội xe", path: "/fleet" },
        { label: "Tài xế" },
      ]}
    />
  );
}
