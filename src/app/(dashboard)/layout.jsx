import { DashboardLayout } from "@/components/layout";

export const metadata = {
  title: "Dashboard | BackHaulBid",
};

export default function DashboardGroupLayout({ children }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
