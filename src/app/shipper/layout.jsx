import { DashboardLayout } from "@/components/layout";

export const metadata = {
  title: "Shipper | BackHaulBid",
};

export default function ShipperLayout({ children }) {
  return <DashboardLayout role="shipper">{children}</DashboardLayout>;
}
