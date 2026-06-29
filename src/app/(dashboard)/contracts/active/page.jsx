import { PageHeader } from "@/components/common";

export default function ActiveContractsPage() {
  return (
    <PageHeader
      title="Hợp đồng đang hoạt động"
      subtitle="Các hợp đồng vận tải đang được thực hiện"
      breadcrumbs={[
        { label: "Trang chủ", path: "/" },
        { label: "Hợp đồng", path: "/contracts" },
        { label: "Đang hoạt động" },
      ]}
    />
  );
}
