import { PageHeader } from "@/components/common";

export default function CompletedContractsPage() {
  return (
    <PageHeader
      title="Hợp đồng đã hoàn thành"
      subtitle="Lịch sử các hợp đồng đã thực hiện"
      breadcrumbs={[
        { label: "Trang chủ", path: "/" },
        { label: "Hợp đồng", path: "/contracts" },
        { label: "Đã hoàn thành" },
      ]}
    />
  );
}
