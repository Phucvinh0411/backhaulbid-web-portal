import { PageHeader } from "@/components/common";

export default function SettingsPage() {
  return (
    <PageHeader
      title="Cài đặt"
      subtitle="Cấu hình hệ thống và tùy chỉnh nền tảng"
      breadcrumbs={[
        { label: "Trang chủ", path: "/" },
        { label: "Cài đặt" },
      ]}
    />
  );
}
