import { DashboardLayout } from "@/components/layout";
import shipperNavigation from "@/configs/shipperNavigation";

export const metadata = {
  title: "Shipper | BackHaulBid",
};

const shipperUser = {
  name: "Nguyễn Minh Triết",
  email: "shipper@backhaulbid.vn",
  avatar: "T",
  role: "Chủ hàng",
  settingsPath: "/shipper/settings",
};

export default function ShipperLayout({ children }) {
  return (
    <DashboardLayout role="shipper" userInfo={shipperUser}>
      {children}
    </DashboardLayout>
  );
}
