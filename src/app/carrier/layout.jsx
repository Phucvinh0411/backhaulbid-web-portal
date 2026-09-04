import { DashboardLayout } from "@/components/layout";

export const metadata = {
  title: "Carrier | BackHaulBid",
};

export default function CarrierLayout({ children }) {
  return <DashboardLayout role="carrier">{children}</DashboardLayout>;
}
