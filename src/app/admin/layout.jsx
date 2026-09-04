import { DashboardLayout } from "@/components/layout";

export const metadata = {
  title: "Admin | BackHaulBid",
};

export default function AdminLayout({ children }) {
  return <DashboardLayout role="admin">{children}</DashboardLayout>;
}
