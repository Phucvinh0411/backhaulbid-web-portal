import { DashboardLayout } from "@/components/layout";

export const metadata = {
  title: "Carrier | BackHaulBid",
};

const carrierUser = {
  name: "Nguyễn Văn Chủ Xe",
  email: "carrier@transport.vn",
  avatar: "C",
  role: "Chủ xe",
  settingsPath: "/carrier/settings",
};

export default function CarrierLayout({ children }) {
  return (
    <DashboardLayout role="carrier" userInfo={carrierUser}>
      {children}
    </DashboardLayout>
  );
}
