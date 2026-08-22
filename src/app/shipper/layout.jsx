import { DashboardLayout } from "@/components/layout";

export const metadata = {
  title: "Shipper | BackHaulBid",
};

const shipperUser = {
  name: "Nguyễn Văn Hàng (Shipper)",
  email: "shipper123@backhaulbid.local",
  avatar: "H",
  role: "Chủ hàng",
  settingsPath: "/shipper/settings",
};

export default function ShipperLayout({ children }) {
  return <DashboardLayout role="shipper">{children}</DashboardLayout>;
}
