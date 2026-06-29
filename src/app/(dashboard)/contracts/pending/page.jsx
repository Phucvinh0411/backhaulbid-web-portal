import { PageHeader } from "@/components/common";

export default function PendingContractsPage() {
  return (
    <PageHeader
      title="Hợp đồng chờ duyệt"
      subtitle="Các hợp đồng đang chờ phê duyệt"
      breadcrumbs={[
        { label: "Trang chủ", path: "/" },
        { label: "Hợp đồng", path: "/contracts" },
        { label: "Chờ duyệt" },
      ]}
    />
  );
}
