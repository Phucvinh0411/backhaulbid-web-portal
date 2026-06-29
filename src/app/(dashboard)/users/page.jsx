import { PageHeader } from "@/components/common";

export default function UsersPage() {
  return (
    <PageHeader
      title="Quản lý người dùng"
      subtitle="Quản lý tài khoản Shipper và Carrier trên nền tảng"
      breadcrumbs={[
        { label: "Trang chủ", path: "/" },
        { label: "Người dùng" },
      ]}
    />
  );
}
